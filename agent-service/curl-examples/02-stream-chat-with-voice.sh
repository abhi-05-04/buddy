#!/bin/bash

# Stream Chat with Voice Session ID
echo "Testing: Stream Chat with Voice Session"
echo "=================================="

curl -v \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Test message with voice session",
    "sessionId": "test-session-456", 
    "voiceSessionId": "voice-session-789"
  }'

echo ""
echo "Test completed."
