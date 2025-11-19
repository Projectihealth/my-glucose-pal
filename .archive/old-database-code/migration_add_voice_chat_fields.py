# migration_add_voice_chat_fields.py
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：为 conversations 表添加 Voice Chat (Retell AI) 支持
扩展现有表以支持 Voice Chat、Video Chat、GPT Chat 的统一存储
"""
import sqlite3
from datetime import datetime
import sys
import io

# 设置 Windows 控制台输出编码
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def migrate_add_voice_chat_fields(db_path: str = 'cgm_butler.db'):
    """
    向 conversations 表添加 Voice Chat 相关字段

    Args:
        db_path: 数据库文件路径
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("开始数据库迁移 - 添加 Voice Chat 字段...")
        print("=" * 60)

        # 检查表是否存在
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='conversations'
        """)
        if not cursor.fetchone():
            print("❌ conversations 表不存在，请先运行 migration_add_conversations.py")
            return

        # 获取现有列名
        cursor.execute("PRAGMA table_info(conversations)")
        existing_columns = {row[1] for row in cursor.fetchall()}

        # 需要添加的字段定义
        new_columns = [
            # Retell AI 特有字段
            ("retell_call_id", "VARCHAR(100)", "Retell Call ID"),
            ("retell_agent_id", "VARCHAR(100)", "Retell Agent ID"),
            ("call_status", "VARCHAR(20)", "通话状态 (active, ended, error)"),
            ("call_type", "VARCHAR(20)", "通话类型 (web_call, phone_call)"),

            # 通话详情
            ("call_cost", "TEXT", "通话费用（JSON 格式）"),
            ("disconnection_reason", "VARCHAR(200)", "断开连接原因"),

            # 对话内容（增强）
            ("transcript_object", "TEXT", "完整 transcript 对象（JSON 数组，带时间戳和角色）"),
            ("recording_url", "VARCHAR(500)", "录音文件 URL"),
        ]

        # 添加新字段
        added_count = 0
        for col_name, col_type, description in new_columns:
            if col_name not in existing_columns:
                print(f"添加字段: {col_name} ({description})")
                cursor.execute(f"ALTER TABLE conversations ADD COLUMN {col_name} {col_type}")
                added_count += 1
            else:
                print(f"跳过已存在字段: {col_name}")

        # 创建新索引
        print("\n创建索引...")

        # 为 Retell Call ID 创建唯一索引
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_retell_call
                ON conversations(retell_call_id) WHERE retell_call_id IS NOT NULL
            """)
            print("✅ 创建 retell_call_id 唯一索引")
        except sqlite3.Error as e:
            print(f"⚠️  索引已存在或创建失败: {e}")

        # 为通话类型创建索引
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_call_type
                ON conversations(call_type) WHERE call_type IS NOT NULL
            """)
            print("✅ 创建 call_type 索引")
        except sqlite3.Error as e:
            print(f"⚠️  索引已存在或创建失败: {e}")

        # 提交更改
        conn.commit()

        print("\n" + "=" * 60)
        print(f"✅ 数据库迁移完成！添加了 {added_count} 个新字段")
        print("\n现在 conversations 表支持以下对话类型：")
        print("  1. retell_voice  - Retell AI Voice Chat")
        print("  2. tavus_video   - Tavus Video Chat")
        print("  3. gpt_chat      - GPT Text Chat")

        print("\n字段使用说明：")
        print("  Voice Chat (Retell):")
        print("    - conversation_type = 'retell_voice'")
        print("    - retell_call_id, retell_agent_id, call_status, call_type")
        print("    - call_cost, disconnection_reason")
        print("    - transcript_object (完整带时间戳), recording_url")
        print("\n  Video Chat (Tavus):")
        print("    - conversation_type = 'tavus_video'")
        print("    - tavus_conversation_id, tavus_replica_id, tavus_persona_id")
        print("    - transcript, conversational_context, custom_greeting")

    except sqlite3.Error as e:
        print(f"❌ 数据库迁移失败: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    import os

    # 获取数据库路径
    db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')

    try:
        migrate_add_voice_chat_fields(db_path)
    except Exception as e:
        print(f"迁移出错: {e}")
        sys.exit(1)
