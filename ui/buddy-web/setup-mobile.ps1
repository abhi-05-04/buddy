# Mobile Setup Script for Buddy Web UI
# This script helps set up the environment for mobile access

Write-Host "🚀 Setting up Buddy Web UI for Mobile Access..." -ForegroundColor Green

# Get the local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | Select-Object -First 1).IPAddress

if (-not $localIP) {
    Write-Host "❌ Could not detect local IP address. Please check your network connection." -ForegroundColor Red
    exit 1
}

Write-Host "📱 Detected local IP: $localIP" -ForegroundColor Yellow

# Check if .env file exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" $envFile
}

# Read current .env content
$envContent = Get-Content $envFile -Raw

# Create mobile configuration
$mobileConfig = @"
# Desktop/Local Development
VITE_AGENT_URL=http://localhost:8080
VITE_TOOLS_URL=http://localhost:8083
VITE_MEMORY_URL=http://localhost:8082

# Mobile Development (auto-configured)
VITE_AGENT_URL=http://$localIP`:8080
VITE_TOOLS_URL=http://$localIP`:8083
VITE_MEMORY_URL=http://$localIP`:8082

# VITE_JWT=dev-jwt-token # COMMENTED OUT FOR DEVELOPMENT
VITE_TTS_AUTOPLAY=true
"@

# Write mobile configuration
Set-Content $envFile $mobileConfig -Encoding UTF8

Write-Host "✅ Mobile configuration created!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   • UI URL: http://$localIP`:5173" -ForegroundColor White
Write-Host "   • Agent Service: http://$localIP`:8080" -ForegroundColor White
Write-Host "   • Tools Service: http://$localIP`:8083" -ForegroundColor White
Write-Host "   • Memory Service: http://$localIP`:8082" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure all backend services are running" -ForegroundColor White
Write-Host "   2. Start the UI with: npm run dev" -ForegroundColor White
Write-Host "   3. Access from mobile: http://$localIP`:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   • Both devices must be on the same network" -ForegroundColor White
Write-Host "   • Windows Firewall may block connections - allow if prompted" -ForegroundColor White
Write-Host "   • Backend services must be configured to accept external connections" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Setup complete! You can now access the UI from your mobile device." -ForegroundColor Green
