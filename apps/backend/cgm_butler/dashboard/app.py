# dashboard/app.py
# -*- coding: utf-8 -*-
"""
CGM Butler Web Dashboard
实时查看数据库数据的 Web 界面
"""

from flask import Flask, render_template, jsonify, request
import sys
import os
import json
from flask_cors import CORS

# 添加项目根目录到路径 (用于 shared 模块)
# app.py -> dashboard -> cgm_butler -> backend -> apps -> my-glucose-pal (5层)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 添加父目录到路径以便导入模块
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.append(backend_root)

# 加载环境变量（必须在其他导入之前）
from dotenv import load_dotenv
# 优先使用项目根目录的 .env
env_path = os.path.join(project_root, '.env')
if not os.path.exists(env_path):
    # 回退到 backend 目录的 .env
    env_path = os.path.join(backend_root, '.env')
load_dotenv(env_path)
print(f"✅ 环境变量加载自: {env_path}")
print(f"   TAVUS_API_KEY: {'已设置' if os.getenv('TAVUS_API_KEY') else '未设置'}")
print(f"   OPENAI_API_KEY: {'已设置' if os.getenv('OPENAI_API_KEY') else '未设置'}")
from database import CGMDatabase
from pattern_identification import CGMPatternIdentifier
from digital_avatar.api import avatar_bp, init_avatar_api

# 使用 shared 数据库模块
from shared.database import get_connection, TodoRepository, MemoryRepository

# 导入 todos API
from todos_api import todos_bp

app = Flask(__name__)
CORS(app)

# 初始化并注册Avatar API
init_avatar_api()
app.register_blueprint(avatar_bp)

# 注册 Todos API
app.register_blueprint(todos_bp)

# 数据库路径(可通过 CGM_DB_PATH 覆盖)
DB_PATH = os.getenv(
    'CGM_DB_PATH',
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'cgm_butler.db'),
)


@app.route('/')
def index():
    """主页"""
    return render_template('index.html')


@app.route('/digital_avatar/chat.html')
@app.route('/chat')
def chat():
    """提供 chat.html 文件"""
    chat_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'digital_avatar', 'chat.html')
    with open(chat_path, 'r', encoding='utf-8') as f:
        return f.read()


@app.route('/api/users')
def get_all_users():
    """获取所有用户列表 API"""
    with CGMDatabase(DB_PATH) as db:
        cursor = db.conn.cursor()
        cursor.execute('SELECT user_id, name, conditions FROM users ORDER BY user_id')
        users = [{'user_id': row[0], 'name': row[1], 'conditions': row[2]} 
                 for row in cursor.fetchall()]
        return jsonify(users)


@app.route('/api/user/<user_id>')
def get_user(user_id):
    """获取用户信息 API"""
    with CGMDatabase(DB_PATH) as db:
        user = db.get_user(user_id)
        return jsonify(user if user else {'error': 'User not found'})


@app.route('/api/stats/<user_id>')
def get_stats(user_id):
    """获取统计信息 API"""
    with CGMDatabase(DB_PATH) as db:
        stats = db.get_glucose_statistics(user_id)
        tir = db.get_time_in_range(user_id, 70, 140)
        
        return jsonify({
            'stats': stats,
            'time_in_range': round(tir, 1)
        })


@app.route('/api/readings/<user_id>')
def get_readings(user_id):
    """获取最近的 CGM 读数 API"""
    limit = 100  # 最近 100 条
    with CGMDatabase(DB_PATH) as db:
        readings = db.get_cgm_readings(user_id, limit=limit)
        return jsonify(readings)


@app.route('/api/recent/<user_id>/<int:limit>')
def get_recent_readings(user_id, limit):
    """获取指定数量的最近读数"""
    with CGMDatabase(DB_PATH) as db:
        readings = db.get_cgm_readings(user_id, limit=limit)
        return jsonify(readings)


@app.route('/api/glucose/<user_id>')
def get_current_glucose(user_id):
    """获取用户最新的血糖值"""
    with CGMDatabase(DB_PATH) as db:
        readings = db.get_cgm_readings(user_id, limit=1)
        if readings and len(readings) > 0:
            reading = readings[0]
            glucose = reading['glucose_value']
            
            # 判断状态
            status = 'Normal'
            if glucose < 70:
                status = 'Low'
            elif glucose > 180:
                status = 'High'
            elif glucose > 140:
                status = 'Elevated'
            
            return jsonify({
                'glucose': glucose,
                'timestamp': reading['timestamp'],
                'status': status
            })
        else:
            return jsonify({'error': 'No readings found', 'glucose': 0, 'status': 'Unknown'}), 404


@app.route('/api/actions')
def get_actions():
    """获取所有 Pattern-Action 建议"""
    with CGMDatabase(DB_PATH) as db:
        actions = db.get_pattern_actions()
        return jsonify(actions)


@app.route('/api/actions/<category>')
def get_actions_by_category(category):
    """获取指定类别的建议"""
    with CGMDatabase(DB_PATH) as db:
        actions = db.get_pattern_actions(category=category)
        return jsonify(actions)


@app.route('/api/activity-logs/<user_id>', methods=['GET'])
def list_activity_logs(user_id):
    """获取指定用户的活动日志"""
    start_day = request.args.get('start')
    end_day = request.args.get('end')
    limit = request.args.get('limit', type=int)

    with CGMDatabase(DB_PATH) as db:
        logs = db.get_activity_logs(user_id, start_day=start_day, end_day=end_day, limit=limit)
        return jsonify(logs)


@app.route('/api/activity-logs', methods=['POST'])
def create_activity_log():
    """创建活动日志"""
    payload = request.get_json(silent=True) or {}
    user_id = payload.get('userId') or payload.get('user_id')
    category = payload.get('category')
    title = payload.get('title')
    timestamp_utc = payload.get('timestampUtc') or payload.get('timestamp_utc')
    note = payload.get('note')
    medication_name = payload.get('medicationName') or payload.get('medication_name')
    dose = payload.get('dose')
    meal_type = payload.get('mealType') or payload.get('meal_type')

    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    if not category or category not in {'food', 'lifestyle', 'medication', 'sleep', 'stress'}:
        return jsonify({'error': 'category must be one of food, lifestyle, medication, sleep, stress'}), 400
    if not title:
        return jsonify({'error': 'title is required'}), 400
    if not timestamp_utc:
        return jsonify({'error': 'timestampUtc is required'}), 400

    try:
        with CGMDatabase(DB_PATH) as db:
            created = db.add_activity_log(
                user_id,
                category=category,
                title=title,
                timestamp_utc=timestamp_utc,
                note=note,
                medication_name=medication_name,
                dose=dose,
                meal_type=meal_type,
            )
            return jsonify(created), 201
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400


@app.route('/api/activity-logs/<int:log_id>', methods=['DELETE'])
def delete_activity_log(log_id):
    """删除活动日志"""
    try:
        with CGMDatabase(DB_PATH) as db:
            db.delete_activity_log(log_id)
            return jsonify({'success': True}), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@app.route('/api/activity-logs/<int:log_id>', methods=['PUT'])
def update_activity_log(log_id):
    """更新活动日志"""
    payload = request.get_json(silent=True) or {}

    try:
        with CGMDatabase(DB_PATH) as db:
            updated = db.update_activity_log(
                log_id,
                title=payload.get('title'),
                category=payload.get('category'),
                note=payload.get('note'),
                timestamp_utc=payload.get('timestampUtc') or payload.get('timestamp_utc'),
                medication_name=payload.get('medicationName') or payload.get('medication_name'),
                dose=payload.get('dose'),
                meal_type=payload.get('mealType') or payload.get('meal_type'),
            )
            return jsonify(updated), 200
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400


@app.route('/api/daily_summary/<user_id>/<date>')
def get_daily_summary(user_id, date):
    """获取每日总结"""
    with CGMDatabase(DB_PATH) as db:
        summary = db.get_daily_summary(user_id, date)
        return jsonify(summary)


@app.route('/api/patterns/<user_id>')
def get_user_patterns(user_id):
    """获取用户的识别模式 API"""
    with CGMDatabase(DB_PATH) as db:
        patterns = db.get_user_patterns(user_id, limit=20)
        return jsonify(patterns if patterns else [])


@app.route('/api/patterns/<user_id>/latest')
def get_latest_patterns(user_id):
    """获取用户最近的识别模式 (最近24小时)"""
    with CGMDatabase(DB_PATH) as db:
        patterns = db.get_latest_patterns(user_id, hours=24)
        return jsonify(patterns if patterns else [])


@app.route('/api/patterns/<user_id>/summary')
def get_pattern_summary(user_id):
    """获取用户的模式摘要（最近7天）"""
    with CGMDatabase(DB_PATH) as db:
        summary = db.get_pattern_summary(user_id, days=7)
        return jsonify(summary)


# ============================================================
# Tavus Tools API Endpoints
# ============================================================
# 这些端点供 Tavus 数字人调用，获取用户的实时 CGM 数据

@app.route('/api/tools/get_current_glucose', methods=['POST'])
def tavus_get_current_glucose():
    """
    Tavus Tool: 获取用户当前血糖值
    Input: {"user_id": "user_001", "include_trend": true}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    include_trend = data.get('include_trend', True)
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        latest = db.get_latest_glucose(user_id)
        
        if not latest:
            return jsonify({
                "status": "no_data",
                "message": "No glucose readings found for this user"
            }), 200
        
        response = {
            "user_id": user_id,
            "current_glucose": latest['glucose'],
            "timestamp": latest['timestamp'],
            "status": latest['status']
        }
        
        if include_trend:
            # 获取最近的趋势
            stats = db.get_glucose_statistics(user_id, hours=24)
            response["trend"] = {
                "avg_24h": stats.get('avg_glucose'),
                "min_24h": stats.get('min_glucose'),
                "max_24h": stats.get('max_glucose'),
                "std_dev": stats.get('std_dev')
            }
        
        return jsonify(response)


@app.route('/api/tools/get_glucose_statistics', methods=['POST'])
def tavus_get_glucose_statistics():
    """
    Tavus Tool: 获取用户血糖统计数据
    Input: {"user_id": "user_001", "hours": 24}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    hours = data.get('hours', 24)
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        stats = db.get_glucose_statistics(user_id, hours=hours)
        tir = db.calculate_time_in_range(user_id, hours=hours)
        
        return jsonify({
            "user_id": user_id,
            "period_hours": hours,
            "statistics": stats,
            "time_in_range": tir
        })


@app.route('/api/tools/get_detected_patterns', methods=['POST'])
def tavus_get_detected_patterns():
    """
    Tavus Tool: 获取检测到的血糖模式
    Input: {"user_id": "user_001", "hours": 24}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    hours = data.get('hours', 24)
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        patterns = db.get_latest_patterns(user_id, hours=hours)
        
        return jsonify({
            "user_id": user_id,
            "period_hours": hours,
            "patterns": patterns,
            "pattern_count": len(patterns)
        })


@app.route('/api/tools/get_user_info', methods=['POST'])
def tavus_get_user_info():
    """
    Tavus Tool: 获取用户信息和健康目标
    Input: {"user_id": "user_001"}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        user = db.get_user(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user_id": user_id,
            "name": user.get('name'),
            "age": user.get('age'),
            "conditions": user.get('conditions'),
            "medications": user.get('medications'),
            "health_goals": user.get('health_goals')
        })


@app.route('/api/tools/get_recent_readings', methods=['POST'])
def tavus_get_recent_readings():
    """
    Tavus Tool: 获取最近的血糖读数
    Input: {"user_id": "user_001", "count": 20}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    count = data.get('count', 20)
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        readings = db.get_recent_readings(user_id, limit=count)
        
        return jsonify({
            "user_id": user_id,
            "readings_count": len(readings),
            "readings": readings
        })


@app.route('/api/tools/get_health_recommendations', methods=['POST'])
def tavus_get_health_recommendations():
    """
    Tavus Tool: 获取健康建议
    Input: {"user_id": "user_001"}
    """
    from flask import request
    data = request.get_json() or {}
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    with CGMDatabase(DB_PATH) as db:
        actions = db.get_pattern_actions(user_id)
        
        return jsonify({
            "user_id": user_id,
            "recommendations": actions
        })


# ============================================================
# Todos API Endpoints
# ============================================================

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get todos for a user"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    status = request.args.get('status')
    week_start = request.args.get('week_start')

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)
            todos = todo_repo.get_by_user(user_id, status=status, week_start=week_start)
            return jsonify({'todos': todos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)
            todo = todo_repo.get_by_id(todo_id)

            if not todo:
                return jsonify({'error': 'Todo not found'}), 404

            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    user_id = data.get('user_id')
    title = data.get('title')

    if not user_id or not title:
        return jsonify({'error': 'user_id and title are required'}), 400

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            optional_fields = {
                'conversation_id': data.get('conversation_id'),
                'description': data.get('description'),
                'category': data.get('category'),
                'health_benefit': data.get('health_benefit'),
                'time_of_day': data.get('time_of_day'),
                'time_description': data.get('time_description'),
                'target_count': data.get('target_count', 1),
                'current_count': data.get('current_count', 0),
                'status': data.get('status', 'pending'),
                'completed_today': data.get('completed_today', 0),
                'uploaded_images': data.get('uploaded_images', []),
                'notes': data.get('notes'),
                'week_start': data.get('week_start'),
            }

            optional_fields = {k: v for k, v in optional_fields.items() if v is not None}

            todo_id = todo_repo.create(user_id, title, **optional_fields)
            todo = todo_repo.get_by_id(todo_id)

            return jsonify({'todo': todo}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            success = todo_repo.update(todo_id, **data)

            if not success:
                return jsonify({'error': 'No fields to update'}), 400

            todo = todo_repo.get_by_id(todo_id)
            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            success = todo_repo.delete(todo_id)

            if not success:
                return jsonify({'error': 'Failed to delete todo'}), 500

            return jsonify({'message': 'Todo deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/<int:todo_id>/check-in', methods=['POST'])
def check_in_todo(todo_id):
    """Check in / complete a todo (increment progress)"""
    data = request.get_json() or {}

    notes = data.get('notes')
    images = data.get('images', [])

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            success = todo_repo.increment_progress(todo_id, notes=notes, images=images)

            if not success:
                return jsonify({'error': 'Failed to check in todo'}), 500

            todo = todo_repo.get_by_id(todo_id)
            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/todos/reset-daily/<user_id>', methods=['POST'])
def reset_daily_completion(user_id):
    """Reset daily completion status for all todos of a user"""
    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)
            count = todo_repo.reset_daily_completion(user_id)

            return jsonify({
                'message': f'Reset {count} todos',
                'count': count
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================
# Conversation History API Endpoints
# ============================================================

@app.route('/api/conversations/history/<user_id>', methods=['GET'])
def get_conversation_history(user_id):
    """
    Get conversation history with summaries for a user
    Combines data from conversations, user_memories, and conversation_analysis tables
    """
    try:
        limit = request.args.get('limit', type=int, default=10)

        with get_connection() as conn:
            cursor = conn.cursor()

            # 使用 ConversationRepository 而不是原始SQL
            from shared.database.repositories.conversation_repository import ConversationRepository
            conv_repo = ConversationRepository(conn)
            
            # 获取用户的对话列表（包含 summary）
            conversations_data = conv_repo.get_user_conversations(user_id, limit=limit)
            
            # ⚡ 性能优化：一次性获取所有对话的memories，避免N+1查询问题
            conversation_ids = [conv['conversation_id'] for conv in conversations_data]
            memory_map = {}
            
            if conversation_ids:
                try:
                    from shared.database.repositories.memory_repository import MemoryRepository
                    mem_repo = MemoryRepository(conn)
                    
                    # 一次性查询所有相关的memories
                    placeholders = ', '.join([mem_repo.placeholder] * len(conversation_ids))
                    query = f'''
                        SELECT * FROM user_memories 
                        WHERE conversation_id IN ({placeholders})
                    '''
                    mem_repo.execute(query, tuple(conversation_ids))
                    memories = mem_repo.cursor.fetchall()
                    
                    # 构建conversation_id -> memory的映射
                    for mem in memories:
                        mem_dict = mem_repo._dict_from_row(mem)
                        conv_id = mem_dict.get('conversation_id')
                        if conv_id:
                            memory_map[conv_id] = mem_dict
                except Exception as e:
                    print(f"Warning: Failed to get memories: {e}")
            
            conversations = []
            for conv in conversations_data:
                # 从映射中直接获取memory（O(1)查找）
                memory = memory_map.get(conv['conversation_id'])

                # -------------------------
                # 对话有效性过滤（避免展示“空内容”卡片）
                # -------------------------
                conv_id = conv.get('conversation_id') or ''
                started_at = conv.get('started_at')
                raw_transcript = conv.get('transcript') or ''
                raw_summary = ''
                if memory:
                    raw_summary = memory.get('summary') or ''

                # 跳过测试对话（脚本生成的 test_xxx）
                if conv_id.startswith('test_'):
                    continue

                # 将 transcript / summary 简单标准化
                def _normalize_text(text) -> str:
                    if not text:
                        return ''
                    if isinstance(text, (dict, list)):
                        try:
                            return json.dumps(text, ensure_ascii=False)
                        except Exception:
                            return str(text)
                    return str(text)

                summary_text = _normalize_text(raw_summary).strip()

                # 规则：只展示有“可读 summary”的对话
                # - summary 至少需要一定长度（避免只有一句客套、或解析失败的情况）
                # - 没有 summary 的历史测试对话 / 误触通话将被过滤掉
                MIN_SUMMARY_LEN = 40  # 大约一两句话

                if len(summary_text) < MIN_SUMMARY_LEN:
                    # 没有有效 summary，则不在历史卡片中展示
                    continue

                # 处理JSON字段（MySQL可能已解析，SQLite返回字符串）
                def parse_json_field(field_value, default):
                    if not field_value:
                        return default
                    if isinstance(field_value, (dict, list)):
                        return field_value  # MySQL已解析
                    if isinstance(field_value, str):
                        try:
                            return json.loads(field_value)  # SQLite字符串
                        except:
                            return default
                    return default
                
                # 生成简洁的对话标题 (英文)
                def generate_conversation_title(conv_type, summary, key_topics, started_at, conversation_name=None):
                    from datetime import datetime
                    
                    # 如果有conversation_name，且不是默认的"Voice Call - call_xxx"格式，就用它
                    if conversation_name and not (conversation_name.startswith('Voice Call - call_') or 
                                                  conversation_name.startswith('Video Call - call_')):
                        return conversation_name
                    
                    # 根据对话类型 (英文)
                    type_prefix = {
                        'retell_voice': 'Voice Chat',
                        'tavus_video': 'Video Chat', 
                        'gpt_chat': 'Text Chat'
                    }.get(conv_type, 'Conversation')
                    
                    # Extract topic from English summary
                    if summary:
                        # Skip brief greeting conversations
                        skip_keywords = ['brief interaction', 'no specific topics', 'whenever you', 'available to chat']
                        if not any(keyword in summary.lower() for keyword in skip_keywords):
                            
                            # Find specific health topics in English summary
                            health_topics_map = {
                                'blood sugar': 'Blood Sugar',
                                'glucose level': 'Glucose',
                                'meal planning': 'Meal Planning',
                                'meal': 'Meal Discussion',
                                'exercise': 'Exercise',
                                'health goal': 'Health Goals',
                                'diet': 'Diet Planning',
                                'medication': 'Medication',
                                'insulin': 'Insulin',
                                'stress': 'Stress Management',
                                'sleep': 'Sleep Quality',
                                'weight': 'Weight Management',
                                'nutrition': 'Nutrition'
                            }
                            
                            summary_lower = summary.lower()
                            for en_keyword, topic_title in health_topics_map.items():
                                if en_keyword in summary_lower:
                                    return f"{type_prefix} - {topic_title}"
                            
                            # Extract topic from "discussed X" pattern
                            if 'discussed' in summary_lower:
                                idx = summary_lower.find('discussed')
                                after = summary[idx + 9:].strip()
                                if after:
                                    topic = after.split('.')[0].split(',')[0].strip()
                                    if 5 < len(topic) < 35 and not topic.startswith(('how', 'whether', 'if', 'your', 'the')):
                                        # Capitalize first letter
                                        topic = topic[0].upper() + topic[1:] if topic else topic
                                        return f"{type_prefix} - {topic}"
                            
                            # Extract topic from "created a plan" pattern
                            if 'created a plan' in summary_lower:
                                return f"{type_prefix} - Health Plan"
                    
                    # Use key_topics
                    topics = parse_json_field(key_topics, [])
                    if topics and len(topics) > 0:
                        return f"{type_prefix} - {topics[0]}"
                    
                    # Use date and time (English format)
                    if started_at:
                        try:
                            if isinstance(started_at, str):
                                dt = datetime.fromisoformat(str(started_at).replace('Z', '+00:00').replace('GMT', '+00:00'))
                            else:
                                dt = started_at
                            date_str = dt.strftime('%b %d, %H:%M')  # e.g., "Nov 18, 00:48"
                            return f"{type_prefix} ({date_str})"
                        except:
                            pass
                    
                    return type_prefix
                
                title = generate_conversation_title(
                    conv['conversation_type'],
                    summary_text,
                    memory.get('key_topics') if memory else None,
                    conv.get('started_at'),
                    conv.get('conversation_name')
                )
                
                conversation = {
                    'id': conv['conversation_id'],
                    'type': conv['conversation_type'],
                    'title': title,  # 添加简洁标题
                    'started_at': str(conv.get('started_at', '')),
                    'ended_at': str(conv.get('ended_at', '')),
                    'duration_seconds': conv.get('duration_seconds'),
                    'transcript': raw_transcript,
                    'summary': summary_text,
                    'key_topics': parse_json_field(memory.get('key_topics') if memory else None, []),
                    'insights': memory.get('insights', '') if memory else '',
                    'extracted_data': parse_json_field(memory.get('extracted_data') if memory else None, {})
                }
                conversations.append(conversation)

            return jsonify({
                'conversations': conversations,
                'count': len(conversations)
            })

    except Exception as e:
        print(f"Error fetching conversation history: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation_detail(conversation_id):
    """
    Get detailed information for a specific conversation
    """
    try:
        with get_connection() as conn:
            # 使用 Repository 而不是原始SQL
            from shared.database.repositories.conversation_repository import ConversationRepository
            from shared.database.repositories.memory_repository import MemoryRepository
            
            conv_repo = ConversationRepository(conn)
            mem_repo = MemoryRepository(conn)
            
            # 获取对话信息
            conversation = conv_repo.get_by_id(conversation_id)

            if not conversation:
                return jsonify({'error': 'Conversation not found'}), 404

            # 获取对应的memory
            user_id = conversation.get('user_id')
            memories = mem_repo.get_recent_memories(user_id, days=365, limit=100)
            
            memory = None
            for m in memories:
                if m.get('conversation_id') == conversation_id:
                    memory = m
                    break
            
            # 合并memory信息到conversation
            if memory:
                # 处理JSON字段（兼容MySQL和SQLite）
                def parse_json_field(field_value, default):
                    if not field_value:
                        return default
                    if isinstance(field_value, (dict, list)):
                        return field_value
                    if isinstance(field_value, str):
                        try:
                            return json.loads(field_value)
                        except:
                            return default
                    return default
                
                conversation['summary'] = memory.get('summary', '')
                conversation['key_topics'] = parse_json_field(memory.get('key_topics'), [])
                conversation['insights'] = memory.get('insights', '')
                conversation['extracted_data'] = parse_json_field(memory.get('extracted_data'), {})
            else:
                conversation['summary'] = ''
                conversation['key_topics'] = []
                conversation['insights'] = ''
                conversation['extracted_data'] = {}

            return jsonify({'conversation': conversation})

    except Exception as e:
        print(f"Error fetching conversation detail: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 CGM Butler Dashboard 启动中...")
    print("="*60)
    print(f"📊 数据库路径: {DB_PATH}")
    print("🌐 访问地址: http://localhost:5000")
    print("💡 按 Ctrl+C 停止服务器")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
