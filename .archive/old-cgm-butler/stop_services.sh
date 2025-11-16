#!/bin/bash
# CGM Butler - 停止所有服务

echo "============================================================"
echo "  CGM Butler - 停止所有服务"
echo "============================================================"
echo ""

# 停止 Flask Dashboard (端口 5000)
echo "[1/3] 停止 Flask Dashboard (端口 5000)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Flask Dashboard 已停止"
else
    echo "⚠️  Flask Dashboard 未运行或已停止"
fi

# 停止 Minerva Backend (端口 8000)
echo "[2/3] 停止 Minerva Backend (端口 8000)..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Minerva Backend 已停止"
else
    echo "⚠️  Minerva Backend 未运行或已停止"
fi

# 停止 Vite Frontend (端口 5173)
echo "[3/3] 停止 Vite Frontend (端口 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Vite Frontend 已停止"
else
    echo "⚠️  Vite Frontend 未运行或已停止"
fi

echo ""
echo "============================================================"
echo "  所有服务已停止"
echo "============================================================"
echo ""

