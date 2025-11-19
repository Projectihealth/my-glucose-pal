"""
测试 MySQL 兼容性修复

这个脚本测试所有的 MySQL 兼容性修复：
1. todo_checkins 表是否存在
2. BOOLEAN 处理是否正确
3. JSON 字段序列化/反序列化是否正确
4. 日期函数是否正确工作
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


def test_todo_checkins_table():
    """测试 todo_checkins 表是否存在"""
    print("\n" + "=" * 60)
    print("测试 1: 检查 todo_checkins 表是否存在")
    print("=" * 60)

    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            # 检查表是否存在
            if hasattr(cursor, 'execute'):
                # MySQL
                cursor.execute("SHOW TABLES LIKE 'todo_checkins'")
                result = cursor.fetchone()
                if result:
                    print("✅ todo_checkins 表存在")

                    # 检查表结构
                    cursor.execute("DESCRIBE todo_checkins")
                    columns = cursor.fetchall()
                    print(f"   表字段: {[col for col in columns]}")
                    return True
                else:
                    print("❌ todo_checkins 表不存在")
                    return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False


def test_boolean_handling():
    """测试 BOOLEAN 处理"""
    print("\n" + "=" * 60)
    print("测试 2: BOOLEAN 处理")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            todo_repo = TodoRepository(conn)

            # 创建测试用户
            test_user_id = f"test_bool_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            try:
                user_repo.create(
                    user_id=test_user_id,
                    name="Test Boolean User"
                )
                print(f"✅ 创建测试用户: {test_user_id}")
            except Exception as e:
                print(f"   用户可能已存在，继续测试")

            # 创建 TODO，测试 BOOLEAN 字段
            todo_id = todo_repo.create(
                user_id=test_user_id,
                title="Test Boolean TODO",
                completed_today=True,
                user_selected=False
            )
            print(f"✅ 创建 TODO (ID: {todo_id}) 使用布尔值: completed_today=True, user_selected=False")

            # 读取并验证
            todo = todo_repo.get_by_id(todo_id)
            assert isinstance(todo['completed_today'], bool), f"completed_today 应该是 bool 类型，实际是 {type(todo['completed_today'])}"
            assert isinstance(todo['user_selected'], bool), f"user_selected 应该是 bool 类型，实际是 {type(todo['user_selected'])}"
            assert todo['completed_today'] == True, "completed_today 应该是 True"
            assert todo['user_selected'] == False, "user_selected 应该是 False"

            print("✅ BOOLEAN 值正确读取和转换")

            # 更新 BOOLEAN 字段
            todo_repo.update(todo_id, completed_today=False, user_selected=True)
            updated_todo = todo_repo.get_by_id(todo_id)
            assert updated_todo['completed_today'] == False
            assert updated_todo['user_selected'] == True
            print("✅ BOOLEAN 值更新成功")

            # 清理
            todo_repo.delete(todo_id)
            print("✅ 测试数据清理完成")

            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_json_serialization():
    """测试 JSON 字段序列化/反序列化"""
    print("\n" + "=" * 60)
    print("测试 3: JSON 字段序列化/反序列化")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            conv_repo = ConversationRepository(conn)
            mem_repo = MemoryRepository(conn)

            test_user_id = f"test_json_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            # 创建测试用户（外键约束要求）
            try:
                user_repo.create(user_id=test_user_id, name="Test JSON User")
                print(f"✅ 创建测试用户: {test_user_id}")
            except:
                print(f"   用户可能已存在，继续测试")

            # 测试 conversation 的 JSON 字段
            test_transcript = [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
            test_metadata = {"source": "test", "version": "1.0"}
            test_properties = {"priority": "high", "tags": ["test", "json"]}

            conv_id = conv_repo.save_gpt_conversation(
                user_id=test_user_id,
                transcript=test_transcript,
                conversational_context="Test context",
                started_at=datetime.now().isoformat(),
                metadata=test_metadata,
                properties=test_properties
            )
            print(f"✅ 创建对话 (ID: {conv_id}) 包含 JSON 字段")

            # 读取并验证
            conv = conv_repo.get_by_id(conv_id)
            assert isinstance(conv['transcript'], list), f"transcript 应该是 list，实际是 {type(conv['transcript'])}"
            assert isinstance(conv['metadata'], dict), f"metadata 应该是 dict，实际是 {type(conv['metadata'])}"
            assert isinstance(conv['properties'], dict), f"properties 应该是 dict，实际是 {type(conv['properties'])}"
            assert conv['transcript'] == test_transcript, "transcript 内容不匹配"
            assert conv['metadata'] == test_metadata, "metadata 内容不匹配"
            assert conv['properties'] == test_properties, "properties 内容不匹配"

            print("✅ Conversation JSON 字段正确序列化和反序列化")

            # 测试 memory 的 JSON 字段
            test_key_topics = ["health", "diet", "exercise"]
            test_extracted_data = {"weight": 70, "goal": "lose weight"}

            mem_id = mem_repo.save_memory(
                user_id=test_user_id,
                conversation_id=conv_id,
                channel="gpt_chat",
                summary="Test memory",
                key_topics=test_key_topics,
                extracted_data=test_extracted_data
            )
            print(f"✅ 创建记忆 (ID: {mem_id}) 包含 JSON 字段")

            # 读取并验证
            memories = mem_repo.get_recent_memories(test_user_id, days=1, limit=10)
            assert len(memories) > 0, "应该有至少一条记忆"
            mem = memories[0]
            assert isinstance(mem['key_topics'], list), f"key_topics 应该是 list，实际是 {type(mem['key_topics'])}"
            assert isinstance(mem['extracted_data'], dict), f"extracted_data 应该是 dict，实际是 {type(mem['extracted_data'])}"
            assert mem['key_topics'] == test_key_topics, "key_topics 内容不匹配"
            assert mem['extracted_data'] == test_extracted_data, "extracted_data 内容不匹配"

            print("✅ Memory JSON 字段正确序列化和反序列化")

            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_date_functions():
    """测试日期函数"""
    print("\n" + "=" * 60)
    print("测试 4: 日期函数")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            conv_repo = ConversationRepository(conn)
            mem_repo = MemoryRepository(conn)

            test_user_id = f"test_date_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            # 创建测试用户（外键约束要求）
            try:
                user_repo.create(user_id=test_user_id, name="Test Date User")
                print(f"✅ 创建测试用户: {test_user_id}")
            except:
                print(f"   用户可能已存在，继续测试")

            # 创建一些测试数据
            conv_id1 = conv_repo.save_gpt_conversation(
                user_id=test_user_id,
                transcript=[{"role": "user", "content": "Test 1"}],
                conversational_context="Context 1",
                started_at=datetime.now().isoformat()
            )
            print(f"✅ 创建对话 1 (ID: {conv_id1})")

            conv_id2 = conv_repo.save_gpt_conversation(
                user_id=test_user_id,
                transcript=[{"role": "user", "content": "Test 2"}],
                conversational_context="Context 2",
                started_at=datetime.now().isoformat()
            )
            print(f"✅ 创建对话 2 (ID: {conv_id2})")

            # 测试 get_recent_conversations (使用日期函数)
            recent_convs = conv_repo.get_recent_conversations(test_user_id, days=7, limit=10)
            assert len(recent_convs) >= 2, f"应该有至少 2 条最近对话，实际: {len(recent_convs)}"
            print(f"✅ get_recent_conversations 返回 {len(recent_convs)} 条对话")

            # 测试 get_stats (使用日期函数)
            stats = conv_repo.get_stats(test_user_id, days=7)
            assert stats['total_conversations'] >= 2, f"统计应该显示至少 2 条对话，实际: {stats['total_conversations']}"
            print(f"✅ get_stats 返回正确统计: {stats}")

            # 测试 get_recent_memories (使用日期函数)
            mem_repo.save_memory(
                user_id=test_user_id,
                conversation_id=conv_id1,
                channel="gpt_chat",
                summary="Recent memory test"
            )

            recent_mems = mem_repo.get_recent_memories(test_user_id, days=7, limit=10)
            assert len(recent_mems) >= 1, f"应该有至少 1 条最近记忆，实际: {len(recent_mems)}"
            print(f"✅ get_recent_memories 返回 {len(recent_mems)} 条记忆")

            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_todo_checkin_functionality():
    """测试 todo_checkin 功能"""
    print("\n" + "=" * 60)
    print("测试 5: TodoCheckin 功能")
    print("=" * 60)

    try:
        with get_connection() as conn:
            user_repo = UserRepository(conn)
            todo_repo = TodoRepository(conn)
            checkin_repo = TodoCheckinRepository(conn)

            test_user_id = f"test_checkin_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            # 创建测试用户
            try:
                user_repo.create(user_id=test_user_id, name="Test Checkin User")
                print(f"✅ 创建测试用户: {test_user_id}")
            except:
                print(f"   用户可能已存在，继续测试")

            # 创建 TODO
            week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
            todo_id1 = todo_repo.create(
                user_id=test_user_id,
                title="Daily Exercise",
                week_start=week_start
            )
            todo_id2 = todo_repo.create(
                user_id=test_user_id,
                title="Drink Water",
                week_start=week_start
            )
            print(f"✅ 创建 2 个 TODOs (ID: {todo_id1}, {todo_id2})")

            # 创建 check-in
            today = datetime.now().date().isoformat()
            yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()

            checkin_repo.create(test_user_id, todo_id1, today)
            checkin_repo.create(test_user_id, todo_id1, yesterday)
            checkin_repo.create(test_user_id, todo_id2, today)

            print(f"✅ 创建 3 个 check-ins")

            # 获取周统计
            weekly_stats = checkin_repo.get_weekly_completion(test_user_id, week_start)

            print(f"✅ 获取周统计成功")
            print(f"   周平均: {weekly_stats['week_average']}%")
            print(f"   天数: {len(weekly_stats['days'])}")

            # 验证统计数据
            assert 'days' in weekly_stats, "统计应该包含 days"
            assert len(weekly_stats['days']) == 7, "应该有 7 天的数据"
            assert 'week_average' in weekly_stats, "统计应该包含 week_average"

            # 查找今天和昨天的统计
            today_stats = next((d for d in weekly_stats['days'] if d['date'] == today), None)
            yesterday_stats = next((d for d in weekly_stats['days'] if d['date'] == yesterday), None)

            assert today_stats is not None, "应该有今天的统计"
            assert yesterday_stats is not None, "应该有昨天的统计"

            # 今天: 2 个 todos，2 个完成 (todo_id1 和 todo_id2)
            assert today_stats['completed'] == 2, f"今天应该完成 2 个，实际: {today_stats['completed']}"
            assert today_stats['total'] == 2, f"今天总共 2 个，实际: {today_stats['total']}"

            # 昨天: 2 个 todos，1 个完成 (todo_id1)
            assert yesterday_stats['completed'] == 1, f"昨天应该完成 1 个，实际: {yesterday_stats['completed']}"
            assert yesterday_stats['total'] == 2, f"昨天总共 2 个，实际: {yesterday_stats['total']}"

            print("✅ TodoCheckin 统计数据正确")

            # 清理
            todo_repo.delete(todo_id1)
            todo_repo.delete(todo_id2)
            print("✅ 测试数据清理完成")

            return True

    except AssertionError as e:
        print(f"❌ 断言失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("MySQL 兼容性修复测试套件")
    print("=" * 60)

    # 检查数据库类型
    from config.settings import settings
    print(f"\n当前数据库类型: {settings.DB_TYPE}")
    if settings.DB_TYPE.lower() != 'mysql':
        print("⚠️  警告: 当前不是 MySQL 数据库，某些测试可能不准确")

    # 运行所有测试
    tests = [
        ("todo_checkins 表存在", test_todo_checkins_table),
        ("BOOLEAN 处理", test_boolean_handling),
        ("JSON 序列化/反序列化", test_json_serialization),
        ("日期函数", test_date_functions),
        ("TodoCheckin 功能", test_todo_checkin_functionality),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ 测试 '{test_name}' 异常: {e}")
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

    return passed == total


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
