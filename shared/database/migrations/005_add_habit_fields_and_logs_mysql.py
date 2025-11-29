"""
数据库迁移: 添加习惯相关字段和创建 habit_logs 表 (MySQL 版本)

新增到 user_todos 表的字段:
- emoji: 习惯图标 (VARCHAR(10))
- frequency: 每周目标次数 (INT, 默认7)

新建 habit_logs 表:
- 用于记录每日习惯完成状态
- 支持查询历史任意日期的完成情况
- 支持 streak 计算

运行方式:
    python3 shared/database/migrations/005_add_habit_fields_and_logs_mysql.py
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from config.settings import settings
from shared.database.mysql_connection import MySQLConnection


def run_migration():
    """运行迁移"""
    print(f"📁 数据库类型: {settings.DB_TYPE}")
    print(f"📁 MySQL 主机: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}")
    print(f"📁 数据库名称: {settings.MYSQL_DATABASE}")

    try:
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor()

        # ============================================================
        # Part 1: 为 user_todos 表添加新字段
        # ============================================================
        print("\n" + "="*60)
        print("Part 1: 为 user_todos 表添加字段")
        print("="*60)

        print("\n🔍 检查 user_todos 表结构...")
        cursor.execute("SHOW COLUMNS FROM user_todos")
        result = cursor.fetchall()
        # MySQL cursor returns dictionaries with DictCursor
        columns = [row['Field'] if isinstance(row, dict) else row[0] for row in result]
        print(f"   当前字段: {', '.join(columns)}")

        # 检查并添加 emoji 字段
        if 'emoji' not in columns:
            print("\n➕ 添加字段: emoji (VARCHAR(10))")
            cursor.execute("""
                ALTER TABLE user_todos
                ADD COLUMN emoji VARCHAR(10) NULL
            """)
            print("   ✅ emoji 添加成功")
        else:
            print("\n✓  emoji 字段已存在")

        # 检查并添加 frequency 字段
        if 'frequency' not in columns:
            print("\n➕ 添加字段: frequency (INT DEFAULT 7)")
            cursor.execute("""
                ALTER TABLE user_todos
                ADD COLUMN frequency INT DEFAULT 7
            """)
            print("   ✅ frequency 添加成功")
        else:
            print("\n✓  frequency 字段已存在")

        # ============================================================
        # Part 2: 创建 habit_logs 表
        # ============================================================
        print("\n" + "="*60)
        print("Part 2: 创建 habit_logs 表")
        print("="*60)

        # 检查表是否已存在
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = %s
            AND table_name = 'habit_logs'
        """, (settings.MYSQL_DATABASE,))

        result = cursor.fetchone()
        table_exists = (result['COUNT(*)'] if isinstance(result, dict) else result[0]) > 0

        if table_exists:
            print("\n✓  habit_logs 表已存在")
        else:
            print("\n📝 创建 habit_logs 表...")
            cursor.execute("""
                CREATE TABLE habit_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    habit_id INT NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    log_date DATE NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    timestamp BIGINT NOT NULL,
                    note TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (habit_id) REFERENCES user_todos(id) ON DELETE CASCADE,
                    UNIQUE KEY uk_habit_date (habit_id, log_date),
                    KEY idx_user_date (user_id, log_date),
                    KEY idx_habit_id (habit_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            print("   ✅ habit_logs 表创建成功")
            print("   ✅ 唯一索引创建成功 (habit_id, log_date)")
            print("   ✅ 查询索引创建成功 (user_id, log_date)")

        # 提交更改
        conn.commit()

        # ============================================================
        # 验证迁移结果
        # ============================================================
        print("\n" + "="*60)
        print("验证迁移结果")
        print("="*60)

        # 验证 user_todos 表结构
        print("\n📊 user_todos 新增字段:")
        cursor.execute("SHOW COLUMNS FROM user_todos WHERE Field IN ('emoji', 'frequency')")
        todos_columns = cursor.fetchall()
        for col in todos_columns:
            if isinstance(col, dict):
                field, type_, null, default = col['Field'], col['Type'], col['Null'], col['Default']
            else:
                field, type_, null, key, default, extra = col
            nullable = "NULL" if null == "YES" else "NOT NULL"
            default_val = f"DEFAULT {default}" if default else ""
            print(f"   ✓ {field:20s} {type_:15s} {nullable:10s} {default_val:20s}")

        # 验证 habit_logs 表结构
        print("\n📊 habit_logs 表结构:")
        cursor.execute("SHOW COLUMNS FROM habit_logs")
        logs_columns = cursor.fetchall()
        for col in logs_columns:
            if isinstance(col, dict):
                field, type_, null, key, default = col['Field'], col['Type'], col['Null'], col['Key'], col['Default']
            else:
                field, type_, null, key, default, extra = col
            nullable = "NULL" if null == "YES" else "NOT NULL"
            default_val = f"DEFAULT {default}" if default else ""
            pk_marker = "PRIMARY KEY" if key == "PRI" else ""
            print(f"   {field:20s} {type_:15s} {nullable:10s} {default_val:20s} {pk_marker}")

        # 验证索引
        print("\n📊 habit_logs 表索引:")
        cursor.execute("SHOW INDEX FROM habit_logs")
        indexes = cursor.fetchall()
        index_names = set()
        for idx in indexes:
            if isinstance(idx, dict):
                index_name = idx['Key_name']
                non_unique = idx['Non_unique']
            else:
                index_name = idx[2]
                non_unique = idx[1]
            if index_name not in index_names:
                unique = "UNIQUE" if non_unique == 0 else "INDEX"
                print(f"   {index_name:40s} ({unique})")
                index_names.add(index_name)

        cursor.close()
        conn.close()

        print("\n" + "="*60)
        print("✅ 迁移成功完成!")
        print("="*60)

        return True

    except Exception as e:
        print(f"\n❌ 迁移失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    print("="*60)
    print("🚀 数据库迁移: 添加习惯字段和创建日志表 (MySQL)")
    print("="*60)

    if settings.DB_TYPE.lower() != 'mysql':
        print(f"\n⚠️  警告: 当前 DB_TYPE={settings.DB_TYPE}, 不是 mysql")
        print("   如果你想使用 MySQL，请在 .env 中设置 DB_TYPE=mysql")
        sys.exit(1)

    success = run_migration()
    sys.exit(0 if success else 1)
