# Wait for service and run tests

Write-Host "Waiting for Agent Service to start..." -ForegroundColor Yellow

# Wait for service to be ready
$maxAttempts = 30
$attempt = 0
$serviceReady = $false

while ($attempt -lt $maxAttempts -and -not $serviceReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serviceReady = $true
            Write-Host "Service is ready!" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "Attempt $attempt of $maxAttempts - Service not ready yet, waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if ($serviceReady) {
    Write-Host "Running API tests..." -ForegroundColor Green
    cd agent-service
    .\test-chat-api.bat
} else {
    Write-Host "Service failed to start within expected time" -ForegroundColor Red
}
