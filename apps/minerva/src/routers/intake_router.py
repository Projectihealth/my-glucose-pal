"""
Intake Phone Agent Router
API endpoints for voice chat functionality

重构版本 - 使用 shared/database
"""

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
from typing import Optional, Dict, Any
import os
import sys

# 添加项目根目录到 Python 路径
# __file__ = apps/minerva/src/routers/intake_router.py
# Need 5 levels up to reach project root
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# 使用新的 shared database
from shared.database import get_connection, ConversationRepository, MemoryRepository

from ..services.intake_service import create_intake_web_call, generate_call_summary, analyze_goal_achievement, update_llm_settings

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
            "recording_url": "https://...",
            "user_name": "张三"  // 可选，用于 memory processing
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

        # 使用新的 shared database
        conn = get_connection()
        
        try:
            conv_repo = ConversationRepository(conn)
            memory_repo = MemoryRepository(conn)

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

            # 保存对话到数据库
            conversation_id = conv_repo.save_retell_conversation(
                user_id=user_id,
                retell_call_id=call_id,
                retell_agent_id=agent_id,
                call_status=call_status,
                call_type=call_type,
                started_at=start_timestamp,
                ended_at=end_timestamp,
                duration_seconds=call_duration,
                call_cost=call_cost,
                disconnection_reason=disconnection_reason,
                transcript=transcript,
                transcript_object=transcript_object,
                recording_url=recording_url,
                properties=properties,
                metadata=metadata
            )

            logger.info(f"==== Conversation saved with ID: {conversation_id}")

            # 处理 Memory 和 TODO (使用 MemoryService)
            memory_result = {"success": False}
            try:
                # 动态导入 MemoryService
                import importlib.util
                memory_service_path = os.path.join(
                    project_root, 
                    'apps', 
                    'backend', 
                    'cgm_butler', 
                    'digital_avatar', 
                    'memory_service.py'
                )
                
                spec = importlib.util.spec_from_file_location("memory_service", memory_service_path)
                memory_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(memory_module)
                MemoryService = memory_module.MemoryService
                
                memory_service = MemoryService()
                memory_result = memory_service.process_conversation(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    channel='retell_voice',
                    transcript=transcript,
                    user_name=body.get('user_name', 'User')
                )
                logger.info(f"==== Memory processing result: {memory_result}")
            except Exception as mem_error:
                logger.error(f"==== Memory processing failed (non-fatal): {mem_error}", exc_info=True)

            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "conversation_id": conversation_id,
                    "message": "Call data saved successfully",
                    "memory_processed": memory_result.get('success', False),
                    "todos_created": memory_result.get('todos_count', 0)
                }
            )
        
        finally:
            conn.close()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error saving call data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@intake_router.post("/generate-summary")
async def generate_summary_endpoint(request: Request):
    """
    生成通话总结
    """
    try:
        body = await request.json()
        transcript = body.get('transcript', '')
        
        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="transcript is required"
            )
        
        logger.info("==== Generating call summary")
        
        summary = await generate_call_summary(transcript)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
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

@intake_router.post("/analyze-goals")
async def analyze_goals_endpoint(request: Request):
    """
    分析目标达成情况
    """
    try:
        body = await request.json()
        user_id = body.get('user_id')
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id is required"
            )
        
        logger.info(f"==== Analyzing goals for user_id: {user_id}")
        
        analysis = await analyze_goal_achievement(user_id)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "analysis": analysis
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error analyzing goals: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@intake_router.post("/analyze-goal-achievement")
async def analyze_goal_achievement_endpoint(request: Request):
    """
    分析目标达成情况 (前端兼容端点)
    
    请求体:
        {
            "call_id": "call_abc123",
            "transcript": [...],
            "patient_id": "user_001",
            "patient_name": "John"
        }
    """
    try:
        body = await request.json()
        user_id = body.get('patient_id') or body.get('user_id')
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="patient_id or user_id is required"
            )
        
        logger.info(f"==== Analyzing goal achievement for user_id: {user_id}")
        
        # 调用相同的服务函数
        analysis = await analyze_goal_achievement(user_id)
        
        return JSONResponse(
            status_code=200,
            content=analysis  # 直接返回分析结果
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
    更新 LLM 设置（系统提示词等）
    """
    try:
        body = await request.json()
        
        logger.info("==== Updating LLM settings")
        
        result = await update_llm_settings(body)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "result": result
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"==== Error updating LLM settings: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

