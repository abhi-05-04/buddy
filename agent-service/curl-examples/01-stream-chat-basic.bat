@echo off
REM Basic Stream Chat Request

echo Testing: Basic Stream Chat
echo ==================================

curl -v ^
  -X POST "http://localhost:8080/api/chat/stream" ^
  -H "Content-Type: application/json" ^
  -H "Accept: text/event-stream" ^
  -d "{\"message\": \"Hello, how are you?\", \"sessionId\": \"test-session-123\"}"

echo.
echo Test completed.
pause
