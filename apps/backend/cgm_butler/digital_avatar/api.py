"""
Flask API for Digital Avatar

This module provides REST API endpoints for the digital avatar functionality.
Can be integrated into the main dashboard or run as a separate service.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import os
import sys

# 添加项目根目录到路径 (用于 shared 模块)
# api.py -> digital_avatar -> cgm_butler -> backend -> apps -> my-glucose-pal (5层)
current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file)))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 使用相对导入 (当前目录)
from . import ConversationManager, AvatarConfig
from .gpt_chat import GPTChatManager
from .memory_service import MemoryService

# 使用新的 shared/database
from shared.database import get_connection, ConversationRepository

# Create Blueprint
avatar_bp = Blueprint('avatar', __name__, url_prefix='/api/avatar')

# Initialize managers
conversation_manager = None
gpt_chat_manager = None
memory_service = None

# 数据库连接和 Repository
db_conn = None
conversation_repo = None


def init_avatar_api(tavus_api_key: str = None, persona_id: str = None, replica_id: str = None, openai_api_key: str = None):
    """
    Initialize the avatar API.

    Args:
        tavus_api_key: Tavus API key (optional, video avatar won't work without it)
        persona_id: Persona ID
        replica_id: Replica ID
        openai_api_key: OpenAI API key
    """
    global conversation_manager, gpt_chat_manager, memory_service, db_conn, conversation_repo

    # Tavus conversation manager (for video avatar) - optional, will fail gracefully
    try:
        if tavus_api_key or os.getenv('TAVUS_API_KEY'):
            conversation_manager = ConversationManager(
                tavus_api_key=tavus_api_key,
                persona_id=persona_id or AvatarConfig.TAVUS_PERSONA_ID,
                replica_id=replica_id or AvatarConfig.TAVUS_REPLICA_ID
            )
            print("✅ Tavus API initialized successfully (video avatar available)")
        else:
            print("⚠️  Tavus API key not found (video avatar will be unavailable)")
            conversation_manager = None
    except Exception as e:
        print(f"⚠️  Failed to initialize Tavus API: {e}")
        print("   Video avatar will be unavailable, but text chat will work")
        conversation_manager = None
    
    # GPT chat manager (for text chat) - always initialize
    try:
        gpt_chat_manager = GPTChatManager(api_key=openai_api_key)
        print("✅ GPT-4o chat initialized successfully (text chat available)")
    except Exception as e:
        print(f"⚠️  Failed to initialize GPT chat: {e}")
        gpt_chat_manager = None
    
    # Memory service (for all chat types)
    try:
        memory_service = MemoryService(openai_api_key=openai_api_key or AvatarConfig.OPENAI_API_KEY)
        print("✅ Memory service initialized successfully")
    except Exception as e:
        print(f"⚠️  Failed to initialize memory service: {e}")
        memory_service = None
    
    # 数据库连接和 Repository (使用新的 shared/database)
    try:
        db_conn = get_connection()
        conversation_repo = ConversationRepository(db_conn)
        print("✅ Database repository initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database repository: {e}")
        db_conn = None
        conversation_repo = None


@avatar_bp.route('/start', methods=['POST'])
def start_conversation():
    """
    Start a new conversation with the digital avatar.
    
    Request body:
        {
            "user_id": "user_001",
            "config": {  // optional
                "language": "en"
            }
        }
    
    Returns:
        {
            "success": true,
            "conversation_id": "conv_123",
            "user_id": "user_001",
            "message": "Conversation started successfully"
        }
    """
    try:
        if not conversation_manager:
            return jsonify({
                "success": False,
                "message": "Tavus API not configured. Video avatar unavailable. Use GPT chat instead."
            }), 503
        
        data = request.get_json()
        user_id = data.get('user_id')
        config = data.get('config')
        
        if not user_id:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400
        
        result = conversation_manager.start_conversation(user_id, config)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/message', methods=['POST'])
def send_message():
    """
    Send a message in a conversation.
    
    Request body:
        {
            "conversation_id": "conv_123",
            "message": "What's my current glucose level?"
        }
    
    Returns:
        {
            "success": true,
            "conversation_id": "conv_123",
            "user_message": "What's my current glucose level?",
            "avatar_response": "Your current glucose is 120 mg/dL (Normal) ✅",
            "timestamp": "2025-10-27T10:30:00"
        }
    """
    try:
        if not conversation_manager:
            return jsonify({
                "success": False,
                "message": "Tavus API not configured. Use GPT chat instead."
            }), 503
        
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        message = data.get('message')
        
        if not conversation_id or not message:
            return jsonify({
                "success": False,
                "message": "conversation_id and message are required"
            }), 400
        
        result = conversation_manager.send_message(conversation_id, message)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/history/<conversation_id>', methods=['GET'])
def get_history(conversation_id: str):
    """
    Get conversation history.
    
    Returns:
        {
            "success": true,
            "conversation_id": "conv_123",
            "history": [...]
        }
    """
    try:
        result = conversation_manager.get_conversation_history(conversation_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/end/<conversation_id>', methods=['POST'])
def end_conversation(conversation_id: str):
    """
    End a Tavus video conversation and save to database.
    
    Request body (optional):
        {
            "user_id": "user_001"  // Required for saving to DB
        }
    
    Returns:
        {
            "success": true,
            "conversation_id": "conv_123",
            "message": "Conversation ended successfully",
            "db_conversation_id": "uuid",
            "memory_processed": true,
            "todos_created": 2
        }
    """
    try:
        # 结束 Tavus 对话
        result = conversation_manager.end_conversation(conversation_id)
        
        # 尝试保存到数据库并处理 memory
        data = request.get_json() or {}
        user_id = data.get('user_id')
        
        if user_id and conversation_repo and conversation_manager:
            try:
                # 获取对话详情（包含 transcript）
                tavus_details = conversation_manager.tavus_client.get_conversation(conversation_id)
                
                # 提取必要信息
                transcript = tavus_details.get('transcript', [])
                started_at = tavus_details.get('created_at')
                ended_at = tavus_details.get('ended_at')
                status = tavus_details.get('status', 'ended')
                
                # 保存到数据库 (使用新的 Repository)
                db_conv_id = conversation_repo.save_tavus_conversation(
                    user_id=user_id,
                    tavus_conversation_id=conversation_id,
                    tavus_conversation_url=tavus_details.get('conversation_url', ''),
                    tavus_replica_id=tavus_details.get('replica_id', ''),
                    tavus_persona_id=tavus_details.get('persona_id', ''),
                    transcript=transcript,
                    conversational_context=tavus_details.get('conversational_context', ''),
                    custom_greeting=tavus_details.get('custom_greeting', ''),
                    started_at=started_at,
                    ended_at=ended_at,
                    duration_seconds=tavus_details.get('duration_seconds'),
                    status=status,
                    shutdown_reason=tavus_details.get('shutdown_reason'),
                    properties=tavus_details.get('properties'),
                    metadata=tavus_details.get('metadata')
                )
                db_conn.commit()
                
                # 处理记忆和 TODO
                memory_result = {"success": False}
                if memory_service:
                    try:
                        # 获取用户信息
                        from .cgm_tools import CGMTools
                        cgm_tools = CGMTools()
                        user_info = cgm_tools.get_user_info(user_id)
                        user_name = user_info.get('name', 'User')
                        
                        memory_result = memory_service.process_conversation(
                            user_id=user_id,
                            conversation_id=db_conv_id,
                            channel='tavus_video',
                            transcript=transcript,
                            user_name=user_name
                        )
                    except Exception as mem_error:
                        print(f"⚠️  Memory processing failed (non-fatal): {mem_error}")
                
                result['db_conversation_id'] = db_conv_id
                result['memory_processed'] = memory_result.get('success', False)
                result['todos_created'] = memory_result.get('todos_count', 0)
                
            except Exception as db_error:
                print(f"⚠️  Database save failed (non-fatal): {db_error}")
                result['db_save_error'] = str(db_error)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/save-conversation-id', methods=['POST'])
def save_conversation_id():
    """
    保存 Tavus 对话 URL 和 ID 便于后续清理
    
    Request body:
        {
            "conversation_url": "https://...",
            "conversation_id": "conv_xxxxx",
            "created_at": "2025-10-27T..."
        }
    
    Returns:
        {
            "success": true,
            "message": "Conversation ID saved"
        }
    """
    try:
        import json
        from pathlib import Path
        from datetime import datetime
        
        data = request.get_json() or {}
        conversation_url = data.get('conversation_url')
        conversation_id = data.get('conversation_id')
        created_at = data.get('created_at', datetime.now().isoformat())
        
        if not conversation_url or not conversation_id:
            return jsonify({
                "success": False,
                "message": "conversation_url and conversation_id are required"
            }), 400
        
        # 保存到 conversations_history.json
        project_root = os.path.dirname(os.path.dirname(__file__))
        history_file = os.path.join(project_root, 'conversations_history.json')
        
        # 读取现有记录
        history = []
        if os.path.exists(history_file):
            try:
                with open(history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                history = []
        
        # 添加新记录
        history.append({
            "conversation_id": conversation_id,
            "conversation_url": conversation_url,
            "created_at": created_at
        })
        
        # 保持最近 10 条记录
        history = history[-10:]
        
        # 写入文件
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Conversation ID saved",
            "file": history_file
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/conversation-history', methods=['GET'])
def get_conversation_history():
    """
    获取已保存的对话历史
    
    Returns:
        {
            "success": true,
            "conversations": [
                {
                    "conversation_id": "conv_xxxxx",
                    "conversation_url": "https://...",
                    "created_at": "2025-10-27T..."
                }
            ]
        }
    """
    try:
        import json
        
        project_root = os.path.dirname(os.path.dirname(__file__))
        history_file = os.path.join(project_root, 'conversations_history.json')
        
        history = []
        if os.path.exists(history_file):
            try:
                with open(history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                history = []
        
        return jsonify({
            "success": True,
            "conversations": history
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/cleanup', methods=['POST'])
def cleanup_old_conversations():
    """
    清理之前的 Tavus 对话，解决并发限制问题
    
    Request body (optional):
        {
            "conversation_id": "specific_id_to_end"  // 可选，指定要结束的对话ID
        }
    
    Returns:
        {
            "success": true,
            "message": "Conversation cleaned up",
            "ended_count": 1
        }
    """
    try:
        if not conversation_manager:
            return jsonify({
                "success": False,
                "message": "Tavus API not configured"
            }), 503
        
        data = request.get_json() or {}
        conversation_id = data.get('conversation_id')
        
        if conversation_id:
            # 结束指定的对话
            try:
                result = conversation_manager.end_conversation(conversation_id)
                return jsonify({
                    "success": True,
                    "message": "Conversation ended",
                    "ended_count": 1,
                    "details": result
                })
            except Exception as e:
                return jsonify({
                    "success": False,
                    "message": f"Failed to end conversation: {str(e)}"
                }), 400
        else:
            # 获取活跃对话列表
            active_convs = conversation_manager.get_active_conversations()
            ended_count = 0
            
            for conv in active_convs:
                try:
                    conversation_manager.end_conversation(conv.get('conversation_id'))
                    ended_count += 1
                except:
                    pass
            
            return jsonify({
                "success": True,
                "message": f"Cleaned up {ended_count} conversation(s)",
                "ended_count": ended_count
            })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/active', methods=['GET'])
def get_active_conversations():
    """
    Get list of active conversations.
    
    Returns:
        {
            "success": true,
            "conversations": [
                {
                    "conversation_id": "conv_123",
                    "user_id": "user_001"
                }
            ]
        }
    """
    try:
        conversations = conversation_manager.get_active_conversations()
        return jsonify({
            "success": True,
            "conversations": conversations
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        {
            "status": "ok",
            "module": "digital_avatar",
            "version": "1.0.0"
        }
    """
    return jsonify({
        "status": "ok",
        "module": "digital_avatar",
        "version": "1.0.0",
        "conversation_manager_initialized": conversation_manager is not None,
        "gpt_chat_manager_initialized": gpt_chat_manager is not None
    })


# GPT Chat Endpoints
@avatar_bp.route('/gpt/chat', methods=['POST'])
def gpt_chat():
    """
    GPT-4o聊天端点
    
    Request body:
        {
            "user_id": "user_001",
            "message": "我的血糖是多少？"
        }
    
    Returns:
        {
            "success": true,
            "response": "您的当前血糖是...",
            "function_called": "get_latest_glucose"  // 可选
        }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')
        
        if not user_id or not message:
            return jsonify({
                "success": False,
                "message": "user_id and message are required"
            }), 400
        
        result = gpt_chat_manager.chat(user_id, message)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/gpt/start', methods=['POST'])
def gpt_start():
    """
    开始GPT对话
    
    Request body:
        {
            "user_id": "user_001"
        }
    
    Returns:
        {
            "success": true,
            "user_id": "user_001",
            "message": "对话已开始"
        }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400
        
        result = gpt_chat_manager.start_conversation(user_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/gpt/end', methods=['POST'])
def gpt_end():
    """
    结束GPT对话并保存到数据库
    
    Request body:
        {
            "user_id": "user_001"
        }
    
    Returns:
        {
            "success": true,
            "conversation_id": "uuid",
            "message": "对话已保存",
            "duration_seconds": 300
        }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400
        
        result = gpt_chat_manager.end_conversation(user_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/gpt/history/<user_id>', methods=['GET'])
def gpt_history(user_id: str):
    """
    获取用户的对话历史
    
    Query params:
        - limit: 返回对话数量 (默认 10)
        - days: 天数范围 (默认 7)
    
    Returns:
        {
            "success": true,
            "user_id": "user_001",
            "conversations": [...],
            "stats": {
                "total_conversations": 5,
                "by_type": {"gpt_chat": 3, "tavus_video": 2},
                "follow_up_needed": 1
            }
        }
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        days = request.args.get('days', 7, type=int)
        
        # 获取对话列表
        from database.conversation_manager import ConversationManager
        db = ConversationManager()
        
        conversations = db.get_user_conversations(
            user_id=user_id,
            limit=limit,
            conversation_type='gpt_chat'
        )
        
        # 获取统计信息
        stats = db.get_conversation_stats(user_id, days=days)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "conversations": conversations,
            "stats": stats
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@avatar_bp.route('/gpt/clear/<user_id>', methods=['POST'])
def gpt_clear(user_id: str):
    """
    清除GPT对话历史
    
    Returns:
        {
            "success": true,
            "message": "对话历史已清除"
        }
    """
    try:
        gpt_chat_manager.clear_conversation(user_id)
        return jsonify({
            "success": True,
            "message": "对话历史已清除"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# Standalone Flask app for testing
if __name__ == '__main__':
    from flask import Flask
    
    app = Flask(__name__)
    
    # Initialize avatar API
    init_avatar_api()
    
    # Register blueprint
    app.register_blueprint(avatar_bp)
    
    print("\n" + "="*60)
    print("🤖 Digital Avatar API Server")
    print("="*60)
    print("🌐 Running on: http://localhost:5001")
    print("📚 API Endpoints:")
    print("  POST /api/avatar/start - Start conversation")
    print("  POST /api/avatar/message - Send message")
    print("  GET  /api/avatar/history/<id> - Get history")
    print("  POST /api/avatar/end/<id> - End conversation")
    print("  GET  /api/avatar/active - List active conversations")
    print("  GET  /api/avatar/health - Health check")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)

