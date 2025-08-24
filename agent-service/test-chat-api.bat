@echo off
REM ChatController API Testing Script for Windows
REM Make sure the agent service is running on port 8080

set BASE_URL=http://localhost:8080
set API_BASE=%BASE_URL%/api/chat

echo ===================================
echo ChatController API Testing Script
echo ===================================
echo Testing endpoints at: %API_BASE%
echo.

REM Test 1: Stream Chat - Valid Request
echo Test 1: Stream Chat with valid request
echo Request: POST %API_BASE%/stream
echo Payload: Valid ChatRequest with message and sessionId

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -d "{\"message\": \"Hello, how are you?\", \"sessionId\": \"test-session-123\"}"

echo.
echo.

REM Test 2: Stream Chat - With Voice Session ID
echo Test 2: Stream Chat with voice session ID
echo Request: POST %API_BASE%/stream
echo Payload: ChatRequest with message, sessionId, and voiceSessionId

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -d "{\"message\": \"Test message with voice\", \"sessionId\": \"test-session-456\", \"voiceSessionId\": \"voice-session-789\"}"

echo.
echo.

REM Test 3: Stream Chat - Empty Message (Validation Error)
echo Test 3: Stream Chat with empty message (should fail validation)
echo Request: POST %API_BASE%/stream
echo Payload: ChatRequest with empty message

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -d "{\"message\": \"\", \"sessionId\": \"test-session-123\"}"

echo.
echo.

REM Test 4: Stream Chat - Missing Session ID (Validation Error)
echo Test 4: Stream Chat with missing sessionId (should fail validation)
echo Request: POST %API_BASE%/stream
echo Payload: ChatRequest without sessionId

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -d "{\"message\": \"Hello without session\"}"

echo.
echo.

REM Test 5: Voice Chat - Valid Request
echo Test 5: Voice Chat with valid request
echo Request: POST %API_BASE%/voice
echo Payload: Valid ChatRequest

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/voice" ^
    -H "Content-Type: application/json" ^
    -d "{\"message\": \"Hello voice chat\", \"sessionId\": \"voice-test-session-123\", \"voiceSessionId\": \"voice-123\"}"

echo.
echo.

REM Test 6: Voice Chat - Empty Message (Validation Error)
echo Test 6: Voice Chat with empty message (should fail validation)
echo Request: POST %API_BASE%/voice
echo Payload: ChatRequest with empty message

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/voice" ^
    -H "Content-Type: application/json" ^
    -d "{\"message\": \"\", \"sessionId\": \"voice-test-session-123\"}"

echo.
echo.

REM Test 7: CORS Headers Check
echo Test 7: Check CORS headers
echo Request: POST %API_BASE%/stream with Origin header

curl -i -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -H "Origin: http://localhost:3000" ^
    -d "{\"message\": \"CORS test\", \"sessionId\": \"cors-test-123\"}"

echo.
echo.

REM Test 8: Authentication Test
echo Test 8: Stream Chat with Authorization header
echo Request: POST %API_BASE%/stream with Bearer token

curl -w "HTTP Status: %%{http_code}\n" ^
    -X POST "%API_BASE%/stream" ^
    -H "Content-Type: application/json" ^
    -H "Accept: text/event-stream" ^
    -H "Authorization: Bearer test-token-123" ^
    -d "{\"message\": \"Authenticated request\", \"sessionId\": \"auth-test-session-123\"}"

echo.
echo.

REM Test 9: Health Check (if available)
echo Test 9: Health check endpoint
echo Request: GET %BASE_URL%/actuator/health

curl -w "HTTP Status: %%{http_code}\n" ^
    -X GET "%BASE_URL%/actuator/health" ^
    -H "Accept: application/json"

echo.
echo.

REM Test 10: Invalid HTTP Method
echo Test 10: Invalid HTTP method (GET on POST endpoint)
echo Request: GET %API_BASE%/stream (should fail)

curl -w "HTTP Status: %%{http_code}\n" ^
    -X GET "%API_BASE%/stream" ^
    -H "Accept: text/event-stream"

echo.
echo.

echo ===================================
echo All tests completed!
echo ===================================
pause
