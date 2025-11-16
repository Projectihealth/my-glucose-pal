#!/bin/bash
echo "============================================================"
echo "  测试 Text Chat (文字对话)"
echo "============================================================"
echo ""

# 开始对话
echo "[1/3] 开始对话..."
start_response=$(curl -s -X POST http://localhost:5000/api/avatar/gpt/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001"}')
echo "响应: $start_response"
echo ""

# 发送消息
echo "[2/3] 发送消息: 我的血糖是多少？"
chat_response=$(curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "我的血糖是多少？"}')
echo "响应: $chat_response"
echo ""

# 再发送一条消息
echo "[3/3] 发送消息: 给我一些健康建议"
chat_response2=$(curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "给我一些健康建议"}')
echo "响应: $chat_response2"
echo ""

echo "============================================================"
echo "  ✅ Text Chat 测试完成！"
echo "============================================================"
echo ""
echo "请在浏览器中访问 http://localhost:5173 测试完整功能"
echo ""
