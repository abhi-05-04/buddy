Write-Host "Running ChatController Tests..." -ForegroundColor Green
Write-Host ""

Write-Host "Building the project..." -ForegroundColor Yellow
./gradlew.bat clean build -x test

Write-Host ""
Write-Host "Running unit tests..." -ForegroundColor Yellow
./gradlew.bat test --tests "*ChatControllerTest*"

Write-Host ""
Write-Host "Running integration tests..." -ForegroundColor Yellow
./gradlew.bat test --tests "*ChatControllerIntegrationTest*"

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
Read-Host "Press Enter to continue"
