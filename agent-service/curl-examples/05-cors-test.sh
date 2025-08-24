#!/bin/bash

# CORS Testing
echo "Testing: CORS Headers"
echo "=================================="

echo "1. Testing OPTIONS request for CORS preflight:"
curl -v \
  -X OPTIONS "http://localhost:8080/api/chat/stream" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

echo ""
echo ""

echo "2. Testing POST request with Origin header:"
curl -i \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": "CORS test message",
    "sessionId": "cors-test-session"
  }'

echo ""
echo "CORS tests completed."
