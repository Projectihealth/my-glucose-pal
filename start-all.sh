#!/bin/bash

# My Glucose Pal - 一键启动所有服务
# 使用方法: ./start-all.sh

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 My Glucose Pal with Olivia - Starting All Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 创建日志目录
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

# PID 文件目录
PID_DIR="$PROJECT_ROOT/.pids"
mkdir -p "$PID_DIR"

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # 停止所有服务
    if [ -f "$PID_DIR/flask.pid" ]; then
        FLASK_PID=$(cat "$PID_DIR/flask.pid")
        kill $FLASK_PID 2>/dev/null && echo -e "${GREEN}✓${NC} Flask backend stopped"
        rm "$PID_DIR/flask.pid"
    fi
    
    if [ -f "$PID_DIR/minerva.pid" ]; then
        MINERVA_PID=$(cat "$PID_DIR/minerva.pid")
        kill $MINERVA_PID 2>/dev/null && echo -e "${GREEN}✓${NC} Minerva service stopped"
        rm "$PID_DIR/minerva.pid"
    fi
    
    if [ -f "$PID_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
        kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✓${NC} Frontend stopped"
        rm "$PID_DIR/frontend.pid"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}👋 All services stopped. Goodbye!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    exit 0
}

# 捕获 Ctrl+C
trap cleanup SIGINT SIGTERM

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}✗${NC} Port $port is already in use"
        echo -e "${YELLOW}  Please stop the service using port $port first${NC}"
        return 1
    fi
    return 0
}

echo -e "${BLUE}📋 Checking ports...${NC}"
check_port 5000 || exit 1
check_port 8000 || exit 1
check_port 8080 || exit 1
echo -e "${GREEN}✓${NC} All ports available"
echo ""

# 1. 启动 Flask 后端
echo -e "${BLUE}1️⃣  Starting Flask Backend (port 5000)...${NC}"
cd "$PROJECT_ROOT/apps/backend/cgm_butler"

# 检测 Python 命令
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}✗${NC} Python not found. Please install Python 3.8+"
    exit 1
fi

echo -e "   Using: ${YELLOW}$PYTHON_CMD${NC}"
$PYTHON_CMD dashboard/app.py > "$LOG_DIR/flask.log" 2>&1 &
FLASK_PID=$!
echo $FLASK_PID > "$PID_DIR/flask.pid"
echo -e "${GREEN}✓${NC} Flask backend started (PID: $FLASK_PID)"
echo -e "   Log: ${YELLOW}$LOG_DIR/flask.log${NC}"
sleep 2

# 2. 启动 Minerva 语音服务
echo ""
echo -e "${BLUE}2️⃣  Starting Minerva Voice Service (port 8000)...${NC}"
cd "$PROJECT_ROOT/apps/minerva"

# 检查是否有虚拟环境
if [ -d "$PROJECT_ROOT/venv" ]; then
    source "$PROJECT_ROOT/venv/bin/activate"
    echo -e "${GREEN}✓${NC} Virtual environment activated"
    uvicorn main:app --host 127.0.0.1 --port 8000 > "$LOG_DIR/minerva.log" 2>&1 &
else
    # Use miniconda uvicorn if available
    /Users/ellaquan/miniconda3/bin/uvicorn main:app --host 127.0.0.1 --port 8000 > "$LOG_DIR/minerva.log" 2>&1 &
fi
MINERVA_PID=$!
echo $MINERVA_PID > "$PID_DIR/minerva.pid"
echo -e "${GREEN}✓${NC} Minerva service started (PID: $MINERVA_PID)"
echo -e "   Log: ${YELLOW}$LOG_DIR/minerva.log${NC}"
sleep 2

# 3. 启动前端
echo ""
echo -e "${BLUE}3️⃣  Starting Frontend (port 8080)...${NC}"
cd "$PROJECT_ROOT/apps/frontend"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
echo -e "   Log: ${YELLOW}$LOG_DIR/frontend.log${NC}"
sleep 3

# 显示状态
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All Services Running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "   Frontend:        ${BLUE}http://localhost:8080${NC}"
echo -e "   Flask Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "   Minerva Service: ${BLUE}http://localhost:8000${NC}"
echo ""
echo -e "${GREEN}📝 Logs:${NC}"
echo -e "   Flask:   ${YELLOW}tail -f $LOG_DIR/flask.log${NC}"
echo -e "   Minerva: ${YELLOW}tail -f $LOG_DIR/minerva.log${NC}"
echo -e "   Frontend: ${YELLOW}tail -f $LOG_DIR/frontend.log${NC}"
echo ""
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 打开浏览器
sleep 2
echo -e "${GREEN}🌐 Opening browser...${NC}"
open http://localhost:8080

# 保持脚本运行
echo ""
echo -e "${GREEN}✨ All systems ready! Waiting for Ctrl+C...${NC}"
echo ""

# 等待用户按 Ctrl+C
wait



