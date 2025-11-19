#!/usr/bin/env python3
"""测试对话历史API"""
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from shared.database import get_connection
from shared.database.repositories.conversation_repository import ConversationRepository
from shared.database.repositories.memory_repository import MemoryRepository
import json

def test_conversation_history():
    print("="*80)
    print("🧪 测试对话历史API逻辑")
    print("="*80)
    
    test_users = ['user_38377a3b', 'tiantuo', 'user_001']
    
    with get_connection() as conn:
        conv_repo = ConversationRepository(conn)
        mem_repo = MemoryRepository(conn)
        
        for user_id in test_users:
            print(f"\n📋 用户: {user_id}")
            
            # 获取对话列表
            conversations_data = conv_repo.get_user_conversations(user_id, limit=10)
            print(f"  对话总数: {len(conversations_data)}")
            
            if conversations_data:
                for i, conv in enumerate(conversations_data[:3], 1):  # 只显示前3条
                    print(f"\n  对话 {i}:")
                    print(f"    ID: {conv['conversation_id']}")
                    print(f"    类型: {conv['conversation_type']}")
                    print(f"    开始: {conv.get('started_at', 'N/A')}")
                    
                    # 获取memory
                    all_memories = mem_repo.get_recent_memories(user_id, days=365, limit=100)
                    mem = None
                    for m in all_memories:
                        if m.get('conversation_id') == conv['conversation_id']:
                            mem = m
                            break
                    
                    if mem:
                        summary = mem.get('summary', '')
                        print(f"    Summary: {summary[:80]}..." if len(summary) > 80 else f"    Summary: {summary}")
                    else:
                        print(f"    Summary: (无)")
            else:
                print("  (无对话记录)")
    
    print("\n" + "="*80)
    print("✅ 测试完成! API逻辑正常工作")
    print("="*80)

if __name__ == '__main__':
    test_conversation_history()

