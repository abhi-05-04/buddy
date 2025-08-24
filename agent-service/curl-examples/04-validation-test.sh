#!/bin/bash

# Validation Error Tests
echo "Testing: Validation Errors"
echo "=================================="

echo "1. Testing empty message (should return 400):"
curl -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "",
    "sessionId": "test-session-123"
  }'

echo ""
echo ""

echo "2. Testing missing sessionId (should return 400):"
curl -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Hello without session"
  }'

echo ""
echo ""

echo "3. Testing null sessionId (should return 400):"
curl -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Hello with null session",
    "sessionId": null
  }'

echo ""
echo "Validation tests completed."
