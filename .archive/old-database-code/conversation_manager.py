# conversation_manager.py
# -*- coding: utf-8 -*-
"""
对话管理器
管理对话的保存、查询、分析和历史记录
"""
import sqlite3
import json
import uuid
import os
from datetime import datetime
from typing import Dict, List, Optional, Any


class ConversationManager:
    """对话管理器 - 保存和查询所有对话记录"""
    
    def __init__(self, db_path: str = None):
        """
        初始化对话管理器
        
        Args:
            db_path: 数据库文件路径，如果为None则使用默认路径
        """
        if db_path is None:
            # 获取默认数据库路径
            db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
        
        # 确保使用绝对路径
        self.db_path = os.path.abspath(db_path)
    
    def _get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    # ============================================================
    # 对话保存方法
    # ============================================================
    
    def save_tavus_conversation(
        self,
        user_id: str,
        tavus_conversation_id: str,
        tavus_conversation_url: str,
        tavus_replica_id: str,
        tavus_persona_id: str,
        transcript: List[Dict],
        conversational_context: str,
        custom_greeting: str,
        started_at: str,
        ended_at: Optional[str] = None,
        duration_seconds: Optional[int] = None,
        status: str = 'active',
        shutdown_reason: Optional[str] = None,
        properties: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        保存 Tavus 视频对话
        
        Args:
            user_id: 用户ID
            tavus_conversation_id: Tavus 对话ID
            tavus_conversation_url: Tavus 对话 URL
            tavus_replica_id: Replica ID
            tavus_persona_id: Persona ID
            transcript: 对话记录（List[Dict]）
            conversational_context: 初始 context
            custom_greeting: 自定义问候
            started_at: 开始时间
            ended_at: 结束时间
            duration_seconds: 对话时长（秒）
            status: 对话状态
            shutdown_reason: 关闭原因
            properties: 属性字典
            metadata: 元数据字典
            
        Returns:
            对话ID
        """
        conversation_id = str(uuid.uuid4())
        
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO conversations (
                conversation_id, user_id, conversation_type, conversation_name,
                tavus_conversation_id, tavus_conversation_url, tavus_replica_id, tavus_persona_id,
                started_at, ended_at, duration_seconds,
                status, shutdown_reason,
                transcript, conversational_context, custom_greeting,
                properties, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                conversation_id, user_id, 'tavus_video', f'Tavus Video - {tavus_conversation_id[:10]}',
                tavus_conversation_id, tavus_conversation_url, tavus_replica_id, tavus_persona_id,
                started_at, ended_at, duration_seconds,
                status, shutdown_reason,
                json.dumps(transcript, ensure_ascii=False),  # 转换为 JSON
                conversational_context, custom_greeting,
                json.dumps(properties or {}),
                json.dumps(metadata or {})
            ))
            
            conn.commit()
            print(f"✅ Tavus 对话已保存: {conversation_id}")
            return conversation_id
            
        except sqlite3.Error as e:
            print(f"❌ 保存 Tavus 对话失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def save_retell_conversation(
        self,
        user_id: str,
        retell_call_id: str,
        retell_agent_id: str,
        call_status: str,
        call_type: str,
        started_at: str,
        transcript: str,
        transcript_object: List[Dict],
        ended_at: Optional[str] = None,
        duration_seconds: Optional[float] = None,
        call_cost: Optional[Dict] = None,
        disconnection_reason: Optional[str] = None,
        recording_url: Optional[str] = None,
        properties: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        保存 Retell Voice Chat 对话

        Args:
            user_id: 用户ID
            retell_call_id: Retell Call ID
            retell_agent_id: Retell Agent ID
            call_status: 通话状态 (active, ended, error)
            call_type: 通话类型 (web_call, phone_call)
            started_at: 开始时间戳
            transcript: 纯文本 transcript
            transcript_object: 完整 transcript 对象（List[Dict]）
            ended_at: 结束时间戳
            duration_seconds: 通话时长（秒）
            call_cost: 通话费用（Dict）
            disconnection_reason: 断开连接原因
            recording_url: 录音文件 URL
            properties: 属性字典
            metadata: 元数据字典

        Returns:
            对话ID
        """
        conversation_id = str(uuid.uuid4())

        conn = self._get_connection()
        try:
            cursor = conn.cursor()

            cursor.execute('''
            INSERT INTO conversations (
                conversation_id, user_id, conversation_type, conversation_name,
                retell_call_id, retell_agent_id, call_status, call_type,
                started_at, ended_at, duration_seconds,
                call_cost, disconnection_reason,
                transcript, transcript_object, recording_url,
                properties, metadata, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                conversation_id, user_id, 'retell_voice', f'Voice Call - {retell_call_id[:10]}',
                retell_call_id, retell_agent_id, call_status, call_type,
                started_at, ended_at, duration_seconds,
                json.dumps(call_cost or {}, ensure_ascii=False),
                disconnection_reason,
                transcript,
                json.dumps(transcript_object, ensure_ascii=False),
                recording_url,
                json.dumps(properties or {}),
                json.dumps(metadata or {}),
                'ended'  # Voice calls are saved after they end
            ))

            conn.commit()
            print(f"✅ Retell Voice 对话已保存: {conversation_id}")
            return conversation_id

        except sqlite3.Error as e:
            print(f"❌ 保存 Retell Voice 对话失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def save_gpt_conversation(
        self,
        user_id: str,
        transcript: List[Dict],
        conversational_context: str,
        started_at: str,
        ended_at: Optional[str] = None,
        duration_seconds: Optional[int] = None,
        status: str = 'active',
        properties: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        保存 GPT 文本对话
        
        Args:
            user_id: 用户ID
            transcript: 对话记录（List[Dict]）
            conversational_context: 初始 context
            started_at: 开始时间
            ended_at: 结束时间
            duration_seconds: 对话时长（秒）
            status: 对话状态
            properties: 属性字典
            metadata: 元数据字典
            
        Returns:
            对话ID
        """
        conversation_id = str(uuid.uuid4())
        
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO conversations (
                conversation_id, user_id, conversation_type, conversation_name,
                started_at, ended_at, duration_seconds,
                status,
                transcript, conversational_context,
                properties, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                conversation_id, user_id, 'gpt_chat', f'GPT Chat - {conversation_id[:10]}',
                started_at, ended_at, duration_seconds,
                status,
                json.dumps(transcript, ensure_ascii=False),  # 转换为 JSON
                conversational_context,
                json.dumps(properties or {}),
                json.dumps(metadata or {})
            ))
            
            conn.commit()
            print(f"✅ GPT 对话已保存: {conversation_id}")
            return conversation_id
            
        except sqlite3.Error as e:
            print(f"❌ 保存 GPT 对话失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    # ============================================================
    # 对话查询方法
    # ============================================================
    
    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        """
        获取单个对话
        
        Args:
            conversation_id: 对话ID
            
        Returns:
            对话字典，未找到返回 None
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM conversations WHERE conversation_id = ?', (conversation_id,))
            row = cursor.fetchone()
            
            if row:
                result = dict(row)
                # 解析 JSON 字段（根据对话类型）
                conv_type = result.get('conversation_type')

                # Voice Chat 的 transcript 是纯文本，不需要 JSON 解析
                if conv_type == 'retell_voice':
                    # transcript 保持为纯文本
                    # transcript_object 需要 JSON 解析
                    if result.get('transcript_object'):
                        result['transcript_object'] = json.loads(result['transcript_object'])
                    if result.get('call_cost'):
                        result['call_cost'] = json.loads(result['call_cost'])
                else:
                    # Video Chat 和 GPT Chat 的 transcript 是 JSON
                    result['transcript'] = json.loads(result['transcript']) if result['transcript'] else []

                result['properties'] = json.loads(result['properties']) if result['properties'] else {}
                result['metadata'] = json.loads(result['metadata']) if result['metadata'] else {}
                return result
            return None
            
        finally:
            conn.close()
    
    def get_user_conversations(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        conversation_type: Optional[str] = None
    ) -> List[Dict]:
        """
        获取用户的所有对话
        
        Args:
            user_id: 用户ID
            limit: 返回数量限制
            offset: 偏移量
            conversation_type: 对话类型过滤 ('tavus_video' 或 'gpt_chat')
            
        Returns:
            对话列表
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            if conversation_type:
                query = '''
                SELECT * FROM conversations 
                WHERE user_id = ? AND conversation_type = ?
                ORDER BY started_at DESC
                LIMIT ? OFFSET ?
                '''
                cursor.execute(query, (user_id, conversation_type, limit, offset))
            else:
                query = '''
                SELECT * FROM conversations 
                WHERE user_id = ?
                ORDER BY started_at DESC
                LIMIT ? OFFSET ?
                '''
                cursor.execute(query, (user_id, limit, offset))
            
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                result = dict(row)
                # 解析 JSON 字段（根据对话类型）
                conv_type = result.get('conversation_type')

                # Voice Chat 的 transcript 是纯文本，不需要 JSON 解析
                if conv_type == 'retell_voice':
                    # transcript 保持为纯文本
                    # transcript_object 需要 JSON 解析
                    if result.get('transcript_object'):
                        result['transcript_object'] = json.loads(result['transcript_object'])
                    if result.get('call_cost'):
                        result['call_cost'] = json.loads(result['call_cost'])
                else:
                    # Video Chat 和 GPT Chat 的 transcript 是 JSON
                    result['transcript'] = json.loads(result['transcript']) if result['transcript'] else []

                result['properties'] = json.loads(result['properties']) if result['properties'] else {}
                result['metadata'] = json.loads(result['metadata']) if result['metadata'] else {}
                results.append(result)
            
            return results
            
        finally:
            conn.close()
    
    def get_recent_conversations(self, user_id: str, days: int = 7, limit: int = 10) -> List[Dict]:
        """
        获取用户最近 N 天的对话
        
        Args:
            user_id: 用户ID
            days: 天数
            limit: 返回数量限制
            
        Returns:
            对话列表
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            # SQLite 中用 datetime 函数计算
            query = '''
            SELECT * FROM conversations 
            WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
            ORDER BY started_at DESC
            LIMIT ?
            '''
            cursor.execute(query, (user_id, days, limit))
            
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                result = dict(row)
                # 解析 JSON 字段（根据对话类型）
                conv_type = result.get('conversation_type')

                # Voice Chat 的 transcript 是纯文本，不需要 JSON 解析
                if conv_type == 'retell_voice':
                    # transcript 保持为纯文本
                    # transcript_object 需要 JSON 解析
                    if result.get('transcript_object'):
                        result['transcript_object'] = json.loads(result['transcript_object'])
                    if result.get('call_cost'):
                        result['call_cost'] = json.loads(result['call_cost'])
                else:
                    # Video Chat 和 GPT Chat 的 transcript 是 JSON
                    result['transcript'] = json.loads(result['transcript']) if result['transcript'] else []

                result['properties'] = json.loads(result['properties']) if result['properties'] else {}
                result['metadata'] = json.loads(result['metadata']) if result['metadata'] else {}
                results.append(result)

            return results
            
        finally:
            conn.close()
    
    # ============================================================
    # 对话分析方法
    # ============================================================
    
    def save_analysis(
        self,
        conversation_id: str,
        summary: Optional[str] = None,
        key_topics: Optional[List[str]] = None,
        extracted_data: Optional[Dict] = None,
        user_intents: Optional[List[str]] = None,
        user_concerns: Optional[List[str]] = None,
        user_sentiment: Optional[str] = None,
        engagement_score: Optional[float] = None,
        action_items: Optional[List[Dict]] = None,
        follow_up_needed: bool = False,
        analysis_model: str = 'gpt-4o',
        analysis_timestamp: Optional[str] = None
    ) -> int:
        """
        保存对话分析结果
        
        Args:
            conversation_id: 对话ID
            summary: 摘要
            key_topics: 关键话题列表
            extracted_data: 提取的结构化数据
            user_intents: 用户意图
            user_concerns: 用户关切
            user_sentiment: 用户情感 ('positive', 'neutral', 'negative')
            engagement_score: 参与度评分 (0-100)
            action_items: 行动项列表
            follow_up_needed: 是否需要后续跟进
            analysis_model: 使用的分析模型
            analysis_timestamp: 分析时间戳
            
        Returns:
            分析ID
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO conversation_analysis (
                conversation_id, summary, key_topics, extracted_data,
                user_intents, user_concerns, user_sentiment,
                engagement_score, action_items, follow_up_needed,
                analysis_model, analysis_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                conversation_id,
                summary,
                json.dumps(key_topics or []),
                json.dumps(extracted_data or {}),
                json.dumps(user_intents or []),
                json.dumps(user_concerns or []),
                user_sentiment,
                engagement_score,
                json.dumps(action_items or []),
                1 if follow_up_needed else 0,
                analysis_model,
                analysis_timestamp or datetime.now().isoformat()
            ))
            
            conn.commit()
            analysis_id = cursor.lastrowid
            print(f"✅ 对话分析已保存: {analysis_id}")
            return analysis_id
            
        except sqlite3.Error as e:
            print(f"❌ 保存对话分析失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_analysis(self, conversation_id: str) -> Optional[Dict]:
        """
        获取对话分析结果
        
        Args:
            conversation_id: 对话ID
            
        Returns:
            分析结果字典，未找到返回 None
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM conversation_analysis WHERE conversation_id = ?',
                (conversation_id,)
            )
            row = cursor.fetchone()
            
            if row:
                result = dict(row)
                # 解析 JSON 字段
                result['key_topics'] = json.loads(result['key_topics']) if result['key_topics'] else []
                result['extracted_data'] = json.loads(result['extracted_data']) if result['extracted_data'] else {}
                result['user_intents'] = json.loads(result['user_intents']) if result['user_intents'] else []
                result['user_concerns'] = json.loads(result['user_concerns']) if result['user_concerns'] else []
                result['action_items'] = json.loads(result['action_items']) if result['action_items'] else []
                result['follow_up_needed'] = bool(result['follow_up_needed'])
                return result
            return None
            
        finally:
            conn.close()
    
    # ============================================================
    # Memory 和 TODO 操作方法
    # ============================================================
    
    def save_memory(
        self,
        user_id: str,
        conversation_id: str,
        channel: str,
        summary: str,
        insights: Optional[str] = None,
        key_topics: Optional[List[str]] = None,
        extracted_data: Optional[Dict] = None,
        created_at: Optional[str] = None
    ) -> int:
        """
        保存短期记忆（session summary）
        
        Args:
            user_id: 用户ID
            conversation_id: 对话ID
            channel: 对话渠道 (gpt_chat, retell_voice, tavus_video)
            summary: 本次对话总结
            insights: 洞察/发现
            key_topics: 关键话题列表
            extracted_data: 提取的结构化数据
            created_at: 创建时间
            
        Returns:
            memory_id
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO user_memories (
                user_id, conversation_id, channel, summary, insights,
                key_topics, extracted_data, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, conversation_id, channel, summary, insights,
                json.dumps(key_topics or [], ensure_ascii=False),
                json.dumps(extracted_data or {}, ensure_ascii=False),
                created_at or datetime.now().isoformat()
            ))
            
            conn.commit()
            memory_id = cursor.lastrowid
            print(f"✅ 短期记忆已保存: {memory_id}")
            return memory_id
            
        except sqlite3.Error as e:
            print(f"❌ 保存短期记忆失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_recent_memories(self, user_id: str, days: int = 7, limit: int = 10) -> List[Dict]:
        """
        获取用户最近 N 天的记忆
        
        Args:
            user_id: 用户ID
            days: 天数
            limit: 返回数量限制
            
        Returns:
            记忆列表
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            query = '''
            SELECT * FROM user_memories 
            WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
            ORDER BY created_at DESC
            LIMIT ?
            '''
            cursor.execute(query, (user_id, days, limit))
            
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                result = dict(row)
                result['key_topics'] = json.loads(result['key_topics']) if result.get('key_topics') else []
                result['extracted_data'] = json.loads(result['extracted_data']) if result.get('extracted_data') else {}
                results.append(result)
            
            return results
            
        finally:
            conn.close()
    
    def update_long_term_memory(
        self,
        user_id: str,
        preferences: Optional[Dict] = None,
        health_goals: Optional[Dict] = None,
        habits: Optional[Dict] = None,
        dietary_patterns: Optional[Dict] = None,
        exercise_patterns: Optional[Dict] = None,
        stress_patterns: Optional[Dict] = None,
        sleep_patterns: Optional[Dict] = None,
        concerns: Optional[List[str]] = None,
        updated_at: Optional[str] = None
    ) -> None:
        """
        更新长期记忆（upsert）
        
        Args:
            user_id: 用户ID
            preferences: 用户偏好
            health_goals: 健康目标
            habits: 习惯
            dietary_patterns: 饮食模式
            exercise_patterns: 运动模式
            stress_patterns: 压力模式
            sleep_patterns: 睡眠模式
            concerns: 关注事项
            updated_at: 更新时间
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            # 检查是否已存在
            cursor.execute('SELECT id FROM user_long_term_memory WHERE user_id = ?', (user_id,))
            existing = cursor.fetchone()
            
            updated_at = updated_at or datetime.now().isoformat()
            
            if existing:
                # 更新：只更新非 None 的字段
                updates = []
                params = []
                
                if preferences is not None:
                    updates.append('preferences = ?')
                    params.append(json.dumps(preferences, ensure_ascii=False))
                if health_goals is not None:
                    updates.append('health_goals = ?')
                    params.append(json.dumps(health_goals, ensure_ascii=False))
                if habits is not None:
                    updates.append('habits = ?')
                    params.append(json.dumps(habits, ensure_ascii=False))
                if dietary_patterns is not None:
                    updates.append('dietary_patterns = ?')
                    params.append(json.dumps(dietary_patterns, ensure_ascii=False))
                if exercise_patterns is not None:
                    updates.append('exercise_patterns = ?')
                    params.append(json.dumps(exercise_patterns, ensure_ascii=False))
                if stress_patterns is not None:
                    updates.append('stress_patterns = ?')
                    params.append(json.dumps(stress_patterns, ensure_ascii=False))
                if sleep_patterns is not None:
                    updates.append('sleep_patterns = ?')
                    params.append(json.dumps(sleep_patterns, ensure_ascii=False))
                if concerns is not None:
                    updates.append('concerns = ?')
                    params.append(json.dumps(concerns, ensure_ascii=False))
                
                updates.append('updated_at = ?')
                params.append(updated_at)
                params.append(user_id)
                
                if updates:
                    query = f"UPDATE user_long_term_memory SET {', '.join(updates)} WHERE user_id = ?"
                    cursor.execute(query, params)
            else:
                # 插入新记录
                cursor.execute('''
                INSERT INTO user_long_term_memory (
                    user_id, preferences, health_goals, habits,
                    dietary_patterns, exercise_patterns, stress_patterns, sleep_patterns,
                    concerns, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    json.dumps(preferences or {}, ensure_ascii=False),
                    json.dumps(health_goals or {}, ensure_ascii=False),
                    json.dumps(habits or {}, ensure_ascii=False),
                    json.dumps(dietary_patterns or {}, ensure_ascii=False),
                    json.dumps(exercise_patterns or {}, ensure_ascii=False),
                    json.dumps(stress_patterns or {}, ensure_ascii=False),
                    json.dumps(sleep_patterns or {}, ensure_ascii=False),
                    json.dumps(concerns or [], ensure_ascii=False),
                    updated_at,
                    updated_at
                ))
            
            conn.commit()
            print(f"✅ 长期记忆已更新: {user_id}")
            
        except sqlite3.Error as e:
            print(f"❌ 更新长期记忆失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_long_term_memory(self, user_id: str) -> Optional[Dict]:
        """
        获取用户的长期记忆
        
        Args:
            user_id: 用户ID
            
        Returns:
            长期记忆字典，未找到返回 None
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM user_long_term_memory WHERE user_id = ?', (user_id,))
            row = cursor.fetchone()
            
            if row:
                result = dict(row)
                # 解析 JSON 字段
                for field in ['preferences', 'health_goals', 'habits', 'dietary_patterns',
                             'exercise_patterns', 'stress_patterns', 'sleep_patterns', 'concerns']:
                    if result.get(field):
                        result[field] = json.loads(result[field])
                return result
            return None
            
        finally:
            conn.close()
    
    def save_todos(
        self,
        user_id: str,
        conversation_id: str,
        todos: List[Dict],
        week_start: Optional[str] = None,
        created_at: Optional[str] = None
    ) -> List[int]:
        """
        保存 TODO 列表
        
        Args:
            user_id: 用户ID
            conversation_id: 对话ID
            todos: TODO 列表，每个 TODO 是一个 Dict，包含 title, description, category, target_count 等
            week_start: 本周开始日期（YYYY-MM-DD）
            created_at: 创建时间
            
        Returns:
            插入的 todo_id 列表
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            todo_ids = []
            
            for todo in todos:
                cursor.execute('''
                INSERT INTO user_todos (
                    user_id, conversation_id, title, description,
                    category, target_count, current_count, status,
                    week_start, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    conversation_id,
                    todo.get('title', ''),
                    todo.get('description', ''),
                    todo.get('category', 'other'),
                    todo.get('target_count', 1),
                    todo.get('current_count', 0),
                    todo.get('status', 'pending'),
                    week_start or datetime.now().strftime('%Y-%m-%d'),
                    created_at or datetime.now().isoformat()
                ))
                todo_ids.append(cursor.lastrowid)
            
            conn.commit()
            print(f"✅ 已保存 {len(todo_ids)} 个 TODO")
            return todo_ids
            
        except sqlite3.Error as e:
            print(f"❌ 保存 TODO 失败: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_weekly_todos(self, user_id: str, week_start: Optional[str] = None) -> List[Dict]:
        """
        获取用户本周的 TODO
        
        Args:
            user_id: 用户ID
            week_start: 本周开始日期（YYYY-MM-DD），如果为 None 则使用当前周
            
        Returns:
            TODO 列表
        """
        if week_start is None:
            # 计算本周一
            from datetime import datetime, timedelta
            today = datetime.now()
            week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            query = '''
            SELECT * FROM user_todos 
            WHERE user_id = ? AND week_start = ?
            ORDER BY created_at DESC
            '''
            cursor.execute(query, (user_id, week_start))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
            
        finally:
            conn.close()
    
    # ============================================================
    # 统计方法
    # ============================================================
    
    def get_conversation_stats(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """
        获取用户的对话统计
        
        Args:
            user_id: 用户ID
            days: 统计天数
            
        Returns:
            统计数据字典
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            # 总对话数
            cursor.execute('''
            SELECT COUNT(*) as total FROM conversations 
            WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
            ''', (user_id, days))
            total_conversations = cursor.fetchone()['total']
            
            # 按类型统计
            cursor.execute('''
            SELECT conversation_type, COUNT(*) as count FROM conversations 
            WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
            GROUP BY conversation_type
            ''', (user_id, days))
            by_type = {row['conversation_type']: row['count'] for row in cursor.fetchall()}
            
            # 总对话时长
            cursor.execute('''
            SELECT SUM(duration_seconds) as total_duration FROM conversations 
            WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
            AND duration_seconds IS NOT NULL
            ''', (user_id, days))
            total_duration = cursor.fetchone()['total_duration'] or 0
            
            # 需要跟进的对话
            cursor.execute('''
            SELECT COUNT(*) as count FROM conversation_analysis 
            WHERE conversation_id IN (
                SELECT conversation_id FROM conversations WHERE user_id = ?
            ) AND follow_up_needed = 1
            ''', (user_id,))
            follow_up_count = cursor.fetchone()['count']
            
            return {
                'total_conversations': total_conversations,
                'by_type': by_type,
                'total_duration_seconds': total_duration,
                'follow_up_needed': follow_up_count,
                'period_days': days
            }
            
        finally:
            conn.close()


if __name__ == '__main__':
    # 测试示例
    db_path = os.path.join(os.path.dirname(__file__), 'cgm_butler.db')
    manager = ConversationManager(db_path)
    
    # 测试保存 GPT 对话
    print("测试保存 GPT 对话...")
    transcript = [
        {
            "role": "user",
            "content": "我的血糖是多少?",
            "timestamp": datetime.now().isoformat()
        },
        {
            "role": "assistant",
            "content": "你的当前血糖是 114 mg/dL，状态正常。",
            "timestamp": datetime.now().isoformat()
        }
    ]
    
    conv_id = manager.save_gpt_conversation(
        user_id='user_001',
        transcript=transcript,
        conversational_context='用户询问血糖状态',
        started_at=datetime.now().isoformat(),
        status='ended'
    )
    
    # 查询对话
    print(f"\n获取对话信息...")
    conv = manager.get_conversation(conv_id)
    print(f"对话ID: {conv['conversation_id']}")
    print(f"用户: {conv['user_id']}")
    print(f"类型: {conv['conversation_type']}")
    print(f"对话数: {len(conv['transcript'])}")
    
    print("\n✅ 测试完成！")
