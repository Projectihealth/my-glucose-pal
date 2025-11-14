#!/bin/bash

# My Glucose Pal - 停止所有服务
# 使用方法: ./stop-all.sh

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🛑 Stopping All Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 停止 Flask 后端
if [ -f "$PID_DIR/flask.pid" ]; then
    FLASK_PID=$(cat "$PID_DIR/flask.pid")
    if kill -0 $FLASK_PID 2>/dev/null; then
        kill $FLASK_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Flask backend stopped (PID: $FLASK_PID)"
    else
        echo -e "${YELLOW}⚠${NC} Flask backend not running"
    fi
    rm "$PID_DIR/flask.pid"
else
    echo -e "${YELLOW}⚠${NC} Flask backend PID file not found"
fi

# 停止 Minerva 服务
if [ -f "$PID_DIR/minerva.pid" ]; then
    MINERVA_PID=$(cat "$PID_DIR/minerva.pid")
    if kill -0 $MINERVA_PID 2>/dev/null; then
        kill $MINERVA_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Minerva service stopped (PID: $MINERVA_PID)"
    else
        echo -e "${YELLOW}⚠${NC} Minerva service not running"
    fi
    rm "$PID_DIR/minerva.pid"
else
    echo -e "${YELLOW}⚠${NC} Minerva service PID file not found"
fi

# 停止前端
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo -e "${YELLOW}⚠${NC} Frontend not running"
    fi
    rm "$PID_DIR/frontend.pid"
else
    echo -e "${YELLOW}⚠${NC} Frontend PID file not found"
fi

# 额外清理：杀死可能残留的进程
echo ""
echo -e "${BLUE}🧹 Cleaning up any remaining processes...${NC}"

# 清理可能占用端口的进程
for port in 5000 8000 8080; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Cleaned up process on port $port"
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All services stopped!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"



