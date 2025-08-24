#!/bin/bash

# ChatController API Testing Script
# Make sure the agent service is running on port 8080

BASE_URL="http://localhost:8080"
API_BASE="${BASE_URL}/api/chat"

echo "==================================="
echo "ChatController API Testing Script"
echo "==================================="
echo "Testing endpoints at: $API_BASE"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
    echo ""
}

# Test 1: Stream Chat - Valid Request
echo -e "${YELLOW}Test 1: Stream Chat with valid request${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: Valid ChatRequest with message and sessionId"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "message": "Hello, how are you?",
        "sessionId": "test-session-123"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    print_test_result 0 "Stream chat with valid request"
else
    print_test_result 1 "Stream chat with valid request (Expected 200, got $HTTP_STATUS)"
fi

# Test 2: Stream Chat - With Voice Session ID
echo -e "${YELLOW}Test 2: Stream Chat with voice session ID${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: ChatRequest with message, sessionId, and voiceSessionId"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "message": "Test message with voice",
        "sessionId": "test-session-456",
        "voiceSessionId": "voice-session-789"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    print_test_result 0 "Stream chat with voice session ID"
else
    print_test_result 1 "Stream chat with voice session ID (Expected 200, got $HTTP_STATUS)"
fi

# Test 3: Stream Chat - Empty Message (Validation Error)
echo -e "${YELLOW}Test 3: Stream Chat with empty message (should fail validation)${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: ChatRequest with empty message"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "message": "",
        "sessionId": "test-session-123"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 400 ]; then
    print_test_result 0 "Stream chat with empty message validation"
else
    print_test_result 1 "Stream chat with empty message validation (Expected 400, got $HTTP_STATUS)"
fi

# Test 4: Stream Chat - Null Session ID (Validation Error)
echo -e "${YELLOW}Test 4: Stream Chat with missing sessionId (should fail validation)${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: ChatRequest without sessionId"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "message": "Hello without session"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 400 ]; then
    print_test_result 0 "Stream chat with missing sessionId validation"
else
    print_test_result 1 "Stream chat with missing sessionId validation (Expected 400, got $HTTP_STATUS)"
fi

# Test 5: Stream Chat - Invalid JSON
echo -e "${YELLOW}Test 5: Stream Chat with invalid JSON (should fail)${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: Invalid JSON"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "message": "Hello",
        "sessionId": "test-session-123",
        invalid json here
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 400 ]; then
    print_test_result 0 "Stream chat with invalid JSON"
else
    print_test_result 1 "Stream chat with invalid JSON (Expected 400, got $HTTP_STATUS)"
fi

# Test 6: Voice Chat - Valid Request
echo -e "${YELLOW}Test 6: Voice Chat with valid request${NC}"
echo "Request: POST $API_BASE/voice"
echo "Payload: Valid ChatRequest"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/voice" \
    -H "Content-Type: application/json" \
    -d '{
        "message": "Hello voice chat",
        "sessionId": "voice-test-session-123",
        "voiceSessionId": "voice-123"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    print_test_result 0 "Voice chat with valid request"
else
    print_test_result 1 "Voice chat with valid request (Expected 200, got $HTTP_STATUS)"
fi

# Test 7: Voice Chat - Empty Message (Validation Error)
echo -e "${YELLOW}Test 7: Voice Chat with empty message (should fail validation)${NC}"
echo "Request: POST $API_BASE/voice"
echo "Payload: ChatRequest with empty message"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/voice" \
    -H "Content-Type: application/json" \
    -d '{
        "message": "",
        "sessionId": "voice-test-session-123"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 400 ]; then
    print_test_result 0 "Voice chat with empty message validation"
else
    print_test_result 1 "Voice chat with empty message validation (Expected 400, got $HTTP_STATUS)"
fi

# Test 8: OPTIONS request for CORS
echo -e "${YELLOW}Test 8: OPTIONS request for CORS${NC}"
echo "Request: OPTIONS $API_BASE/stream"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X OPTIONS "$API_BASE/stream" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type")

echo "HTTP Status: $HTTP_STATUS"
echo "Response Headers:"
curl -I -s \
    -X OPTIONS "$API_BASE/stream" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type"
echo ""

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 204 ]; then
    print_test_result 0 "CORS OPTIONS request"
else
    print_test_result 1 "CORS OPTIONS request (Expected 200/204, got $HTTP_STATUS)"
fi

# Test 9: Stream Chat with Authentication
echo -e "${YELLOW}Test 9: Stream Chat with Authorization header${NC}"
echo "Request: POST $API_BASE/stream"
echo "Headers: Authorization Bearer token"

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -H "Authorization: Bearer test-token-123" \
    -d '{
        "message": "Authenticated request",
        "sessionId": "auth-test-session-123"
    }')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
cat /tmp/response.txt
echo ""

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 401 ]; then
    print_test_result 0 "Stream chat with authorization (status $HTTP_STATUS is expected)"
else
    print_test_result 1 "Stream chat with authorization (Got unexpected status $HTTP_STATUS)"
fi

# Test 10: Large Message Payload
echo -e "${YELLOW}Test 10: Stream Chat with large message${NC}"
echo "Request: POST $API_BASE/stream"
echo "Payload: ChatRequest with large message"

LARGE_MESSAGE=$(printf 'A%.0s' {1..1000})

HTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/response.txt -s \
    -X POST "$API_BASE/stream" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d "{
        \"message\": \"$LARGE_MESSAGE\",
        \"sessionId\": \"large-message-test-123\"
    }")

echo "HTTP Status: $HTTP_STATUS"
echo "Response (first 200 chars):"
head -c 200 /tmp/response.txt
echo ""
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    print_test_result 0 "Stream chat with large message"
else
    print_test_result 1 "Stream chat with large message (Expected 200, got $HTTP_STATUS)"
fi

echo "==================================="
echo "All tests completed!"
echo "==================================="

# Clean up
rm -f /tmp/response.txt
