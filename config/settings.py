"""
Centralized Configuration Management

Usage:
    from config.settings import settings
    
    db_path = settings.DB_PATH
    api_key = settings.OPENAI_API_KEY
"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Determine project root
PROJECT_ROOT = Path(__file__).parent.parent

# Load environment variables from .env file
env_file = os.getenv('ENV_FILE', '.env')
env_path = PROJECT_ROOT / env_file

if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from: {env_path}")
else:
    print(f"⚠️  Environment file not found: {env_path}")
    print(f"   Using system environment variables only")


class Settings:
    """Application Settings"""
    
    # =========================================================================
    # Database Configuration
    # =========================================================================
    
    DB_PATH: str = os.getenv(
        'CGM_DB_PATH',
        str(PROJECT_ROOT / 'storage' / 'databases' / 'cgm_butler.db')
    )
    
    # =========================================================================
    # OpenAI Configuration
    # =========================================================================
    
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL: str = os.getenv('OPENAI_MODEL', 'gpt-4o')
    
    # =========================================================================
    # Tavus Configuration (Video Chat)
    # =========================================================================
    
    TAVUS_API_KEY: str = os.getenv('TAVUS_API_KEY', '')
    TAVUS_PERSONA_ID: str = os.getenv('TAVUS_PERSONA_ID', '')
    TAVUS_REPLICA_ID: str = os.getenv('TAVUS_REPLICA_ID', '')
    
    # =========================================================================
    # Retell Configuration (Voice Chat)
    # =========================================================================
    
    RETELL_API_KEY: str = os.getenv('RETELL_API_KEY', '')
    INTAKE_AGENT_ID: str = os.getenv('INTAKE_AGENT_ID', 'agent_c7d1cb2c279ec45bce38c95067')
    INTAKE_LLM_ID: str = os.getenv('INTAKE_LLM_ID', 'llm_e54c307ce74090cdfd06f682523b')
    
    # =========================================================================
    # Flask Backend Configuration
    # =========================================================================
    
    FLASK_ENV: str = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG: bool = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
    FLASK_PORT: int = int(os.getenv('FLASK_PORT', '5000'))
    
    # =========================================================================
    # Minerva Service Configuration
    # =========================================================================
    
    MINERVA_PORT: int = int(os.getenv('MINERVA_PORT', '8000'))
    CGM_BACKEND_URL: str = os.getenv('CGM_BACKEND_URL', 'http://localhost:5000')
    
    # =========================================================================
    # CORS Configuration
    # =========================================================================
    
    CORS_ORIGINS: list = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:3000'
    ).split(',')
    
    # =========================================================================
    # Logging Configuration
    # =========================================================================
    
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE: str = os.getenv('LOG_FILE', str(PROJECT_ROOT / 'storage' / 'logs' / 'app.log'))
    
    # =========================================================================
    # Paths
    # =========================================================================
    
    PROJECT_ROOT: Path = PROJECT_ROOT
    STORAGE_DIR: Path = PROJECT_ROOT / 'storage'
    DATABASE_DIR: Path = STORAGE_DIR / 'databases'
    LOGS_DIR: Path = STORAGE_DIR / 'logs'
    UPLOADS_DIR: Path = STORAGE_DIR / 'uploads'
    
    # =========================================================================
    # Validation
    # =========================================================================
    
    def validate(self) -> tuple[bool, list[str]]:
        """
        Validate required settings.
        
        Returns:
            (is_valid, missing_keys)
        """
        required_keys = [
            ('OPENAI_API_KEY', self.OPENAI_API_KEY),
            ('TAVUS_API_KEY', self.TAVUS_API_KEY),
            ('RETELL_API_KEY', self.RETELL_API_KEY),
        ]
        
        missing = [key for key, value in required_keys if not value]
        
        return (len(missing) == 0, missing)
    
    def __repr__(self) -> str:
        """String representation (masks sensitive data)."""
        return (
            f"Settings(\n"
            f"  DB_PATH={self.DB_PATH}\n"
            f"  OPENAI_API_KEY={'***' if self.OPENAI_API_KEY else 'NOT SET'}\n"
            f"  TAVUS_API_KEY={'***' if self.TAVUS_API_KEY else 'NOT SET'}\n"
            f"  RETELL_API_KEY={'***' if self.RETELL_API_KEY else 'NOT SET'}\n"
            f"  FLASK_ENV={self.FLASK_ENV}\n"
            f"  FLASK_PORT={self.FLASK_PORT}\n"
            f"  MINERVA_PORT={self.MINERVA_PORT}\n"
            f")"
        )


# Global settings instance
settings = Settings()


# Validation on import
if __name__ != '__main__':
    is_valid, missing = settings.validate()
    if not is_valid:
        print(f"⚠️  Missing required environment variables: {', '.join(missing)}")
        print(f"   Please check your .env file or environment variables")


if __name__ == '__main__':
    # Print settings when run directly
    print("=" * 80)
    print("CGM Butler - Configuration")
    print("=" * 80)
    print(settings)
    print("=" * 80)
    
    is_valid, missing = settings.validate()
    if is_valid:
        print("✅ All required settings are configured")
    else:
        print(f"❌ Missing required settings: {', '.join(missing)}")

