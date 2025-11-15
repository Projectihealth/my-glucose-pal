#!/bin/bash
# 测试 CGM Butler API 状态

echo "============================================================"
echo "  CGM Butler - API 状态测试"
echo "============================================================"
echo ""

# 1. 测试 Avatar API 健康检查
echo "[1/5] 测试 Avatar API 健康检查..."
health_response=$(curl -s http://localhost:5000/api/avatar/health)
echo "响应: $health_response"
echo ""

# 2. 测试 Minerva Backend
echo "[2/5] 测试 Minerva Backend..."
minerva_response=$(curl -s http://localhost:8000/health)
echo "响应: $minerva_response"
echo ""

# 3. 测试 Text Chat (GPT)
echo "[3/5] 测试 Text Chat API..."
text_chat_response=$(curl -s -X POST http://localhost:5000/api/avatar/gpt/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001"}')
echo "响应: $text_chat_response"
echo ""

# 4. 测试获取用户信息
echo "[4/5] 测试获取用户信息..."
user_response=$(curl -s http://localhost:5000/api/user/user_001)
echo "响应: $user_response"
echo ""

# 5. 测试获取血糖数据
echo "[5/5] 测试获取血糖数据..."
glucose_response=$(curl -s http://localhost:5000/api/glucose/user_001)
echo "响应: $glucose_response"
echo ""

echo "============================================================"
echo "  ✅ 测试完成"
echo "============================================================"
echo ""
echo "📝 总结:"
echo "  - Avatar API: $(echo $health_response | grep -q 'ok' && echo '✅ 可用' || echo '❌ 不可用')"
echo "  - Minerva Backend: $(echo $minerva_response | grep -q 'healthy' && echo '✅ 可用' || echo '❌ 不可用')"
echo "  - Text Chat: $(echo $text_chat_response | grep -q 'success' && echo '✅ 可用' || echo '❌ 不可用')"
echo ""
echo "⚠️  Video Chat (Tavus) 状态: 需要有效的 Tavus API Key"
echo ""

