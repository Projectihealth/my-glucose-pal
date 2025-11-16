"""
Voice Chat Context Service

管理 Voice Chat 的上下文逻辑，包括：
- 判断 Call Type (onboarding, onboarding_continuation, followup)
- 获取用户上下文信息
- 构建动态 Prompt
"""

import os
import sys
from pathlib import Path
from typing import Dict, Optional, List
import logging

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from shared.database import get_connection, OnboardingStatusRepository, MemoryRepository
from shared.database.repositories.onboarding_utils import determine_call_type, identify_missing_areas

# Import PromptLoader
sys.path.insert(0, str(Path(__file__).parent.parent / 'prompts' / 'voice_chat'))
from prompt_loader import get_prompt_loader

logger = logging.getLogger(__name__)


class VoiceChatContextService:
    """Voice Chat 上下文服务"""
    
    def __init__(self, db_path: Optional[str] = None):
        """
        初始化服务
        
        Args:
            db_path: 数据库路径（可选）
        """
        self.db_conn = get_connection(db_path)
        self.onboarding_repo = OnboardingStatusRepository(self.db_conn)
        self.memory_repo = MemoryRepository(self.db_conn)
        self.prompt_loader = get_prompt_loader()
    
    def get_call_context(self, user_id: str, user_name: str = "there") -> Dict:
        """
        获取 Call 上下文（用于 Retell Agent 的动态变量）
        
        Args:
            user_id: 用户 ID
            user_name: 用户名
        
        Returns:
            包含 call_type 和 call_context 的字典
        """
        try:
            # 1. 获取 Onboarding 状态
            status = self.onboarding_repo.get_or_create(user_id)
            
            # 2. 判断 Call Type
            call_type = determine_call_type(status)
            
            logger.info(f"📞 Call Type for {user_id}: {call_type} (score: {status.get('completion_score', 0)})")
            
            # 3. 根据 Call Type 构建 Context
            if call_type == 'onboarding':
                call_context = self._build_onboarding_context(user_name)
            elif call_type == 'onboarding_continuation':
                call_context = self._build_onboarding_continuation_context(user_id, status)
            else:  # followup
                call_context = self._build_followup_context(user_id, user_name)
            
            return {
                'call_type': call_type,
                'call_context': call_context,
                'completion_score': status.get('completion_score', 0)
            }
        
        except Exception as e:
            logger.error(f"Failed to get call context for {user_id}: {e}")
            # 默认返回 onboarding
            return {
                'call_type': 'onboarding',
                'call_context': self._build_onboarding_context(user_name),
                'completion_score': 0
            }
    
    def _build_onboarding_context(self, user_name: str) -> str:
        """
        构建 Onboarding Call Context
        
        Args:
            user_name: 用户名
        
        Returns:
            Onboarding Context 文本
        """
        context = self.prompt_loader.get_onboarding_context()
        return context
    
    def _build_onboarding_continuation_context(self, user_id: str, status: Dict) -> str:
        """
        构建 Onboarding Continuation Call Context
        
        Args:
            user_id: 用户 ID
            status: Onboarding 状态
        
        Returns:
            Onboarding Continuation Context 文本
        """
        # 1. 构建已知信息
        existing_info = self._extract_existing_info(status)
        
        # 2. 识别缺失信息
        missing_areas = identify_missing_areas(status)
        missing_info = {'missing_areas': missing_areas}
        
        # 3. 使用 PromptLoader 构建 Context
        context = self.prompt_loader.get_onboarding_continuation_context(
            existing_info=existing_info,
            missing_info=missing_info
        )
        
        return context
    
    def _build_followup_context(self, user_id: str, user_name: str) -> str:
        """
        构建 Follow-up Call Context
        
        Args:
            user_id: 用户 ID
            user_name: 用户名
        
        Returns:
            Follow-up Context 文本
        """
        # 1. 获取用户档案
        user_profile = self._get_user_profile(user_id, user_name)
        
        # 2. 获取最近的记忆
        recent_memories = self._get_recent_memories(user_id)
        
        # 3. 获取活跃的 TODOs
        active_todos = self._get_active_todos(user_id)
        
        # 4. 使用 PromptLoader 构建 Context
        context = self.prompt_loader.get_followup_context(
            user_profile=user_profile,
            recent_memories=recent_memories,
            active_todos=active_todos
        )
        
        return context
    
    def _extract_existing_info(self, status: Dict) -> Dict:
        """
        从状态中提取已收集的信息
        
        Args:
            status: Onboarding 状态
        
        Returns:
            已收集信息的字典
        """
        return {
            'concerns_collected': bool(status.get('concerns_collected', 0)),
            'primary_concern': status.get('primary_concern'),
            'concern_duration': status.get('concern_duration'),
            'main_worry': status.get('main_worry'),
            'goals_set': bool(status.get('goals_set', 0)),
            'primary_goal': status.get('primary_goal'),
            'goal_timeline': status.get('goal_timeline'),
            'motivation': status.get('motivation'),
            'eating_habits_collected': bool(status.get('eating_habits_collected', 0)),
            'exercise_habits_collected': bool(status.get('exercise_habits_collected', 0)),
            'sleep_habits_collected': bool(status.get('sleep_habits_collected', 0)),
            'stress_habits_collected': bool(status.get('stress_habits_collected', 0)),
            'todos_created': bool(status.get('todos_created', 0)),
            'initial_todos_count': status.get('initial_todos_count', 0)
        }
    
    def _get_user_profile(self, user_id: str, user_name: str) -> Dict:
        """
        获取用户档案信息
        
        Args:
            user_id: 用户 ID
            user_name: 用户名
        
        Returns:
            用户档案字典
        """
        # 从数据库获取用户基本信息
        # 这里需要实现从 users 表获取信息的逻辑
        # 暂时返回基本信息
        
        profile = {
            'name': user_name,
            'age': None,
            'health_goal': None,
            'conditions': None,
            'cgm_device_type': None
        }
        
        # 获取长期记忆
        long_term_memory = self.memory_repo.get_long_term_memory(user_id)
        if long_term_memory:
            profile['long_term_memory'] = long_term_memory
        
        return profile
    
    def _get_recent_memories(self, user_id: str, limit: int = 3) -> List[Dict]:
        """
        获取最近的对话记忆
        
        Args:
            user_id: 用户 ID
            limit: 返回记录数
        
        Returns:
            记忆列表
        """
        memories = self.memory_repo.get_recent_memories(user_id, days=7)
        return memories[:limit] if memories else []
    
    def _get_active_todos(self, user_id: str) -> List[Dict]:
        """
        获取活跃的 TODOs
        
        Args:
            user_id: 用户 ID
        
        Returns:
            TODO 列表
        """
        todos = self.memory_repo.get_weekly_todos(user_id, order_by_time=True)
        # 只返回未完成的 TODOs
        return [todo for todo in todos if todo.get('status') != 'completed']


# 单例实例
_context_service = None


def get_context_service(db_path: Optional[str] = None) -> VoiceChatContextService:
    """获取 VoiceChatContextService 单例"""
    global _context_service
    if _context_service is None:
        _context_service = VoiceChatContextService(db_path)
    return _context_service

