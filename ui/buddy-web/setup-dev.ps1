# Buddy Web UI Development Setup Script
Write-Host "Setting up Buddy Web UI for development..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not available. Please install npm." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "Environment file created. Please review and update .env with your settings." -ForegroundColor Green
} else {
    Write-Host ".env file already exists." -ForegroundColor Green
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "To start development server, run: npm run dev" -ForegroundColor Cyan
Write-Host "Make sure your backend services are running on the configured ports." -ForegroundColor Cyan
