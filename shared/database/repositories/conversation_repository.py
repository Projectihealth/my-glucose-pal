"""
Conversation Repository

Handles all conversation-related database operations.
This is a refactored version of the original ConversationManager.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

from .base import BaseRepository


class ConversationRepository(BaseRepository):
    """Repository for conversation operations."""
    
    # ============================================================
    # Save Methods
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
        """Save Tavus video conversation."""
        conversation_id = str(uuid.uuid4())
        
        self.execute('''
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
            json.dumps(transcript, ensure_ascii=False),
            conversational_context, custom_greeting,
            json.dumps(properties or {}),
            json.dumps(metadata or {})
        ))
        
        self.commit()
        return conversation_id
    
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
        """Save Retell voice conversation."""
        conversation_id = str(uuid.uuid4())
        
        self.execute('''
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
            'ended'
        ))
        
        self.commit()
        return conversation_id
    
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
        """Save GPT text conversation."""
        conversation_id = str(uuid.uuid4())
        
        self.execute('''
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
            json.dumps(transcript, ensure_ascii=False),
            conversational_context,
            json.dumps(properties or {}),
            json.dumps(metadata or {})
        ))
        
        self.commit()
        return conversation_id
    
    # ============================================================
    # Query Methods
    # ============================================================
    
    def get_by_id(self, conversation_id: str) -> Optional[Dict]:
        """Get conversation by ID."""
        row = self.fetchone(
            'SELECT * FROM conversations WHERE conversation_id = ?',
            (conversation_id,)
        )
        
        if row:
            return self._parse_conversation(row)
        return None
    
    def get_user_conversations(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        conversation_type: Optional[str] = None
    ) -> List[Dict]:
        """Get user's conversations."""
        if conversation_type:
            query = '''
            SELECT * FROM conversations 
            WHERE user_id = ? AND conversation_type = ?
            ORDER BY started_at DESC
            LIMIT ? OFFSET ?
            '''
            rows = self.fetchall(query, (user_id, conversation_type, limit, offset))
        else:
            query = '''
            SELECT * FROM conversations 
            WHERE user_id = ?
            ORDER BY started_at DESC
            LIMIT ? OFFSET ?
            '''
            rows = self.fetchall(query, (user_id, limit, offset))
        
        return [self._parse_conversation(row) for row in rows]
    
    def get_recent_conversations(
        self,
        user_id: str,
        days: int = 7,
        limit: int = 10
    ) -> List[Dict]:
        """Get user's recent conversations."""
        query = '''
        SELECT * FROM conversations 
        WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
        ORDER BY started_at DESC
        LIMIT ?
        '''
        rows = self.fetchall(query, (user_id, days, limit))
        return [self._parse_conversation(row) for row in rows]
    
    def get_stats(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """Get conversation statistics."""
        # Total conversations
        total = self.fetchone('''
        SELECT COUNT(*) as total FROM conversations 
        WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
        ''', (user_id, days))
        
        # By type
        by_type_rows = self.fetchall('''
        SELECT conversation_type, COUNT(*) as count FROM conversations 
        WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
        GROUP BY conversation_type
        ''', (user_id, days))
        
        # Total duration
        duration = self.fetchone('''
        SELECT SUM(duration_seconds) as total_duration FROM conversations 
        WHERE user_id = ? AND started_at >= datetime('now', '-' || ? || ' days')
        AND duration_seconds IS NOT NULL
        ''', (user_id, days))
        
        return {
            'total_conversations': total['total'] if total else 0,
            'by_type': {row['conversation_type']: row['count'] for row in by_type_rows},
            'total_duration_seconds': duration['total_duration'] if duration and duration['total_duration'] else 0,
            'period_days': days
        }
    
    # ============================================================
    # Helper Methods
    # ============================================================
    
    def _parse_conversation(self, row: Dict) -> Dict:
        """Parse conversation row with JSON fields."""
        conv_type = row.get('conversation_type')
        
        # Voice chat transcript is plain text
        if conv_type == 'retell_voice':
            if row.get('transcript_object'):
                row['transcript_object'] = json.loads(row['transcript_object'])
            if row.get('call_cost'):
                row['call_cost'] = json.loads(row['call_cost'])
        else:
            # Video/text chat transcript is JSON
            if row.get('transcript'):
                row['transcript'] = json.loads(row['transcript'])
        
        if row.get('properties'):
            row['properties'] = json.loads(row['properties'])
        if row.get('metadata'):
            row['metadata'] = json.loads(row['metadata'])
        
        return row


# Backward compatibility: ConversationManager alias
ConversationManager = ConversationRepository

