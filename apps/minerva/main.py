"""
Minerva Backend - FastAPI Application
CGM Butler Voice Chat Backend Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# 加载环境变量 (从项目根目录)
env_path = project_root / '.env'
load_dotenv(env_path)
print(f"✅ 环境变量加载自: {env_path}")
print(f"   RETELL_API_KEY: {'已设置' if os.getenv('RETELL_API_KEY') else '未设置'}")
print(f"   OPENAI_API_KEY: {'已设置' if os.getenv('OPENAI_API_KEY') else '未设置'}")

# 创建 FastAPI 应用
app = FastAPI(
    title="Minerva Backend",
    description="CGM Butler Voice Chat Backend",
    version="1.0.0"
)

# 配置 CORS
# 默认允许常见本地开发端口；可通过 CORS_ORIGINS 覆盖
default_origins = "http://localhost:5173,http://localhost:3000,http://localhost:8080"
cors_origins = os.getenv("CORS_ORIGINS", default_origins).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入并注册路由
from src.routers.intake_router import intake_router
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

