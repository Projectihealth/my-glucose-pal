"""
Base Repository Class

Provides common database operations for all repositories.
"""

import sqlite3
from typing import Optional, List, Dict, Any


class BaseRepository:
    """Base class for all repositories."""
    
    def __init__(self, conn: sqlite3.Connection):
        """
        Initialize repository with database connection.
        
        Args:
            conn: SQLite connection
        """
        self.conn = conn
        self.cursor = conn.cursor()
    
    def _dict_from_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        """
        Convert sqlite3.Row to dictionary.
        
        Args:
            row: SQLite row object
            
        Returns:
            Dictionary representation
        """
        return dict(row) if row else {}
    
    def _dicts_from_rows(self, rows: List[sqlite3.Row]) -> List[Dict[str, Any]]:
        """
        Convert list of sqlite3.Row to list of dictionaries.
        
        Args:
            rows: List of SQLite row objects
            
        Returns:
            List of dictionaries
        """
        return [dict(row) for row in rows]
    
    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        """
        Execute a query.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            Cursor object
        """
        return self.cursor.execute(query, params)
    
    def fetchone(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """
        Fetch one row as dictionary.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            Dictionary or None
        """
        self.execute(query, params)
        row = self.cursor.fetchone()
        return self._dict_from_row(row) if row else None
    
    def fetchall(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """
        Fetch all rows as list of dictionaries.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            List of dictionaries
        """
        self.execute(query, params)
        rows = self.cursor.fetchall()
        return self._dicts_from_rows(rows)
    
    def commit(self):
        """Commit current transaction."""
        self.conn.commit()
    
    def rollback(self):
        """Rollback current transaction."""
        self.conn.rollback()

