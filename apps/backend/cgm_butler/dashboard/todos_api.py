"""
Flask API for Todos Management

This module provides REST API endpoints for managing user todos/goals.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import os
import sys

# 添加项目根目录到路径 (用于 shared 模块)
# todos_api.py -> dashboard -> cgm_butler -> backend -> apps -> my-glucose-pal (5层)
current_file = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file)))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 使用新的 shared/database
from shared.database import get_connection, TodoRepository, HabitLogsRepository
from shared.database.repositories.todo_checkin_repository import TodoCheckinRepository

# Create Blueprint
todos_bp = Blueprint('todos', __name__, url_prefix='/api/todos')


@todos_bp.route('', methods=['GET'])
def get_todos():
    """
    Get todos for a user.

    Query Parameters:
        user_id (str, required): User ID
        status (str, optional): Filter by status ('pending', 'in_progress', 'completed', 'cancelled')
        week_start (str, optional): Filter by week start date (YYYY-MM-DD)

    Returns:
        JSON: List of todos
    """
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


@todos_bp.route('/<int:todo_id>', methods=['GET'])
def get_todo(todo_id: int):
    """
    Get a specific todo by ID.

    Args:
        todo_id (int): Todo ID

    Returns:
        JSON: Todo details
    """
    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)
            todo = todo_repo.get_by_id(todo_id)

            if not todo:
                return jsonify({'error': 'Todo not found'}), 404

            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('', methods=['POST'])
def create_todo():
    """
    Create a new todo.

    Request Body (JSON):
        user_id (str, required): User ID
        title (str, required): Todo title
        description (str, optional): Todo description
        category (str, optional): Category ('diet', 'exercise', 'sleep', 'stress', 'medication', 'other')
        health_benefit (str, optional): Health benefit description
        time_of_day (str, optional): Time of day (e.g., '09:00-10:00')
        time_description (str, optional): Time description (e.g., 'Before work')
        target_count (int, optional): Target count (default: 1)
        current_count (int, optional): Current count (default: 0)
        status (str, optional): Status (default: 'pending')
        week_start (str, optional): Week start date (YYYY-MM-DD)
        conversation_id (str, optional): Associated conversation ID

    Returns:
        JSON: Created todo with ID
    """
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

            # Extract optional fields
            optional_fields = {
                'conversation_id': data.get('conversation_id'),
                'description': data.get('description'),
                'category': data.get('category'),
                'health_benefit': data.get('health_benefit'),
                'emoji': data.get('emoji'),
                'time_of_day': data.get('time_of_day'),
                'time_description': data.get('time_description'),
                'target_count': data.get('target_count', 1),
                'current_count': data.get('current_count', 0),
                'status': data.get('status', 'pending'),
                'completed_today': data.get('completed_today', False),
                'user_selected': data.get('user_selected', True),
                'uploaded_images': data.get('uploaded_images', []),
                'notes': data.get('notes'),
                'week_start': data.get('week_start'),
            }

            # Remove None values
            optional_fields = {k: v for k, v in optional_fields.items() if v is not None}

            todo_id = todo_repo.create(user_id, title, **optional_fields)

            # Get the created todo
            todo = todo_repo.get_by_id(todo_id)

            return jsonify({'todo_id': todo_id, 'todo': todo}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id: int):
    """
    Update a todo.

    Args:
        todo_id (int): Todo ID

    Request Body (JSON):
        Any fields to update (title, description, category, status, etc.)

    Returns:
        JSON: Updated todo
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            # Check if todo exists
            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            # Update the todo
            success = todo_repo.update(todo_id, **data)

            if not success:
                return jsonify({'error': 'No fields to update'}), 400

            # Get the updated todo
            todo = todo_repo.get_by_id(todo_id)

            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id: int):
    """
    Delete a todo.

    Args:
        todo_id (int): Todo ID

    Returns:
        JSON: Success message
    """
    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            # Check if todo exists
            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            # Delete the todo
            success = todo_repo.delete(todo_id)

            if not success:
                return jsonify({'error': 'Failed to delete todo'}), 500

            return jsonify({'message': 'Todo deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>/check-in', methods=['POST'])
def check_in_todo(todo_id: int):
    """
    Check in / complete a todo (increment progress).

    Args:
        todo_id (int): Todo ID

    Request Body (JSON):
        notes (str, optional): Check-in notes
        images (list, optional): List of image URLs to add

    Returns:
        JSON: Updated todo
    """
    data = request.get_json() or {}

    notes = data.get('notes')
    images = data.get('images', [])

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)

            # Check if todo exists
            existing_todo = todo_repo.get_by_id(todo_id)
            if not existing_todo:
                return jsonify({'error': 'Todo not found'}), 404

            # Increment progress on main todo record
            success = todo_repo.increment_progress(todo_id, notes=notes, images=images)

            if not success:
                return jsonify({'error': 'Failed to check in todo'}), 500

            # 记录每日 check-in，用于周统计
            try:
                checkin_repo = TodoCheckinRepository(conn)
                checkin_repo.create(
                    user_id=existing_todo['user_id'],
                    todo_id=todo_id,
                )
            except Exception as e:
                # 不让统计失败影响主流程，只打印日志
                print(f"⚠️ Failed to create todo_checkin record: {e}")

            # Get the updated todo
            todo = todo_repo.get_by_id(todo_id)

            return jsonify({'todo': todo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/reset-daily/<user_id>', methods=['POST'])
def reset_daily_completion(user_id: str):
    """
    Reset daily completion status for all todos of a user.
    This should be called daily (e.g., at midnight).

    Args:
        user_id (str): User ID

    Returns:
        JSON: Number of todos reset
    """
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


@todos_bp.route('/weekly-stats/<user_id>', methods=['GET'])
def get_weekly_stats(user_id: str):
    """
    Get weekly completion stats for a user.

    Query Parameters:
        week_start (str, optional): Week start date (YYYY-MM-DD). Defaults to current week Monday.

    Returns:
        JSON: {
          "user_id": "...",
          "week_start": "YYYY-MM-DD",
          "days": [
            {"date": "YYYY-MM-DD", "day_label": "Mon", "completed": 2, "total": 5, "rate": 40},
            ...
          ],
          "week_average": 47
        }
    """
    from datetime import datetime, timedelta

    week_start = request.args.get('week_start')

    # 如果没有传 week_start，默认当前周的周一
    if not week_start:
        today = datetime.now().date()
        # Monday is 0, Sunday is 6
        monday = today - timedelta(days=today.weekday())
        week_start = monday.isoformat()

    try:
        with get_connection() as conn:
            checkin_repo = TodoCheckinRepository(conn)
            stats = checkin_repo.get_weekly_completion(user_id, week_start)
            return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/batch-create', methods=['POST'])
def batch_create_todos():
    """
    Batch create multiple todos (用于 CallResultsPage 保存用户选择的 TODOs)

    Request Body (JSON):
        {
            "user_id": "user_001",
            "conversation_id": "conv_xxx",
            "week_start": "2025-01-13",
            "todos": [
                {
                    "title": "...",
                    "category": "diet",
                    "health_benefit": "...",
                    "time_of_day": "09:00-10:00",
                    "time_description": "Before work",
                    "target_count": 7,
                    "priority": "high",
                    "recommendation_tag": "ai_recommended"
                }
            ]
        }

    Returns:
        JSON: Created todos with IDs
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    user_id = data.get('user_id')
    todos_data = data.get('todos', [])
    conversation_id = data.get('conversation_id')
    week_start = data.get('week_start')
    
    print(f"[batch_create_todos] Received request:")
    print(f"  user_id: {user_id}")
    print(f"  conversation_id: {conversation_id}")
    print(f"  week_start: {week_start}")
    print(f"  todos_count: {len(todos_data)}")

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    if not todos_data:
        return jsonify({'error': 'todos array is required'}), 400

    try:
        with get_connection() as conn:
            # 验证 conversation_id 是否存在（如果提供了的话）
            if conversation_id:
                cursor = conn.cursor()
                placeholder = '%s' if hasattr(conn, 'server_version') else '?'
                cursor.execute(f'SELECT conversation_id FROM conversations WHERE conversation_id = {placeholder}', (conversation_id,))
                if not cursor.fetchone():
                    print(f"[batch_create_todos] Warning: conversation_id '{conversation_id}' not found in database, setting to NULL")
                    conversation_id = None
            
            todo_repo = TodoRepository(conn)
            created_todos = []

            for todo_data in todos_data:
                title = todo_data.get('title')
                if not title:
                    continue  # Skip todos without title

                # Build optional fields
                optional_fields = {
                    'conversation_id': conversation_id,
                    'description': todo_data.get('description'),
                    'category': todo_data.get('category'),
                    'health_benefit': todo_data.get('health_benefit'),
                    'time_of_day': todo_data.get('time_of_day'),
                    'time_description': todo_data.get('time_description'),
                    'target_count': todo_data.get('target_count', 1),
                    'current_count': todo_data.get('current_count', 0),
                    'status': todo_data.get('status', 'pending'),
                    'user_selected': todo_data.get('user_selected', True),  # Boolean value - will be normalized by repository
                    'priority': todo_data.get('priority'),
                    'recommendation_tag': todo_data.get('recommendation_tag'),
                    'week_start': week_start,
                }

                # Remove None values
                optional_fields = {k: v for k, v in optional_fields.items() if v is not None}

                # Create todo
                try:
                    todo_id = todo_repo.create(user_id, title, **optional_fields)
                    # Get created todo
                    todo = todo_repo.get_by_id(todo_id)
                    created_todos.append(todo)
                except Exception as create_error:
                    print(f"[batch_create_todos] Failed to create todo '{title}': {create_error}")
                    raise

            conn.commit()

            return jsonify({
                'message': f'Created {len(created_todos)} todos',
                'count': len(created_todos),
                'todos': created_todos
            }), 201

    except Exception as e:
        import traceback
        print(f"[batch_create_todos] Error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ============================================================
# Habit Logs API Endpoints
# ============================================================

@todos_bp.route('/<int:todo_id>/logs', methods=['GET'])
def get_habit_logs(todo_id: int):
    """
    Get logs for a specific habit.

    Args:
        todo_id: Habit/Todo ID

    Query Parameters:
        start_date (str, optional): Start date (YYYY-MM-DD)
        end_date (str, optional): End date (YYYY-MM-DD)
        format (str, optional): Response format ('list' or 'dict', default: 'list')

    Returns:
        JSON: Habit logs
    """
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    response_format = request.args.get('format', 'list')

    try:
        with get_connection() as conn:
            logs_repo = HabitLogsRepository(conn)

            if response_format == 'dict':
                # Return as dictionary keyed by date (for frontend)
                logs = logs_repo.get_logs_dict_for_habit(todo_id, start_date, end_date)
            else:
                # Return as list (default)
                logs = logs_repo.get_logs_by_habit(todo_id, start_date, end_date)

            return jsonify({'logs': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>/logs', methods=['POST'])
def create_habit_log(todo_id: int):
    """
    Create or update a habit log entry.

    Args:
        todo_id: Habit/Todo ID

    Request Body (JSON):
        log_date (str, required): Log date (YYYY-MM-DD)
        status (str, required): Status ('COMPLETED' or 'SKIPPED')
        note (str, optional): Optional note

    Returns:
        JSON: Created/updated log
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    log_date = data.get('log_date')
    status = data.get('status', 'COMPLETED')
    note = data.get('note')

    if not log_date:
        return jsonify({'error': 'log_date is required'}), 400

    if status not in ['COMPLETED', 'SKIPPED']:
        return jsonify({'error': 'status must be COMPLETED or SKIPPED'}), 400

    try:
        with get_connection() as conn:
            # Get the todo to get user_id
            todo_repo = TodoRepository(conn)
            todo = todo_repo.get_by_id(todo_id)

            if not todo:
                return jsonify({'error': 'Todo not found'}), 404

            # Upsert the log
            logs_repo = HabitLogsRepository(conn)
            log_id = logs_repo.upsert(
                habit_id=todo_id,
                user_id=todo['user_id'],
                log_date=log_date,
                status=status,
                note=note
            )

            # Get the created/updated log
            log = logs_repo.get_by_habit_and_date(todo_id, log_date)

            return jsonify({'log_id': log_id, 'log': log}), 201
    except Exception as e:
        import traceback
        print(f"[create_habit_log] Error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>/logs/<log_date>', methods=['DELETE'])
def delete_habit_log(todo_id: int, log_date: str):
    """
    Delete a habit log entry.

    Args:
        todo_id: Habit/Todo ID
        log_date: Log date (YYYY-MM-DD)

    Returns:
        JSON: Success message
    """
    try:
        with get_connection() as conn:
            logs_repo = HabitLogsRepository(conn)

            # Check if log exists
            existing_log = logs_repo.get_by_habit_and_date(todo_id, log_date)
            if not existing_log:
                return jsonify({'error': 'Log not found'}), 404

            # Delete the log
            success = logs_repo.delete(todo_id, log_date)

            if not success:
                return jsonify({'error': 'Failed to delete log'}), 500

            return jsonify({'message': 'Log deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>/streak', methods=['GET'])
def get_habit_streak(todo_id: int):
    """
    Get the current streak for a habit.

    Args:
        todo_id: Habit/Todo ID

    Query Parameters:
        as_of_date (str, optional): Calculate streak as of this date (YYYY-MM-DD)

    Returns:
        JSON: { "habit_id": 123, "streak": 7 }
    """
    as_of_date = request.args.get('as_of_date')

    try:
        with get_connection() as conn:
            logs_repo = HabitLogsRepository(conn)
            streak = logs_repo.calculate_streak(todo_id, as_of_date)

            return jsonify({
                'habit_id': todo_id,
                'streak': streak
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/habits/<user_id>', methods=['GET'])
def get_user_habits_with_logs(user_id: str):
    """
    Get all habits for a user with their logs.

    This endpoint combines habit data with logs in the format expected by the frontend.

    Query Parameters:
        week_start (str, optional): Filter by week start date (YYYY-MM-DD)
        start_date (str, optional): Start date for logs (YYYY-MM-DD, default: 30 days ago)
        end_date (str, optional): End date for logs (YYYY-MM-DD, default: today)

    Returns:
        JSON: {
            "habits": [
                {
                    "id": "1",
                    "title": "...",
                    "category": "NUTRITION",
                    "emoji": "🥑",
                    "frequency": 7,
                    "logs": {
                        "2025-01-15": { "status": "COMPLETED", "timestamp": 123456789 },
                        ...
                    },
                    "streak": 5
                }
            ]
        }
    """
    from datetime import datetime, timedelta

    week_start = request.args.get('week_start')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Default date range: last 30 days
    if not end_date:
        end_date = datetime.now().date().isoformat()
    if not start_date:
        start_date = (datetime.now().date() - timedelta(days=30)).isoformat()

    try:
        with get_connection() as conn:
            todo_repo = TodoRepository(conn)
            logs_repo = HabitLogsRepository(conn)

            # Get user's todos (habits)
            todos = todo_repo.get_by_user(user_id, week_start=week_start)

            # Enrich each todo with logs and streak
            habits = []
            for todo in todos:
                # Get logs as dictionary
                logs = logs_repo.get_logs_dict_for_habit(
                    habit_id=todo['id'],
                    start_date=start_date,
                    end_date=end_date
                )

                # Calculate streak
                streak = logs_repo.calculate_streak(todo['id'])

                # Map category to frontend format
                category_map = {
                    'diet': 'NUTRITION',
                    'nutrition': 'NUTRITION',
                    'exercise': 'EXERCISE',
                    'sleep': 'SLEEP',
                    'stress': 'MINDFULNESS',
                    'mindfulness': 'MINDFULNESS',
                    'medication': 'OTHER',
                    'other': 'OTHER'
                }

                habit = {
                    'id': str(todo['id']),
                    'title': todo['title'],
                    'description': todo.get('description'),
                    'category': category_map.get(todo.get('category', 'other'), 'OTHER'),
                    'logs': logs,
                    'frequency': todo.get('frequency', 7),
                    'streak': streak,
                    'emoji': todo.get('emoji')
                }

                habits.append(habit)

            return jsonify({'habits': habits})
    except Exception as e:
        import traceback
        print(f"[get_user_habits_with_logs] Error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
