# Start all Buddy AI services
Write-Host "Starting Buddy AI Services..." -ForegroundColor Green

# Start Memory Service (Port 8082)
Write-Host "Starting Memory Service on port 8082..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\abhi\Documents\Buddy'; Write-Host 'Memory Service Starting...'; .\gradlew.bat :memory-service:bootRun"

# Wait a moment
Start-Sleep -Seconds 3

# Start Tools Service (Port 8083)
Write-Host "Starting Tools Service on port 8083..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\abhi\Documents\Buddy'; Write-Host 'Tools Service Starting...'; .\gradlew.bat :tools-service:bootRun"

# Wait a moment
Start-Sleep -Seconds 3

# Start Agent Service (Port 8080)
Write-Host "Starting Agent Service on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\abhi\Documents\Buddy'; Write-Host 'Agent Service Starting...'; .\gradlew.bat :agent-service:bootRun"

Write-Host "All services started! Check the new terminal windows." -ForegroundColor Green
Write-Host "Services will be available at:" -ForegroundColor Cyan
Write-Host "  - Agent Service: http://localhost:8080" -ForegroundColor White
Write-Host "  - Memory Service: http://localhost:8082" -ForegroundColor White
Write-Host "  - Tools Service: http://localhost:8083" -ForegroundColor White
