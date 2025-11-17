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
from shared.database import get_connection, TodoRepository

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

            # Remove None values
            optional_fields = {k: v for k, v in optional_fields.items() if v is not None}

            todo_id = todo_repo.create(user_id, title, **optional_fields)

            # Get the created todo
            todo = todo_repo.get_by_id(todo_id)

            return jsonify({'todo': todo}), 201
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

            # Increment progress
            success = todo_repo.increment_progress(todo_id, notes=notes, images=images)

            if not success:
                return jsonify({'error': 'Failed to check in todo'}), 500

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
