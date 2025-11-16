"""
Memory Repository

Handles memory-related database operations (short-term and long-term memory, todos).
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from .base import BaseRepository


class MemoryRepository(BaseRepository):
    """Repository for memory operations."""
    
    def save_memory(
        self,
        user_id: str,
        conversation_id: str,
        channel: str,
        summary: str,
        insights: Optional[str] = None,
        key_topics: Optional[List[str]] = None,
        extracted_data: Optional[Dict] = None,
        created_at: Optional[str] = None
    ) -> int:
        """Save short-term memory."""
        self.execute('''
        INSERT INTO user_memories (
            user_id, conversation_id, channel, summary, insights,
            key_topics, extracted_data, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, conversation_id, channel, summary, insights,
            json.dumps(key_topics or [], ensure_ascii=False),
            json.dumps(extracted_data or {}, ensure_ascii=False),
            created_at or datetime.now().isoformat()
        ))
        
        self.commit()
        return self.cursor.lastrowid
    
    def get_recent_memories(
        self,
        user_id: str,
        days: int = 7,
        limit: int = 10
    ) -> List[Dict]:
        """Get recent memories."""
        rows = self.fetchall('''
        SELECT * FROM user_memories 
        WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
        ORDER BY created_at DESC
        LIMIT ?
        ''', (user_id, days, limit))
        
        for row in rows:
            if row.get('key_topics'):
                row['key_topics'] = json.loads(row['key_topics'])
            if row.get('extracted_data'):
                row['extracted_data'] = json.loads(row['extracted_data'])
        
        return rows
    
    def update_long_term_memory(
        self,
        user_id: str,
        **fields
    ) -> None:
        """Update long-term memory (upsert)."""
        # Check if exists
        existing = self.fetchone(
            'SELECT id FROM user_long_term_memory WHERE user_id = ?',
            (user_id,)
        )
        
        updated_at = datetime.now().isoformat()
        
        if existing:
            # Update only non-None fields
            updates = []
            params = []
            
            for field in ['preferences', 'health_goals', 'habits', 'dietary_patterns',
                         'exercise_patterns', 'stress_patterns', 'sleep_patterns', 'concerns']:
                if field in fields and fields[field] is not None:
                    updates.append(f'{field} = ?')
                    params.append(json.dumps(fields[field], ensure_ascii=False))
            
            if updates:
                updates.append('updated_at = ?')
                params.append(updated_at)
                params.append(user_id)
                
                query = f"UPDATE user_long_term_memory SET {', '.join(updates)} WHERE user_id = ?"
                self.execute(query, tuple(params))
        else:
            # Insert new record
            self.execute('''
            INSERT INTO user_long_term_memory (
                user_id, preferences, health_goals, habits,
                dietary_patterns, exercise_patterns, stress_patterns, sleep_patterns,
                concerns, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                json.dumps(fields.get('preferences', {}), ensure_ascii=False),
                json.dumps(fields.get('health_goals', {}), ensure_ascii=False),
                json.dumps(fields.get('habits', {}), ensure_ascii=False),
                json.dumps(fields.get('dietary_patterns', {}), ensure_ascii=False),
                json.dumps(fields.get('exercise_patterns', {}), ensure_ascii=False),
                json.dumps(fields.get('stress_patterns', {}), ensure_ascii=False),
                json.dumps(fields.get('sleep_patterns', {}), ensure_ascii=False),
                json.dumps(fields.get('concerns', []), ensure_ascii=False),
                updated_at,
                updated_at
            ))
        
        self.commit()
    
    def get_long_term_memory(self, user_id: str) -> Optional[Dict]:
        """Get long-term memory."""
        row = self.fetchone(
            'SELECT * FROM user_long_term_memory WHERE user_id = ?',
            (user_id,)
        )
        
        if row:
            for field in ['preferences', 'health_goals', 'habits', 'dietary_patterns',
                         'exercise_patterns', 'stress_patterns', 'sleep_patterns', 'concerns']:
                if row.get(field):
                    row[field] = json.loads(row[field])
        
        return row
    
    def save_todos(
        self,
        user_id: str,
        conversation_id: str,
        todos: List[Dict],
        week_start: Optional[str] = None,
        created_at: Optional[str] = None
    ) -> List[int]:
        """
        Save TODO list.
        
        Args:
            user_id: User ID
            conversation_id: Conversation ID
            todos: List of TODO items, each containing:
                - title: TODO title (required)
                - description: Description (optional)
                - category: Category (optional, default: 'other')
                - target_count: Target count (optional, default: 1)
                - current_count: Current count (optional, default: 0)
                - status: Status (optional, default: 'pending')
                - health_benefit: Health benefit (optional)
                - time_of_day: Time of day (optional, format: "HH:MM-HH:MM")
                - time_description: Time description (optional, e.g., "上班前")
            week_start: Week start date (optional)
            created_at: Created timestamp (optional)
        
        Returns:
            List of TODO IDs
        """
        todo_ids = []
        
        for todo in todos:
            self.execute('''
            INSERT INTO user_todos (
                user_id, conversation_id, title, description,
                category, target_count, current_count, status,
                health_benefit, time_of_day, time_description,
                week_start, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                conversation_id,
                todo.get('title', ''),
                todo.get('description', ''),
                todo.get('category', 'other'),
                todo.get('target_count', 1),
                todo.get('current_count', 0),
                todo.get('status', 'pending'),
                todo.get('health_benefit', ''),
                todo.get('time_of_day', ''),
                todo.get('time_description', ''),
                week_start or datetime.now().strftime('%Y-%m-%d'),
                created_at or datetime.now().isoformat()
            ))
            todo_ids.append(self.cursor.lastrowid)
        
        self.commit()
        return todo_ids
    
    def get_weekly_todos(
        self,
        user_id: str,
        week_start: Optional[str] = None,
        order_by_time: bool = False
    ) -> List[Dict]:
        """
        Get weekly todos.
        
        Args:
            user_id: User ID
            week_start: Week start date (optional, defaults to current week)
            order_by_time: If True, order by time_of_day (for urgency sorting)
        
        Returns:
            List of TODO items
        """
        if week_start is None:
            today = datetime.now()
            week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        if order_by_time:
            # Order by time_of_day for urgency sorting (frontend will handle current time logic)
            return self.fetchall('''
            SELECT * FROM user_todos 
            WHERE user_id = ? AND week_start = ?
            ORDER BY 
                CASE WHEN time_of_day IS NULL OR time_of_day = '' THEN 1 ELSE 0 END,
                time_of_day ASC,
                created_at DESC
            ''', (user_id, week_start))
        else:
            return self.fetchall('''
            SELECT * FROM user_todos 
            WHERE user_id = ? AND week_start = ?
            ORDER BY created_at DESC
            ''', (user_id, week_start))
    
    def get_todos_by_status(
        self,
        user_id: str,
        status: str = 'pending',
        week_start: Optional[str] = None
    ) -> List[Dict]:
        """
        Get todos by status.
        
        Args:
            user_id: User ID
            status: TODO status ('pending', 'in_progress', 'completed', 'cancelled')
            week_start: Week start date (optional)
        
        Returns:
            List of TODO items
        """
        if week_start is None:
            today = datetime.now()
            week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        return self.fetchall('''
        SELECT * FROM user_todos 
        WHERE user_id = ? AND status = ? AND week_start = ?
        ORDER BY 
            CASE WHEN time_of_day IS NULL OR time_of_day = '' THEN 1 ELSE 0 END,
            time_of_day ASC,
            created_at DESC
        ''', (user_id, status, week_start))

