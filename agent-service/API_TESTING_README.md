# ChatController API Testing Guide

This guide provides comprehensive testing for the ChatController APIs in the Buddy Agent Service.

## Prerequisites

1. **Agent Service Running**: Make sure the agent service is running on port 8080
2. **curl Installed**: Ensure curl is installed and available in your PATH
3. **Services Dependencies**: Ensure memory-service (port 8082) and tools-service (port 8083) are running

## Available Endpoints

### 1. Stream Chat Endpoint
- **URL**: `POST /api/chat/stream`
- **Content-Type**: `application/json`
- **Accept**: `text/event-stream`
- **Description**: Processes chat messages and returns streaming responses

### 2. Voice Chat Endpoint
- **URL**: `POST /api/chat/voice`
- **Content-Type**: `application/json`
- **Description**: Handles voice chat requests (currently returns placeholder response)

## Request Format

### ChatRequest DTO
```json
{
  "message": "string (required, not blank)",
  "sessionId": "string (required, not null)",
  "voiceSessionId": "string (optional)"
}
```

## Testing Scripts

### Automated Testing Scripts

#### For Linux/macOS:
```bash
# Run comprehensive test suite
./test-chat-api.sh

# Run individual tests
./curl-examples/01-stream-chat-basic.sh
./curl-examples/02-stream-chat-with-voice.sh
./curl-examples/03-voice-chat.sh
./curl-examples/04-validation-test.sh
./curl-examples/05-cors-test.sh
```

#### For Windows:
```cmd
# Run comprehensive test suite
test-chat-api.bat

# Run individual tests
curl-examples\01-stream-chat-basic.bat
curl-examples\02-stream-chat-with-voice.bat
curl-examples\03-voice-chat.bat
```

### Manual curl Commands

#### 1. Basic Stream Chat Request
```bash
curl -v \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Hello, how are you?",
    "sessionId": "test-session-123"
  }'
```

#### 2. Stream Chat with Voice Session
```bash
curl -v \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Test message with voice",
    "sessionId": "test-session-456",
    "voiceSessionId": "voice-session-789"
  }'
```

#### 3. Voice Chat Request
```bash
curl -v \
  -X POST "http://localhost:8080/api/chat/voice" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello voice chat",
    "sessionId": "voice-test-session-123",
    "voiceSessionId": "voice-123"
  }'
```

#### 4. Validation Error Test (Empty Message)
```bash
curl -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "",
    "sessionId": "test-session-123"
  }'
```

#### 5. Validation Error Test (Missing Session ID)
```bash
curl -w "\nHTTP Status: %{http_code}\n" \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Hello without session"
  }'
```

#### 6. CORS Test
```bash
curl -i \
  -X POST "http://localhost:8080/api/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": "CORS test message",
    "sessionId": "cors-test-session"
  }'
```

## Expected Responses

### Successful Stream Chat Response
- **HTTP Status**: 200
- **Content-Type**: `text/event-stream`
- **Body**: Server-Sent Events with ChatEvent objects

### Successful Voice Chat Response
- **HTTP Status**: 200
- **Content-Type**: `text/plain`
- **Body**: "Voice chat endpoint - coming soon!"

### Validation Error Response
- **HTTP Status**: 400
- **Content-Type**: `application/json`
- **Body**: Error details about validation failures

### CORS Headers
- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization

## Test Scenarios Covered

1. ✅ **Valid stream chat request**
2. ✅ **Stream chat with voice session ID**
3. ✅ **Valid voice chat request**
4. ✅ **Empty message validation error**
5. ✅ **Missing session ID validation error**
6. ✅ **Null session ID validation error**
7. ✅ **Invalid JSON format error**
8. ✅ **CORS headers verification**
9. ✅ **OPTIONS preflight request**
10. ✅ **Large message payload handling**

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure agent service is running on port 8080
   - Check if the service started successfully

2. **401 Unauthorized**
   - Security configuration may require authentication
   - Check SecurityConfig.java for authentication requirements

3. **500 Internal Server Error**
   - Check agent service logs
   - Ensure memory-service and tools-service are running
   - Verify OpenAI API key configuration

4. **400 Bad Request**
   - Check request JSON format
   - Verify required fields are present
   - Ensure message is not empty and sessionId is not null

### Checking Service Status

```bash
# Check if service is running
curl -f http://localhost:8080/actuator/health

# Check service logs
# (Depends on how you're running the service)
```

## Additional Notes

- The stream chat endpoint returns Server-Sent Events (SSE)
- Voice chat endpoint is currently a placeholder
- All endpoints support CORS with wildcard origin
- Validation is performed using Jakarta Bean Validation
- Authentication may be required depending on security configuration
