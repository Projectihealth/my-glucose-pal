"""
Conversation Manager for Digital Avatar

This module manages conversations between users and the digital avatar,
integrating CGM data and pattern information.
"""

import json
from typing import Dict, List, Optional, Any
from datetime import datetime

from .tavus_client import TavusClient
from .cgm_tools import CGMTools, FUNCTION_DEFINITIONS
from .prompt_loader import (
    build_conversational_context,
    build_custom_greeting,
)


class ConversationManager:
    """Manages conversations with the digital avatar."""
    
    def __init__(self, tavus_api_key: Optional[str] = None, persona_id: str = "p754b367b5f0"):
        """
        Initialize conversation manager.
        
        Args:
            tavus_api_key: Tavus API key
            persona_id: Digital avatar persona ID
        """
        self.tavus_client = TavusClient(api_key=tavus_api_key)
        self.cgm_tools = CGMTools()
        self.persona_id = persona_id
        self.active_conversations = {}  # conversation_id -> user_id mapping
    
    def start_conversation(self, user_id: str, config: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Start a new conversation with the digital avatar.
        
        Args:
            user_id: User identifier
            config: Optional conversation configuration
        
        Returns:
            Conversation details including conversation_id
        """
        # Get user info to personalize the conversation
        user_info = self.cgm_tools.get_user_info(user_id)

        # Build conversational context from local prompt files + user info
        conversational_context = build_conversational_context(
            user_id=user_id,
            user_name=user_info.get("name", "User"),
            health_goal=user_info.get("health_goal", "Manage glucose levels"),
            conditions=user_info.get("conditions", "Not specified"),
        )

        # Build custom greeting
        custom_greeting = build_custom_greeting(user_info.get("name", "there"))

        # Default configuration for Tavus client
        default_config = {
            "context": conversational_context,
            "tools": FUNCTION_DEFINITIONS,
            "language": "en",
            "custom_greeting": custom_greeting,
        }

        # Merge with custom config
        if config:
            default_config.update(config)

        # Create conversation via Tavus API
        conversation = self.tavus_client.create_conversation(
            persona_id=self.persona_id,
            config=default_config
        )
        
        # Store conversation mapping
        conversation_id = conversation.get('conversation_id')
        self.active_conversations[conversation_id] = user_id
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "message": "Conversation started successfully",
            "conversation_details": conversation
        }
    
    def send_message(self, conversation_id: str, message: str) -> Dict[str, Any]:
        """
        Send a message in a conversation.
        
        Args:
            conversation_id: The conversation ID
            message: User's message
        
        Returns:
            Avatar's response
        """
        user_id = self.active_conversations.get(conversation_id)
        if not user_id:
            return {
                "success": False,
                "message": "Conversation not found or not active"
            }
        
        # Send message to Tavus
        response = self.tavus_client.send_message(conversation_id, message)
        
        # Check if avatar wants to call a function
        if response.get('function_call'):
            function_result = self._handle_function_call(
                user_id,
                response['function_call']
            )
            
            # Send function result back to avatar
            # (This depends on Tavus API's function calling mechanism)
            # You may need to adjust based on actual Tavus API behavior
            response['function_result'] = function_result
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "user_message": message,
            "avatar_response": response.get('message', ''),
            "function_call": response.get('function_call'),
            "function_result": response.get('function_result'),
            "timestamp": datetime.now().isoformat()
        }
    
    def _handle_function_call(self, user_id: str, function_call: Dict) -> Any:
        """
        Handle function calls from the avatar.
        
        Args:
            user_id: User identifier
            function_call: Function call details from avatar
        
        Returns:
            Function execution result
        """
        function_name = function_call.get('name')
        arguments = function_call.get('arguments', {})
        
        # Ensure user_id is in arguments
        if 'user_id' not in arguments:
            arguments['user_id'] = user_id
        
        # Map function names to CGMTools methods
        function_map = {
            'get_latest_glucose': self.cgm_tools.get_latest_glucose,
            'get_glucose_statistics': self.cgm_tools.get_glucose_statistics,
            'get_recent_patterns': self.cgm_tools.get_recent_patterns,
            'get_pattern_actions': self.cgm_tools.get_pattern_actions,
            'get_user_info': self.cgm_tools.get_user_info
        }
        
        if function_name in function_map:
            try:
                result = function_map[function_name](**arguments)
                return result
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": f"Error executing {function_name}: {str(e)}"
                }
        else:
            return {
                "success": False,
                "message": f"Unknown function: {function_name}"
            }
    
    def get_conversation_history(self, conversation_id: str) -> Dict[str, Any]:
        """
        Get conversation history.
        
        Args:
            conversation_id: The conversation ID
        
        Returns:
            Conversation history
        """
        history = self.tavus_client.get_conversation_history(conversation_id)
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "history": history
        }
    
    def end_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """
        End a conversation.
        
        Args:
            conversation_id: The conversation ID
        
        Returns:
            Confirmation
        """
        result = self.tavus_client.end_conversation(conversation_id)
        
        # Remove from active conversations
        if conversation_id in self.active_conversations:
            del self.active_conversations[conversation_id]
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "message": "Conversation ended successfully",
            "result": result
        }
    
    def get_active_conversations(self) -> List[Dict[str, str]]:
        """
        Get list of active conversations.
        
        Returns:
            List of active conversations
        """
        return [
            {
                "conversation_id": conv_id,
                "user_id": user_id
            }
            for conv_id, user_id in self.active_conversations.items()
        ]


# Example usage for testing
if __name__ == '__main__':
    import os
    
    # Set your Tavus API key
    # os.environ['TAVUS_API_KEY'] = 'your-api-key-here'
    
    try:
        manager = ConversationManager()
        
        # Start a conversation
        user_id = 'user_001'
        conversation = manager.start_conversation(user_id)
        print(f"Started conversation: {conversation}")
        
        # Send a message
        conv_id = conversation['conversation_id']
        response = manager.send_message(
            conv_id,
            "What's my current glucose level?"
        )
        print(f"\nResponse: {response}")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Set TAVUS_API_KEY environment variable to test with real API")


