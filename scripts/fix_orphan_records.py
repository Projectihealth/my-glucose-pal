"""
修复孤立记录

清理外键引用不存在记录的数据
"""

import sys
import os

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from shared.database.mysql_connection import MySQLConnection


def fix_orphan_user_todos():
    """修复 user_todos 表中的孤立记录"""
    print("=" * 60)
    print("修复 user_todos 孤立记录")
    print("=" * 60)

    try:
        with MySQLConnection.get_db_session() as conn:
            cursor = conn.cursor()

            # 查找孤立记录
            query = """
            SELECT t.id, t.user_id, t.title
            FROM user_todos t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.user_id IS NOT NULL
                AND u.user_id IS NULL
            """

            cursor.execute(query)
            orphan_todos = cursor.fetchall()

            if not orphan_todos:
                print("✅ 没有发现孤立记录")
                return True

            print(f"\n发现 {len(orphan_todos)} 条孤立记录:")
            for todo in orphan_todos:
                print(f"  - ID: {todo['id']}, User: {todo['user_id']}, Title: {todo['title']}")

            # 询问用户如何处理
            print("\n处理选项:")
            print("1. 删除这些孤立记录（推荐）")
            print("2. 创建占位用户")
            print("3. 取消")

            choice = input("\n请选择 (1/2/3): ").strip()

            if choice == '1':
                # 删除孤立记录
                delete_query = """
                DELETE t FROM user_todos t
                LEFT JOIN users u ON t.user_id = u.user_id
                WHERE t.user_id IS NOT NULL
                    AND u.user_id IS NULL
                """
                cursor.execute(delete_query)
                conn.commit()
                print(f"✅ 已删除 {len(orphan_todos)} 条孤立记录")
                return True

            elif choice == '2':
                # 获取需要创建的用户
                orphan_users = set(todo['user_id'] for todo in orphan_todos)

                for user_id in orphan_users:
                    # 创建占位用户
                    insert_query = """
                    INSERT INTO users (user_id, name, created_at, updated_at)
                    VALUES (%s, %s, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE user_id = user_id
                    """
                    cursor.execute(insert_query, (user_id, f"Placeholder User ({user_id})"))

                conn.commit()
                print(f"✅ 已创建 {len(orphan_users)} 个占位用户")
                return True

            else:
                print("❌ 已取消")
                return False

    except Exception as e:
        print(f"❌ 修复失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """修复所有孤立记录"""
    success = fix_orphan_user_todos()
    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
