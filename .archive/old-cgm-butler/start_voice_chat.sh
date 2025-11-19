#!/bin/bash
# CGM Butler - 启动语音对话服务 (macOS)
# 使用方法: ./start_voice_chat.sh

echo "============================================================"
echo "  CGM Butler - 启动语音对话服务"
echo "============================================================"
echo ""

# 检查 Python
echo "检查 Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3"
    echo "   请先安装 Python 3.11+: https://www.python.org/downloads/"
    exit 1
fi
echo "✅ Python 版本: $(python3 --version)"

# 检查 Node.js
echo ""
echo "检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "   请先安装 Node.js 18+:"
    echo "   brew install node"
    echo "   或访问: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"

# 检查 minerva 目录
echo ""
echo "检查 Minerva 后端..."
if [ ! -d "minerva" ] || [ -z "$(ls -A minerva 2>/dev/null)" ]; then
    echo "⚠️  警告: minerva 目录为空或不存在"
    echo "   语音对话需要 Minerva 后端服务"
    echo "   请确保 minerva 目录已正确设置"
    echo ""
    read -p "是否继续启动其他服务? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 服务 1: Flask Dashboard
echo ""
echo "[1/3] 启动 Flask Dashboard (端口 5000)..."
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT/dashboard' && python3 app.py\"" > /dev/null 2>&1
sleep 2

# 服务 2: Minerva Backend (如果存在)
if [ -d "minerva" ] && [ -f "minerva/main.py" ]; then
    echo "[2/3] 启动 Minerva Backend (端口 8000)..."
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT/minerva' && python3 -m uvicorn main:app --reload --port 8000\"" > /dev/null 2>&1
    sleep 2
else
    echo "[2/3] ⚠️  跳过 Minerva Backend (目录不存在或未配置)"
fi

# 服务 3: Vite Frontend
echo "[3/3] 启动 Vite Frontend (端口 5173)..."
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT/cgm-avatar-app' && npm run dev\"" > /dev/null 2>&1
sleep 2

echo ""
echo "============================================================"
echo "  服务启动完成！"
echo "============================================================"
echo ""
echo "请检查新打开的终端窗口:"
echo "  1. Flask Dashboard:  http://localhost:5000"
if [ -d "minerva" ] && [ -f "minerva/main.py" ]; then
    echo "  2. Minerva Backend:  http://localhost:8000"
fi
echo "  3. Vite Frontend:    http://localhost:5173"
echo ""
echo "打开浏览器访问: http://localhost:5173"
echo "然后点击 'Olivia' 标签 → 'Voice Chat' 开始语音对话"
echo ""

