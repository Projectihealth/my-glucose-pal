"""
Onboarding Status Repository

管理用户 Onboarding 状态的数据访问层
"""

import sqlite3
import json
from typing import Dict, List, Optional
from datetime import datetime

from .base_repository import BaseRepository


class OnboardingStatusRepository(BaseRepository):
    """用户 Onboarding 状态 Repository"""
    
    def __init__(self, conn: sqlite3.Connection):
        super().__init__(conn)
        self.table_name = "user_onboarding_status"
    
    def get_by_user_id(self, user_id: str) -> Optional[Dict]:
        """
        根据 user_id 获取 Onboarding 状态
        
        Args:
            user_id: 用户 ID
        
        Returns:
            状态字典，如果不存在则返回 None
        """
        result = self.fetchone(
            f"SELECT * FROM {self.table_name} WHERE user_id = ?",
            (user_id,)
        )
        return dict(result) if result else None
    
    def create_initial_status(self, user_id: str) -> int:
        """
        为用户创建初始 Onboarding 状态
        
        Args:
            user_id: 用户 ID
        
        Returns:
            新记录的 ID
        """
        self.execute(
            f"""
            INSERT INTO {self.table_name} (
                user_id,
                onboarding_stage,
                completion_score,
                engagement_stage
            ) VALUES (?, ?, ?, ?)
            """,
            (user_id, 'not_started', 0, 'new_user')
        )
        self.commit()
        return self.cursor.lastrowid
    
    def update_status(self, user_id: str, updates: Dict) -> bool:
        """
        更新用户的 Onboarding 状态
        
        Args:
            user_id: 用户 ID
            updates: 要更新的字段字典
        
        Returns:
            是否更新成功
        """
        if not updates:
            return False
        
        # 构建 UPDATE 语句
        set_clauses = []
        values = []
        
        for key, value in updates.items():
            set_clauses.append(f"{key} = ?")
            values.append(value)
        
        values.append(user_id)
        
        sql = f"""
            UPDATE {self.table_name}
            SET {', '.join(set_clauses)}
            WHERE user_id = ?
        """
        
        self.execute(sql, tuple(values))
        self.commit()
        
        return self.cursor.rowcount > 0
    
    def get_or_create(self, user_id: str) -> Dict:
        """
        获取或创建用户的 Onboarding 状态
        
        Args:
            user_id: 用户 ID
        
        Returns:
            状态字典
        """
        status = self.get_by_user_id(user_id)
        
        if status is None:
            try:
                self.create_initial_status(user_id)
                status = self.get_by_user_id(user_id)
            except sqlite3.IntegrityError:
                # 已被其他请求创建，重新获取
                status = self.get_by_user_id(user_id)
        
        return status
    
    def mark_onboarding_started(self, user_id: str) -> bool:
        """
        标记 Onboarding 已开始
        
        Args:
            user_id: 用户 ID
        
        Returns:
            是否更新成功
        """
        status = self.get_by_user_id(user_id)
        
        if not status or status.get('onboarding_started_at'):
            return False
        
        updates = {
            'onboarding_stage': 'in_progress',
            'onboarding_started_at': datetime.now().isoformat()
        }
        
        return self.update_status(user_id, updates)
    
    def mark_onboarding_completed(self, user_id: str) -> bool:
        """
        标记 Onboarding 已完成
        
        Args:
            user_id: 用户 ID
        
        Returns:
            是否更新成功
        """
        updates = {
            'onboarding_stage': 'completed',
            'onboarding_completed_at': datetime.now().isoformat()
        }
        
        return self.update_status(user_id, updates)
    
    def get_completion_score(self, user_id: str) -> int:
        """
        获取用户的 Onboarding 完成度分数
        
        Args:
            user_id: 用户 ID
        
        Returns:
            完成度分数 (0-100)
        """
        status = self.get_by_user_id(user_id)
        return status.get('completion_score', 0) if status else 0
    
    def update_completion_score(self, user_id: str, score: int) -> bool:
        """
        更新用户的 Onboarding 完成度分数
        
        Args:
            user_id: 用户 ID
            score: 完成度分数 (0-100)
        
        Returns:
            是否更新成功
        """
        updates = {
            'completion_score': min(max(score, 0), 100),  # 限制在 0-100
            'last_updated_at': datetime.now().isoformat()
        }
        
        return self.update_status(user_id, updates)
    
    def get_missing_info(self, user_id: str) -> Dict:
        """
        获取用户缺失的 Onboarding 信息
        
        Args:
            user_id: 用户 ID
        
        Returns:
            缺失信息的字典
        """
        status = self.get_by_user_id(user_id)
        
        if not status:
            return {
                'missing_areas': ['concerns', 'goals', 'eating_habits', 'todos']
            }
        
        missing_areas = []
        
        # 检查各个阶段
        if not bool(status.get('concerns_collected', 0)):
            missing_areas.append('concerns')
        
        if not bool(status.get('goals_set', 0)):
            missing_areas.append('goals')
        
        if not bool(status.get('eating_habits_collected', 0)):
            missing_areas.append('eating_habits')
        
        if not bool(status.get('exercise_habits_collected', 0)):
            missing_areas.append('exercise_habits')
        
        if not bool(status.get('sleep_habits_collected', 0)):
            missing_areas.append('sleep_habits')
        
        if not bool(status.get('stress_habits_collected', 0)):
            missing_areas.append('stress_habits')
        
        if not bool(status.get('todos_created', 0)):
            missing_areas.append('todos')
        
        return {
            'missing_areas': missing_areas,
            'completion_score': status.get('completion_score', 0)
        }
    
    def get_all_by_stage(self, stage: str) -> List[Dict]:
        """
        获取指定阶段的所有用户
        
        Args:
            stage: Onboarding 阶段 (not_started, in_progress, completed)
        
        Returns:
            用户状态列表
        """
        return self.fetchall(
            f"SELECT * FROM {self.table_name} WHERE onboarding_stage = ?",
            (stage,)
        )
    
    def get_all_by_engagement_stage(self, engagement_stage: str) -> List[Dict]:
        """
        获取指定 Engagement 阶段的所有用户
        
        Args:
            engagement_stage: Engagement 阶段 (new_user, active, at_risk, inactive, churned)
        
        Returns:
            用户状态列表
        """
        return self.fetchall(
            f"SELECT * FROM {self.table_name} WHERE engagement_stage = ?",
            (engagement_stage,)
        )

