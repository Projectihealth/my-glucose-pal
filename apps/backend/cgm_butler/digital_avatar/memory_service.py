"""
Memory Service - 从对话中提取记忆和 TODO

负责调用 OpenAI 从 transcript 中提取:
1. 短期记忆 (session summary)
2. 长期记忆更新 (habits, goals, patterns)
3. TODO 列表 (action items)
"""

import json
import os
import sys
from typing import Dict, List, Optional, Any
from datetime import datetime
from openai import OpenAI

# 添加项目根目录到路径 (用于 shared 模块)
# memory_service.py -> digital_avatar -> cgm_butler -> backend -> apps -> my-glucose-pal (5层)
current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file)))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 使用新的 shared/database
from shared.database import get_connection, MemoryRepository, OnboardingStatusRepository
from shared.database.repositories.onboarding_utils import calculate_onboarding_completion

# 导入 Onboarding 信息提取函数
# 注意：本文件既可能作为包内模块导入，也可能通过 spec_from_file_location 直接加载。
# 直接加载时相对导入会失败，因此这里使用绝对导入。
from apps.backend.cgm_butler.digital_avatar.onboarding_extractors import (
    _has_concerns_info,
    _has_goals_info,
    _has_eating_habits,
    _has_exercise_habits,
    _has_sleep_habits,
    _has_stress_info
)


class MemoryService:
    """从对话中提取并保存记忆和 TODO"""
    
    def __init__(self, openai_api_key: Optional[str] = None, db_path: Optional[str] = None):
        """
        初始化 MemoryService
        
        Args:
            openai_api_key: OpenAI API key
            db_path: 数据库路径 (可选,使用新的 shared/database)
        """
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required")
        
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # 使用新的 Repository 模式
        self.db_conn = get_connection(db_path)
        self.memory_repo = MemoryRepository(self.db_conn)
        self.onboarding_repo = OnboardingStatusRepository(self.db_conn)
    
    def process_conversation(
        self,
        user_id: str,
        conversation_id: str,
        channel: str,
        transcript: Any,
        user_name: str = "User"
    ) -> Dict[str, Any]:
        """
        处理对话结束后的记忆提取和保存
        
        Args:
            user_id: 用户ID
            conversation_id: 对话ID
            channel: 对话渠道 (gpt_chat, retell_voice, tavus_video)
            transcript: 对话记录 (可以是 List[Dict] 或 str)
            user_name: 用户名
            
        Returns:
            处理结果字典
        """
        try:
            # 1. 提取短期记忆
            memory_result = self._extract_session_memory(transcript, channel)
            
            # 2. 提取长期记忆更新
            long_term_updates = self._extract_long_term_updates(transcript, user_id)
            
            # 3. 提取 TODO
            todos = self._extract_todos(transcript, user_name)
            
            # 4. 保存到数据库
            memory_id = None
            if memory_result.get('summary'):
                memory_id = self.memory_repo.save_memory(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    channel=channel,
                    summary=memory_result['summary'],
                    insights=memory_result.get('insights'),
                    key_topics=memory_result.get('key_topics', []),
                    extracted_data=memory_result.get('extracted_data', {})
                )
            
            # 5. 更新长期记忆
            if long_term_updates:
                self.memory_repo.update_long_term_memory(
                    user_id=user_id,
                    **long_term_updates
                )
                self.db_conn.commit()
            
            # 6. 保存 TODO
            todo_ids = []
            if todos:
                todo_ids = self.memory_repo.save_todos(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    todos=todos
                )
                self.db_conn.commit()
            
            # 7. 更新 Onboarding 状态 (仅针对 Voice Chat)
            onboarding_updated = False
            if channel == 'retell_voice':
                try:
                    self._update_onboarding_status(
                        user_id=user_id,
                        transcript=transcript,
                        extracted_memory=memory_result,
                        extracted_todos=todos
                    )
                    onboarding_updated = True
                except Exception as onb_error:
                    print(f"⚠️  Onboarding 状态更新失败 (非致命): {onb_error}")
            
            return {
                'success': True,
                'memory_id': memory_id,
                'long_term_updated': bool(long_term_updates),
                'todo_ids': todo_ids,
                'summary': memory_result.get('summary'),
                'todos_count': len(todos),
                'onboarding_updated': onboarding_updated
            }
            
        except Exception as e:
            print(f"❌ MemoryService 处理失败: {e}")
            self.db_conn.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    def _extract_session_memory(self, transcript: Any, channel: str) -> Dict[str, Any]:
        """
        从对话中提取短期记忆（本次会话总结）
        
        Args:
            transcript: 对话记录
            channel: 对话渠道
            
        Returns:
            包含 summary, insights, key_topics, extracted_data 的字典
        """
        # 格式化 transcript 为文本
        transcript_text = self._format_transcript(transcript, channel)
        
        if not transcript_text.strip():
            return {'summary': '空对话', 'insights': None, 'key_topics': [], 'extracted_data': {}}
        
        prompt = f"""请分析以下健康助手与用户的对话记录，提取关键信息。

对话记录：
{transcript_text}

请以 JSON 格式返回以下内容：
{{
  "summary": "本次对话的完整总结。要求：
              1. 根据对话内容的丰富程度自适应调整长度（不要有固定句数限制）
              2. 必须包含：讨论的主要主题、用户的问题/关注点、助手给出的具体建议（包括具体方案、食物、时间等细节）、达成的共识或行动计划
              3. 如果对话涉及多个具体方案选择，必须列出每个方案的关键信息
              4. 短对话(< 5轮)可以简短，长对话(> 15轮)可以详细，以完整表达为准",
  
  "insights": "从对话中发现的洞察、模式或趋势（如用户的行为习惯、情绪状态、健康问题的根本原因等）",
  
  "key_topics": ["话题1", "话题2", "话题3"],
  
  "extracted_data": {{
    "mentioned_foods": ["食物1", "食物2", ...],
    "mentioned_activities": ["活动1", "活动2", ...],
    "glucose_concerns": ["关注点1", "关注点2", ...],
    "user_mood": "positive/neutral/negative",
    
    "specific_recommendations": [
      {{
        "topic": "建议的主题（如'早餐改进'、'运动计划'）",
        "options": ["具体方案1", "具体方案2"],
        "rationale": "为什么这样建议（原理/好处）",
        "implementation": "如何实施（可选）"
      }}
    ],
    
    "user_commitments": ["用户承诺要做的事情1", "用户承诺要做的事情2"],
    
    "discussed_timing": {{
      "breakfast": "时间描述",
      "lunch": "时间描述",
      "dinner": "时间描述"
    }}
  }}
}}

只返回 JSON，不要其他文字。"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "你是一个专业的健康对话分析助手，擅长从对话中提取结构化信息。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"❌ 提取短期记忆失败: {e}")
            return {
                'summary': '对话总结失败',
                'insights': None,
                'key_topics': [],
                'extracted_data': {}
            }
    
    def _extract_long_term_updates(self, transcript: Any, user_id: str) -> Dict[str, Any]:
        """
        从对话中提取长期记忆更新
        
        Args:
            transcript: 对话记录
            user_id: 用户ID
            
        Returns:
            长期记忆更新字典（只包含需要更新的字段）
        """
        # 先获取现有长期记忆
        existing_memory = self.memory_repo.get_long_term_memory(user_id)
        
        transcript_text = self._format_transcript(transcript, 'any')
        
        if not transcript_text.strip():
            return {}
        
        prompt = f"""请分析以下对话，判断是否包含用户的长期习惯、目标、偏好等信息。

现有长期记忆：
{json.dumps(existing_memory or {}, ensure_ascii=False, indent=2)}

本次对话：
{transcript_text}

如果对话中包含新的或更新的长期信息，请以 JSON 格式返回需要更新的字段：
{{
  "preferences": {{"偏好类别": "偏好内容"}},
  "health_goals": {{"目标类别": "目标描述"}},
  "habits": {{"习惯类别": "习惯描述"}},
  "dietary_patterns": {{"饮食模式": "描述"}},
  "exercise_patterns": {{"运动模式": "描述"}},
  "stress_patterns": {{"压力模式": "描述"}},
  "sleep_patterns": {{"睡眠模式": "描述"}},
  "concerns": ["关注事项1", "关注事项2"]
}}

如果没有需要更新的长期信息，返回空对象 {{}}。
只返回 JSON，不要其他文字。"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "你是一个专业的健康信息提取助手，擅长识别用户的长期习惯和目标。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            # 过滤掉空字典和空列表
            return {k: v for k, v in result.items() if v}
            
        except Exception as e:
            print(f"❌ 提取长期记忆更新失败: {e}")
            return {}
    
    def _extract_todos(self, transcript: Any, user_name: str) -> List[Dict]:
        """
        从对话中提取 TODO 列表
        
        Args:
            transcript: 对话记录
            user_name: 用户名
            
        Returns:
            TODO 列表
        """
        transcript_text = self._format_transcript(transcript, 'any')
        
        if not transcript_text.strip():
            return []
        
        prompt = f"""请分析以下健康助手与 {user_name} 的对话，提取双方达成共识的行动项（TODO）。

对话记录：
{transcript_text}

请以 JSON 格式返回 TODO 列表：
{{
  "todos": [
    {{
      "title": "清晰的行动描述（包含具体方案，用中文）",
      "description": "补充说明（可选，通常为空）",
      "category": "diet/exercise/sleep/stress/medication/other",
      "health_benefit": "为什么要做这个（健康好处/影响）",
      "time_of_day": "执行时间段（HH:MM-HH:MM 格式）",
      "time_description": "时间描述（如'上班前'、'晚饭后1小时'）",
      "target_count": 目标次数,
      "current_count": 0,
      "status": "pending"
    }}
  ]
}}

【重要说明】

1. **title（行动描述）**:
   - 清晰描述要做什么，包含具体方案
   - 如果有多个方案选择，用 "/" 或 "、" 分隔
   - 例如：
     ✅ "每天上班前吃营养早餐（希腊酸奶+坚果 / 提前煮好的鸡蛋）"
     ✅ "每周运动3次，每次30分钟（快走/慢跑）"
     ✅ "每晚11点前上床睡觉"
     ❌ "改善早餐习惯"（太笼统）
     ❌ "Prepare breakfast"（不要英文）

2. **health_benefit（健康好处）**:
   - 说明为什么要做这个，对健康有什么好处
   - 强化用户的执行动力
   - 例如：
     ✅ "减少饥饿导致的血糖降低，稳定上午血糖水平"
     ✅ "提高胰岛素敏感性，帮助控制血糖"
     ✅ "改善睡眠质量，帮助血糖调节和代谢健康"
     ❌ "对健康有好处"（太笼统）

3. **time_of_day（执行时间段）**:
   - 格式: "HH:MM-HH:MM"（24小时制）
   - 根据对话中提到的用户作息时间推断
   - 例如：
     - 早餐: "09:00-10:00"（如果用户说"起床后半小时"，推断起床时间）
     - 午餐: "12:00-13:00"
     - 晚餐: "19:00-20:00"
     - 运动: "20:00-21:00"（如果说"晚饭后1小时"）
     - 睡觉: "22:00-23:00"（如果说"11点前睡觉"）
   - ⚠️ **重要：避免跨天时间**
     - ❌ 错误: "23:00-01:00"（跨天了）
     - ✅ 正确: "23:00-23:59"（只记录当天部分）
     - ❌ 错误: "22:00-00:30"（跨天了）
     - ✅ 正确: "22:00-23:59"（只记录当天部分）
   - 如果对话中没有明确时间，根据常识和类别推断
   - 如果是全天性任务（如"每天喝8杯水"），可以填 "全天"

4. **time_description（时间描述）**:
   - 用户友好的时间描述
   - 例如：
     ✅ "上班前"
     ✅ "午餐时间"
     ✅ "晚饭后1小时"
     ✅ "睡前"
     ✅ "周一、周三、周五晚上"

5. **description**:
   - 通常为空（因为 title 已经包含了足够信息）
   - 只在需要额外补充说明时使用

6. **category**: 
   - 必须是以下之一: diet, exercise, sleep, stress, medication, other

7. **target_count**: 
   - 本周目标次数（如"每周3次"则为3，"每天"则为7）

8. **只提取明确达成共识的行动项**

【完整示例】

示例1（饮食 - 早餐）:
{{
  "title": "每天上班前吃营养早餐（希腊酸奶+坚果 / 提前煮好的鸡蛋）",
  "description": "",
  "category": "diet",
  "health_benefit": "减少饥饿导致的血糖降低，稳定上午血糖水平",
  "time_of_day": "09:00-10:00",
  "time_description": "上班前",
  "target_count": 7,
  "current_count": 0,
  "status": "pending"
}}

示例2（运动）:
{{
  "title": "每周运动3次，每次30分钟（快走/慢跑）",
  "description": "",
  "category": "exercise",
  "health_benefit": "提高胰岛素敏感性，帮助控制血糖",
  "time_of_day": "20:00-21:00",
  "time_description": "晚饭后1小时",
  "target_count": 3,
  "current_count": 0,
  "status": "pending"
}}

示例3（睡眠）:
{{
  "title": "每晚11点前上床睡觉",
  "description": "",
  "category": "sleep",
  "health_benefit": "改善睡眠质量，帮助血糖调节和代谢健康",
  "time_of_day": "22:30-23:00",
  "time_description": "睡前",
  "target_count": 7,
  "current_count": 0,
  "status": "pending"
}}

【输出要求】
- 只返回 JSON 格式，不要其他文字
- 如果没有明确的 TODO，返回 {{"todos": []}}
- 确保 JSON 格式正确，可以被解析
- time_of_day 必须是 "HH:MM-HH:MM" 格式或 "全天"
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "你是一个专业的行动项提取助手，擅长从对话中识别可执行的健康行动计划。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('todos', [])
            
        except Exception as e:
            print(f"❌ 提取 TODO 失败: {e}")
            return []
    
    def _format_transcript(self, transcript: Any, channel: str) -> str:
        """
        将 transcript 格式化为文本
        
        Args:
            transcript: 对话记录（可能是 List[Dict], str, 或其他格式）
            channel: 对话渠道
            
        Returns:
            格式化后的文本
        """
        if isinstance(transcript, str):
            return transcript
        
        if isinstance(transcript, list):
            # List[Dict] 格式 (GPT chat / Tavus video)
            lines = []
            for msg in transcript:
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                if role == 'user':
                    lines.append(f"用户: {content}")
                elif role == 'assistant':
                    lines.append(f"助手: {content}")
                else:
                    lines.append(f"{role}: {content}")
            return '\n'.join(lines)
        
        # 其他格式尝试转为 JSON 字符串
        try:
            return json.dumps(transcript, ensure_ascii=False, indent=2)
        except:
            return str(transcript)
    
    def _update_onboarding_status(
        self,
        user_id: str,
        transcript: Any,
        extracted_memory: Dict,
        extracted_todos: List[Dict]
    ):
        """
        根据对话内容更新 Onboarding 状态
        
        Args:
            user_id: 用户 ID
            transcript: 对话记录
            extracted_memory: 提取的记忆数据
            extracted_todos: 提取的 TODOs
        """
        try:
            # 1. 获取或创建状态（在事务中）
            with self.db_conn:
                status = self.onboarding_repo.get_or_create(user_id)
                
                # 2. 分析对话内容，只更新有新值的字段
                updates = {}
                
                # Concerns
                if _has_concerns_info(extracted_memory):
                    updates['concerns_collected'] = 1  # SQLite BOOLEAN
                    
                    # 尝试提取详细信息
                    extracted_data = extracted_memory.get('extracted_data', {})
                    glucose_concerns = extracted_data.get('glucose_concerns', [])
                    
                    if glucose_concerns:
                        concern = glucose_concerns[0]
                        if concern:  # 只在有新值时更新
                            updates['primary_concern'] = concern
                
                # Goals
                if _has_goals_info(extracted_memory):
                    updates['goals_set'] = 1
                    
                    # 尝试从 summary 中提取 goal 信息
                    # 这里可以进一步使用 LLM 提取结构化信息
                    # 暂时简化处理
                
                # Lifestyle
                if _has_eating_habits(extracted_memory):
                    updates['eating_habits_collected'] = 1
                if _has_exercise_habits(extracted_memory):
                    updates['exercise_habits_collected'] = 1
                if _has_sleep_habits(extracted_memory):
                    updates['sleep_habits_collected'] = 1
                if _has_stress_info(extracted_memory):
                    updates['stress_habits_collected'] = 1
                
                # TODOs
                if extracted_todos and len(extracted_todos) >= 1:
                    updates['todos_created'] = 1
                    updates['initial_todos_count'] = len(extracted_todos)
                
                # 3. 重新读取最新状态并计算完成度（防止并发问题）
                latest_status = self.onboarding_repo.get_by_user_id(user_id)
                new_status = {**latest_status, **updates}
                completion_score = calculate_onboarding_completion(new_status)
                updates['completion_score'] = completion_score
                
                # 4. 更新 stage
                if completion_score >= 80:
                    updates['onboarding_stage'] = 'completed'
                    if not latest_status.get('onboarding_completed_at'):
                        updates['onboarding_completed_at'] = datetime.now().isoformat()
                elif completion_score > 0:
                    updates['onboarding_stage'] = 'in_progress'
                    if not latest_status.get('onboarding_started_at'):
                        updates['onboarding_started_at'] = datetime.now().isoformat()
                
                updates['last_updated_at'] = datetime.now().isoformat()
                
                # 5. 保存（在同一事务中）
                self.onboarding_repo.update_status(user_id, updates)
                
                print(f"✅ Onboarding status updated for {user_id}: {completion_score}% complete")
        
        except Exception as e:
            print(f"❌ Failed to update onboarding status for {user_id}: {e}")
            # 不抛出异常，不影响主流程


if __name__ == '__main__':
    # 测试示例
    import os
    
    # 需要设置 OPENAI_API_KEY 环境变量
    if not os.getenv('OPENAI_API_KEY'):
        print("请设置 OPENAI_API_KEY 环境变量")
        exit(1)
    
    service = MemoryService()
    
    # 测试对话
    test_transcript = [
        {"role": "user", "content": "我今天早上吃了很多面包，血糖升高了"},
        {"role": "assistant", "content": "面包是高碳水化合物食物，容易导致血糖快速上升。建议你下次尝试搭配蛋白质和蔬菜，可以减缓血糖上升速度。"},
        {"role": "user", "content": "好的，我会注意的。我想每周至少运动3次。"},
        {"role": "assistant", "content": "很好的目标！建议你选择自己喜欢的运动方式，比如快走、游泳或骑自行车，每次30分钟左右。"}
    ]
    
    result = service.process_conversation(
        user_id='test_user',
        conversation_id='test_conv_123',
        channel='gpt_chat',
        transcript=test_transcript,
        user_name='测试用户'
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

