"""
Memory Service - 从对话中提取记忆和 TODO

负责调用 OpenAI 从 transcript 中提取:
1. 短期记忆 (session summary)
2. 长期记忆更新 (habits, goals, patterns)
3. TODO 列表 (action items)
"""

import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from openai import OpenAI

# 注意：这里导入路径不同
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.conversation_manager import ConversationManager


class MemoryService:
    """从对话中提取并保存记忆和 TODO"""
    
    def __init__(self, openai_api_key: Optional[str] = None, db_path: Optional[str] = None):
        """
        初始化 MemoryService
        
        Args:
            openai_api_key: OpenAI API key
            db_path: 数据库路径
        """
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required")
        
        self.client = OpenAI(api_key=self.openai_api_key)
        self.conversation_manager = ConversationManager(db_path=db_path)
    
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
                memory_id = self.conversation_manager.save_memory(
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
                self.conversation_manager.update_long_term_memory(
                    user_id=user_id,
                    **long_term_updates
                )
            
            # 6. 保存 TODO
            todo_ids = []
            if todos:
                todo_ids = self.conversation_manager.save_todos(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    todos=todos
                )
            
            return {
                'success': True,
                'memory_id': memory_id,
                'long_term_updated': bool(long_term_updates),
                'todo_ids': todo_ids,
                'summary': memory_result.get('summary'),
                'todos_count': len(todos)
            }
            
        except Exception as e:
            print(f"❌ MemoryService 处理失败: {e}")
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
  "summary": "本次对话的简短总结（1-2句话）",
  "insights": "从对话中发现的洞察或模式",
  "key_topics": ["话题1", "话题2", ...],
  "extracted_data": {{
    "mentioned_foods": ["食物1", "食物2", ...],
    "mentioned_activities": ["活动1", "活动2", ...],
    "glucose_concerns": ["关注点1", "关注点2", ...],
    "user_mood": "positive/neutral/negative"
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
        existing_memory = self.conversation_manager.get_long_term_memory(user_id)
        
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
      "title": "TODO 标题（简短）",
      "description": "详细描述",
      "category": "diet/exercise/sleep/stress/medication/other",
      "target_count": 3,
      "current_count": 0,
      "status": "pending"
    }}
  ]
}}

注意：
- 只提取明确达成共识的行动项
- target_count 是本周目标次数（如"每周运动3次"则为3）
- category 必须是上述类别之一
- 如果没有明确的 TODO，返回空列表

只返回 JSON，不要其他文字。"""
        
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

