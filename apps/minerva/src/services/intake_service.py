"""
Intake Phone Agent Service
业务逻辑层：创建 Web Call，获取用户信息等

这是原 service.py 的简化版本,保持相同的功能
"""

import os
import sys
import logging
import requests
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Retell SDK
try:
    from retell import Retell
except ImportError:
    logging.warning("retell-sdk not installed. Please install: pip install retell-sdk")
    Retell = None

# Import VoiceChatContextService
try:
    from .voice_chat_context_service import get_context_service
    CONTEXT_SERVICE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"VoiceChatContextService not available: {e}")
    CONTEXT_SERVICE_AVAILABLE = False

logger = logging.getLogger(__name__)

# 从环境变量获取配置
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
INTAKE_AGENT_ID = os.getenv("INTAKE_AGENT_ID", "agent_c7d1cb2c279ec45bce38c95067")
INTAKE_LLM_ID = os.getenv("INTAKE_LLM_ID", "llm_e54c307ce74090cdfd06f682523b")
CGM_BACKEND_URL = os.getenv("CGM_BACKEND_URL", "http://localhost:5000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 获取 prompts 目录
PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prompts")
OLIVIA_PROMPT_PATH = os.path.join(PROMPTS_DIR, "olivia_coach_prompt.txt")
BEGIN_MESSAGE_PATH = os.path.join(PROMPTS_DIR, "begin_message.txt")

# OpenAI Client
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    logging.warning("openai package not installed. Please install: pip install openai")
    openai_client = None


def get_retell_client() -> Retell:
    """初始化 Retell 客户端"""
    if not Retell:
        raise RuntimeError("Retell SDK not installed. Please install: pip install retell-sdk")
    
    if not RETELL_API_KEY:
        raise RuntimeError("RETELL_API_KEY environment variable is not set")
    
    return Retell(api_key=RETELL_API_KEY)


async def get_cgm_butler_user_info(user_id: str) -> Dict[str, Any]:
    """从 CGM Butler 数据库获取用户信息"""
    try:
        response = requests.get(
            f"{CGM_BACKEND_URL}/api/user/{user_id}",
            timeout=5
        )
        response.raise_for_status()
        user_data = response.json()
        
        logger.info(f"==== Successfully fetched user info for user_id: {user_id}")
        return user_data
        
    except Exception as e:
        logger.warning(f"==== Failed to fetch CGM Butler user info: {e}")
        return {
            "name": "there",
            "health_goal": "managing your health",
            "conditions": "your health",
            "cgm_device_type": "CGM device",
            "date_of_birth": "1990-01-01"
        }


def calculate_age(date_of_birth: str) -> int:
    """计算年龄"""
    try:
        dob = datetime.strptime(date_of_birth.split('T')[0], "%Y-%m-%d")
        today = datetime.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except Exception as e:
        logger.warning(f"==== Failed to calculate age: {e}")
        return 0


async def create_intake_web_call(
    user_id: str,
    previous_transcript: Optional[list] = None
) -> Dict[str, Any]:
    """创建 CGM Butler App 的 Web Call（支持动态 Context）"""
    try:
        logger.info(f"==== Fetching user info for user_id: {user_id}")
        user_info = await get_cgm_butler_user_info(user_id)
        
        dob = user_info.get('date_of_birth', '1990-01-01')
        age = calculate_age(dob)
        user_name = user_info.get('name', 'there')
        
        # 基础动态变量
        llm_dynamic_variables = {
            "user_name": user_name,
            "user_age": str(age),
            "user_health_goal": user_info.get('health_goal', 'managing your health'),
            "user_conditions": user_info.get('conditions', 'your health'),
            "user_cgm_device": user_info.get('cgm_device_type', 'CGM device'),
        }
        
        # 获取动态 Call Context (Onboarding / Continuation / Follow-up)
        if CONTEXT_SERVICE_AVAILABLE:
            try:
                context_service = get_context_service()
                context_info = context_service.get_call_context(user_id, user_name)
                
                # 添加 call_context 到动态变量
                llm_dynamic_variables["call_context"] = context_info['call_context']
                
                logger.info(f"📞 Call Type: {context_info['call_type']} (Score: {context_info['completion_score']}%)")
            except Exception as ctx_error:
                logger.warning(f"⚠️  Failed to get call context: {ctx_error}. Using default.")
                # 使用默认的 onboarding context
                llm_dynamic_variables["call_context"] = "This is the user's first call. Focus on understanding their concerns and goals."
        else:
            logger.warning("⚠️  VoiceChatContextService not available. Using default context.")
            llm_dynamic_variables["call_context"] = "This is the user's first call. Focus on understanding their concerns and goals."
        
        if previous_transcript:
            llm_dynamic_variables["previous_transcript"] = previous_transcript
            logger.info(f"==== Restoring call with {len(previous_transcript)} previous messages")
        
        logger.info(f"==== Creating web call with agent_id: {INTAKE_AGENT_ID}")
        
        retell = get_retell_client()
        
        metadata = {
            "user_id": user_id,
            "call_type": "cgm_butler_app",
            "user_name": user_name
        }
        
        web_call_response = retell.call.create_web_call(
            agent_id=INTAKE_AGENT_ID,
            metadata=metadata,
            retell_llm_dynamic_variables=llm_dynamic_variables
        )
        
        if hasattr(web_call_response, 'access_token') and hasattr(web_call_response, 'call_id'):
            access_token = web_call_response.access_token
            call_id = web_call_response.call_id
        else:
            access_token = web_call_response.get('access_token') if isinstance(web_call_response, dict) else None
            call_id = web_call_response.get('call_id') if isinstance(web_call_response, dict) else None
        
        if not access_token or not call_id:
            raise RuntimeError("Failed to extract access_token or call_id from Retell response")
        
        logger.info(f"==== Web call created successfully: {call_id}")
        
        return {
            "status_code": 200,
            "content": {
                "access_token": access_token,
                "call_id": call_id,
                "agent_id": INTAKE_AGENT_ID,
                "user_name": user_name,
                "message": "Web call created successfully"
            }
        }
        
    except Exception as e:
        logger.error(f"==== Failed to create web call: {e}", exc_info=True)
        return {
            "status_code": 500,
            "content": {
                "message": f"Failed to create web call: {str(e)}"
            }
        }


async def generate_call_summary(transcript: str) -> Dict[str, Any]:
    """使用 OpenAI GPT-4 生成通话摘要"""
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized. Please check OPENAI_API_KEY")

        prompt = f"""Based on the following conversation, extract a detailed summary.

Conversation:
{transcript}

Please provide a JSON response with key information extracted."""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health data extraction assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        import json
        summary = json.loads(response.choices[0].message.content)
        return summary

    except Exception as e:
        logger.error(f"==== Failed to generate summary: {e}", exc_info=True)
        raise


async def analyze_goal_achievement(user_id: str) -> Dict[str, Any]:
    """分析目标达成情况"""
    try:
        # 简化版本,返回基础分析
        return {
            "goals": [],
            "message": "Goal analysis feature"
        }
    except Exception as e:
        logger.error(f"==== Failed to analyze goals: {e}", exc_info=True)
        raise


def load_prompt_from_file(file_path: str) -> str:
    """从本地文件加载 prompt"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            prompt_content = f.read()
        logger.info(f"==== Successfully loaded prompt from {file_path}")
        return prompt_content
    except FileNotFoundError:
        logger.error(f"==== Prompt file not found: {file_path}")
        raise
    except Exception as e:
        logger.error(f"==== Failed to load prompt: {e}", exc_info=True)
        raise


async def update_llm_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    """更新 Retell LLM 设置"""
    try:
        llm_id = settings.get('llm_id', INTAKE_LLM_ID)
        prompt_path = settings.get('prompt_path', OLIVIA_PROMPT_PATH)
        
        general_prompt = load_prompt_from_file(prompt_path)
        
        retell = get_retell_client()
        
        update_params = {"general_prompt": general_prompt}
        
        if settings.get('begin_message'):
            update_params["begin_message"] = settings['begin_message']
        
        response = retell.llm.update(llm_id=llm_id, **update_params)
        
        logger.info(f"==== LLM settings updated successfully for llm_id: {llm_id}")
        
        return {
            "status": "success",
            "message": "LLM settings updated successfully",
            "llm_id": llm_id
        }
        
    except Exception as e:
        logger.error(f"==== Failed to update LLM settings: {e}", exc_info=True)
        raise

