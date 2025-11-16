# migration_add_memory_tables.py
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：添加用户记忆与 TODO 相关表

- user_memories: 存储每次会话后的短期记忆 / 总结
- user_long_term_memory: 存储长期稳定的用户画像、目标、习惯
- user_todos: 存储从对话中提炼出的 TODO 列表（供前端展示）
"""

import sqlite3
import sys
import io
from datetime import datetime

# 设置 Windows 控制台输出编码
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


def migrate_add_memory_tables(db_path: str = "cgm_butler.db"):
    """
    添加用户记忆与 TODO 相关表到数据库

    Args:
        db_path: 数据库文件路径
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("开始 memory/todo 相关数据库迁移...")
        print("=" * 60)

        # 1. 创建 user_memories 表（短期记忆）
        print("\n[1/3] 创建 user_memories 表...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS user_memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id VARCHAR(50) NOT NULL,
            conversation_id VARCHAR(100),
            channel VARCHAR(20) NOT NULL,           -- 'gpt_chat', 'retell_voice', 'tavus_video'
            memory_type VARCHAR(50) NOT NULL,       -- 'session_summary', 'insight' 等
            title VARCHAR(200),
            content TEXT NOT NULL,
            importance INTEGER,                     -- 0-10
            tags TEXT,                              -- JSON array
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            valid_until TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
        )
        """
        )

        cursor.execute(
            """
        CREATE INDEX IF NOT EXISTS idx_user_memories_user_time
        ON user_memories(user_id, created_at DESC)
        """
        )
        cursor.execute(
            """
        CREATE INDEX IF NOT EXISTS idx_user_memories_channel
        ON user_memories(channel)
        """
        )

        print("✅ user_memories 表创建成功")

        # 2. 创建 user_long_term_memory 表（长期记忆）
        print("[2/3] 创建 user_long_term_memory 表...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS user_long_term_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,          -- 'goal', 'habit', 'preference', 'risk_factor', ...
            key VARCHAR(100) NOT NULL,
            value TEXT NOT NULL,                    -- JSON 或文本
            source VARCHAR(50) NOT NULL,            -- 'user_report', 'agent_inference', 'manual'
            confidence REAL,
            is_active INTEGER NOT NULL DEFAULT 1,   -- 0/1
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
        )

        cursor.execute(
            """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_long_term_unique_key
        ON user_long_term_memory(user_id, category, key)
        """
        )

        print("✅ user_long_term_memory 表创建成功")

        # 3. 创建 user_todos 表
        print("[3/3] 创建 user_todos 表...")
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS user_todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id VARCHAR(50) NOT NULL,
            conversation_id VARCHAR(100),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(50),                   -- 'diet', 'exercise', 'sleep', ...
            target_count INTEGER,
            current_count INTEGER DEFAULT 0,
            unit VARCHAR(50),                       -- 'times_per_week', 'minutes_per_week', ...
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'expired', 'cancelled'
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
        )
        """
        )

        cursor.execute(
            """
        CREATE INDEX IF NOT EXISTS idx_todos_user_period
        ON user_todos(user_id, period_start, period_end)
        """
        )
        cursor.execute(
            """
        CREATE INDEX IF NOT EXISTS idx_todos_status
        ON user_todos(status)
        """
        )

        print("✅ user_todos 表创建成功")

        conn.commit()

        print("\n" + "=" * 60)
        print("✅ memory/todo 相关数据库迁移完成！")
        print("\n新增表：")
        print("  1. user_memories - 存储每次会话后的短期记忆/总结")
        print("  2. user_long_term_memory - 存储长期稳定的用户画像和目标")
        print("  3. user_todos - 存储从对话中提炼出的 TODO 列表")

    except sqlite3.Error as e:
        print(f"❌ 数据库迁移失败: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import os

    db_path = os.path.join(os.path.dirname(__file__), "cgm_butler.db")

    try:
        migrate_add_memory_tables(db_path)
    except Exception as e:
        print(f"迁移出错: {e}")
        sys.exit(1)


