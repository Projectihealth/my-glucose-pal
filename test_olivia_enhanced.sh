#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         🧪 Test Olivia with Enhanced CGM Data                      ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if services are running
echo "📋 Checking services..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Minerva is running (port 8000)"
else
    echo "❌ Minerva is NOT running"
    exit 1
fi

if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ CGM Backend is running (port 5000)"
else
    echo "⚠️  CGM Backend is NOT running (using mock or real backend)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test web call creation
echo "🎤 Creating test web call for user_38377a3b..."
RESPONSE=$(curl -s -X POST http://localhost:8000/intake/create-web-call \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_38377a3b"}')

CALL_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('call_id', 'N/A'))" 2>/dev/null)

if [ "$CALL_ID" != "N/A" ]; then
    echo "✅ Web call created: $CALL_ID"
else
    echo "❌ Failed to create web call"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Display CGM data from logs
echo "📊 CGM Data sent to Olivia:"
tail -200 /tmp/minerva-final.log | grep -A 10 "CGM data in variables:" | grep -v "INFO:" | tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Test complete! Olivia now has access to:"
echo "   • Current glucose with trend"
echo "   • 24h & 7-day averages"
echo "   • Daily patterns (breakfast/lunch/dinner/overnight)"
echo "   • Variability (CV%)"
echo "   • Hypo/hyper event counts"
echo "   • Recent peaks with timestamps"
echo ""
echo "🚀 Try asking Olivia:"
echo "   - \"What's my glucose?\""
echo "   - \"Any patterns in my data?\""
echo "   - \"Am I stable?\""
echo "   - \"Did I spike today?\""
echo ""


