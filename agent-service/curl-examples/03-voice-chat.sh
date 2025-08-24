#!/bin/bash

# Voice Chat Request
echo "Testing: Voice Chat Endpoint"
echo "=================================="

curl -v \
  -X POST "http://localhost:8080/api/chat/voice" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello voice chat",
    "sessionId": "voice-test-session-123",
    "voiceSessionId": "voice-123"
  }'

echo ""
echo "Test completed."
