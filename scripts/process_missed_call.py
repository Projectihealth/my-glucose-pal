#!/usr/bin/env python3
"""
处理遗漏的通话数据
从 Retell API 获取数据并保存到数据库，然后运行 Memory Service
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 导入数据库和服务
from shared.database import get_connection, ConversationRepository
from apps.backend.cgm_butler.digital_avatar.memory_service import MemoryService

# 用户信息
USER_ID = "user_38377a3b"
USER_NAME = "Yijia"
CALL_DATA_FILE = "/tmp/retell_call_data.json"

def main():
    print(f"\n{'='*60}")
    print(f"处理遗漏的通话数据")
    print(f"{'='*60}\n")

    # 1. 读取通话数据
    print(f"📖 读取通话数据: {CALL_DATA_FILE}")
    with open(CALL_DATA_FILE, 'r') as f:
        call_data = json.load(f)

    call_id = call_data['call_id']
    agent_id = call_data['agent_id']
    transcript = call_data['transcript']
    start_timestamp = call_data['start_timestamp']
    end_timestamp = call_data['end_timestamp']

    # 转换时间戳（毫秒转秒）
    started_at = datetime.fromtimestamp(start_timestamp / 1000).isoformat()
    ended_at = datetime.fromtimestamp(end_timestamp / 1000).isoformat()
    duration_seconds = int((end_timestamp - start_timestamp) / 1000)

    print(f"  Call ID: {call_id}")
    print(f"  Started: {started_at}")
    print(f"  Duration: {duration_seconds}s")
    print(f"  Transcript length: {len(transcript)} chars\n")

    # 2. 保存到数据库
    print(f"💾 检查并保存对话记录到数据库...")
    db_path = str(project_root / "storage" / "databases" / "cgm_butler.db")
    print(f"  数据库路径: {db_path}")
    conn = get_connection(db_path=db_path)
    conversation_repo = ConversationRepository(conn)

    # 先检查对话是否已存在
    cursor = conn.cursor()
    cursor.execute("SELECT conversation_id FROM conversations WHERE retell_call_id = ?", (call_id,))
    existing = cursor.fetchone()

    if existing:
        conversation_id = existing[0]
        print(f"  ⚠️  对话记录已存在: {conversation_id}")
        print(f"  ⏩ 跳过保存，直接处理 Memory\n")
    else:
        # 保存对话 - 使用 save_retell_conversation
        conversation_id = conversation_repo.save_retell_conversation(
            user_id=USER_ID,
            retell_call_id=call_id,
            retell_agent_id=agent_id,
            call_status='ended',
            call_type='onboarding',  # 第一次通话
            started_at=started_at,
            ended_at=ended_at,
            duration_seconds=duration_seconds,
            transcript=transcript,
            transcript_object=call_data.get('transcript_object', []),
            recording_url=call_data.get('recording_url'),
            metadata=call_data.get('metadata')
        )
        print(f"  ✅ 对话记录已保存: {conversation_id}\n")

    # 3. 运行 Memory Service
    print(f"🧠 运行 Memory Service...")
    try:
        memory_service = MemoryService(db_path=db_path)
        result = memory_service.process_conversation(
            user_id=USER_ID,
            conversation_id=conversation_id,
            channel='retell_voice',
            transcript=transcript,
            user_name=USER_NAME
        )

        print(f"  ✅ Memory Service 处理完成")
        print(f"  📊 结果:")
        print(f"    - Memory 已保存: {result.get('memory_saved', False)}")
        print(f"    - TODOs 数量: {len(result.get('todos', []))}")
        print(f"    - Long-term Memory 已更新: {result.get('long_term_updated', False)}")

        if result.get('todos'):
            print(f"\n  📝 提取的 TODOs:")
            for i, todo in enumerate(result.get('todos', []), 1):
                print(f"    {i}. {todo.get('title', 'N/A')}")
                print(f"       - 类别: {todo.get('category', 'N/A')}")
                print(f"       - 目标: {todo.get('target_count', 1)} 次/周")
                print(f"       - 健康益处: {todo.get('health_benefit', 'N/A')}")

    except Exception as e:
        print(f"  ❌ Memory Service 处理失败: {e}")
        import traceback
        traceback.print_exc()
        return

    # 4. 验证数据保存
    print(f"\n{'='*60}")
    print(f"✅ 验证数据保存")
    print(f"{'='*60}\n")

    cursor = conn.cursor()

    # 检查对话记录
    cursor.execute("SELECT conversation_id FROM conversations WHERE user_id = ?", (USER_ID,))
    conv_count = len(cursor.fetchall())
    print(f"  ✓ Conversations: {conv_count} 条")

    # 检查 Memories
    cursor.execute("SELECT COUNT(*) FROM user_memories WHERE user_id = ?", (USER_ID,))
    mem_count = cursor.fetchone()[0]
    print(f"  ✓ Memories: {mem_count} 条")

    # 检查 TODOs
    cursor.execute("SELECT COUNT(*) FROM user_todos WHERE user_id = ? AND status = 'active'", (USER_ID,))
    todo_count = cursor.fetchone()[0]
    print(f"  ✓ Active TODOs: {todo_count} 条")

    # 检查 Long-term Memory
    cursor.execute("SELECT COUNT(*) FROM user_long_term_memory WHERE user_id = ?", (USER_ID,))
    ltm_count = cursor.fetchone()[0]
    print(f"  ✓ Long-term Memory: {ltm_count} 条")

    conn.close()

    print(f"\n{'='*60}")
    print(f"✅ 处理完成！")
    print(f"{'='*60}\n")
    print(f"下次对话将被识别为 Follow-up Call，可以基于本次对话的数据继续。\n")

if __name__ == '__main__':
    main()
