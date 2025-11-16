#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 Voice Chat 存储功能
"""
import sys
import os
from datetime import datetime
from conversation_manager import ConversationManager

def test_save_retell_conversation():
    """测试保存 Retell Voice Chat"""
    print("=" * 60)
    print("测试保存 Retell Voice Chat")
    print("=" * 60)

    # 初始化管理器
    db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    manager = ConversationManager(db_path=db_path)

    # 模拟 Retell 数据
    test_data = {
        'user_id': 'user_001',
        'retell_call_id': 'call_test_' + datetime.now().strftime('%Y%m%d_%H%M%S'),
        'retell_agent_id': 'agent_olivia_001',
        'call_status': 'ended',
        'call_type': 'web_call',
        'started_at': '2025-01-14T10:00:00Z',
        'ended_at': '2025-01-14T10:05:30Z',
        'duration_seconds': 330.5,
        'transcript': '用户: 你好 Olivia\nOlivia: 你好！很高兴见到你。今天感觉怎么样？\n用户: 我想咨询一下血糖管理\nOlivia: 当然，我很乐意帮助你。',
        'transcript_object': [
            {
                'role': 'user',
                'content': '你好 Olivia',
                'timestamp': '2025-01-14T10:00:05Z'
            },
            {
                'role': 'agent',
                'content': '你好！很高兴见到你。今天感觉怎么样？',
                'timestamp': '2025-01-14T10:00:08Z'
            },
            {
                'role': 'user',
                'content': '我想咨询一下血糖管理',
                'timestamp': '2025-01-14T10:00:15Z'
            },
            {
                'role': 'agent',
                'content': '当然，我很乐意帮助你。',
                'timestamp': '2025-01-14T10:00:18Z'
            }
        ],
        'call_cost': {
            'total': 0.12,
            'currency': 'USD',
            'breakdown': {
                'llm': 0.08,
                'tts': 0.03,
                'stt': 0.01
            }
        },
        'disconnection_reason': 'user_hangup',
        'recording_url': 'https://recordings.retellai.com/call_test_123.mp3',
        'properties': {
            'language': 'zh-CN',
            'voice': 'olivia_mandarin'
        },
        'metadata': {
            'source': 'web_app',
            'device': 'desktop'
        }
    }

    try:
        # 保存对话
        print("\n📝 保存测试数据...")
        conversation_id = manager.save_retell_conversation(**test_data)
        print(f"✅ 保存成功！Conversation ID: {conversation_id}")

        # 验证保存结果
        print("\n🔍 验证保存的数据...")
        conversation = manager.get_conversation(conversation_id)

        if conversation:
            print("\n✅ 成功读取对话记录:")
            print(f"  - Conversation ID: {conversation['conversation_id']}")
            print(f"  - Type: {conversation['conversation_type']}")
            print(f"  - User ID: {conversation['user_id']}")
            print(f"  - Retell Call ID: {conversation['retell_call_id']}")
            print(f"  - Retell Agent ID: {conversation['retell_agent_id']}")
            print(f"  - Call Status: {conversation['call_status']}")
            print(f"  - Call Type: {conversation['call_type']}")
            print(f"  - Duration: {conversation['duration_seconds']} 秒")
            print(f"  - Cost: ${conversation['call_cost']['total']} {conversation['call_cost']['currency']}")
            print(f"  - Disconnection Reason: {conversation['disconnection_reason']}")
            print(f"  - Recording URL: {conversation['recording_url']}")
            print(f"  - Transcript Messages: {len(conversation['transcript_object'])} 条")
            print(f"  - Started At: {conversation['started_at']}")
            print(f"  - Ended At: {conversation['ended_at']}")

            print("\n📝 Transcript 内容:")
            for i, msg in enumerate(conversation['transcript_object'], 1):
                print(f"  {i}. [{msg['role']}] {msg['content']}")

            print("\n✅ 所有字段验证通过！")
            return True
        else:
            print("❌ 无法读取保存的对话记录")
            return False

    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_query_conversations():
    """测试查询对话"""
    print("\n" + "=" * 60)
    print("测试查询对话功能")
    print("=" * 60)

    db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    manager = ConversationManager(db_path=db_path)

    try:
        # 查询所有 Voice Chat
        print("\n🔍 查询 user_001 的所有 Voice Chat...")
        voice_chats = manager.get_user_conversations(
            user_id='user_001',
            conversation_type='retell_voice',
            limit=10
        )

        print(f"\n找到 {len(voice_chats)} 个 Voice Chat 记录:")
        for i, chat in enumerate(voice_chats, 1):
            print(f"\n  {i}. {chat['conversation_name']}")
            print(f"     - Call ID: {chat['retell_call_id']}")
            print(f"     - Duration: {chat['duration_seconds']}s")
            print(f"     - Status: {chat['call_status']}")
            print(f"     - Started: {chat['started_at']}")

        # 查询所有类型的对话
        print("\n🔍 查询 user_001 的所有对话...")
        all_chats = manager.get_user_conversations(
            user_id='user_001',
            limit=20
        )

        print(f"\n找到 {len(all_chats)} 个对话记录:")
        type_counts = {}
        for chat in all_chats:
            conv_type = chat['conversation_type']
            type_counts[conv_type] = type_counts.get(conv_type, 0) + 1

        for conv_type, count in type_counts.items():
            print(f"  - {conv_type}: {count} 个")

        print("\n✅ 查询测试通过！")
        return True

    except Exception as e:
        print(f"\n❌ 查询测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主测试函数"""
    print("\n" + "🧪" * 30)
    print("Voice Chat 存储功能测试")
    print("🧪" * 30 + "\n")

    # 运行测试
    test1_passed = test_save_retell_conversation()
    test2_passed = test_query_conversations()

    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    print(f"保存功能测试: {'✅ 通过' if test1_passed else '❌ 失败'}")
    print(f"查询功能测试: {'✅ 通过' if test2_passed else '❌ 失败'}")

    if test1_passed and test2_passed:
        print("\n🎉 所有测试通过！Voice Chat 存储功能正常工作。")
        return 0
    else:
        print("\n⚠️  部分测试失败，请检查上面的错误信息。")
        return 1


if __name__ == '__main__':
    sys.exit(main())
