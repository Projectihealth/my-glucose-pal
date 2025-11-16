"""
Onboarding 信息提取判断函数

用于从对话记忆中判断是否包含特定类型的信息
"""

import json
from typing import Dict, Any, List


def _has_concerns_info(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Concerns 信息
    
    使用更精确的关键词匹配，避免误判
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Concerns 信息
    """
    # 检查 extracted_data 中的 glucose_concerns
    extracted_data = extracted_memory.get('extracted_data', {})
    glucose_concerns = extracted_data.get('glucose_concerns', [])
    
    if glucose_concerns and len(glucose_concerns) > 0:
        return True
    
    # 检查 summary 中的关键词
    summary = extracted_memory.get('summary', '').lower()
    
    concern_keywords = [
        '担心', '焦虑', '困扰', '问题', '症状',
        'concern', 'worry', 'issue', 'problem', 'symptom',
        '血糖高', '血糖低', '血糖波动', '血糖不稳',
        'high glucose', 'low glucose', 'glucose spike', 'glucose fluctuation'
    ]
    
    # 至少匹配 2 个关键词，或者有明确的 glucose_concerns
    keyword_matches = sum(1 for kw in concern_keywords if kw in summary)
    
    return keyword_matches >= 2


def _has_goals_info(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Goals 信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Goals 信息
    """
    summary = extracted_memory.get('summary', '').lower()
    
    goal_keywords = [
        '目标', '希望', '想要', '计划', '改善',
        'goal', 'want', 'hope', 'plan', 'improve',
        '降低血糖', '稳定血糖', '控制血糖',
        'lower glucose', 'stabilize glucose', 'control glucose'
    ]
    
    # 至少匹配 2 个关键词
    keyword_matches = sum(1 for kw in goal_keywords if kw in summary)
    
    return keyword_matches >= 2


def _has_eating_habits(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Eating Habits 信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Eating Habits 信息
    """
    extracted_data = extracted_memory.get('extracted_data', {})
    
    # 检查 mentioned_foods
    mentioned_foods = extracted_data.get('mentioned_foods', [])
    if mentioned_foods and len(mentioned_foods) >= 2:  # 至少提到 2 种食物
        return True
    
    # 检查 discussed_timing
    discussed_timing = extracted_data.get('discussed_timing', {})
    if discussed_timing and len(discussed_timing) >= 1:  # 至少讨论了 1 个用餐时间
        return True
    
    # 检查 summary
    summary = extracted_memory.get('summary', '').lower()
    
    eating_keywords = [
        '早餐', '午餐', '晚餐', '零食', '饮食',
        'breakfast', 'lunch', 'dinner', 'snack', 'meal', 'eat', 'food'
    ]
    
    keyword_matches = sum(1 for kw in eating_keywords if kw in summary)
    
    return keyword_matches >= 2


def _has_exercise_habits(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Exercise Habits 信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Exercise Habits 信息
    """
    extracted_data = extracted_memory.get('extracted_data', {})
    
    # 检查 mentioned_activities
    mentioned_activities = extracted_data.get('mentioned_activities', [])
    if mentioned_activities and len(mentioned_activities) >= 1:
        return True
    
    # 检查 summary
    summary = extracted_memory.get('summary', '').lower()
    
    exercise_keywords = [
        '运动', '锻炼', '活动', '走路', '跑步', '健身',
        'exercise', 'workout', 'activity', 'walk', 'run', 'gym', 'physical'
    ]
    
    keyword_matches = sum(1 for kw in exercise_keywords if kw in summary)
    
    return keyword_matches >= 2


def _has_sleep_habits(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Sleep Habits 信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Sleep Habits 信息
    """
    summary = extracted_memory.get('summary', '').lower()
    
    sleep_keywords = [
        '睡眠', '睡觉', '入睡', '起床', '失眠',
        'sleep', 'bedtime', 'wake', 'insomnia', 'rest'
    ]
    
    keyword_matches = sum(1 for kw in sleep_keywords if kw in summary)
    
    return keyword_matches >= 2


def _has_stress_info(extracted_memory: Dict) -> bool:
    """
    判断是否包含 Stress 信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        是否包含 Stress 信息
    """
    extracted_data = extracted_memory.get('extracted_data', {})
    
    # 检查 user_mood
    user_mood = extracted_data.get('user_mood', '')
    if user_mood and user_mood != 'neutral':
        # 如果有明确的情绪状态（positive 或 negative），可能涉及压力
        pass
    
    # 检查 summary
    summary = extracted_memory.get('summary', '').lower()
    
    stress_keywords = [
        '压力', '焦虑', '紧张', '放松', '情绪',
        'stress', 'anxiety', 'tension', 'relax', 'mood', 'mental'
    ]
    
    keyword_matches = sum(1 for kw in stress_keywords if kw in summary)
    
    return keyword_matches >= 2


def extract_concern_details(extracted_memory: Dict) -> Dict[str, Any]:
    """
    从记忆中提取 Concern 详细信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        Concern 详细信息字典
    """
    extracted_data = extracted_memory.get('extracted_data', {})
    summary = extracted_memory.get('summary', '')
    
    details = {}
    
    # Primary concern
    glucose_concerns = extracted_data.get('glucose_concerns', [])
    if glucose_concerns:
        details['primary_concern'] = glucose_concerns[0]
    
    # 尝试从 summary 中提取 duration 和 main_worry
    # 这里可以使用更复杂的 NLP 或 LLM 提取逻辑
    # 暂时简化处理
    
    return details


def extract_goal_details(extracted_memory: Dict) -> Dict[str, Any]:
    """
    从记忆中提取 Goal 详细信息
    
    Args:
        extracted_memory: 提取的记忆数据
    
    Returns:
        Goal 详细信息字典
    """
    # 这里可以使用 LLM 进一步提取结构化的 Goal 信息
    # 暂时返回空字典，由 MemoryService 的 LLM 提取逻辑处理
    
    return {}

