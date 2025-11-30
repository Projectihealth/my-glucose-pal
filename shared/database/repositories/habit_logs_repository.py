"""
Habit Logs Repository

Handles habit log-related database operations for tracking daily habit completion.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta

from .base import BaseRepository


class HabitLogsRepository(BaseRepository):
    """Repository for habit logs operations."""

    def create(
        self,
        habit_id: int,
        user_id: str,
        log_date: str,
        status: str = 'COMPLETED',
        note: Optional[str] = None
    ) -> int:
        """
        Create a new habit log entry.

        Args:
            habit_id: Habit ID (references user_todos.id)
            user_id: User ID
            log_date: Log date in YYYY-MM-DD format
            status: Status ('COMPLETED' or 'SKIPPED')
            note: Optional note

        Returns:
            Created log ID
        """
        timestamp = int(datetime.now().timestamp() * 1000)  # Milliseconds
        now = datetime.now().isoformat()

        self.execute('''
        INSERT INTO habit_logs (
            habit_id, user_id, log_date, status, timestamp, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            habit_id,
            user_id,
            log_date,
            status,
            timestamp,
            note,
            now
        ))

        self.commit()
        return self.cursor.lastrowid

    def get_by_habit_and_date(
        self,
        habit_id: int,
        log_date: str
    ) -> Optional[Dict]:
        """
        Get a specific habit log by habit_id and date.

        Args:
            habit_id: Habit ID
            log_date: Log date in YYYY-MM-DD format

        Returns:
            Habit log dict or None
        """
        log = self.fetchone(
            'SELECT * FROM habit_logs WHERE habit_id = ? AND log_date = ?',
            (habit_id, log_date)
        )

        # Convert date to ISO string for JSON serialization
        if log and 'log_date' in log:
            if hasattr(log['log_date'], 'isoformat'):
                log['log_date'] = log['log_date'].isoformat()

        return log

    def get_logs_by_habit(
        self,
        habit_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """
        Get all logs for a specific habit, optionally filtered by date range.

        Args:
            habit_id: Habit ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)

        Returns:
            List of habit logs
        """
        query = 'SELECT * FROM habit_logs WHERE habit_id = ?'
        params = [habit_id]

        if start_date:
            query += ' AND log_date >= ?'
            params.append(start_date)

        if end_date:
            query += ' AND log_date <= ?'
            params.append(end_date)

        query += ' ORDER BY log_date DESC'

        return self.fetchall(query, tuple(params))

    def get_logs_by_user(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """
        Get all logs for a specific user, optionally filtered by date range.

        Args:
            user_id: User ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)

        Returns:
            List of habit logs
        """
        query = 'SELECT * FROM habit_logs WHERE user_id = ?'
        params = [user_id]

        if start_date:
            query += ' AND log_date >= ?'
            params.append(start_date)

        if end_date:
            query += ' AND log_date <= ?'
            params.append(end_date)

        query += ' ORDER BY log_date DESC, habit_id'

        return self.fetchall(query, tuple(params))

    def upsert(
        self,
        habit_id: int,
        user_id: str,
        log_date: str,
        status: str,
        note: Optional[str] = None
    ) -> int:
        """
        Insert or update a habit log (upsert).

        Args:
            habit_id: Habit ID
            user_id: User ID
            log_date: Log date in YYYY-MM-DD format
            status: Status ('COMPLETED' or 'SKIPPED')
            note: Optional note

        Returns:
            Log ID
        """
        # Check if log exists
        existing = self.get_by_habit_and_date(habit_id, log_date)

        if existing:
            # Update existing log
            timestamp = int(datetime.now().timestamp() * 1000)
            self.execute('''
            UPDATE habit_logs
            SET status = ?, timestamp = ?, note = ?
            WHERE habit_id = ? AND log_date = ?
            ''', (status, timestamp, note, habit_id, log_date))
            self.commit()
            return existing['id']
        else:
            # Create new log
            return self.create(habit_id, user_id, log_date, status, note)

    def delete(self, habit_id: int, log_date: str) -> bool:
        """
        Delete a habit log entry.

        Args:
            habit_id: Habit ID
            log_date: Log date in YYYY-MM-DD format

        Returns:
            True if deleted, False otherwise
        """
        self.execute(
            'DELETE FROM habit_logs WHERE habit_id = ? AND log_date = ?',
            (habit_id, log_date)
        )
        self.commit()
        return self.cursor.rowcount > 0

    def calculate_streak(self, habit_id: int, as_of_date: Optional[str] = None) -> int:
        """
        Calculate the current streak for a habit.

        Streak = consecutive days (up to today or as_of_date) where the habit was completed.

        Args:
            habit_id: Habit ID
            as_of_date: Optional date to calculate streak as of (YYYY-MM-DD)

        Returns:
            Current streak count (in days)
        """
        if as_of_date:
            end_date = datetime.fromisoformat(as_of_date).date()
        else:
            end_date = datetime.now().date()

        # Get all completed logs for this habit, sorted by date descending
        logs = self.fetchall('''
            SELECT log_date
            FROM habit_logs
            WHERE habit_id = ? AND status = 'COMPLETED' AND log_date <= ?
            ORDER BY log_date DESC
        ''', (habit_id, end_date.isoformat()))

        if not logs:
            return 0

        streak = 0
        current_date = end_date

        for log in logs:
            # Handle both string and date object (MySQL returns date objects)
            log_date_raw = log['log_date']
            if isinstance(log_date_raw, str):
                log_date = datetime.fromisoformat(log_date_raw).date()
            else:
                log_date = log_date_raw  # Already a date object

            # Check if this log is for the current expected date
            if log_date == current_date:
                streak += 1
                current_date = current_date - timedelta(days=1)
            elif log_date < current_date:
                # There's a gap, streak is broken
                break

        return streak

    def get_logs_dict_for_habit(
        self,
        habit_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Dict]:
        """
        Get habit logs as a dictionary keyed by date.

        This format matches the frontend's expected structure:
        { '2025-01-15': { status: 'COMPLETED', timestamp: 123456789 }, ... }

        Args:
            habit_id: Habit ID
            start_date: Optional start date (YYYY-MM-DD)
            end_date: Optional end date (YYYY-MM-DD)

        Returns:
            Dictionary of logs keyed by log_date
        """
        logs = self.get_logs_by_habit(habit_id, start_date, end_date)

        logs_dict = {}
        for log in logs:
            # Convert date to string if it's a date object (MySQL returns date objects)
            log_date = log['log_date']
            if hasattr(log_date, 'isoformat'):
                log_date = log_date.isoformat()

            logs_dict[log_date] = {
                'status': log['status'],
                'timestamp': log['timestamp'],
                'note': log.get('note')
            }

        return logs_dict
