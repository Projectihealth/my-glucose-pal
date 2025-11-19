"""
Call Results Service
处理通话结束后的结果生成：摘要、Goals、TODO建议
"""
import os
import sys
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from shared.database import get_connection, MemoryRepository

logger = logging.getLogger(__name__)

# OpenAI Client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    logging.warning("openai package not installed")
    openai_client = None


def format_duration(seconds: int) -> str:
    """格式化时长为 'X min Y sec'"""
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes} min {secs} sec"


async def generate_conversation_summary(
    transcript: List[Dict[str, Any]],
    duration_seconds: int
) -> Dict[str, Any]:
    """
    生成对话摘要（纯文本格式，适合展示在 CallResultsPage）

    Args:
        transcript: 对话记录列表
        duration_seconds: 通话时长（秒）

    Returns:
        {
            "overview": "纯文本总结（2-3句话）",
            "key_findings": ["要点1", "要点2", "要点3"],
            "duration": "12 min 34 sec"
        }
    """
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized")

        # 将 transcript 转换为可读文本
        if isinstance(transcript, list):
            transcript_text = "\n".join([
                f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
                for msg in transcript
            ])
        else:
            transcript_text = str(transcript)

        prompt = f"""Based on the following health coaching conversation, generate a concise bullet-point summary.

Conversation:
{transcript_text}

Please provide a JSON response with:
1. "overview": A structured bullet-point summary (3-5 bullet points). Each bullet should be:
   - One clear, concise sentence or two related sentences maximum
   - Start with '• ' (bullet point character)
   - Written in second person perspective (You and Olivia)
   - Focus on: what was discussed, key recommendations, and action plans
   
   Example format:
   "• You shared your current breakfast routine of boiled eggs and yogurt, and expressed concerns about feeling hungry before lunch.
   • Olivia suggested adding more fiber and protein through options like nuts, seeds, whole grains, and fruit to keep you fuller longer.
   • Together, you decided on a simple plan: having an egg and a banana for breakfast to improve satiety."

2. "key_findings": An array of 3-5 key takeaways or important points (each as a short sentence)

Keep it concise, scannable, and user-friendly."""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health summary assistant. Provide concise, actionable summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        return {
            "overview": result.get("overview", ""),
            "key_findings": result.get("key_findings", []),
            "duration": format_duration(duration_seconds)
        }

    except Exception as e:
        logger.error(f"Failed to generate conversation summary: {e}", exc_info=True)
        raise


async def generate_and_save_goals(
    user_id: str,
    conversation_id: str,
    transcript: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    生成并保存健康目标（对比历史状态更新）

    从对话中提取健康目标，对比 long_term_memory 中的历史目标，
    更新状态（NOT STARTED → IN PROGRESS → ACHIEVED）

    Args:
        user_id: 用户ID
        conversation_id: 对话ID
        transcript: 对话记录

    Returns:
        {
            "goals": [
                {
                    "id": "goal_1",
                    "title": "Consume more vegetables...",
                    "status": "IN PROGRESS",
                    "currentBehavior": "...",
                    "recommendation": "..."
                }
            ]
        }
    """
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized")

        # 1. 获取历史 goals
        with get_connection() as conn:
            memory_repo = MemoryRepository(conn)
            long_term_memory = memory_repo.get_long_term_memory(user_id)

        historical_goals = {}
        if long_term_memory and long_term_memory.get('health_goals'):
            try:
                if isinstance(long_term_memory['health_goals'], str):
                    historical_goals = json.loads(long_term_memory['health_goals'])
                else:
                    historical_goals = long_term_memory['health_goals']
            except:
                historical_goals = {}

        # 2. 将 transcript 转换为文本
        if isinstance(transcript, list):
            transcript_text = "\n".join([
                f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
                for msg in transcript
            ])
        else:
            transcript_text = str(transcript)

        # 3. 调用 LLM 分析目标进展
        prompt = f"""Analyze this health coaching conversation and extract health goals with their achievement status.

Historical Goals (if any):
{json.dumps(historical_goals, indent=2, ensure_ascii=False)}

Current Conversation:
{transcript_text}

For each health goal mentioned or relevant to the conversation:
1. Determine if it's a new goal or matches a historical goal
2. Assess the status: "ACHIEVED", "IN PROGRESS", or "NOT STARTED"
3. Describe current behavior (if status is IN PROGRESS or ACHIEVED)
4. Provide a recommendation

Return JSON in this format:
{{
  "goals": [
    {{
      "id": "unique_goal_id",  # Use existing ID if matching historical goal, or create new one
      "title": "Clear, specific goal statement",
      "status": "ACHIEVED" | "IN PROGRESS" | "NOT STARTED",
      "currentBehavior": "What the user is currently doing (optional)",
      "recommendation": "Actionable recommendation to achieve/maintain the goal"
    }}
  ]
}}

Guidelines:
- Limit to 3-5 most relevant goals
- Be specific and actionable
- Focus on dietary, exercise, sleep, and stress management goals"""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health goal analysis expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        goals = result.get("goals", [])

        # 4. 保存到 long_term_memory.health_goals
        goals_to_save = {
            "goals": goals,
            "last_updated": datetime.utcnow().isoformat(),
            "last_conversation_id": conversation_id
        }

        with get_connection() as conn:
            memory_repo = MemoryRepository(conn)
            memory_repo.update_long_term_memory(
                user_id=user_id,
                health_goals=goals_to_save
            )
            conn.commit()

        logger.info(f"✓ Generated and saved {len(goals)} goals for user {user_id}")

        return {"goals": goals}

    except Exception as e:
        logger.error(f"Failed to generate goals: {e}", exc_info=True)
        raise


async def generate_todo_suggestions(
    user_id: str,
    conversation_id: str,
    transcript: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    生成 TODO 建议（不保存到数据库）

    从对话中提取可执行的行动项，并由 LLM 判断优先级和推荐标签

    Args:
        user_id: 用户ID
        conversation_id: 对话ID (用于上下文，但不保存)
        transcript: 对话记录

    Returns:
        {
            "suggestions": [
                {
                    "title": "Eat nutritious breakfast...",
                    "description": "...",
                    "category": "diet",
                    "health_benefit": "...",
                    "time_of_day": "09:00-10:00",
                    "time_description": "Before work",
                    "target_count": 7,
                    "priority": "high",
                    "recommendation_tag": "ai_recommended"
                }
            ]
        }
    """
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized")

        # 将 transcript 转换为文本
        if isinstance(transcript, list):
            transcript_text = "\n".join([
                f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
                for msg in transcript
            ])
        else:
            transcript_text = str(transcript)

        prompt = f"""Extract actionable TODO items from this health coaching conversation.

Conversation:
{transcript_text}

For each actionable habit or behavior change that was discussed or agreed upon:

Return JSON in this format:
{{
  "suggestions": [
    {{
      "title": "Specific action with details (e.g., 'Eat Greek yogurt with nuts for breakfast')",
      "description": "Optional additional details",
      "category": "diet" | "exercise" | "sleep" | "stress" | "medication" | "other",
      "health_benefit": "Why this helps (1-2 sentences)",
      "time_of_day": "HH:MM-HH:MM" (e.g., "09:00-10:00") or "all_day",
      "time_description": "Human-readable time (e.g., 'Before work', 'After dinner')",
      "target_count": 1-7 (suggested times per week),
      "priority": "high" | "medium" | "low",
      "recommendation_tag": "ai_recommended" | "quick_win" | "high_impact" | "doctor_suggested"
    }}
  ]
}}

Guidelines for priority:
- high: Urgent or critical for health goals
- medium: Important but not urgent
- low: Nice to have, supportive habit

Guidelines for recommendation_tag:
- ai_recommended: Based on AI analysis of the conversation
- quick_win: Easy to implement, quick results
- high_impact: Significant health benefit
- doctor_suggested: Mentioned as doctor's advice

Only include items that were actually discussed or implied in the conversation.
Limit to 3-6 most important actionable items."""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health habit extraction expert. Extract specific, actionable TODO items."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        suggestions = result.get("suggestions", [])

        logger.info(f"✓ Generated {len(suggestions)} TODO suggestions for user {user_id}")

        return {"suggestions": suggestions}

    except Exception as e:
        logger.error(f"Failed to generate TODO suggestions: {e}", exc_info=True)
        raise
