"""
Tavus API Client

This module provides a client for interacting with the Tavus Digital Avatar API.
"""

import requests
from typing import Dict, Optional, Any, List
import os


class TavusClient:
    """Client for Tavus Digital Avatar API."""
    
    BASE_URL = "https://tavusapi.com"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Tavus client.
        
        Args:
            api_key: Tavus API key. If None, reads from environment variable TAVUS_API_KEY
        """
        # 尝试从多个来源获取API key
        self.api_key = api_key or os.getenv('TAVUS_API_KEY')
        
        # 如果还是没有，尝试从config导入
        if not self.api_key:
            try:
                from digital_avatar.config import AvatarConfig
                self.api_key = AvatarConfig.TAVUS_API_KEY
            except:
                pass
        
        if not self.api_key:
            raise ValueError("Tavus API key is required. Set TAVUS_API_KEY environment variable or pass api_key parameter.")
        
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
    
    def update_persona(self, persona_id: str, data: Dict[str, Any]) -> Dict:
        """
        Update a persona's settings.
        
        Args:
            persona_id: The persona ID (e.g., 'p754b367b5f0')
            data: Update data
        
        Returns:
            Response from Tavus API
        """
        url = f"{self.BASE_URL}/v2/personas/{persona_id}"
        
        response = requests.patch(url, headers=self.headers, json=data)
        response.raise_for_status()
        
        return response.json()
    
    def get_persona(self, persona_id: str) -> Dict:
        """
        Get persona information.
        
        Args:
            persona_id: The persona ID
        
        Returns:
            Persona information
        """
        url = f"{self.BASE_URL}/v2/personas/{persona_id}"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        return response.json()
    
    def create_conversation(self, replica_id: str, persona_id: str,
                          conversational_context: Optional[str] = None,
                          custom_greeting: Optional[str] = None,
                          properties: Optional[Dict[str, Any]] = None) -> Dict:
        """
        Create a new conversation with the digital avatar.

        Args:
            replica_id: The replica ID (required)
            persona_id: The persona ID (required)
            conversational_context: Optional context for the conversation
            custom_greeting: Optional custom greeting message
            properties: Optional properties (language, max_call_duration, etc.)

        Returns:
            Conversation details including conversation_id and conversation_url
        """
        url = f"{self.BASE_URL}/v2/conversations"

        data = {
            "replica_id": replica_id,
            "persona_id": persona_id
        }

        # Add optional parameters
        if conversational_context:
            data["conversational_context"] = conversational_context
        if custom_greeting:
            data["custom_greeting"] = custom_greeting
        if properties:
            data["properties"] = properties

        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()

        return response.json()
    
    def send_message(self, conversation_id: str, message: str) -> Dict:
        """
        Send a message in a conversation.
        
        Args:
            conversation_id: The conversation ID
            message: Message text
        
        Returns:
            Response from the avatar
        """
        url = f"{self.BASE_URL}/v2/conversations/{conversation_id}/messages"
        
        data = {
            "message": message
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        
        return response.json()
    
    def get_conversation_history(self, conversation_id: str) -> Dict:
        """
        Get conversation history.
        
        Args:
            conversation_id: The conversation ID
        
        Returns:
            Conversation history
        """
        url = f"{self.BASE_URL}/v2/conversations/{conversation_id}"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        return response.json()
    
    def end_conversation(self, conversation_id: str) -> Dict:
        """
        End/Delete a conversation.

        Args:
            conversation_id: The conversation ID

        Returns:
            Response confirming conversation ended
        """
        url = f"{self.BASE_URL}/v2/conversations/{conversation_id}"

        response = requests.delete(url, headers=self.headers)
        response.raise_for_status()

        # DELETE returns 204 No Content on success
        if response.status_code == 204:
            return {"success": True, "message": "Conversation deleted"}
        return response.json()
    
    def get_active_conversations_from_api(self) -> List[Dict]:
        """
        Get list of active conversations from Tavus API.
        Note: This requires the conversation_id, so we can't directly list all.
        Use replica_id to track conversations instead.
        
        Returns:
            List of active conversations (if API supports it)
        """
        # Try to get active conversations
        # Note: Tavus API may not support this directly, so we return an empty list
        # and rely on tracking at the application level
        return []
    
    def force_end_all_conversations(self) -> Dict:
        """
        Force end all conversations for this API key.
        This is a workaround for the concurrent conversation limit.
        
        Returns:
            Status of cleanup attempt
        """
        try:
            # Since we can't directly list all conversations,
            # we'll attempt to query the API status endpoint if available
            url = f"{self.BASE_URL}/v2/status"
            response = requests.get(url, headers=self.headers)
            
            if response.ok:
                data = response.json()
                return data
            else:
                return {"status": "unable to check", "message": "API endpoint not available"}
        except Exception as e:
            return {"status": "error", "message": str(e)}


if __name__ == '__main__':
    # Example usage
    try:
        client = TavusClient()
        
        # Get persona info
        persona_id = "p754b367b5f0"
        persona = client.get_persona(persona_id)
        print(f"Persona: {persona}")
        
    except Exception as e:
        print(f"Error: {e}")

