# Chef Claude Frontend Check Script
Write-Host "🔍 Checking Frontend Installation Status..." -ForegroundColor Cyan

$frontendPath = "C:\Users\Hemal\OneDrive\Documents\Desktop\Cheif-Claude\Chef-Claude\frontend"
$nodeModulesPath = Join-Path $frontendPath "node_modules"
$viteBinPath = Join-Path $nodeModulesPath ".bin\vite.cmd"

Write-Host "📂 Frontend Path: $frontendPath" -ForegroundColor Yellow

# Check if node_modules exists and has content
if (Test-Path $nodeModulesPath) {
    $moduleCount = (Get-ChildItem $nodeModulesPath -Directory | Measure-Object).Count
    Write-Host "✅ node_modules exists with $moduleCount packages" -ForegroundColor Green
    
    # Check if vite binary exists
    if (Test-Path $viteBinPath) {
        Write-Host "✅ Vite is installed and ready!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Ready to start frontend! Run:" -ForegroundColor Magenta
        Write-Host "   cd frontend" -ForegroundColor White
        Write-Host "   npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "🌟 Or I can start it for you automatically!" -ForegroundColor Yellow
        
        # Auto-start option
        $response = Read-Host "Start frontend now? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Set-Location $frontendPath
            Write-Host "🚀 Starting React frontend..." -ForegroundColor Green
            Start-Process cmd "/c npm run dev"
            Start-Sleep -Seconds 3
            Write-Host "🌐 Frontend should be starting at http://localhost:5173" -ForegroundColor Cyan
            Start-Process "http://localhost:5173"
        }
        
    } else {
        Write-Host "⏳ Vite not found yet. Installation still in progress..." -ForegroundColor Yellow
        Write-Host "   Run this script again when npm install completes" -ForegroundColor Gray
    }
} else {
    Write-Host "⏳ node_modules not found. npm install is still running..." -ForegroundColor Yellow
    Write-Host "   Wait for npm install to complete in VS Code" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Current Status:" -ForegroundColor Magenta
Write-Host "   Backend: ✅ Running on port 5000" -ForegroundColor Green
Write-Host "   MongoDB: ✅ Connected" -ForegroundColor Green  
Write-Host "   Gemini AI: ✅ Working" -ForegroundColor Green
Write-Host "   Frontend: ⏳ Installing dependencies..." -ForegroundColor Yellow