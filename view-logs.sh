#!/bin/bash

# My Glucose Pal - 查看日志
# 使用方法: ./view-logs.sh [flask|minerva|frontend|all]

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"

SERVICE=${1:-all}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 Viewing Logs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

case $SERVICE in
    flask)
        echo -e "${GREEN}📋 Flask Backend Logs:${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        tail -f "$LOG_DIR/flask.log"
        ;;
    minerva)
        echo -e "${GREEN}📋 Minerva Service Logs:${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        tail -f "$LOG_DIR/minerva.log"
        ;;
    frontend)
        echo -e "${GREEN}📋 Frontend Logs:${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        tail -f "$LOG_DIR/frontend.log"
        ;;
    all)
        echo -e "${GREEN}📋 All Service Logs (last 20 lines each):${NC}"
        echo ""
        echo -e "${BLUE}━━━ Flask Backend ━━━${NC}"
        tail -n 20 "$LOG_DIR/flask.log" 2>/dev/null || echo "No logs yet"
        echo ""
        echo -e "${BLUE}━━━ Minerva Service ━━━${NC}"
        tail -n 20 "$LOG_DIR/minerva.log" 2>/dev/null || echo "No logs yet"
        echo ""
        echo -e "${BLUE}━━━ Frontend ━━━${NC}"
        tail -n 20 "$LOG_DIR/frontend.log" 2>/dev/null || echo "No logs yet"
        ;;
    *)
        echo -e "${YELLOW}Usage: ./view-logs.sh [flask|minerva|frontend|all]${NC}"
        exit 1
        ;;
esac



