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

    def _normalize_bool_for_db(self, value: Any) -> Any:
        """
        Convert boolean to database-appropriate format.

        Args:
            value: Boolean value (or any value)

        Returns:
            1/0 for SQLite, True/False for MySQL, or original value if not bool
        """
        if not isinstance(value, bool):
            return value

        if self.db_type == 'sqlite':
            return 1 if value else 0
        else:  # mysql
            return value

    def _normalize_bool_from_db(self, value: Any) -> bool:
        """
        Convert database boolean to Python bool.

        Args:
            value: Value from database (int, bool, or None)

        Returns:
            Python boolean
        """
        if value is None:
            return False
        if isinstance(value, bool):
            return value
        # SQLite returns 0/1
        return bool(value)

    def _serialize_json_for_db(self, value: Any) -> Any:
        """
        Serialize JSON data for database storage.

        SQLite: Always serialize to JSON string (TEXT column)
        MySQL: Keep as-is for JSON columns (they accept dicts/lists directly)

        Args:
            value: Data to serialize (dict, list, or already serialized string)

        Returns:
            Serialized data appropriate for the database type
        """
        import json

        if value is None:
            return None

        # If already a string, return as-is
        if isinstance(value, str):
            return value

        # For dict/list:
        # - SQLite: Always serialize to string
        # - MySQL: Keep as-is (MySQL JSON column handles it)
        if isinstance(value, (dict, list)):
            if self.db_type == 'sqlite':
                return json.dumps(value, ensure_ascii=False)
            else:  # mysql with JSON column
                # MySQL can accept dict/list directly for JSON columns
                # But we serialize to string for consistency and compatibility
                return json.dumps(value, ensure_ascii=False)

        return value

    def _deserialize_json_from_db(self, value: Any) -> Any:
        """
        Deserialize JSON data from database.

        SQLite: Always returns string, needs json.loads()
        MySQL JSON: Returns native dict/list, no parsing needed

        Args:
            value: Value from database

        Returns:
            Deserialized Python object (dict/list) or original value
        """
        import json

        if value is None:
            return None

        # MySQL JSON columns return native dict/list
        if isinstance(value, (dict, list)):
            return value

        # SQLite TEXT or string data needs parsing
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value

        return value

    def _validate_string_length(self, value: str, max_length: int, field_name: str = "field") -> str:
        """
        Validate and truncate string if exceeds max length.

        Args:
            value: String value to validate
            max_length: Maximum allowed length
            field_name: Name of the field (for logging)

        Returns:
            Original or truncated string
        """
        if value is None:
            return value

        if not isinstance(value, str):
            return value

        actual_length = len(value)
        if actual_length > max_length:
            import logging
            logging.warning(
                f"String field '{field_name}' length ({actual_length}) exceeds "
                f"max length ({max_length}). Truncating to fit."
            )
            return value[:max_length]

        return value

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

