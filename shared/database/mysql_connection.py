"""
MySQL Database Connection Management

Provides MySQL database connection handling.
"""

import pymysql
from typing import Optional
from contextlib import contextmanager
import sys
import os

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from config.settings import settings


class MySQLConnection:
    """MySQL连接管理器"""
    
    @staticmethod
    def get_connection() -> pymysql.connections.Connection:
        """
        获取MySQL数据库连接
        
        Returns:
            PyMySQL连接对象
        """
        try:
            conn = pymysql.connect(
                host=settings.MYSQL_HOST,
                port=settings.MYSQL_PORT,
                user=settings.MYSQL_USER,
                password=settings.MYSQL_PASSWORD,
                database=settings.MYSQL_DATABASE,
                charset=settings.MYSQL_CHARSET,
                cursorclass=pymysql.cursors.DictCursor,  # 返回字典格式
                autocommit=False
            )
            return conn
        except pymysql.Error as e:
            print(f"❌ MySQL连接失败: {e}")
            raise
    
    @staticmethod
    @contextmanager
    def get_db_session():
        """
        MySQL数据库会话上下文管理器
        
        Usage:
            with MySQLConnection.get_db_session() as conn:
                cursor = conn.cursor()
                cursor.execute(...)
                conn.commit()
        
        Yields:
            PyMySQL连接对象
        """
        conn = MySQLConnection.get_connection()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"❌ 数据库操作失败，已回滚: {e}")
            raise
        finally:
            conn.close()
    
    @staticmethod
    def test_connection() -> bool:
        """
        测试MySQL连接
        
        Returns:
            连接是否成功
        """
        try:
            with MySQLConnection.get_db_session() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()
                print(f"✅ MySQL连接成功!")
                print(f"   服务器版本: {version}")
                return True
        except Exception as e:
            print(f"❌ MySQL连接失败: {e}")
            return False


if __name__ == '__main__':
    # 测试连接
    print("=" * 80)
    print("测试MySQL连接")
    print("=" * 80)
    print(f"Host: {settings.MYSQL_HOST}")
    print(f"Port: {settings.MYSQL_PORT}")
    print(f"User: {settings.MYSQL_USER}")
    print(f"Database: {settings.MYSQL_DATABASE}")
    print("=" * 80)
    
    MySQLConnection.test_connection()



