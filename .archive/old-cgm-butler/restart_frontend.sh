#!/bin/bash
# 重启前端服务

echo "============================================================"
echo "  重启 Vite Frontend"
echo "============================================================"
echo ""

# 停止 Vite Frontend
echo "[1/2] 停止 Vite Frontend (端口 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# 重新启动 Vite Frontend
echo "[2/2] 启动 Vite Frontend..."
cd /Users/yijialiu/Desktop/cgm_butler/cgm-avatar-app
osascript -e "tell application \"Terminal\" to do script \"cd '$PWD' && npm run dev\"" > /dev/null 2>&1

sleep 3

echo ""
echo "============================================================"
echo "  ✅ Vite Frontend 已重启"
echo "============================================================"
echo ""
echo "请访问: http://localhost:5173"
echo "并刷新浏览器页面"
echo ""

