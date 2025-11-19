"""
Todo Repository

Handles todo-related database operations.
"""

from typing import Dict, List, Optional
from datetime import datetime
import json

from .base import BaseRepository


class TodoRepository(BaseRepository):
    """Repository for todo operations."""

    def get_by_id(self, todo_id: int) -> Optional[Dict]:
        """Get todo by ID."""
        todo = self.fetchone(
            'SELECT * FROM user_todos WHERE id = ?',
            (todo_id,)
        )
        if todo:
            todo = self._parse_json_fields(todo)
        return todo

    def get_by_user(
        self,
        user_id: str,
        status: Optional[str] = None,
        week_start: Optional[str] = None
    ) -> List[Dict]:
        """
        Get todos for a specific user.

        Args:
            user_id: User ID
            status: Optional status filter ('pending', 'in_progress', 'completed', 'cancelled')
            week_start: Optional week start date filter (YYYY-MM-DD)

        Returns:
            List of todos
        """
        query = 'SELECT * FROM user_todos WHERE user_id = ?'
        params = [user_id]

        if status:
            query += ' AND status = ?'
            params.append(status)

        if week_start:
            query += ' AND week_start = ?'
            params.append(week_start)

        query += ' ORDER BY created_at DESC'

        todos = self.fetchall(query, tuple(params))
        return [self._parse_json_fields(todo) for todo in todos]

    def create(
        self,
        user_id: str,
        title: str,
        **kwargs
    ) -> int:
        """
        Create a new todo.

        Args:
            user_id: User ID
            title: Todo title
            **kwargs: Optional fields (description, category, health_benefit, etc.)

        Returns:
            Created todo ID
        """
        now = datetime.now().isoformat()

        # Parse uploaded_images if provided as list
        uploaded_images = kwargs.get('uploaded_images', [])
        if isinstance(uploaded_images, list):
            # Serialize for both SQLite and MySQL
            uploaded_images = json.dumps(uploaded_images)
        elif uploaded_images is None:
            uploaded_images = '[]'  # Empty JSON array as string

        self.execute('''
        INSERT INTO user_todos (
            user_id, conversation_id, title, description, category,
            health_benefit, time_of_day, time_description,
            target_count, current_count, status, completed_today,
            user_selected, priority, recommendation_tag,
            uploaded_images, notes, week_start, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            kwargs.get('conversation_id'),
            title,
            kwargs.get('description'),
            kwargs.get('category'),
            kwargs.get('health_benefit'),
            kwargs.get('time_of_day'),
            kwargs.get('time_description'),
            kwargs.get('target_count', 1),
            kwargs.get('current_count', 0),
            kwargs.get('status', 'pending'),
            kwargs.get('completed_today', 0),
            kwargs.get('user_selected', 1),  # Default to True/1
            kwargs.get('priority'),
            kwargs.get('recommendation_tag'),
            uploaded_images,
            kwargs.get('notes'),
            kwargs.get('week_start'),
            now
        ))

        self.commit()
        return self.cursor.lastrowid

    def update(self, todo_id: int, **kwargs) -> bool:
        """
        Update todo information.

        Args:
            todo_id: Todo ID
            **kwargs: Fields to update

        Returns:
            True if updated, False otherwise
        """
        updates = []
        params = []

        # Handle uploaded_images serialization
        if 'uploaded_images' in kwargs:
            if isinstance(kwargs['uploaded_images'], list):
                # Only serialize for SQLite; MySQL JSON type handles lists automatically
                if self.db_type == 'sqlite':
                    kwargs['uploaded_images'] = json.dumps(kwargs['uploaded_images'])
                # For MySQL, keep as list

        # Normalise uploaded_images for UPDATE as well
        if 'uploaded_images' in kwargs:
            ui = kwargs['uploaded_images']
            if isinstance(ui, list):
                # Always store as JSON string; works for both SQLite (TEXT) and MySQL (JSON)
                kwargs['uploaded_images'] = json.dumps(ui)

        for field in [
            'title', 'description', 'category', 'health_benefit',
            'time_of_day', 'time_description', 'target_count',
            'current_count', 'status', 'completed_today',
            'user_selected', 'priority', 'recommendation_tag',
            'uploaded_images', 'notes', 'week_start', 'completed_at'
        ]:
            if field in kwargs:
                updates.append(f'{field} = ?')
                params.append(kwargs[field])

        if not updates:
            return False

        params.append(todo_id)

        query = f"UPDATE user_todos SET {', '.join(updates)} WHERE id = ?"
        self.execute(query, tuple(params))
        self.commit()

        return True

    def delete(self, todo_id: int) -> bool:
        """
        Delete a todo.

        Args:
            todo_id: Todo ID

        Returns:
            True if deleted, False otherwise
        """
        self.execute('DELETE FROM user_todos WHERE id = ?', (todo_id,))
        self.commit()
        return self.cursor.rowcount > 0

    def increment_progress(
        self,
        todo_id: int,
        notes: Optional[str] = None,
        images: Optional[List[str]] = None
    ) -> bool:
        """
        Increment todo progress by 1.

        Args:
            todo_id: Todo ID
            notes: Optional notes to add
            images: Optional images to add

        Returns:
            True if updated, False otherwise
        """
        # Get current todo
        todo = self.get_by_id(todo_id)
        if not todo:
            return False

        new_count = todo['current_count'] + 1
        target_count = todo['target_count']

        # Determine new status
        if new_count >= target_count:
            status = 'completed'
            completed_at = datetime.now().isoformat()
        elif new_count > 0:
            status = 'in_progress'
            completed_at = None
        else:
            status = 'pending'
            completed_at = None

        # NOTE:
        #   Previously we tried to always update `uploaded_images` here by
        #   reading the existing JSON/list value and writing it back.
        #   This caused SQL syntax issues on MySQL because of how the JSON
        #   column and parameter binding interacted (see error near
        #   "uploaded_images = ), notes = ...").
        #
        #   For now, we keep `uploaded_images` immutable during check‑in
        #   (we don't support attaching images from GoalTab yet), which
        #   removes the problematic field from the UPDATE statement and
        #   fixes the 500 errors on `/api/todos/<id>/check-in`.
        #
        #   If/when we want to support images here, we should implement
        #   a dedicated JSON append/update helper that is tested on both
        #   SQLite and MySQL.

        # Base fields that always get updated on check‑in
        update_kwargs = {
            # Prevent current_count from exceeding target_count
            'current_count': min(new_count, target_count),
            'status': status,
            'completed_today': 1,
        }

        if notes:
            update_kwargs['notes'] = notes

        if completed_at:
            update_kwargs['completed_at'] = completed_at

        return self.update(todo_id, **update_kwargs)

    def reset_daily_completion(self, user_id: str) -> int:
        """
        Reset completed_today flag for all todos of a user.
        This should be called daily (e.g., at midnight).

        Args:
            user_id: User ID

        Returns:
            Number of todos reset
        """
        self.execute(
            'UPDATE user_todos SET completed_today = 0 WHERE user_id = ? AND completed_today = 1',
            (user_id,)
        )
        self.commit()
        return self.cursor.rowcount

    def _parse_json_fields(self, todo: Dict) -> Dict:
        """
        Parse JSON fields in todo.

        Args:
            todo: Todo dictionary

        Returns:
            Todo with parsed JSON fields
        """
        raw_images = todo.get('uploaded_images')
        if raw_images:
            # MySQL JSON column may already return list/dict; SQLite returns TEXT
            if isinstance(raw_images, (list, dict)):
                todo['uploaded_images'] = raw_images
            else:
                try:
                    todo['uploaded_images'] = json.loads(raw_images)
                except (json.JSONDecodeError, TypeError):
                    todo['uploaded_images'] = []
        else:
            todo['uploaded_images'] = []

        # Convert completed_today to boolean
        if 'completed_today' in todo:
            todo['completed_today'] = bool(todo['completed_today'])

        return todo
