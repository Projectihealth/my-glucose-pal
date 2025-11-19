"""
添加 todo_checkins 表到 MySQL 数据库

这个脚本会检查 todo_checkins 表是否存在，如果不存在则创建它。
"""

import sys
import os

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from shared.database.mysql_connection import MySQLConnection
from shared.database.mysql_schema import TODO_CHECKINS_TABLE


def main():
    """添加 todo_checkins 表"""
    print("=" * 60)
    print("添加 todo_checkins 表到 MySQL")
    print("=" * 60)

    try:
        with MySQLConnection.get_db_session() as conn:
            cursor = conn.cursor()

            # 检查表是否已存在
            cursor.execute("SHOW TABLES LIKE 'todo_checkins'")
            exists = cursor.fetchone()

            if exists:
                print("✅ todo_checkins 表已存在")
                return True

            # 创建表
            print("📝 创建 todo_checkins 表...")
            cursor.execute(TODO_CHECKINS_TABLE)
            conn.commit()

            print("✅ todo_checkins 表创建成功!")

            # 验证表结构
            cursor.execute("DESCRIBE todo_checkins")
            columns = cursor.fetchall()
            print("\n表结构:")
            for col in columns:
                print(f"  - {col['Field']}: {col['Type']}")

            return True

    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
