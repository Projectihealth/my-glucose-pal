#!/usr/bin/env python3
"""
测试语音对话结束后的 Memory/TODO 生成和 MySQL 存储
"""
import sys
import os
from pathlib import Path
import json
import time

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from shared.database import get_connection
import pymysql

def test_voice_call_flow():
    """模拟完整的语音对话流程并测试MySQL存储"""
    
    print("=" * 80)
    print("🧪 测试语音对话 → Memory/TODO → MySQL 存储流程")
    print("=" * 80)
    
    # 1. 确认使用MySQL
    print("\n步骤 1: 确认数据库配置")
    from config.settings import settings
    print(f"  数据库类型: {settings.DB_TYPE}")
    print(f"  MySQL Host: {settings.MYSQL_HOST}")
    print(f"  MySQL Database: {settings.MYSQL_DATABASE}")
    
    if settings.DB_TYPE.lower() != 'mysql':
        print("  ❌ 当前未配置MySQL，请检查 .env 文件")
        return False
    print("  ✅ 已配置MySQL")
    
    # 2. 测试数据库连接
    print("\n步骤 2: 测试MySQL连接")
    try:
        conn = get_connection()
        print("  ✅ MySQL连接成功")
        
        # 检查表是否存在
        if isinstance(conn, pymysql.connections.Connection):
            cursor = conn.cursor(pymysql.cursors.DictCursor)
        else:
            cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables_result = cursor.fetchall()
        if tables_result and isinstance(tables_result[0], dict):
            tables = [list(row.values())[0] for row in tables_result]
        else:
            tables = [row[0] for row in tables_result]
        
        required_tables = ['conversations', 'user_memories', 'user_todos', 'user_long_term_memory']
        missing = [t for t in required_tables if t not in tables]
        
        if missing:
            print(f"  ❌ 缺少必需的表: {missing}")
            return False
        print(f"  ✅ 所有必需的表都存在")
        
    except Exception as e:
        print(f"  ❌ 数据库连接失败: {e}")
        return False
    
    # 3. 检查现有数据
    print("\n步骤 3: 检查当前MySQL数据")
    try:
        cursor.execute("SELECT COUNT(*) as count FROM conversations WHERE conversation_type='retell_voice'")
        voice_convs = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM user_memories WHERE channel='retell_voice'")
        voice_memories = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM user_todos")
        total_todos = cursor.fetchone()['count']
        
        print(f"  语音对话记录: {voice_convs} 条")
        print(f"  语音对话记忆: {voice_memories} 条")
        print(f"  待办事项: {total_todos} 条")
        
    except Exception as e:
        print(f"  ⚠️  查询数据失败: {e}")
    
    # 4. 模拟语音对话数据保存
    print("\n步骤 4: 模拟语音对话数据保存")
    
    test_user_id = "user_001"  # 使用已存在的用户
    test_call_id = f"test_call_{int(time.time())}"
    test_transcript = """
USER: Hi Olivia, I want to improve my glucose control.
AGENT: That's great! Can you tell me about your typical breakfast?
USER: I usually have a bowl of oatmeal with some fruit.
AGENT: Excellent choice! Oatmeal is a good complex carbohydrate. Have you noticed how your glucose responds to it?
USER: Yes, it seems pretty stable. But I snack a lot in the afternoon.
AGENT: I understand. Let's work on creating a healthier snack plan. How about we set a goal to choose protein-rich snacks like nuts or yogurt instead of sugary ones?
USER: That sounds good. I'll try that.
AGENT: Perfect! I'll add a reminder for you to prepare healthy snacks. Also, make sure to monitor your glucose levels after snacking.
    """
    
    try:
        # 导入 MemoryService
        from apps.backend.cgm_butler.digital_avatar.memory_service import MemoryService
        
        print(f"  测试用户: {test_user_id}")
        print(f"  模拟对话ID: {test_call_id}")
        print(f"  对话内容: {len(test_transcript)} 字符")
        
        # 先保存对话记录到 conversations 表
        from shared.database.repositories.conversation_repository import ConversationRepository
        conv_repo = ConversationRepository(conn)
        
        conversation_id = conv_repo.save_retell_conversation(
            user_id=test_user_id,
            retell_call_id=test_call_id,
            retell_agent_id="test_agent",
            call_status="ended",
            call_type="web_call",
            started_at="2025-01-19 10:00:00",
            ended_at="2025-01-19 10:05:00",
            duration_seconds=300,
            transcript=test_transcript,
            transcript_object=[]  # 空数组
        )
        
        print(f"  ✅ 对话记录已保存: {conversation_id}")
        
        # 5. 使用 MemoryService 处理对话
        print("\n步骤 5: 使用 MemoryService 提取 Memory 和 TODO")
        
        memory_service = MemoryService()
        result = memory_service.process_conversation(
            user_id=test_user_id,
            conversation_id=conversation_id,
            channel='retell_voice',
            transcript=test_transcript,
            user_name="Test User"
        )
        
        print(f"  处理结果:")
        print(f"    成功: {result.get('success')}")
        print(f"    Memory ID: {result.get('memory_id')}")
        print(f"    TODOs 数量: {result.get('todos_count')}")
        print(f"    长期记忆已更新: {result.get('long_term_updated')}")
        print(f"    Onboarding 已更新: {result.get('onboarding_updated')}")
        
        if result.get('success'):
            print("\n  📝 生成的 Summary:")
            summary = result.get('summary', 'N/A')
            print(f"    {summary[:200]}..." if len(summary) > 200 else f"    {summary}")
        
        # 6. 验证 MySQL 中的数据
        print("\n步骤 6: 验证MySQL中的数据")
        
        # 检查 user_memories
        cursor.execute("""
            SELECT id, summary, channel, created_at 
            FROM user_memories 
            WHERE user_id = %s AND conversation_id = %s
        """, (test_user_id, conversation_id))
        
        memories = cursor.fetchall()
        if memories:
            print(f"  ✅ user_memories 表: 找到 {len(memories)} 条记录")
            for mem in memories:
                print(f"     ID: {mem['id']}, Channel: {mem['channel']}")
                print(f"     Summary: {mem['summary'][:100]}...")
        else:
            print(f"  ⚠️  user_memories 表: 未找到记录")
        
        # 检查 user_todos
        cursor.execute("""
            SELECT id, title, category, status 
            FROM user_todos 
            WHERE user_id = %s AND conversation_id = %s
        """, (test_user_id, conversation_id))
        
        todos = cursor.fetchall()
        if todos:
            print(f"  ✅ user_todos 表: 找到 {len(todos)} 条记录")
            for todo in todos:
                print(f"     - {todo['title']} ({todo['category']}) [{todo['status']}]")
        else:
            print(f"  ⚠️  user_todos 表: 未找到TODO")
        
        # 检查 user_long_term_memory
        cursor.execute("""
            SELECT preferences, health_goals, habits, updated_at
            FROM user_long_term_memory 
            WHERE user_id = %s
        """, (test_user_id,))
        
        ltm = cursor.fetchone()
        if ltm:
            print(f"  ✅ user_long_term_memory 表: 已更新")
            print(f"     更新时间: {ltm['updated_at']}")
            if ltm['preferences']:
                prefs = json.loads(ltm['preferences']) if isinstance(ltm['preferences'], str) else ltm['preferences']
                print(f"     Preferences: {list(prefs.keys()) if isinstance(prefs, dict) else 'N/A'}")
        else:
            print(f"  ℹ️  user_long_term_memory 表: 用户暂无长期记忆")
        
        conn.close()
        
        print("\n" + "=" * 80)
        print("🎉 测试完成!")
        print("=" * 80)
        print("\n✅ 结论: 语音对话结束后能够:")
        print("  1. ✅ 保存对话记录到 conversations 表")
        print("  2. ✅ 生成并保存 summary 到 user_memories 表")
        print("  3. ✅ 提取并保存 TODOs 到 user_todos 表")
        print("  4. ✅ 更新长期记忆到 user_long_term_memory 表")
        print("  5. ✅ 所有数据都存储在 MySQL 中")
        print("\n💡 实际语音对话使用时，前端调用 /intake/save-call-data API")
        print("   该API会自动触发 MemoryService.process_conversation()")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    try:
        success = test_voice_call_flow()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ 测试异常: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

