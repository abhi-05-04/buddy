# PowerShell script to test ChatController APIs
# Run this script to test all endpoints

Write-Host "ChatController API Testing" -ForegroundColor Green
Write-Host "=================================="

$baseUrl = "http://localhost:8080"
$streamUrl = "$baseUrl/api/chat/stream"
$voiceUrl = "$baseUrl/api/chat/voice"

# Test 1: Stream Chat Endpoint
Write-Host "`nTest 1: Stream Chat Endpoint" -ForegroundColor Yellow
Write-Host "URL: $streamUrl"

$body1 = @{
    message = "Hello, how are you?"
    sessionId = "test-session-123"
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri $streamUrl -Method POST -ContentType "application/json" -Body $body1 -Headers @{"Accept" = "text/event-stream"}
    Write-Host "Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response1.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Stream Chat with Voice Session
Write-Host "`nTest 2: Stream Chat with Voice Session" -ForegroundColor Yellow

$body2 = @{
    message = "Test with voice session"
    sessionId = "test-session-456"
    voiceSessionId = "voice-789"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri $streamUrl -Method POST -ContentType "application/json" -Body $body2 -Headers @{"Accept" = "text/event-stream"}
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response2.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Voice Chat Endpoint
Write-Host "`nTest 3: Voice Chat Endpoint" -ForegroundColor Yellow
Write-Host "URL: $voiceUrl"

$body3 = @{
    message = "Hello voice chat"
    sessionId = "voice-test-123"
    voiceSessionId = "voice-456"
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri $voiceUrl -Method POST -ContentType "application/json" -Body $body3
    Write-Host "Status: $($response3.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response3.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Validation Error - Empty Message
Write-Host "`nTest 4: Validation Error - Empty Message" -ForegroundColor Yellow

$body4 = @{
    message = ""
    sessionId = "test-session-123"
} | ConvertTo-Json

try {
    $response4 = Invoke-WebRequest -Uri $streamUrl -Method POST -ContentType "application/json" -Body $body4 -Headers @{"Accept" = "text/event-stream"}
    Write-Host "Status: $($response4.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response4.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Validation Error - Missing Session ID
Write-Host "`nTest 5: Validation Error - Missing Session ID" -ForegroundColor Yellow

$body5 = @{
    message = "Hello without session"
} | ConvertTo-Json

try {
    $response5 = Invoke-WebRequest -Uri $streamUrl -Method POST -ContentType "application/json" -Body $body5 -Headers @{"Accept" = "text/event-stream"}
    Write-Host "Status: $($response5.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response5.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Health Check
Write-Host "`nTest 6: Health Check" -ForegroundColor Yellow

try {
    $health = Invoke-WebRequest -Uri "$baseUrl/actuator/health" -Method GET
    Write-Host "Status: $($health.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($health.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "==================================`n" -ForegroundColor Green
