"""
Configuration for Digital Avatar Module
"""

import os
from typing import Optional

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load from project root directory
    import sys
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_file = os.path.join(project_root, '.env')
    if os.path.exists(env_file):
        load_dotenv(env_file)
except ImportError:
    # python-dotenv not installed, will use environment variables directly
    pass

# API Keys - 仅从环境变量读取，不要硬编码敏感信息！
TAVUS_API_KEY = os.getenv('TAVUS_API_KEY', '')
TAVUS_PERSONA_ID = os.getenv('TAVUS_PERSONA_ID', 'p176d7357a2d')
TAVUS_REPLICA_ID = os.getenv('TAVUS_REPLICA_ID', 'r9fa0878977a')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')


class AvatarConfig:
    """Configuration for digital avatar."""
    
    # Tavus API Configuration
    TAVUS_API_KEY: str = TAVUS_API_KEY
    TAVUS_PERSONA_ID: str = TAVUS_PERSONA_ID
    TAVUS_REPLICA_ID: str = TAVUS_REPLICA_ID
    
    # OpenAI API Configuration
    OPENAI_API_KEY: str = OPENAI_API_KEY
    OPENAI_MODEL: str = "gpt-4o"
    
    # Database Configuration
    DB_PATH: Optional[str] = None  # Will use default if None
    
    # Conversation Settings
    DEFAULT_LANGUAGE: str = 'en'
    MAX_CONVERSATION_DURATION: int = 3600  # seconds
    
    # Avatar Personality
    AVATAR_CONTEXT: str = (
        "You are a friendly and knowledgeable CGM (Continuous Glucose Monitoring) health assistant. "
        "Your name is CGM Butler. You help users understand their glucose data, identify patterns, "
        "and provide personalized recommendations. You are empathetic, supportive, and always "
        "encourage healthy behaviors. When discussing glucose levels, always provide context "
        "and actionable advice. Use emojis appropriately to make the conversation friendly."
    )
    
    # Function Call Settings
    ENABLE_FUNCTION_CALLS: bool = True
    MAX_FUNCTION_CALLS_PER_MESSAGE: int = 3
    
    @classmethod
    def validate(cls) -> bool:
        """
        Validate configuration.
        
        Returns:
            True if configuration is valid
        """
        if not cls.TAVUS_API_KEY:
            raise ValueError(
                "TAVUS_API_KEY is not set. "
                "Please set the TAVUS_API_KEY environment variable."
            )
        
        if not cls.TAVUS_PERSONA_ID:
            raise ValueError("TAVUS_PERSONA_ID is required")
        
        return True
    
    @classmethod
    def get_conversation_config(cls, user_name: str = "User") -> dict:
        """
        Get default conversation configuration.
        
        Args:
            user_name: User's name for personalization
        
        Returns:
            Conversation configuration dictionary
        """
        return {
            "context": cls.AVATAR_CONTEXT.replace("the user", user_name),
            "language": cls.DEFAULT_LANGUAGE,
            "enable_function_calls": cls.ENABLE_FUNCTION_CALLS
        }


# Environment variable template
ENV_TEMPLATE = """
# Digital Avatar Configuration
# Copy this to your .env file and fill in the values

# Tavus API Key (required)
TAVUS_API_KEY=9b6138127c1946fb98a5ad3b5c86300b

# Tavus Persona ID (optional, defaults to p176d7357a2d)
TAVUS_PERSONA_ID=p176d7357a2d

# OpenAI API Key (required for GPT features)
# 获取方法: https://platform.openai.com/account/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database Path (optional, uses default if not set)
# CGM_DB_PATH=/path/to/cgm_butler.db
"""


if __name__ == '__main__':
    # Print configuration template
    print(ENV_TEMPLATE)
    
    # Try to validate configuration
    try:
        AvatarConfig.validate()
        print("\n✅ Configuration is valid")
    except ValueError as e:
        print(f"\n❌ Configuration error: {e}")
        print("\nPlease set the required environment variables:")
        print(ENV_TEMPLATE)

