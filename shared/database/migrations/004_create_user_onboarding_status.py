#!/usr/bin/env python3
"""
数据库迁移: 创建 user_onboarding_status 表

用于跟踪用户的 Onboarding 完成度和状态
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
    """应用迁移：创建 user_onboarding_status 表"""
    conn = None
    try:
        conn = get_connection(db_path)
        cursor = conn.cursor()

        print("=" * 80)
        print("🚀 数据库迁移: 创建 user_onboarding_status 表")
        print("=" * 80)
        print(f"📁 数据库路径: {db_path}")
        print(f"⏰ 迁移时间: {datetime.now().isoformat()}")
        print()

        # 检查表是否已存在
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_onboarding_status'
        """)
        
        if cursor.fetchone():
            print("⚠️  表 user_onboarding_status 已存在，跳过创建")
            print()
            return

        print("📝 创建表: user_onboarding_status")
        print()

        # 创建表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_onboarding_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(255) NOT NULL UNIQUE,
                
                -- Onboarding 阶段完成状态
                onboarding_stage VARCHAR(50) NOT NULL DEFAULT 'not_started',
                completion_score INTEGER DEFAULT 0,
                
                -- Phase 1: Concerns (了解关注点)
                concerns_collected INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                primary_concern TEXT,
                concern_duration TEXT,
                main_worry TEXT,
                
                -- Phase 2: Goals (设定目标)
                goals_set INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                primary_goal TEXT,
                goal_timeline TEXT,
                motivation TEXT,
                baseline_metrics TEXT,  -- JSON
                
                -- Phase 3: Lifestyle (了解生活方式)
                eating_habits_collected INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                exercise_habits_collected INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                sleep_habits_collected INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                stress_habits_collected INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                
                -- Phase 4: Action Plan (制定行动计划)
                todos_created INTEGER DEFAULT 0,  -- BOOLEAN (0/1)
                initial_todos_count INTEGER DEFAULT 0,
                
                -- 元数据
                onboarding_started_at TIMESTAMP,
                onboarding_completed_at TIMESTAMP,
                last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- 后续阶段（预留）
                engagement_stage VARCHAR(50) DEFAULT 'new_user',
                
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)
        
        print("✅ 表创建成功")
        print()

        # 创建索引
        print("📝 创建索引...")
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id 
            ON user_onboarding_status(user_id)
        """)
        print("  ✅ idx_user_onboarding_user_id")
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_onboarding_stage 
            ON user_onboarding_status(onboarding_stage)
        """)
        print("  ✅ idx_user_onboarding_stage")
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_engagement_stage 
            ON user_onboarding_status(engagement_stage)
        """)
        print("  ✅ idx_user_engagement_stage")
        
        print()

        # 提交事务
        conn.commit()

        # 验证表结构
        print("🔍 验证表结构...")
        cursor.execute("PRAGMA table_info(user_onboarding_status)")
        columns = cursor.fetchall()
        
        print()
        print("📊 表结构:")
        print(f"{'ID':<5} {'字段名':<30} {'类型':<20} {'非空':<10} {'默认值':<20}")
        print("-" * 85)
        for col in columns:
            col_id, name, type_, notnull, default, pk = col
            print(f"{col_id:<5} {name:<30} {type_:<20} {'是' if notnull else '否':<10} {str(default):<20}")
        
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
    """回滚迁移：删除 user_onboarding_status 表"""
    conn = None
    try:
        conn = get_connection(db_path)
        cursor = conn.cursor()

        print("=" * 80)
        print("🔄 回滚迁移: 删除 user_onboarding_status 表")
        print("=" * 80)
        
        cursor.execute("DROP TABLE IF EXISTS user_onboarding_status")
        cursor.execute("DROP INDEX IF EXISTS idx_user_onboarding_user_id")
        cursor.execute("DROP INDEX IF EXISTS idx_user_onboarding_stage")
        cursor.execute("DROP INDEX IF EXISTS idx_user_engagement_stage")
        
        conn.commit()
        
        print("✅ 回滚成功")
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

