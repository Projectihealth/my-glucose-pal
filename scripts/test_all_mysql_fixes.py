"""
完整的 MySQL 兼容性测试套件

测试所有已修复的兼容性问题
"""

import sys
import os
from datetime import datetime, timedelta

# 添加项目根目录到路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from shared.database import get_connection
from shared.database.repositories import (
    TodoRepository,
    TodoCheckinRepository,
    ConversationRepository,
    MemoryRepository,
    UserRepository
)


def test_1_todo_checkins_table():
    """测试 1: todo_checkins 表存在"""
    print("\n" + "=" * 60)
    print("测试 1: todo_checkins 表存在")
    print("=" * 60)

    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SHOW TABLES LIKE 'todo_checkins'")
            result = cursor.fetchone()

            if result:
                print("✅ todo_checkins 表存在")
                cursor.execute("DESCRIBE todo_checkins")
                columns = cursor.fetchall()
                print(f"   包含 {len(columns)} 个字段")
                return True
            else:
                print("❌ todo_checkins 表不存在")
                return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_2_boolean_handling():
    """测试 2: BOOLEAN 处理"""
    print("\n" + "=" * 60)
    print("测试 2: BOOLEAN 处理")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            todo_repo = TodoRepository(conn)

            test_user_id = f"test_bool_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            try:
                user_repo.create(user_id=test_user_id, name="Test Boolean User")
            except:
                pass

            # 测试布尔值
            todo_id = todo_repo.create(
                user_id=test_user_id,
                title="Test Boolean",
                completed_today=True,
                user_selected=False
            )

            todo = todo_repo.get_by_id(todo_id)
            assert isinstance(todo['completed_today'], bool), "completed_today 应该是 bool"
            assert isinstance(todo['user_selected'], bool), "user_selected 应该是 bool"
            assert todo['completed_today'] == True
            assert todo['user_selected'] == False

            # 清理
            todo_repo.delete(todo_id)

            print("✅ BOOLEAN 处理正常")
            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_3_json_serialization():
    """测试 3: JSON 序列化"""
    print("\n" + "=" * 60)
    print("测试 3: JSON 序列化/反序列化")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            conv_repo = ConversationRepository(conn)
            mem_repo = MemoryRepository(conn)

            test_user_id = f"test_json_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            try:
                user_repo.create(user_id=test_user_id, name="Test JSON User")
            except:
                pass

            # 测试 JSON 字段
            test_transcript = [{"role": "user", "content": "Hello"}]
            test_metadata = {"source": "test"}

            conv_id = conv_repo.save_gpt_conversation(
                user_id=test_user_id,
                transcript=test_transcript,
                conversational_context="Test",
                started_at=datetime.now().isoformat(),
                metadata=test_metadata
            )

            conv = conv_repo.get_by_id(conv_id)
            assert isinstance(conv['transcript'], list), "transcript 应该是 list"
            assert isinstance(conv['metadata'], dict), "metadata 应该是 dict"
            assert conv['transcript'] == test_transcript
            assert conv['metadata'] == test_metadata

            print("✅ JSON 序列化/反序列化正常")
            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_4_date_functions():
    """测试 4: 日期函数"""
    print("\n" + "=" * 60)
    print("测试 4: 日期函数")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            conv_repo = ConversationRepository(conn)

            test_user_id = f"test_date_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            try:
                user_repo.create(user_id=test_user_id, name="Test Date User")
            except:
                pass

            # 创建对话
            conv_id = conv_repo.save_gpt_conversation(
                user_id=test_user_id,
                transcript=[{"role": "user", "content": "Test"}],
                conversational_context="Context",
                started_at=datetime.now().isoformat()
            )

            # 测试日期过滤
            recent_convs = conv_repo.get_recent_conversations(test_user_id, days=7, limit=10)
            assert len(recent_convs) >= 1, "应该有至少 1 条最近对话"

            # 测试统计
            stats = conv_repo.get_stats(test_user_id, days=7)
            assert stats['total_conversations'] >= 1

            print("✅ 日期函数正常")
            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_5_todo_checkin_functionality():
    """测试 5: TodoCheckin 功能"""
    print("\n" + "=" * 60)
    print("测试 5: TodoCheckin 功能")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            todo_repo = TodoRepository(conn)
            checkin_repo = TodoCheckinRepository(conn)

            test_user_id = f"test_checkin_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            try:
                user_repo.create(user_id=test_user_id, name="Test Checkin User")
            except:
                pass

            # 创建 TODO
            week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
            todo_id = todo_repo.create(
                user_id=test_user_id,
                title="Daily Task",
                week_start=week_start
            )

            # 创建 check-in
            today = datetime.now().date().isoformat()
            checkin_repo.create(test_user_id, todo_id, today)

            # 获取统计
            stats = checkin_repo.get_weekly_completion(test_user_id, week_start)

            assert 'days' in stats
            assert 'week_average' in stats
            assert len(stats['days']) == 7

            # 清理
            todo_repo.delete(todo_id)

            print("✅ TodoCheckin 功能正常")
            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_6_string_length_validation():
    """测试 6: 字符串长度验证"""
    print("\n" + "=" * 60)
    print("测试 6: 字符串长度验证")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)

            # 测试 _validate_string_length 方法
            test_string = "a" * 300
            truncated = user_repo._validate_string_length(test_string, 200, "test_field")

            assert len(truncated) == 200, "应该被截断到 200 字符"

            print("✅ 字符串长度验证正常")
            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_7_foreign_key_constraints():
    """测试 7: 外键约束"""
    print("\n" + "=" * 60)
    print("测试 7: 外键约束")
    print("=" * 60)

    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            # 检查是否有孤立记录
            query = """
            SELECT COUNT(*) as orphan_count
            FROM user_todos t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.user_id IS NOT NULL AND u.user_id IS NULL
            """

            cursor.execute(query)
            result = cursor.fetchone()
            orphan_count = result['orphan_count']

            if orphan_count == 0:
                print("✅ 没有孤立记录")
                return True
            else:
                print(f"❌ 发现 {orphan_count} 条孤立记录")
                return False

    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("MySQL 兼容性完整测试套件")
    print("=" * 60)

    # 检查数据库类型
    from config.settings import settings
    print(f"\n当前数据库类型: {settings.DB_TYPE}")

    # 运行所有测试
    tests = [
        ("todo_checkins 表存在", test_1_todo_checkins_table),
        ("BOOLEAN 处理", test_2_boolean_handling),
        ("JSON 序列化/反序列化", test_3_json_serialization),
        ("日期函数", test_4_date_functions),
        ("TodoCheckin 功能", test_5_todo_checkin_functionality),
        ("字符串长度验证", test_6_string_length_validation),
        ("外键约束", test_7_foreign_key_constraints),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ 测试 '{test_name}' 异常: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))

    # 打印总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{status} - {test_name}")

    print("\n" + "=" * 60)
    print(f"总计: {passed}/{total} 测试通过")
    print("=" * 60)

    if passed == total:
        print("\n🎉 所有测试通过！MySQL 兼容性修复完成。")

    return passed == total


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
