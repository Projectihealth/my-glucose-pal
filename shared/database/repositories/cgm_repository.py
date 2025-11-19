"""
CGM Repository

Handles CGM data operations (readings, patterns, actions).
"""

from typing import Dict, List, Optional, Any
from datetime import datetime

from .base import BaseRepository


class CGMRepository(BaseRepository):
    """Repository for CGM data operations."""
    
    def save_reading(
        self,
        user_id: str,
        timestamp: str,
        glucose_value: int
    ) -> int:
        """Save a CGM reading."""
        self.execute('''
        INSERT INTO cgm_readings (user_id, timestamp, glucose_value, created_at)
        VALUES (?, ?, ?, ?)
        ''', (user_id, timestamp, glucose_value, datetime.now().isoformat()))
        
        self.commit()
        return self.cursor.lastrowid
    
    def get_readings(
        self,
        user_id: str,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """Get CGM readings for a user."""
        if start_time and end_time:
            return self.fetchall('''
            SELECT * FROM cgm_readings
            WHERE user_id = ? AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp DESC
            LIMIT ?
            ''', (user_id, start_time, end_time, limit))
        else:
            return self.fetchall('''
            SELECT * FROM cgm_readings
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            ''', (user_id, limit))
    
    def get_latest_reading(self, user_id: str) -> Optional[Dict]:
        """Get latest CGM reading."""
        return self.fetchone('''
        SELECT * FROM cgm_readings
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (user_id,))
    
    def get_pattern_actions(
        self,
        pattern_name: Optional[str] = None
    ) -> List[Dict]:
        """Get pattern-action mappings."""
        if pattern_name:
            return self.fetchall('''
            SELECT * FROM cgm_pattern_actions
            WHERE pattern_name = ?
            ORDER BY priority DESC
            ''', (pattern_name,))
        else:
            return self.fetchall('''
            SELECT * FROM cgm_pattern_actions
            ORDER BY priority DESC, category
            ''')

