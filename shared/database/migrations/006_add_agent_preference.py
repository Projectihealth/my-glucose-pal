#!/usr/bin/env python3
"""
数据库迁移: 添加 agent_preference 字段到 users 表

允许用户选择偏好的 health companion (Olivia 或 Oliver)
"""

import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime

# Add project root to sys.path for shared modules
project_root = Path(__file__).parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from shared.database.connection import get_connection
from config.settings import settings


def apply_migration(db_path: str):
    """应用迁移：添加 agent_preference 字段"""
    conn = None
    try:
        conn = get_connection(db_path)
        cursor = conn.cursor()

        print("=" * 80)
        print("🚀 数据库迁移: 添加 agent_preference 字段到 users 表")
        print("=" * 80)
        print(f"📁 数据库路径: {db_path}")
        print(f"⏰ 迁移时间: {datetime.now().isoformat()}")
        print()

        # 检查字段是否已存在 (MySQL语法)
        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'agent_preference'
        """)

        if cursor.fetchone():
            print("⚠️  字段 agent_preference 已存在，跳过添加")
            print()
            return

        print("📝 添加字段: agent_preference")
        print("   - 类型: VARCHAR(20)")
        print("   - 默认值: 'olivia'")
        print("   - 允许值: 'olivia' | 'oliver'")
        print()

        # 添加字段 (MySQL语法)
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN agent_preference VARCHAR(20) DEFAULT 'olivia'
            COMMENT 'Preferred health companion: olivia or oliver'
        """)

        print("✅ 字段添加成功")
        print()

        # 提交事务
        conn.commit()

        # 验证字段 (MySQL语法)
        print("🔍 验证字段...")
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'agent_preference'
        """)

        col_info = cursor.fetchone()
        if col_info:
            col_name, data_type, is_nullable, default, comment = col_info
            print()
            print("📊 新字段信息:")
            print(f"  字段名: {col_name}")
            print(f"  类型: {data_type}")
            print(f"  非空: {'否' if is_nullable == 'YES' else '是'}")
            print(f"  默认值: {default}")
            print(f"  注释: {comment}")
            print()

        # 统计现有用户
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"📊 现有用户数: {user_count}")
        if user_count > 0:
            print(f"   所有现有用户的 agent_preference 已自动设置为 'olivia'")
        print()

        print("=" * 80)
        print("✅ 迁移成功完成!")
        print("=" * 80)

    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ 迁移失败: {e}")
        print("=" * 80)
        if conn:
            conn.rollback()
        raise

    finally:
        if conn:
            conn.close()


def rollback_migration(db_path: str):
    """回滚迁移：删除 agent_preference 字段"""
    conn = None
    try:
        conn = get_connection(db_path)
        cursor = conn.cursor()

        print("=" * 80)
        print("🔄 回滚迁移: 删除 agent_preference 字段")
        print("=" * 80)

        # SQLite 不支持 DROP COLUMN，需要重建表
        # 对于简单的测试环境，我们可以这样处理
        print("⚠️  注意: SQLite 不支持 DROP COLUMN")
        print("如需回滚，请手动处理或使用完整的表重建流程")
        print()

        print("=" * 80)

    except Exception as e:
        print(f"❌ 回滚失败: {e}")
        if conn:
            conn.rollback()
        raise

    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    # Ensure environment variables are loaded
    from dotenv import load_dotenv
    load_dotenv(os.path.join(project_root, '.env'))

    db_path = settings.DB_PATH

    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback_migration(db_path)
    else:
        apply_migration(db_path)
