"""
Intake Phone Agent Router
API endpoints for voice chat functionality
"""

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
from typing import Optional, Dict, Any

from .service import create_intake_web_call, generate_call_summary, analyze_goal_achievement, update_llm_settings

# 创建路由器
intake_router = APIRouter()

logger = logging.getLogger(__name__)

@intake_router.post("/create-web-call")
async def create_web_call_endpoint(request: Request):
    """
    创建 Web Call 端点
    
    请求体:
        {
            "user_id": "user_001"  // 必需，CGM Butler 用户 ID
        }
    
    响应:
        {
            "access_token": "...",
            "call_id": "...",
            "agent_id": "...",
            "message": "Web call created successfully"
        }
    """
    try:
        body = await request.json() if request.headers.get('content-type') == 'application/json' else {}
        user_id = body.get('user_id')
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id is required"
            )
        
        logger.info(f"==== Creating web call for user_id: {user_id}")
        
        result = await create_intake_web_call(user_id=user_id)
        
        if result.get('status_code') == 200:
            return JSONResponse(
                status_code=200,
                content=result.get('content', {})
            )
        else:
            raise HTTPException(
                status_code=result.get('status_code', 500),
                detail=result.get('content', {}).get('message', 'Failed to create web call')
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error creating web call: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@intake_router.post("/save-call-data")
async def save_call_data_endpoint(request: Request):
    """
    保存通话数据（通话结束后调用）

    请求体:
        {
            "user_id": "user_001",
            "call_id": "call_abc123",
            "agent_id": "agent_123",
            "call_status": "ended",
            "call_type": "web_call",
            "start_timestamp": "2025-01-14T10:00:00Z",
            "end_timestamp": "2025-01-14T10:05:00Z",
            "call_duration": 300.5,
            "call_cost": {"total": 0.12, "currency": "USD"},
            "disconnection_reason": "user_hangup",
            "transcript": "用户: 你好\\nOlivia: 你好！",
            "transcript_object": [...],
            "recording_url": "https://..."
        }
    """
    try:
        body = await request.json()

        # 必需字段
        user_id = body.get('user_id')
        call_id = body.get('call_id')
        agent_id = body.get('agent_id')

        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if not call_id:
            raise HTTPException(status_code=400, detail="call_id is required")
        if not agent_id:
            raise HTTPException(status_code=400, detail="agent_id is required")

        logger.info(f"==== Saving call data for user_id: {user_id}, call_id: {call_id}")

        # 导入 ConversationManager
        import os
        import sys
        # 获取数据库路径
        db_path = os.path.join(os.path.dirname(__file__), '../../database/cgm_butler.db')

        # 添加数据库目录到 Python 路径
        db_dir = os.path.join(os.path.dirname(__file__), '../../database')
        if db_dir not in sys.path:
            sys.path.insert(0, db_dir)

        from conversation_manager import ConversationManager

        # 初始化管理器
        manager = ConversationManager(db_path=db_path)

        # 提取数据
        call_status = body.get('call_status', 'ended')
        call_type = body.get('call_type', 'web_call')
        start_timestamp = body.get('start_timestamp')
        end_timestamp = body.get('end_timestamp')
        call_duration = body.get('call_duration')
        call_cost = body.get('call_cost')
        disconnection_reason = body.get('disconnection_reason')
        transcript = body.get('transcript', '')
        transcript_object = body.get('transcript_object', [])
        recording_url = body.get('recording_url')
        properties = body.get('properties')
        metadata = body.get('metadata')

        # 保存到数据库
        conversation_id = manager.save_retell_conversation(
            user_id=user_id,
            retell_call_id=call_id,
            retell_agent_id=agent_id,
            call_status=call_status,
            call_type=call_type,
            started_at=start_timestamp,
            ended_at=end_timestamp,
            duration_seconds=call_duration,
            transcript=transcript,
            transcript_object=transcript_object,
            call_cost=call_cost,
            disconnection_reason=disconnection_reason,
            recording_url=recording_url,
            properties=properties,
            metadata=metadata
        )

        logger.info(f"==== Call data saved successfully: conversation_id={conversation_id}")

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "conversation_id": conversation_id,
                "message": "Call data saved successfully"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error saving call data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@intake_router.get("/get-summary/{call_id}")
async def get_summary_endpoint(call_id: str):
    """
    获取通话摘要
    """
    try:
        # TODO: 实现获取摘要的逻辑
        return JSONResponse(
            status_code=200,
            content={
                "has_summary": False,
                "summary": None
            }
        )
    except Exception as e:
        logger.error(f"==== Error getting summary: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@intake_router.get("/get-goal-analysis/{call_id}")
async def get_goal_analysis_endpoint(call_id: str):
    """
    获取目标分析
    """
    try:
        # TODO: 实现获取目标分析的逻辑
        return JSONResponse(
            status_code=200,
            content={
                "goal_analysis": None
            }
        )
    except Exception as e:
        logger.error(f"==== Error getting goal analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@intake_router.post("/generate-summary")
async def generate_summary_endpoint(request: Request):
    """
    生成通话摘要

    请求体:
        {
            "call_id": "call_abc123",
            "transcript": [
                {"role": "agent", "content": "Hello..."},
                {"role": "user", "content": "Hi..."}
            ]
        }

    响应:
        {
            "summary": {
                "data_quality": "sufficient",
                "meals": {...},
                "exercise": "...",
                ...
            }
        }
    """
    try:
        body = await request.json()
        call_id = body.get('call_id')
        transcript = body.get('transcript', [])

        if not call_id:
            raise HTTPException(
                status_code=400,
                detail="call_id is required"
            )

        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="transcript is required"
            )

        logger.info(f"==== Generating summary for call_id: {call_id}")

        summary = await generate_call_summary(call_id, transcript)

        return JSONResponse(
            status_code=200,
            content={
                "summary": summary
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error generating summary: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@intake_router.post("/analyze-goal-achievement")
async def analyze_goal_achievement_endpoint(request: Request):
    """
    分析目标达成情况

    请求体:
        {
            "call_id": "call_abc123",
            "transcript": [...],
            "patient_id": "user_001",
            "patient_name": "John Doe"
        }

    响应:
        {
            "goals": [
                {
                    "id": 1,
                    "title": "...",
                    "status": "ACHIEVED",
                    "currentBehavior": "...",
                    "recommendation": "..."
                }
            ]
        }
    """
    try:
        body = await request.json()
        call_id = body.get('call_id')
        transcript = body.get('transcript', [])
        patient_id = body.get('patient_id')
        patient_name = body.get('patient_name', 'User')

        if not call_id:
            raise HTTPException(
                status_code=400,
                detail="call_id is required"
            )

        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="transcript is required"
            )

        if not patient_id:
            raise HTTPException(
                status_code=400,
                detail="patient_id is required"
            )

        logger.info(f"==== Analyzing goal achievement for call_id: {call_id}, patient_id: {patient_id}")

        analysis = await analyze_goal_achievement(call_id, transcript, patient_id, patient_name)

        return JSONResponse(
            status_code=200,
            content=analysis
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error analyzing goal achievement: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@intake_router.post("/update-llm-settings")
async def update_llm_settings_endpoint(request: Request):
    """
    更新 LLM 的 general_prompt 和 begin_message

    请求体:
        {
            "llm_id": "llm_xxx",  // 可选，默认使用环境变量中的 INTAKE_LLM_ID
            "begin_message": "Hi! I'm Olivia...",  // 可选，如果提供则使用自定义开场白
            "use_default_begin_message": true  // 可选，默认为 true，是否使用默认的 begin_message 文件
        }

    响应:
        {
            "status": "success",
            "message": "LLM settings updated successfully",
            "llm_id": "llm_xxx",
            "updated_fields": ["general_prompt", "begin_message"]
        }
    """
    try:
        body = await request.json() if request.headers.get('content-type') == 'application/json' else {}
        llm_id = body.get('llm_id')
        begin_message = body.get('begin_message')
        use_default_begin_message = body.get('use_default_begin_message', True)

        logger.info(f"==== Updating LLM settings, llm_id: {llm_id}, has_begin_message: {bool(begin_message)}, use_default: {use_default_begin_message}")

        # 调用 service 层的函数
        kwargs = {}
        if llm_id:
            kwargs['llm_id'] = llm_id
        if begin_message:
            kwargs['begin_message'] = begin_message
        kwargs['use_default_begin_message'] = use_default_begin_message

        result = await update_llm_settings(**kwargs)

        return JSONResponse(
            status_code=200,
            content=result
        )

    except Exception as e:
        logger.error(f"==== Error updating LLM settings: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )





