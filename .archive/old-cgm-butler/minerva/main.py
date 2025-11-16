"""
Minerva Backend - FastAPI Application
CGM Butler Voice Chat Backend Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用
app = FastAPI(
    title="Minerva Backend",
    description="CGM Butler Voice Chat Backend",
    version="1.0.0"
)

# 配置 CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入并注册路由
from intake_phone_agent.router import intake_router
app.include_router(intake_router, prefix="/intake", tags=["intake"])

@app.get("/")
async def root():
    """根路径健康检查"""
    return {
        "status": "ok",
        "service": "Minerva Backend",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)







