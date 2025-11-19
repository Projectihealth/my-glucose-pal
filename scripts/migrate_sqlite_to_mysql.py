#!/usr/bin/env python3
"""
SQLite 到 MySQL 数据迁移脚本

使用方法:
    python scripts/migrate_sqlite_to_mysql.py
"""

import sqlite3
import pymysql
import sys
import os
from datetime import datetime
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from config.settings import settings
from shared.database.mysql_connection import MySQLConnection
from shared.database.mysql_schema import create_all_tables, list_all_tables


# 需要迁移的表（按依赖顺序）
TABLES_TO_MIGRATE = [
    'users',
    'cgm_readings',
    'cgm_pattern_actions',
    'activity_logs',
    'conversations',
    'conversation_analysis',
    'user_memories',
    'user_long_term_memory',
    'user_todos',
    'user_onboarding_status',
]


def get_sqlite_connection():
    """获取SQLite连接"""
    db_path = settings.DB_PATH
    if not os.path.exists(db_path):
        print(f"❌ SQLite数据库文件不存在: {db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def table_exists_in_sqlite(sqlite_conn, table_name):
    """检查表是否存在于SQLite中"""
    cursor = sqlite_conn.cursor()
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    )
    return cursor.fetchone() is not None


def get_table_columns(mysql_conn, table_name):
    """获取MySQL表的列名"""
    cursor = mysql_conn.cursor()
    cursor.execute(f"DESCRIBE {table_name}")
    return [row['Field'] for row in cursor.fetchall()]


def convert_value(value, column_name):
    """
    转换数据值以适应MySQL
    
    处理特殊情况:
    - SQLite的INTEGER布尔值(0/1) -> MySQL的BOOLEAN
    - SQLite的TEXT日期 -> MySQL的DATE/DATETIME
    - None值保持None
    """
    if value is None:
        return None
    
    # 布尔值字段
    boolean_fields = [
        'email_verified', 'follow_up_needed', 'completed_today',
        'has_health_goals', 'has_dietary_info', 'has_exercise_info',
        'has_medical_history', 'has_lifestyle_info'
    ]
    if column_name in boolean_fields:
        return bool(value)
    
    return value


def migrate_table(sqlite_conn, mysql_conn, table_name):
    """迁移单个表的数据"""
    print(f"\n迁移表: {table_name}")
    
    # 检查SQLite表是否存在
    if not table_exists_in_sqlite(sqlite_conn, table_name):
        print(f"  ⚠️  表 '{table_name}' 在SQLite中不存在，跳过")
        return 0
    
    # 获取SQLite数据
    sqlite_cursor = sqlite_conn.cursor()
    sqlite_cursor.execute(f"SELECT * FROM {table_name}")
    rows = sqlite_cursor.fetchall()
    
    if not rows:
        print(f"  ℹ️  表 '{table_name}' 无数据")
        return 0
    
    # 获取MySQL表的列
    mysql_columns = get_table_columns(mysql_conn, table_name)
    
    # 准备插入数据
    mysql_cursor = mysql_conn.cursor()
    migrated_count = 0
    error_count = 0
    
    for row in rows:
        try:
            # 将SQLite Row转换为字典
            row_dict = dict(row)
            
            # 过滤出MySQL表中存在的列，并转换值
            filtered_data = {}
            for col in mysql_columns:
                if col in row_dict:
                    filtered_data[col] = convert_value(row_dict[col], col)
            
            # 构建INSERT语句
            columns = ', '.join(filtered_data.keys())
            placeholders = ', '.join(['%s'] * len(filtered_data))
            values = list(filtered_data.values())
            
            insert_sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
            
            mysql_cursor.execute(insert_sql, values)
            migrated_count += 1
            
        except pymysql.Error as e:
            error_count += 1
            if error_count <= 3:  # 只显示前3个错误
                print(f"  ⚠️  插入失败: {e}")
    
    mysql_conn.commit()
    
    if error_count > 3:
        print(f"  ⚠️  共有 {error_count} 条记录插入失败")
    
    print(f"  ✓ 成功迁移 {migrated_count}/{len(rows)} 条记录")
    return migrated_count


def verify_migration(sqlite_conn, mysql_conn):
    """验证迁移结果"""
    print("\n" + "=" * 80)
    print("验证迁移结果")
    print("=" * 80)
    
    for table_name in TABLES_TO_MIGRATE:
        if not table_exists_in_sqlite(sqlite_conn, table_name):
            continue
        
        # SQLite计数
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        sqlite_count = sqlite_cursor.fetchone()[0]
        
        # MySQL计数
        mysql_cursor = mysql_conn.cursor()
        mysql_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        mysql_result = mysql_cursor.fetchone()
        mysql_count = mysql_result['COUNT(*)']
        
        status = "✓" if sqlite_count == mysql_count else "✗"
        print(f"  {status} {table_name:30} SQLite: {sqlite_count:5} | MySQL: {mysql_count:5}")


def main():
    """主函数"""
    print("=" * 80)
    print("SQLite 到 MySQL 数据迁移")
    print("=" * 80)
    print(f"\n数据库配置:")
    print(f"  SQLite: {settings.DB_PATH}")
    print(f"  MySQL:  {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}")
    print("=" * 80)
    
    # 确认
    confirm = input("\n⚠️  注意：此操作将清空MySQL数据库并迁移SQLite数据。是否继续? (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ 已取消")
        return
    
    try:
        # 连接数据库
        print("\n连接数据库...")
        sqlite_conn = get_sqlite_connection()
        print("  ✓ SQLite连接成功")
        
        mysql_conn = MySQLConnection.get_connection()
        print("  ✓ MySQL连接成功")
        
        # 创建MySQL表结构
        print("\n创建MySQL表结构...")
        create_all_tables(mysql_conn)
        
        # 列出所有表
        print("\nMySQL数据库中的表:")
        tables = list_all_tables(mysql_conn)
        for table in tables:
            print(f"  - {table}")
        
        # 迁移数据
        print("\n" + "=" * 80)
        print("开始迁移数据")
        print("=" * 80)
        
        total_migrated = 0
        for table_name in TABLES_TO_MIGRATE:
            count = migrate_table(sqlite_conn, mysql_conn, table_name)
            total_migrated += count
        
        # 验证
        verify_migration(sqlite_conn, mysql_conn)
        
        print("\n" + "=" * 80)
        print(f"✅ 迁移完成! 共迁移 {total_migrated} 条记录")
        print("=" * 80)
        
        # 关闭连接
        sqlite_conn.close()
        mysql_conn.close()
        
    except Exception as e:
        print(f"\n❌ 迁移失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()



