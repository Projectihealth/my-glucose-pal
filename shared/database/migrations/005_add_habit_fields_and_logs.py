"""
数据库迁移: 添加习惯相关字段和创建 habit_logs 表

新增到 user_todos 表的字段:
- emoji: 习惯图标 (TEXT)
- frequency: 每周目标次数 (INTEGER, 默认7)

新建 habit_logs 表:
- 用于记录每日习惯完成状态
- 支持查询历史任意日期的完成情况
- 支持 streak 计算

运行方式:
    python3 shared/database/migrations/005_add_habit_fields_and_logs.py
"""

import sqlite3
import os
import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from config.settings import settings


def run_migration():
    """运行迁移"""
    db_path = settings.DB_PATH

    print(f"📁 数据库路径: {db_path}")

    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # ============================================================
        # Part 1: 为 user_todos 表添加新字段
        # ============================================================
        print("\n" + "="*60)
        print("Part 1: 为 user_todos 表添加字段")
        print("="*60)

        print("\n🔍 检查 user_todos 表结构...")
        cursor.execute("PRAGMA table_info(user_todos)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"   当前字段: {', '.join(columns)}")

        # 检查并添加 emoji 字段
        if 'emoji' not in columns:
            print("\n➕ 添加字段: emoji (TEXT)")
            cursor.execute("""
                ALTER TABLE user_todos
                ADD COLUMN emoji TEXT
            """)
            print("   ✅ emoji 添加成功")
        else:
            print("\n✓  emoji 字段已存在")

        # 检查并添加 frequency 字段
        if 'frequency' not in columns:
            print("\n➕ 添加字段: frequency (INTEGER DEFAULT 7)")
            cursor.execute("""
                ALTER TABLE user_todos
                ADD COLUMN frequency INTEGER DEFAULT 7
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
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='habit_logs'
        """)

        if cursor.fetchone():
            print("\n✓  habit_logs 表已存在")
        else:
            print("\n📝 创建 habit_logs 表...")
            cursor.execute("""
                CREATE TABLE habit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    habit_id INTEGER NOT NULL,
                    user_id TEXT NOT NULL,
                    log_date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp INTEGER NOT NULL,
                    note TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (habit_id) REFERENCES user_todos(id) ON DELETE CASCADE
                )
            """)
            print("   ✅ habit_logs 表创建成功")

            # 创建唯一索引
            print("\n📝 创建索引...")
            cursor.execute("""
                CREATE UNIQUE INDEX idx_habit_logs_unique
                ON habit_logs(habit_id, log_date)
            """)
            print("   ✅ 唯一索引创建成功 (habit_id, log_date)")

            # 创建查询索引
            cursor.execute("""
                CREATE INDEX idx_habit_logs_user_date
                ON habit_logs(user_id, log_date)
            """)
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
        print("\n📊 user_todos 表结构:")
        cursor.execute("PRAGMA table_info(user_todos)")
        todos_columns = cursor.fetchall()
        for col in todos_columns:
            col_id, name, type_, notnull, default, pk = col
            if name in ['emoji', 'frequency']:
                nullable = "NOT NULL" if notnull else "NULL"
                default_val = f"DEFAULT {default}" if default else ""
                pk_marker = "PRIMARY KEY" if pk else ""
                print(f"   ✓ {name:20s} {type_:15s} {nullable:10s} {default_val:20s} {pk_marker}")

        # 验证 habit_logs 表结构
        print("\n📊 habit_logs 表结构:")
        cursor.execute("PRAGMA table_info(habit_logs)")
        logs_columns = cursor.fetchall()
        for col in logs_columns:
            col_id, name, type_, notnull, default, pk = col
            nullable = "NOT NULL" if notnull else "NULL"
            default_val = f"DEFAULT {default}" if default else ""
            pk_marker = "PRIMARY KEY" if pk else ""
            print(f"   {name:20s} {type_:15s} {nullable:10s} {default_val:20s} {pk_marker}")

        # 验证索引
        print("\n📊 habit_logs 表索引:")
        cursor.execute("PRAGMA index_list(habit_logs)")
        indexes = cursor.fetchall()
        for idx in indexes:
            seq, name, unique, origin, partial = idx
            unique_str = "UNIQUE" if unique else "INDEX"
            print(f"   {name:40s} ({unique_str})")

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
    print("🚀 数据库迁移: 添加习惯字段和创建日志表")
    print("="*60)

    success = run_migration()
    sys.exit(0 if success else 1)
