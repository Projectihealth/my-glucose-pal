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

            # 3. 提取 TODO - DISABLED: TODOs are now generated on-demand in CallResultsPage
            # todos = self._extract_todos(transcript, user_name)
            todos = []  # Empty list since we're not auto-extracting TODOs anymore

            # 4. 保存到数据库
            memory_id = None
            if memory_result.get('summary'):
                # Merge optional title into extracted_data for later use in dashboards
                extracted_data = memory_result.get('extracted_data') or {}
                title = memory_result.get('title')
                if title:
                    # Store under a stable key so frontend can read it
                    extracted_data.setdefault('session_title', title)
                memory_id = self.memory_repo.save_memory(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    channel=channel,
                    summary=memory_result['summary'],
                    insights=memory_result.get('insights'),
                    key_topics=memory_result.get('key_topics', []),
                    extracted_data=extracted_data
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
            import traceback
            traceback.print_exc()
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
            return {'summary': 'Empty conversation', 'insights': None, 'key_topics': [], 'extracted_data': {}}
        
        prompt = f"""Analyze the following health assistant conversation with the user and extract key information.

Conversation transcript:
{transcript_text}

Please return the following content in JSON format:
{{
  "title": "A short, concise English title (3-7 words) for this conversation, in Title Case, no quotes, no emojis, no ending punctuation. It should capture the main health topic or goal discussed. Examples: 'Nutrition Habits', 'Sleep Routine Check-in', 'Breakfast Planning', 'Stress Management Support'.",
  "summary": "A structured bullet-point summary in second person perspective (You and Olivia). Format as a clean bulleted list following these requirements:
              
              FORMAT RULES:
              - Use bullet points (•) to separate key points
              - Each bullet point should be 1-2 sentences maximum
              - Keep bullets concise and scannable
              - Use line breaks between bullets
              - Limit to 3-5 main bullet points total
              
              CONTENT RULES:
              1. MUST use second person: 'You mentioned...', 'Olivia suggested...', 'You plan to...', 'Together you decided...'
              2. NEVER use third person: avoid 'The user', 'The assistant'
              3. First bullet: What you discussed/your main concern
              4. Middle bullets: Key recommendations or insights Olivia provided (with specific details)
              5. Last bullet: Action plan or next steps you agreed on
              
              EXAMPLE FORMAT:
              • You shared that you've been experiencing nighttime hunger and asked Olivia for advice on healthy snack options.
              • Olivia recommended Greek yogurt with nuts or a small portion of hummus with vegetables, explaining these provide protein and healthy fats to keep you satisfied.
              • You decided to try having a small yogurt snack (150g) around 9 PM, about 2 hours before bedtime.
              
              DO NOT:
              ❌ Write long paragraphs
              ❌ Use numbered lists (1, 2, 3)
              ❌ Use third person voice
              ❌ Include more than 5 bullet points",
  
  "insights": "Insights, patterns, or trends discovered from the conversation (e.g., user's behavioral habits, emotional state, root causes of health issues)",
  
  "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
  
  "extracted_data": {{
    "mentioned_foods": ["food1", "food2", ...],
    "mentioned_activities": ["activity1", "activity2", ...],
    "glucose_concerns": ["concern1", "concern2", ...],
    "user_mood": "positive/neutral/negative",
    
    "specific_recommendations": [
      {{
        "topic": "Recommendation topic (e.g., 'Breakfast Improvement', 'Exercise Plan')",
        "options": ["specific option 1", "specific option 2"],
        "rationale": "Why this is recommended (principle/benefits)",
        "implementation": "How to implement (optional)"
      }}
    ],
    
    "user_commitments": ["What user committed to do 1", "What user committed to do 2"],
    
    "discussed_timing": {{
      "breakfast": "time description",
      "lunch": "time description",
      "dinner": "time description"
    }}
  }}
}}

Return only JSON, no other text."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional health conversation analysis assistant, skilled at extracting structured information from conversations. Always respond in English. IMPORTANT: When writing summaries, always use second person perspective (You and Olivia) to create an engaging, personal tone for the user reading it. Never use third person like 'The user' or 'The assistant'."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            # Ensure we always return a dict with expected keys
            if not isinstance(result, dict):
                return {
                    'summary': 'Failed to summarize conversation',
                    'insights': None,
                    'key_topics': [],
                    'extracted_data': {}
                }
            result.setdefault('summary', '')
            result.setdefault('insights', None)
            result.setdefault('key_topics', [])
            result.setdefault('extracted_data', {})
            return result
            
        except Exception as e:
            print(f"❌ Extract session memory failed: {e}")
            return {
                'summary': 'Failed to summarize conversation',
                'insights': None,
                'key_topics': [],
                'extracted_data': {}
            }
    
    def _sanitize_for_json(self, data: Any) -> Any:
        """
        清理数据以便 JSON 序列化，转换 datetime 对象为字符串
        """
        if isinstance(data, dict):
            return {k: self._sanitize_for_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_for_json(item) for item in data]
        elif isinstance(data, datetime):
            return data.isoformat()
        else:
            return data
    
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
        
        # 清理 existing_memory 中的 datetime 对象
        sanitized_memory = self._sanitize_for_json(existing_memory or {})
        
        prompt = f"""Analyze the following conversation and determine if it contains information about the user's long-term habits, goals, preferences, etc.

Existing long-term memory:
{json.dumps(sanitized_memory, ensure_ascii=False, indent=2)}

Current conversation:
{transcript_text}

If the conversation contains new or updated long-term information, return the fields that need to be updated in JSON format:
{{
  "preferences": {{"preference category": "preference content"}},
  "health_goals": {{"goal category": "goal description"}},
  "habits": {{"habit category": "habit description"}},
  "dietary_patterns": {{"diet pattern": "description"}},
  "exercise_patterns": {{"exercise pattern": "description"}},
  "stress_patterns": {{"stress pattern": "description"}},
  "sleep_patterns": {{"sleep pattern": "description"}},
  "concerns": ["concern 1", "concern 2"]
}}

If there is no long-term information to update, return an empty object {{}}.
Return only JSON, no other text."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional health information extraction assistant, skilled at identifying users' long-term habits and goals. Always respond in English."},
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
        
        prompt = f"""Analyze the following health assistant conversation with {user_name} and extract action items (TODOs) that both parties agreed upon.

Conversation transcript:
{transcript_text}

Please return TODO list in JSON format:
{{
  "todos": [
    {{
      "title": "Clear action description (include specific options, in English)",
      "description": "Additional notes (optional, usually empty)",
      "category": "diet/exercise/sleep/stress/medication/other",
      "health_benefit": "Why do this (health benefits/impact)",
      "time_of_day": "Execution time period (HH:MM-HH:MM format)",
      "time_description": "Time description (e.g., 'Before work', 'After dinner')",
      "target_count": target number,
      "current_count": 0,
      "status": "pending"
    }}
  ]
}}

【Important Instructions】

1. **title (action description)**:
   - Clearly describe what to do, including specific options
   - If there are multiple option choices, separate with "/" or "or"
   - Examples:
     ✅ "Eat nutritious breakfast before work (Greek yogurt + nuts / pre-cooked eggs)"
     ✅ "Exercise 3 times per week, 30 minutes each (brisk walking/jogging)"
     ✅ "Go to bed before 11 PM every night"
     ❌ "Improve breakfast habits" (too vague)

2. **health_benefit (health benefits)**:
   - Explain why do this, what health benefits it provides
   - Reinforce user's motivation to execute
   - Examples:
     ✅ "Reduce hunger-induced blood sugar drops, stabilize morning glucose levels"
     ✅ "Improve insulin sensitivity, help control blood sugar"
     ✅ "Improve sleep quality, help blood sugar regulation and metabolic health"
     ❌ "Good for health" (too vague)

3. **time_of_day (execution time period)**:
   - Format: "HH:MM-HH:MM" (24-hour format)
   - Infer based on user's schedule mentioned in conversation
   - Examples:
     - Breakfast: "09:00-10:00" (if user says "half hour after waking up", infer wake time)
     - Lunch: "12:00-13:00"
     - Dinner: "19:00-20:00"
     - Exercise: "20:00-21:00" (if says "1 hour after dinner")
     - Sleep: "22:00-23:00" (if says "before 11 PM")
   - ⚠️ **Important: Avoid cross-day times**
     - ❌ Wrong: "23:00-01:00" (crosses day)
     - ✅ Correct: "23:00-23:59" (only record same-day part)
   - If no explicit time in conversation, infer based on common sense and category
   - If all-day task (like "drink 8 glasses of water daily"), fill "All day"

4. **time_description (time description)**:
   - User-friendly time description
   - Examples:
     ✅ "Before work"
     ✅ "Lunchtime"
     ✅ "1 hour after dinner"
     ✅ "Before bed"
     ✅ "Monday, Wednesday, Friday evenings"

5. **description**:
   - Usually empty (title already contains enough information)
   - Only use when additional clarification is needed

6. **category**: 
   - Must be one of: diet, exercise, sleep, stress, medication, other

7. **target_count**: 
   - Weekly target count (if "3 times per week" then 3, if "daily" then 7)

8. **Only extract action items with clear consensus**

【Complete Examples】

Example 1 (Diet - Breakfast):
{{
  "title": "Eat nutritious breakfast before work (Greek yogurt + nuts / pre-cooked eggs)",
  "description": "",
  "category": "diet",
  "health_benefit": "Reduce hunger-induced blood sugar drops, stabilize morning glucose levels",
  "time_of_day": "09:00-10:00",
  "time_description": "Before work",
  "target_count": 7,
  "current_count": 0,
  "status": "pending"
}}

Example 2 (Exercise):
{{
  "title": "Exercise 3 times per week, 30 minutes each (brisk walking/jogging)",
  "description": "",
  "category": "exercise",
  "health_benefit": "Improve insulin sensitivity, help control blood sugar",
  "time_of_day": "20:00-21:00",
  "time_description": "1 hour after dinner",
  "target_count": 3,
  "current_count": 0,
  "status": "pending"
}}

Example 3 (Sleep):
{{
  "title": "Go to bed before 11 PM every night",
  "description": "",
  "category": "sleep",
  "health_benefit": "Improve sleep quality, help blood sugar regulation and metabolic health",
  "time_of_day": "22:30-23:00",
  "time_description": "Before bed",
  "target_count": 7,
  "current_count": 0,
  "status": "pending"
}}

【Output Requirements】
- Return only JSON format, no other text
- If no clear TODOs, return {{"todos": []}}
- Ensure JSON format is correct and parseable
- time_of_day must be "HH:MM-HH:MM" format or "All day"
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional action item extraction assistant, skilled at identifying executable health action plans from conversations. Always respond in English."},
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
            # List[Dict] format (GPT chat / Tavus video)
            lines = []
            for msg in transcript:
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                if role == 'user':
                    lines.append(f"User: {content}")
                elif role == 'assistant':
                    lines.append(f"Olivia: {content}")
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

