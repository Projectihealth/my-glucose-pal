"""
Base Repository Class

Provides common database operations for all repositories.
Supports both SQLite and MySQL.
"""

import sqlite3
from typing import Optional, List, Dict, Any

try:
    import pymysql
    MYSQL_AVAILABLE = True
except ImportError:
    pymysql = None
    MYSQL_AVAILABLE = False


class BaseRepository:
    """Base class for all repositories."""
    
    def __init__(self, conn):
        """
        Initialize repository with database connection.
        
        Args:
            conn: Database connection (SQLite or MySQL)
        """
        self.conn = conn
        self.cursor = conn.cursor()
        
        # 检测数据库类型
        if MYSQL_AVAILABLE and isinstance(conn, pymysql.connections.Connection):
            self.db_type = 'mysql'
            self.placeholder = '%s'
        else:
            self.db_type = 'sqlite'
            self.placeholder = '?'
    
    def _dict_from_row(self, row) -> Dict[str, Any]:
        """
        Convert row to dictionary.
        
        Args:
            row: Row object (SQLite Row or MySQL dict)
            
        Returns:
            Dictionary representation
        """
        if row is None:
            return {}
        if isinstance(row, dict):
            return row  # MySQL already returns dict
        return dict(row)  # SQLite Row
    
    def _dicts_from_rows(self, rows) -> List[Dict[str, Any]]:
        """
        Convert list of rows to list of dictionaries.
        
        Args:
            rows: List of row objects
            
        Returns:
            List of dictionaries
        """
        if not rows:
            return []
        if rows and isinstance(rows[0], dict):
            return rows  # MySQL already returns dicts
        return [dict(row) for row in rows]  # SQLite Rows
    
    def _convert_query(self, query: str) -> str:
        """
        Convert SQLite query to MySQL if needed.
        
        Args:
            query: SQL query with ? placeholders
            
        Returns:
            Query with appropriate placeholders
        """
        if self.db_type == 'mysql':
            # 替换 ? 为 %s
            return query.replace('?', '%s')
        return query
    
    def execute(self, query: str, params: tuple = ()):
        """
        Execute a query.
        
        Args:
            query: SQL query (can use ? placeholders, will be converted)
            params: Query parameters
            
        Returns:
            Cursor object
        """
        converted_query = self._convert_query(query)
        return self.cursor.execute(converted_query, params)
    
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

