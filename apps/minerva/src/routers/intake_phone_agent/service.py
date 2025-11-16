"""
Intake Phone Agent Service
业务逻辑层：创建 Web Call，获取用户信息等
"""

import os
import logging
import requests
from typing import Dict, Any, Optional
from datetime import datetime

# Retell SDK
try:
    from retell import Retell
except ImportError:
    logging.warning("retell-sdk not installed. Please install: pip install retell-sdk")
    Retell = None

logger = logging.getLogger(__name__)

# 从环境变量获取配置
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
INTAKE_AGENT_ID = os.getenv("INTAKE_AGENT_ID", "agent_c7d1cb2c279ec45bce38c95067")
INTAKE_LLM_ID = os.getenv("INTAKE_LLM_ID", "llm_e54c307ce74090cdfd06f682523b")
CGM_BACKEND_URL = os.getenv("CGM_BACKEND_URL", "http://localhost:5000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 获取当前文件所在目录
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPTS_DIR = os.path.join(CURRENT_DIR, "prompts")
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
    """
    从 CGM Butler 数据库获取用户信息
    
    Args:
        user_id: CGM Butler 用户 ID
    
    Returns:
        用户信息字典，包含 name, health_goal, conditions, cgm_device_type, date_of_birth 等
    """
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
        # 返回默认值
        return {
            "name": "there",
            "health_goal": "managing your health",
            "conditions": "your health",
            "cgm_device_type": "CGM device",
            "date_of_birth": "1990-01-01"
        }


def calculate_age(date_of_birth: str) -> int:
    """
    计算年龄
    
    Args:
        date_of_birth: 出生日期字符串 (格式: YYYY-MM-DD)
    
    Returns:
        年龄（整数）
    """
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
    """
    创建 CGM Butler App 的 Web Call（简化版）
    
    流程：
    1. 从 CGM Butler 数据库获取用户信息
    2. 构建 Retell 动态变量
    3. 创建 Web Call
    
    Args:
        user_id: CGM Butler 用户 ID（必需）
        previous_transcript: 历史对话记录（可选，用于恢复中断的通话）
    
    Returns:
        {
            "status_code": 200,
            "content": {
                "access_token": "...",
                "call_id": "...",
                "agent_id": "...",
                "message": "Web call created successfully"
            }
        }
    """
    try:
        # 步骤 1: 获取用户信息（从 CGM Butler 数据库）
        logger.info(f"==== Fetching user info for user_id: {user_id}")
        user_info = await get_cgm_butler_user_info(user_id)
        
        # 步骤 2: 计算年龄
        dob = user_info.get('date_of_birth', '1990-01-01')
        age = calculate_age(dob)
        
        # 步骤 3: 构建 Retell 动态变量（简洁）
        llm_dynamic_variables = {
            "user_name": user_info.get('name', 'there'),
            "user_age": str(age),
            "user_health_goal": user_info.get('health_goal', 'managing your health'),
            "user_conditions": user_info.get('conditions', 'your health'),
            "user_cgm_device": user_info.get('cgm_device_type', 'CGM device'),
        }
        
        # 步骤 4: 添加历史对话（如果是恢复通话）
        if previous_transcript:
            llm_dynamic_variables["previous_transcript"] = previous_transcript
            logger.info(f"==== Restoring call with {len(previous_transcript)} previous messages")
        
        # 步骤 5: 创建 Web Call（直接调用 Retell API）
        logger.info(f"==== Creating web call with agent_id: {INTAKE_AGENT_ID}")
        
        retell = get_retell_client()
        
        metadata = {
            "user_id": user_id,
            "call_type": "cgm_butler_app",
            "user_name": user_info.get('name', '')
        }
        
        web_call_response = retell.call.create_web_call(
            agent_id=INTAKE_AGENT_ID,
            metadata=metadata,
            retell_llm_dynamic_variables=llm_dynamic_variables
        )
        
        # 提取 access_token 和 call_id
        if hasattr(web_call_response, 'access_token') and hasattr(web_call_response, 'call_id'):
            access_token = web_call_response.access_token
            call_id = web_call_response.call_id
        else:
            # 如果返回的是字典格式
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
                "user_name": user_info.get('name', 'there'),
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


async def generate_call_summary(call_id: str, transcript: list) -> Dict[str, Any]:
    """
    使用 OpenAI GPT-4 生成通话摘要

    Args:
        call_id: 通话ID
        transcript: 通话记录列表

    Returns:
        摘要对象
    """
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized. Please check OPENAI_API_KEY")

        # 构建对话历史
        conversation_text = "\n".join([
            f"{msg.get('role', 'unknown').upper()}: {msg.get('content', '')}"
            for msg in transcript
            if msg.get('content')
        ])

        # 调用 GPT-4 生成摘要
        prompt = f"""Based on the following conversation between Olivia (health assistant) and the user, extract a detailed summary of the user's daily activities.

Conversation:
{conversation_text}

Please provide a JSON response with the following structure:
{{
  "data_quality": "sufficient" or "insufficient",
  "meals": {{
    "breakfast": "description or 'Not mentioned'",
    "lunch": "description or 'Not mentioned'",
    "dinner": "description or 'Not mentioned'",
    "snacks": "description or 'Not mentioned'"
  }},
  "exercise": "description or 'Not mentioned'",
  "sleep": "sleep duration and quality or 'Not mentioned'",
  "beverages": "description of drinks consumed or 'Not mentioned'",
  "lifestyle": {{
    "smoking": "status",
    "alcohol": "consumption pattern",
    "fast_food": "frequency"
  }},
  "mental_health": "description or 'Not mentioned'",
  "additional_notes": "any other relevant information"
}}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health data extraction assistant. Extract information from health conversations and provide structured JSON responses."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        summary_data = response.choices[0].message.content
        import json
        summary = json.loads(summary_data)

        logger.info(f"==== Generated summary for call_id: {call_id}")
        return summary

    except Exception as e:
        logger.error(f"==== Failed to generate summary: {e}", exc_info=True)
        raise


async def analyze_goal_achievement(call_id: str, transcript: list, patient_id: str, patient_name: str) -> Dict[str, Any]:
    """
    使用 OpenAI GPT-4 分析目标达成情况

    Args:
        call_id: 通话ID
        transcript: 通话记录列表
        patient_id: 患者ID
        patient_name: 患者姓名

    Returns:
        目标分析对象，包含 goals 数组
    """
    try:
        if not openai_client:
            raise RuntimeError("OpenAI client not initialized. Please check OPENAI_API_KEY")

        # 获取用户的健康目标
        user_info = await get_cgm_butler_user_info(patient_id)
        health_goal = user_info.get('health_goal', 'Manage glucose levels')

        # 构建对话历史
        conversation_text = "\n".join([
            f"{msg.get('role', 'unknown').upper()}: {msg.get('content', '')}"
            for msg in transcript
            if msg.get('content')
        ])

        # 调用 GPT-4 分析目标
        prompt = f"""Based on the following conversation, analyze how well the patient is achieving their health goals.

Patient Name: {patient_name}
Health Goal: {health_goal}

Conversation:
{conversation_text}

Please provide a JSON response with the following structure:
{{
  "goals": [
    {{
      "id": 1,
      "title": "Goal description",
      "status": "ACHIEVED" or "IN PROGRESS" or "NOT STARTED",
      "currentBehavior": "Description of current behavior (optional)",
      "recommendation": "Specific recommendation"
    }}
  ]
}}

Identify 2-4 specific, actionable health goals based on the conversation. Each goal should have a clear status and recommendation."""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a health goal analysis assistant. Analyze health conversations and provide goal achievement assessments with actionable recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        analysis_data = response.choices[0].message.content
        import json
        analysis = json.loads(analysis_data)

        logger.info(f"==== Generated goal analysis for call_id: {call_id}")
        return analysis

    except Exception as e:
        logger.error(f"==== Failed to generate goal analysis: {e}", exc_info=True)
        raise


def load_prompt_from_file(file_path: str = OLIVIA_PROMPT_PATH) -> str:
    """
    从本地文件加载 prompt

    Args:
        file_path: prompt 文件路径

    Returns:
        prompt 内容字符串
    """
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


async def update_llm_settings(
    llm_id: str = INTAKE_LLM_ID,
    prompt_path: str = OLIVIA_PROMPT_PATH,
    begin_message: Optional[str] = None,
    use_default_begin_message: bool = True
) -> Dict[str, Any]:
    """
    更新 Retell LLM 的 general_prompt 和 begin_message

    Args:
        llm_id: LLM ID (默认使用环境变量中的 INTAKE_LLM_ID)
        prompt_path: prompt 文件路径
        begin_message: 开场白（可选，如果提供则使用这个，否则使用默认文件）
        use_default_begin_message: 是否使用默认的 begin_message 文件（默认 True）

    Returns:
        {
            "status": "success",
            "message": "LLM settings updated successfully",
            "llm_id": "llm_xxx"
        }
    """
    try:
        # 1. 加载 prompt
        logger.info(f"==== Loading prompt from {prompt_path}")
        general_prompt = load_prompt_from_file(prompt_path)

        # 2. 获取 Retell 客户端
        retell = get_retell_client()

        # 3. 准备更新参数
        update_params = {
            "general_prompt": general_prompt
        }

        # 4. 处理 begin_message
        if begin_message:
            # 如果提供了自定义 begin_message，使用它
            update_params["begin_message"] = begin_message
            logger.info(f"==== Using custom begin_message: {begin_message[:50]}...")
        elif use_default_begin_message:
            # 否则，如果设置了使用默认值，从文件加载
            try:
                default_begin_message = load_prompt_from_file(BEGIN_MESSAGE_PATH)
                update_params["begin_message"] = default_begin_message
                logger.info(f"==== Using default begin_message from file")
            except Exception as e:
                logger.warning(f"==== Failed to load default begin_message: {e}")

        # 5. 调用 Retell API 更新 LLM
        logger.info(f"==== Updating LLM settings for llm_id: {llm_id}")

        # 注意：retell SDK 的 llm.update 方法
        response = retell.llm.update(
            llm_id=llm_id,
            **update_params
        )

        logger.info(f"==== LLM settings updated successfully for llm_id: {llm_id}")

        return {
            "status": "success",
            "message": "LLM settings updated successfully",
            "llm_id": llm_id,
            "updated_fields": list(update_params.keys())
        }

    except Exception as e:
        logger.error(f"==== Failed to update LLM settings: {e}", exc_info=True)
        raise





