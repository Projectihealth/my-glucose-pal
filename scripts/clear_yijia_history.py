#!/usr/bin/env python3
"""
清空 Yijia 用户的所有对话历史和记忆数据
用于测试首次 Onboarding Call
"""
import sqlite3
import sys
from pathlib import Path

# 数据库路径
DB_PATH = Path(__file__).parent.parent / "storage" / "databases" / "cgm_butler.db"

# Yijia 的 user_id
USER_ID = "user_38377a3b"

def clear_user_history(user_id: str, force: bool = False):
    """清空指定用户的历史数据"""

    print(f"\n{'='*60}")
    print(f"清空用户历史数据")
    print(f"{'='*60}")
    print(f"User ID: {user_id}")
    print(f"Database: {DB_PATH}")
    print(f"{'='*60}\n")

    # 连接数据库
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # 1. 获取当前数据统计
        print("📊 当前数据统计:")

        tables = [
            ('conversations', '对话记录'),
            ('conversation_analysis', '对话分析'),
            ('user_memories', '短期记忆'),
            ('user_long_term_memory', '长期记忆'),
            ('user_todos', '待办事项'),
        ]

        stats = {}
        for table, desc in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE user_id = ?", (user_id,))
                count = cursor.fetchone()[0]
                stats[table] = count
                print(f"  {desc:12} ({table:30}): {count:3} 条")
            except sqlite3.OperationalError:
                print(f"  {desc:12} ({table:30}): 表不存在")

        # 检查 user_onboarding_status 表
        try:
            cursor.execute("SELECT COUNT(*) FROM user_onboarding_status WHERE user_id = ?", (user_id,))
            count = cursor.fetchone()[0]
            stats['user_onboarding_status'] = count
            print(f"  {'Onboarding状态':12} ({'user_onboarding_status':30}): {count:3} 条")
        except sqlite3.OperationalError:
            print(f"  {'Onboarding状态':12} ({'user_onboarding_status':30}): 表不存在")

        total = sum(stats.values())

        if total == 0:
            print(f"\n✅ 用户 {user_id} 没有历史数据，无需清空。")
            return

        # 2. 确认清空
        print(f"\n{'='*60}")
        print(f"⚠️  即将删除 {total} 条数据！")
        print(f"{'='*60}\n")

        if not force:
            response = input("确认清空? (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("\n❌ 操作已取消")
                return
        else:
            print("🚀 Force模式: 自动确认清空")

        # 3. 开始清空数据
        print(f"\n{'='*60}")
        print("🗑️  开始清空数据...")
        print(f"{'='*60}\n")

        # 清空各个表
        for table, desc in tables:
            try:
                cursor.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
                deleted = cursor.rowcount
                print(f"  ✓ {desc:12} ({table:30}): 删除 {deleted} 条")
            except sqlite3.OperationalError as e:
                print(f"  ✗ {desc:12} ({table:30}): {e}")

        # 清空 user_onboarding_status
        try:
            cursor.execute("DELETE FROM user_onboarding_status WHERE user_id = ?", (user_id,))
            deleted = cursor.rowcount
            print(f"  ✓ {'Onboarding状态':12} ({'user_onboarding_status':30}): 删除 {deleted} 条")
        except sqlite3.OperationalError:
            pass

        # 提交更改
        conn.commit()

        # 4. 验证清空结果
        print(f"\n{'='*60}")
        print("✅ 验证清空结果:")
        print(f"{'='*60}\n")

        for table, desc in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE user_id = ?", (user_id,))
                count = cursor.fetchone()[0]
                status = "✓" if count == 0 else "✗"
                print(f"  {status} {desc:12} ({table:30}): {count:3} 条")
            except sqlite3.OperationalError:
                pass

        try:
            cursor.execute("SELECT COUNT(*) FROM user_onboarding_status WHERE user_id = ?", (user_id,))
            count = cursor.fetchone()[0]
            status = "✓" if count == 0 else "✗"
            print(f"  {status} {'Onboarding状态':12} ({'user_onboarding_status':30}): {count:3} 条")
        except sqlite3.OperationalError:
            pass

        print(f"\n{'='*60}")
        print("✅ 清空完成！用户现在是全新状态，可以进行首次 Onboarding Call 测试。")
        print(f"{'='*60}\n")

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        conn.rollback()
        raise

    finally:
        conn.close()


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='清空Yijia用户的历史数据')
    parser.add_argument('--force', '-f', action='store_true', help='跳过确认，直接清空')
    args = parser.parse_args()

    clear_user_history(USER_ID, force=args.force)
