"""
Onboarding Status 工具函数

包含完成度计算、信息判断等辅助函数
"""

import json
from typing import Dict, Any, Optional


def _has_value(value: Any) -> bool:
    """
    检查字段是否有有效值
    
    Args:
        value: 要检查的值
    
    Returns:
        是否有有效值
    """
    return value is not None and value != '' and value != 'null' and value != 'None'


def _has_json_data(json_str: Optional[str]) -> bool:
    """
    检查 JSON 字段是否有有效数据
    
    Args:
        json_str: JSON 字符串
    
    Returns:
        是否有有效数据
    """
    if not _has_value(json_str):
        return False
    
    try:
        data = json.loads(json_str)
        return bool(data)
    except (json.JSONDecodeError, TypeError):
        return False


def calculate_onboarding_completion(status: Dict) -> int:
    """
    计算 Onboarding 完成度 (0-100)
    
    新的计算逻辑:
    - Core Understanding (40%): Concerns (20%) + Goals (20%)
    - Actionable Insights (40%): At least 1 lifestyle area (20%) + At least 1 TODO (20%)
    - Depth of Understanding (20%): Multiple lifestyle areas (10%) + Motivation clarity (10%)
    
    Args:
        status: 用户状态字典
    
    Returns:
        完成度分数 (0-100)
    """
    score = 0
    
    # === Core Understanding (40%) ===
    
    # Concerns (20%)
    if bool(status.get('concerns_collected', 0)):
        score += 10  # 基础分
        
        # 有详细信息再加 10 分
        if _has_value(status.get('concern_duration')) or _has_value(status.get('main_worry')):
            score += 10
    
    # Goals (20%)
    if bool(status.get('goals_set', 0)):
        score += 10  # 基础分
        
        # 有 timeline 和 metrics 再加分
        has_timeline = _has_value(status.get('goal_timeline'))
        has_metrics = _has_json_data(status.get('baseline_metrics'))
        
        if has_timeline and has_metrics:
            score += 10
        elif has_timeline or has_metrics:
            score += 5
    
    # === Actionable Insights (40%) ===
    
    # Lifestyle (20%): 至少收集 1 个方面
    lifestyle_areas = sum([
        bool(status.get('eating_habits_collected', 0)),
        bool(status.get('exercise_habits_collected', 0)),
        bool(status.get('sleep_habits_collected', 0)),
        bool(status.get('stress_habits_collected', 0))
    ])
    
    if lifestyle_areas >= 1:
        score += 20
    
    # TODOs (20%): 至少创建 1 个 TODO
    if bool(status.get('todos_created', 0)) and status.get('initial_todos_count', 0) >= 1:
        score += 20
    
    # === Depth of Understanding (20%) ===
    
    # Multiple lifestyle areas (10%)
    if lifestyle_areas >= 2:
        score += 5
    if lifestyle_areas >= 3:
        score += 5
    
    # Motivation clarity (10%)
    if _has_value(status.get('motivation')):
        score += 10
    
    return min(score, 100)


def determine_call_type(status: Optional[Dict]) -> str:
    """
    判断应该使用哪种 Call Type
    
    逻辑:
    - completion_score < 50: onboarding
    - 50 <= completion_score < 80: onboarding_continuation
    - completion_score >= 80: followup
    
    Args:
        status: 用户状态字典（可能为 None）
    
    Returns:
        Call Type: 'onboarding', 'onboarding_continuation', 'followup'
    """
    if not status:
        return 'onboarding'
    
    completion_score = status.get('completion_score', 0)
    
    if completion_score >= 80:
        return 'followup'
    elif completion_score >= 50:
        return 'onboarding_continuation'
    else:
        return 'onboarding'


def identify_missing_areas(status: Dict) -> list:
    """
    识别缺失的 Onboarding 信息
    
    Args:
        status: 用户状态字典
    
    Returns:
        缺失的领域列表
    """
    missing = []
    
    if not bool(status.get('concerns_collected', 0)):
        missing.append('concerns')
    
    if not bool(status.get('goals_set', 0)):
        missing.append('goals')
    
    if not bool(status.get('eating_habits_collected', 0)):
        missing.append('eating_habits')
    
    if not bool(status.get('exercise_habits_collected', 0)):
        missing.append('exercise_habits')
    
    if not bool(status.get('sleep_habits_collected', 0)):
        missing.append('sleep_habits')
    
    if not bool(status.get('stress_habits_collected', 0)):
        missing.append('stress_habits')
    
    if not bool(status.get('todos_created', 0)):
        missing.append('todos')
    
    return missing

