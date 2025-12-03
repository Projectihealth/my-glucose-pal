"""
Intake Phone Agent Service
业务逻辑层：创建 Web Call，获取用户信息等

这是原 service.py 的简化版本,保持相同的功能
"""

import os
import sys
import logging
import requests
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Retell SDK
try:
    from retell import Retell
except ImportError:
    logging.warning("retell-sdk not installed. Please install: pip install retell-sdk")
    Retell = None

# Import VoiceChatContextService
try:
    from .voice_chat_context_service import get_context_service
    CONTEXT_SERVICE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"VoiceChatContextService not available: {e}")
    CONTEXT_SERVICE_AVAILABLE = False

# Import shared database repositories
from shared.database import get_connection, MemoryRepository, TodoRepository, ConversationRepository, OnboardingStatusRepository

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# 从环境变量获取配置
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
INTAKE_AGENT_ID = os.getenv("INTAKE_AGENT_ID", "agent_c7d1cb2c279ec45bce38c95067")
INTAKE_LLM_ID = os.getenv("INTAKE_LLM_ID", "llm_e54c307ce74090cdfd06f682523b")
CGM_BACKEND_URL = os.getenv("CGM_BACKEND_URL", "http://localhost:5000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 获取 prompts 目录（正确路径：src/routers/intake_phone_agent/prompts/）
PROMPTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "routers",
    "intake_phone_agent",
    "prompts"
)
OLIVIA_PROMPT_PATH = os.path.join(PROMPTS_DIR, "olivia_coach_prompt.txt")
OLIVIA_NEW_USER_PROMPT_PATH = os.path.join(PROMPTS_DIR, "olivia_new_user_prompt.txt")
OLIVIA_RETURNING_USER_PROMPT_PATH = os.path.join(PROMPTS_DIR, "olivia_returning_user_prompt.txt")
BEGIN_MESSAGE_PATH = os.path.join(PROMPTS_DIR, "begin_message.txt")

# OpenAI Client
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    logging.warning("openai package not installed. Please install: pip install openai")
    openai_client = None


def get_retell_client() -> Retell:
    """初始化 Retell 客户端"""
    if not Retell:
        raise RuntimeError("Retell SDK not installed. Please install: pip install retell-sdk")
    
    if not RETELL_API_KEY:
        raise RuntimeError("RETELL_API_KEY environment variable is not set")
    
    return Retell(api_key=RETELL_API_KEY)


async def get_cgm_butler_user_info(user_id: str) -> Dict[str, Any]:
    """从 CGM Butler 数据库获取用户信息"""
    try:
        response = requests.get(
            f"{CGM_BACKEND_URL}/api/user/{user_id}",
            timeout=5
        )
        response.raise_for_status()
        user_data = response.json()
        
        logger.info(f"==== Successfully fetched user info for user_id: {user_id}")
        return user_data
        
    except Exception as e:
        logger.warning(f"==== Failed to fetch CGM Butler user info: {e}")
        return {
            "name": "there",
            "health_goal": "managing your health",
            "conditions": "your health",
            "cgm_device_type": "CGM device",
            "date_of_birth": "1990-01-01"
        }


async def get_cgm_data_summary(user_id: str) -> Dict[str, Any]:
    """
    获取用户CGM数据摘要（精简版，只包含最有用的信息）
    
    Returns:
        包含当前血糖、24小时统计、7天趋势、周对周比较的字典
    """
    try:
        # 1. 获取当前血糖
        current_glucose = None
        glucose_status = None
        last_reading_time = None
        
        try:
            response = requests.get(
                f"{CGM_BACKEND_URL}/api/glucose/{user_id}",
                timeout=3
            )
            if response.status_code == 200:
                glucose_data = response.json()
                current_glucose = glucose_data.get('glucose')
                glucose_status = glucose_data.get('status')
                last_reading_time = glucose_data.get('timestamp')
        except Exception as e:
            logger.warning(f"Failed to fetch current glucose: {e}")
        
        # 2. 获取24小时统计
        stats_24h = None
        time_in_range_24h = None
        
        try:
            response = requests.get(
                f"{CGM_BACKEND_URL}/api/stats/{user_id}",
                timeout=3
            )
            if response.status_code == 200:
                stats_data = response.json()
                stats = stats_data.get('stats', {})
                stats_24h = {
                    'avg': round(stats.get('avg_glucose', 0), 1) if stats.get('avg_glucose') else None,
                    'min': stats.get('min_glucose'),
                    'max': stats.get('max_glucose'),
                }
                time_in_range_24h = stats_data.get('time_in_range')
        except Exception as e:
            logger.warning(f"Failed to fetch 24h stats: {e}")
        
        # 3. 获取最近6小时的读数（用于判断短期趋势）
        recent_trend = None
        
        try:
            response = requests.get(
                f"{CGM_BACKEND_URL}/api/recent/{user_id}/12",  # 12个读数约6小时
                timeout=3
            )
            if response.status_code == 200:
                readings = response.json()
                if len(readings) >= 2:
                    # 简单判断趋势：比较最新和30分钟前
                    latest = readings[0]['glucose_value']
                    earlier = readings[min(6, len(readings)-1)]['glucose_value']  # 约30分钟前
                    diff = latest - earlier
                    
                    if diff > 15:
                        recent_trend = "rising"
                    elif diff < -15:
                        recent_trend = "falling"
                    else:
                        recent_trend = "stable"
        except Exception as e:
            logger.warning(f"Failed to fetch recent trend: {e}")
        
        # 4. 获取7天数据（用于计算本周平均和上周平均）
        stats_7d = None
        stats_prev_7d = None
        week_over_week_change = None
        
        try:
            from datetime import datetime, timedelta
            
            # 本周（最近7天）
            response = requests.get(
                f"{CGM_BACKEND_URL}/api/recent/{user_id}/2016",  # 7天 * 24小时 * 12次/小时 = 2016
                timeout=3
            )
            if response.status_code == 200:
                readings = response.json()
                
                if len(readings) > 0:
                    # 计算本周（最近7天）的平均
                    now = datetime.now()
                    seven_days_ago = now - timedelta(days=7)
                    fourteen_days_ago = now - timedelta(days=14)
                    
                    this_week_readings = []
                    last_week_readings = []
                    
                    for reading in readings:
                        try:
                            timestamp = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
                            glucose = reading['glucose_value']
                            
                            if timestamp >= seven_days_ago:
                                this_week_readings.append(glucose)
                            elif timestamp >= fourteen_days_ago:
                                last_week_readings.append(glucose)
                        except:
                            continue
                    
                    # 计算本周平均
                    if this_week_readings:
                        this_week_avg = sum(this_week_readings) / len(this_week_readings)
                        this_week_tir = sum(1 for g in this_week_readings if 70 <= g <= 140) / len(this_week_readings) * 100
                        
                        stats_7d = {
                            'avg': round(this_week_avg, 1),
                            'time_in_range': round(this_week_tir, 1)
                        }
                    
                    # 计算上周平均和周对周变化
                    if last_week_readings and this_week_readings:
                        last_week_avg = sum(last_week_readings) / len(last_week_readings)
                        stats_prev_7d = {
                            'avg': round(last_week_avg, 1)
                        }
                        
                        # 计算变化
                        change = this_week_avg - last_week_avg
                        change_pct = (change / last_week_avg) * 100 if last_week_avg > 0 else 0
                        
                        # 判断改进还是恶化
                        if abs(change) < 3:  # 变化小于3 mg/dL认为是稳定
                            trend_direction = "stable"
                        elif change < 0:  # 平均血糖降低
                            trend_direction = "improved"
                        else:  # 平均血糖升高
                            trend_direction = "worsened"
                        
                        week_over_week_change = {
                            'change': round(change, 1),
                            'change_pct': round(change_pct, 1),
                            'direction': trend_direction
                        }
                        
        except Exception as e:
            logger.warning(f"Failed to calculate weekly trends: {e}")
        
        # 5. 计算每日模式（早餐后、午餐后、晚餐后、夜间）
        daily_patterns = None
        try:
            if len(readings) > 0:
                from datetime import datetime
                
                breakfast_readings = []  # 7-10 AM
                lunch_readings = []      # 12-2 PM
                dinner_readings = []     # 6-9 PM
                overnight_readings = []  # 12-6 AM
                
                for reading in readings:
                    try:
                        timestamp = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
                        hour = timestamp.hour
                        glucose = reading['glucose_value']
                        
                        if 7 <= hour < 10:
                            breakfast_readings.append(glucose)
                        elif 12 <= hour < 14:
                            lunch_readings.append(glucose)
                        elif 18 <= hour < 21:
                            dinner_readings.append(glucose)
                        elif 0 <= hour < 6:
                            overnight_readings.append(glucose)
                    except:
                        continue
                
                daily_patterns = {
                    'breakfast_avg': round(sum(breakfast_readings) / len(breakfast_readings), 1) if breakfast_readings else None,
                    'lunch_avg': round(sum(lunch_readings) / len(lunch_readings), 1) if lunch_readings else None,
                    'dinner_avg': round(sum(dinner_readings) / len(dinner_readings), 1) if dinner_readings else None,
                    'overnight_avg': round(sum(overnight_readings) / len(overnight_readings), 1) if overnight_readings else None
                }
        except Exception as e:
            logger.warning(f"Failed to calculate daily patterns: {e}")
        
        # 6. 计算波动性（标准差和变异系数）
        variability = None
        try:
            if len(readings) > 0:
                import statistics
                glucose_values = [r['glucose_value'] for r in readings if 'glucose_value' in r]
                
                if len(glucose_values) > 1:
                    mean_glucose = statistics.mean(glucose_values)
                    std_dev = statistics.stdev(glucose_values)
                    cv = (std_dev / mean_glucose * 100) if mean_glucose > 0 else 0
                    
                    variability = {
                        'std_dev': round(std_dev, 1),
                        'cv': round(cv, 1),
                        'stability': 'stable' if cv < 36 else 'variable'  # CV < 36% is considered stable
                    }
        except Exception as e:
            logger.warning(f"Failed to calculate variability: {e}")
        
        # 7. 统计低血糖和高血糖事件
        hypo_hyper_events = None
        try:
            if len(readings) > 0:
                from datetime import datetime, timedelta
                now = datetime.now()
                one_day_ago = now - timedelta(days=1)
                seven_days_ago = now - timedelta(days=7)
                
                hypo_24h = 0
                hyper_24h = 0
                hypo_7d = 0
                hyper_7d = 0
                
                for reading in readings:
                    try:
                        timestamp = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
                        glucose = reading['glucose_value']
                        
                        is_hypo = glucose < 70
                        is_hyper = glucose > 180
                        
                        if timestamp >= one_day_ago:
                            if is_hypo:
                                hypo_24h += 1
                            if is_hyper:
                                hyper_24h += 1
                        
                        if timestamp >= seven_days_ago:
                            if is_hypo:
                                hypo_7d += 1
                            if is_hyper:
                                hyper_7d += 1
                    except:
                        continue
                
                hypo_hyper_events = {
                    'hypo_24h': hypo_24h,
                    'hyper_24h': hyper_24h,
                    'hypo_7d': hypo_7d,
                    'hyper_7d': hyper_7d
                }
        except Exception as e:
            logger.warning(f"Failed to calculate hypo/hyper events: {e}")
        
        # 8. 找到最近的峰值（过去24小时内的高峰）
        recent_peaks = None
        try:
            if len(readings) > 0:
                from datetime import datetime, timedelta
                now = datetime.now()
                one_day_ago = now - timedelta(days=1)
                
                recent_readings = []
                for reading in readings:
                    try:
                        timestamp = datetime.fromisoformat(reading['timestamp'].replace('Z', '+00:00'))
                        if timestamp >= one_day_ago:
                            recent_readings.append({
                                'glucose': reading['glucose_value'],
                                'timestamp': timestamp
                            })
                    except:
                        continue
                
                # 找到最高的3个读数
                if recent_readings:
                    sorted_readings = sorted(recent_readings, key=lambda x: x['glucose'], reverse=True)
                    top_peaks = sorted_readings[:3]
                    
                    # 只保留明显的峰值（>160）
                    significant_peaks = [p for p in top_peaks if p['glucose'] > 160]
                    
                    if significant_peaks:
                        recent_peaks = [{
                            'glucose': p['glucose'],
                            'time_ago': _format_time_ago(now, p['timestamp'])
                        } for p in significant_peaks]
        except Exception as e:
            logger.warning(f"Failed to find recent peaks: {e}")
        
        return {
            "has_data": current_glucose is not None,
            "current": {
                "glucose": current_glucose,
                "status": glucose_status,
                "timestamp": last_reading_time,
                "trend": recent_trend
            },
            "stats_24h": stats_24h,
            "time_in_range_24h": time_in_range_24h,
            "stats_7d": stats_7d,
            "stats_prev_7d": stats_prev_7d,
            "week_over_week": week_over_week_change,
            "daily_patterns": daily_patterns,
            "variability": variability,
            "hypo_hyper_events": hypo_hyper_events,
            "recent_peaks": recent_peaks
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch CGM data summary: {e}")
        return {
            "has_data": False,
            "current": None,
            "stats_24h": None,
            "time_in_range_24h": None,
            "stats_7d": None,
            "stats_prev_7d": None,
            "week_over_week": None
        }


def _format_time_ago(now, timestamp):
    """格式化时间差为可读文本"""
    try:
        diff = now - timestamp
        hours = diff.total_seconds() / 3600
        
        if hours < 1:
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minutes ago"
        elif hours < 24:
            return f"{int(hours)} hours ago"
        else:
            days = int(hours / 24)
            return f"{days} days ago"
    except:
        return "recently"


def calculate_age(date_of_birth: str) -> int:
    """计算年龄"""
    try:
        dob = datetime.strptime(date_of_birth.split('T')[0], "%Y-%m-%d")
        today = datetime.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except Exception as e:
        logger.warning(f"==== Failed to calculate age: {e}")
        return 0


async def get_user_memory_context(user_id: str) -> Dict[str, Any]:
    """
    获取用户的记忆上下文，包括：
    - 长期记忆（健康目标、偏好、习惯）
    - 近期记忆（过去7天）
    - 活跃的待办事项
    - 最近的对话
    """
    try:
        with get_connection() as conn:
            memory_repo = MemoryRepository(conn)
            todo_repo = TodoRepository(conn)
            conv_repo = ConversationRepository(conn)

            # 获取长期记忆
            long_term_memory = memory_repo.get_long_term_memory(user_id)

            # 获取近期记忆（过去7天）
            recent_memories = memory_repo.get_recent_memories(user_id, days=7, limit=5)

            # 获取活跃的待办事项
            all_todos = todo_repo.get_by_user(user_id)
            active_todos = [todo for todo in all_todos if todo['status'] in ['pending', 'in_progress']]

            # 获取最近的对话
            recent_conversations = conv_repo.get_user_conversations(user_id, limit=3)

            return {
                'long_term_memory': long_term_memory,
                'recent_memories': recent_memories,
                'active_todos': active_todos,
                'recent_conversations': recent_conversations
            }
    except Exception as e:
        logger.warning(f"Failed to get memory context for {user_id}: {e}")
        return {
            'long_term_memory': {},
            'recent_memories': [],
            'active_todos': [],
            'recent_conversations': []
        }


def format_cgm_data_for_prompt(cgm_data: Dict[str, Any]) -> str:
    """
    将CGM数据格式化为简洁的prompt文本
    
    Args:
        cgm_data: CGM数据字典
        
    Returns:
        格式化的文本字符串
    """
    if not cgm_data.get("has_data"):
        return "No CGM data available yet."
    
    sections = []
    
    # 当前血糖
    current = cgm_data.get("current", {})
    if current and current.get("glucose"):
        glucose = current["glucose"]
        status = current.get("status", "Unknown")
        trend = current.get("trend", "")
        
        trend_text = ""
        if trend == "rising":
            trend_text = " ↗ (rising)"
        elif trend == "falling":
            trend_text = " ↘ (falling)"
        elif trend == "stable":
            trend_text = " → (stable)"
        
        sections.append(f"**Current:** {glucose} mg/dL ({status}){trend_text}")
    
    # 24小时统计
    stats_24h = cgm_data.get("stats_24h")
    tir_24h = cgm_data.get("time_in_range_24h")
    if stats_24h and stats_24h.get("avg"):
        tir_text = f", TIR: {tir_24h}%" if tir_24h is not None else ""
        sections.append(f"**24h Avg:** {stats_24h['avg']} mg/dL{tir_text}")
    
    # 7天统计和周对周比较
    stats_7d = cgm_data.get("stats_7d")
    week_change = cgm_data.get("week_over_week")
    
    if stats_7d and stats_7d.get("avg"):
        week_text = f"**7-Day Avg:** {stats_7d['avg']} mg/dL"
        
        # 添加周对周变化
        if week_change:
            direction = week_change.get('direction')
            change = week_change.get('change')
            
            if direction == "improved":
                week_text += f" (↓ {abs(change)} from last week - improving!)"
            elif direction == "worsened":
                week_text += f" (↑ {change} from last week - needs attention)"
            else:
                week_text += " (stable week-over-week)"
        
        sections.append(week_text)
    
    # 每日模式
    daily_patterns = cgm_data.get("daily_patterns")
    if daily_patterns:
        pattern_parts = []
        if daily_patterns.get('breakfast_avg'):
            pattern_parts.append(f"Breakfast: {daily_patterns['breakfast_avg']} mg/dL")
        if daily_patterns.get('lunch_avg'):
            pattern_parts.append(f"Lunch: {daily_patterns['lunch_avg']} mg/dL")
        if daily_patterns.get('dinner_avg'):
            pattern_parts.append(f"Dinner: {daily_patterns['dinner_avg']} mg/dL")
        if daily_patterns.get('overnight_avg'):
            pattern_parts.append(f"Overnight: {daily_patterns['overnight_avg']} mg/dL")
        
        if pattern_parts:
            sections.append(f"**Daily Patterns:** {', '.join(pattern_parts)}")
    
    # 波动性
    variability = cgm_data.get("variability")
    if variability and variability.get('cv'):
        cv = variability['cv']
        stability = variability.get('stability', 'unknown')
        sections.append(f"**Variability:** CV {cv}% ({stability})")
    
    # 低血糖/高血糖事件
    events = cgm_data.get("hypo_hyper_events")
    if events:
        event_parts = []
        if events.get('hypo_24h', 0) > 0:
            event_parts.append(f"{events['hypo_24h']} low episodes (24h)")
        if events.get('hyper_24h', 0) > 0:
            event_parts.append(f"{events['hyper_24h']} high episodes (24h)")
        
        if event_parts:
            sections.append(f"**Events:** {', '.join(event_parts)}")
        elif events.get('hypo_24h', 0) == 0 and events.get('hyper_24h', 0) == 0:
            sections.append("**Events:** No hypo/hyper episodes in past 24h ✓")
    
    # 最近的峰值
    peaks = cgm_data.get("recent_peaks")
    if peaks and len(peaks) > 0:
        peak_texts = [f"{p['glucose']} mg/dL ({p['time_ago']})" for p in peaks[:2]]  # 只显示前2个
        sections.append(f"**Recent Peaks:** {', '.join(peak_texts)}")
    
    return "\n".join(sections) if sections else "CGM data available but incomplete."


def format_memory_for_prompt(memory_context: Dict[str, Any]) -> str:
    """将记忆上下文格式化为可读文本，用于prompt注入"""
    sections = []

    # 长期记忆
    long_term = memory_context.get('long_term_memory', {})
    if long_term:
        sections.append("**USER PROFILE:**")
        if long_term.get('health_goals'):
            sections.append(f"- Health Goals: {long_term['health_goals']}")
        if long_term.get('dietary_preferences'):
            sections.append(f"- Dietary Preferences: {long_term['dietary_preferences']}")
        if long_term.get('exercise_habits'):
            sections.append(f"- Exercise Habits: {long_term['exercise_habits']}")
        if long_term.get('concerns'):
            sections.append(f"- Health Concerns: {', '.join(long_term['concerns'])}")

    # 近期对话（从recent_conversations提取）
    recent_convs = memory_context.get('recent_conversations', [])
    if recent_convs:
        sections.append("\n**RECENT CONVERSATIONS:**")
        for conv in recent_convs[:3]:  # 最多3条
            # 从transcript提取关键信息
            transcript = conv.get('transcript', '')
            if transcript and len(transcript) > 50:
                # 提取前200个字符作为摘要
                summary = transcript[:200].replace('\n', ' ').strip()
                if len(transcript) > 200:
                    summary += "..."
                sections.append(f"- {summary}")

    # 从memory表提取的insights
    recent_memories = memory_context.get('recent_memories', [])
    if recent_memories:
        sections.append("\n**KEY INSIGHTS FROM PAST CONVERSATIONS:**")
        for mem in recent_memories[:2]:  # 最多2条
            if mem.get('summary'):
                sections.append(f"- {mem['summary'][:150]}")

    # 活跃待办事项
    todos = memory_context.get('active_todos', [])
    if todos:
        sections.append("\n**ACTIVE HEALTH GOALS:**")
        for todo in todos[:5]:  # 最多5条
            sections.append(f"- {todo['title']} (Progress: {todo['current_count']}/{todo['target_count']})")

    return "\n".join(sections) if sections else "No previous context available."


async def create_intake_web_call(
    user_id: str,
    previous_transcript: Optional[list] = None
) -> Dict[str, Any]:
    """创建 CGM Butler App 的 Web Call（支持动态 Context）"""
    try:
        logger.info(f"==== Fetching user info for user_id: {user_id}")
        user_info = await get_cgm_butler_user_info(user_id)

        dob = user_info.get('date_of_birth', '1990-01-01')
        age = calculate_age(dob)
        user_name = user_info.get('name', 'there')

        logger.info(f"==== User name: {user_name}, age: {age}")

        # 获取 onboarding status
        with get_connection() as conn:
            onboarding_repo = OnboardingStatusRepository(conn)
            onboarding_status = onboarding_repo.get_or_create(user_id)

        onboarding_stage = onboarding_status.get('onboarding_stage', 'not_started')
        completion_score = onboarding_status.get('completion_score', 0)

        logger.info(f"==== Onboarding stage: {onboarding_stage}, completion: {completion_score}%")

        # 获取当前时间信息（用于 time awareness 和 memory formatting）
        import pytz
        pacific_tz = pytz.timezone('America/Los_Angeles')
        now = datetime.now(pacific_tz)
        
        current_date = now.strftime("%A, %B %d, %Y")  # "Monday, December 02, 2025"
        current_time = now.strftime("%I:%M %p %Z")     # "02:30 PM PST"
        current_day_of_week = now.strftime("%A")       # "Monday"
        
        logger.info(f"==== Current time: {current_date} {current_time}")

        # 获取用户记忆上下文
        memory_context = await get_user_memory_context(user_id)
        memory_text = format_memory_for_prompt(memory_context)

        logger.info(f"==== Memory context loaded: {len(memory_text)} chars")

        # 获取CGM数据摘要
        cgm_data = await get_cgm_data_summary(user_id)
        cgm_text = format_cgm_data_for_prompt(cgm_data)
        
        logger.info(f"==== CGM data loaded: has_data={cgm_data.get('has_data', False)}")

        # 判断是否为新用户：
        # 1. 如果有对话历史或记忆，就是returning user
        # 2. 如果completion_score >= 80，就是returning user
        # 3. 否则才是新用户
        has_conversation_history = (
            memory_context.get('recent_conversations') and len(memory_context.get('recent_conversations', [])) > 0
        ) or (
            memory_context.get('recent_memories') and len(memory_context.get('recent_memories', [])) > 0
        )
        
        is_new_user = not has_conversation_history and completion_score < 80
        is_new_user_str = "true" if is_new_user else "false"
        
        logger.info(f"==== User type: is_new_user={is_new_user_str}, has_history={bool(has_conversation_history)}, score={completion_score}")
        
        # 根据用户类型选择对应的prompt并更新LLM
        if is_new_user:
            selected_prompt_path = OLIVIA_NEW_USER_PROMPT_PATH
            logger.info(f"==== Using NEW USER prompt for Olivia")
        else:
            selected_prompt_path = OLIVIA_RETURNING_USER_PROMPT_PATH
            logger.info(f"==== Using RETURNING USER prompt for Olivia")
        
        # 动态更新LLM的prompt（不更新begin_message，让LLM自己决定开场白）
        logger.info(f"==== Updating LLM {INTAKE_LLM_ID} with prompt: {selected_prompt_path}")
        try:
            await update_llm_settings({
                'llm_id': INTAKE_LLM_ID,
                'prompt_path': selected_prompt_path,
                'use_default_begin_message': False  # 不使用静态begin_message
            })
        except Exception as e:
            logger.error(f"==== Failed to update LLM settings: {e}")
            # 继续执行，不要因为更新失败就中断
        
        # 基础动态变量（确保所有值都是字符串）
        llm_dynamic_variables = {
            "user_name": str(user_name),
            "user_age": str(age),
            "user_health_goal": str(user_info.get('health_goal') or 'managing your health'),
            "user_conditions": str(user_info.get('conditions') or 'your health'),
            "user_cgm_device": str(user_info.get('cgm_device_type') or 'CGM device'),
            "user_memory_context": str(memory_text),
            "user_cgm_data": str(cgm_text),
            "onboarding_stage": str(onboarding_stage),
            "completion_score": str(completion_score),
            "is_new_user": is_new_user_str,  # ⭐ 新/老用户标识（虽然现在用不同prompt，但保留这个变量）
            # ⭐ Time awareness variables
            "current_date": str(current_date),  # e.g., "Monday, December 02, 2025"
            "current_time": str(current_time),  # e.g., "02:30 PM PST"
            "current_day_of_week": str(current_day_of_week),  # e.g., "Monday"
        }

        logger.info(f"==== Dynamic variables set: is_new_user={is_new_user_str}, prompt={os.path.basename(selected_prompt_path)}")
        logger.info(f"==== CGM data in variables:\n{cgm_text if cgm_text else 'None'}")

        if previous_transcript:
            llm_dynamic_variables["previous_transcript"] = previous_transcript
            logger.info(f"==== Restoring call with {len(previous_transcript)} previous messages")
        
        logger.info(f"==== Creating web call with agent_id: {INTAKE_AGENT_ID}")
        
        retell = get_retell_client()
        
        metadata = {
            "user_id": user_id,
            "call_type": "cgm_butler_app",
            "user_name": user_name
        }
        
        web_call_response = retell.call.create_web_call(
            agent_id=INTAKE_AGENT_ID,
            metadata=metadata,
            retell_llm_dynamic_variables=llm_dynamic_variables
        )
        
        if hasattr(web_call_response, 'access_token') and hasattr(web_call_response, 'call_id'):
            access_token = web_call_response.access_token
            call_id = web_call_response.call_id
        else:
            access_token = web_call_response.get('access_token') if isinstance(web_call_response, dict) else None
            call_id = web_call_response.get('call_id') if isinstance(web_call_response, dict) else None
        
        if not access_token or not call_id:
            raise RuntimeError("Failed to extract access_token or call_id from Retell response")
        
        logger.info(f"==== Web call created successfully: {call_id}")
        
        return {
            "status_code": 200,
            "content": {
                "access_token": access_token,
                "call_id": call_id,
                "agent_id": INTAKE_AGENT_ID,
                "user_name": user_name,
                "message": "Web call created successfully"
            }
        }
        
    except Exception as e:
        logger.error(f"==== Failed to create web call: {e}", exc_info=True)
        return {
            "status_code": 500,
            "content": {
                "message": f"Failed to create web call: {str(e)}"
            }
        }


async def generate_call_summary(transcript: str) -> Dict[str, Any]:
    """使用 OpenAI GPT-4 生成通话摘要"""
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized. Please check OPENAI_API_KEY")

        prompt = f"""Based on the following conversation, extract a detailed summary.

Conversation:
{transcript}

Please provide a JSON response with key information extracted."""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health data extraction assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        import json
        summary = json.loads(response.choices[0].message.content)
        return summary

    except Exception as e:
        logger.error(f"==== Failed to generate summary: {e}", exc_info=True)
        raise


async def analyze_goal_achievement(user_id: str) -> Dict[str, Any]:
    """分析目标达成情况"""
    try:
        # 简化版本,返回基础分析
        return {
            "goals": [],
            "message": "Goal analysis feature"
        }
    except Exception as e:
        logger.error(f"==== Failed to analyze goals: {e}", exc_info=True)
        raise


def load_prompt_from_file(file_path: str) -> str:
    """从本地文件加载 prompt"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            prompt_content = f.read()
        logger.info(f"==== Successfully loaded prompt from {file_path}")
        return prompt_content
    except FileNotFoundError:
        logger.error(f"==== Prompt file not found: {file_path}")
        raise
    except Exception as e:
        logger.error(f"==== Failed to load prompt: {e}", exc_info=True)
        raise


async def update_llm_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    """更新 Retell LLM 设置"""
    try:
        llm_id = settings.get('llm_id', INTAKE_LLM_ID)
        prompt_path = settings.get('prompt_path', OLIVIA_PROMPT_PATH)
        use_default_begin_message = settings.get('use_default_begin_message', False)
        
        logger.info(f"==== Loading prompt from {prompt_path}")
        general_prompt = load_prompt_from_file(prompt_path)
        
        retell = get_retell_client()
        
        update_params = {
            "general_prompt": general_prompt,
            "start_speaker": "agent"  # Required parameter: who speaks first
        }

        # Handle begin_message
        if settings.get('begin_message'):
            # Use custom begin_message if provided
            update_params["begin_message"] = settings['begin_message']
            logger.info(f"==== Using custom begin_message")
        elif use_default_begin_message:
            # Load from file if requested
            try:
                default_begin_message = load_prompt_from_file(BEGIN_MESSAGE_PATH)
                update_params["begin_message"] = default_begin_message
                logger.info(f"==== Using default begin_message from file: {BEGIN_MESSAGE_PATH}")
                logger.info(f"==== Begin message preview: {default_begin_message[:100]}...")
            except Exception as e:
                logger.warning(f"==== Failed to load default begin_message: {e}")

        response = retell.llm.update(llm_id=llm_id, **update_params)
        
        logger.info(f"==== LLM settings updated successfully for llm_id: {llm_id}")
        
        return {
            "status": "success",
            "message": "LLM settings updated successfully",
            "llm_id": llm_id
        }
        
    except Exception as e:
        logger.error(f"==== Failed to update LLM settings: {e}", exc_info=True)
        raise

