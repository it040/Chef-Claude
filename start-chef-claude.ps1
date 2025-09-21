# Chef Claude Startup Script
Write-Host "🍳 Starting Chef Claude Application..." -ForegroundColor Green

# Kill any existing node processes on port 5000
Write-Host "🔄 Stopping existing servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Set-Location "backend"
Start-Process -WindowStyle Hidden node "simple-server-test.js"
Start-Sleep -Seconds 3

# Test backend
Write-Host "🔍 Testing backend connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend failed to start!" -ForegroundColor Red
    exit 1
}

# Start frontend
Write-Host "🎨 Starting frontend..." -ForegroundColor Magenta
Set-Location "../frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🌐 Starting frontend development server..." -ForegroundColor Magenta
Start-Process -WindowStyle Normal cmd "/c npm run dev"

Write-Host ""
Write-Host "🎉 Chef Claude is starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173 (or check console)" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🧪 Debug Test: Open frontend/debug-test.html in browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open debug test page..." -ForegroundColor Magenta
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "debug-test.html"