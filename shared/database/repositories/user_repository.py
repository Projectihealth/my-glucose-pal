"""
User Repository

Handles user-related database operations.
"""

from typing import Dict, Optional, List
from datetime import datetime

from .base import BaseRepository


class UserRepository(BaseRepository):
    """Repository for user operations."""
    
    def list_users(self) -> List[Dict]:
        """Return a list of all users ordered by ID."""
        return self.fetchall(
            'SELECT user_id, name, conditions FROM users ORDER BY user_id'
        )
    
    def get_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID."""
        return self.fetchone(
            'SELECT * FROM users WHERE user_id = ?',
            (user_id,)
        )
    
    def create(
        self,
        user_id: str,
        name: str,
        **kwargs
    ) -> str:
        """Create a new user."""
        now = datetime.now().isoformat()
        
        self.execute('''
        INSERT INTO users (
            user_id, name, gender, date_of_birth, health_goal,
            enrolled_at, conditions, cgm_device_type,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            name,
            kwargs.get('gender'),
            kwargs.get('date_of_birth'),
            kwargs.get('health_goal'),
            kwargs.get('enrolled_at', now),
            kwargs.get('conditions'),
            kwargs.get('cgm_device_type'),
            now,
            now
        ))
        
        self.commit()
        return user_id
    
    def update(self, user_id: str, **kwargs) -> bool:
        """Update user information."""
        updates = []
        params = []
        
        for field in ['name', 'gender', 'date_of_birth', 'health_goal',
                     'conditions', 'cgm_device_type']:
            if field in kwargs:
                updates.append(f'{field} = ?')
                params.append(kwargs[field])
        
        if not updates:
            return False
        
        updates.append('updated_at = ?')
        params.append(datetime.now().isoformat())
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
        self.execute(query, tuple(params))
        self.commit()
        
        return True
