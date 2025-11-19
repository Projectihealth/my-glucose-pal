#!/bin/bash
# 测试 Text Chat 的所有功能

echo "============================================================"
echo "  Text Chat 功能测试"
echo "============================================================"
echo ""

# 测试 1: 获取当前血糖
echo "[1/4] 测试获取当前血糖..."
curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "What is my current glucose?"}' | python3 -m json.tool | head -20
echo ""
echo "---"
echo ""

# 测试 2: 获取血糖模式
echo "[2/4] 测试获取血糖模式..."
curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "Tell me about my glucose patterns"}' | python3 -m json.tool | head -20
echo ""
echo "---"
echo ""

# 测试 3: 获取统计数据
echo "[3/4] 测试获取血糖统计..."
curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "Show me my glucose statistics"}' | python3 -m json.tool | head -20
echo ""
echo "---"
echo ""

# 测试 4: 获取健康建议
echo "[4/4] 测试获取健康建议..."
curl -s -X POST http://localhost:5000/api/avatar/gpt/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "message": "Give me some health recommendations"}' | python3 -m json.tool | head -20
echo ""

echo "============================================================"
echo "  ✅ 所有测试完成"
echo "============================================================"
echo ""
echo "现在您可以在浏览器中测试 Text Chat:"
echo "  1. 访问 http://localhost:5173"
echo "  2. 点击 'Olivia' → 'Text Chat'"
echo "  3. 尝试这些问题："
echo "     - 我的血糖是多少？"
echo "     - 告诉我最近的血糖模式"
echo "     - 给我一些健康建议"
echo ""

