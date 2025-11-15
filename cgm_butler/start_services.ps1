# CGM Butler - Start All Services
# Run in PowerShell: .\start_services.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CGM Butler - Starting All Services" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonPaths = @(
    "C:\Python313",
    "C:\Python312",
    "C:\Python311",
    "C:\Python310"
)

$pythonExe = "python"
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    foreach ($path in $pythonPaths) {
        if (Test-Path "$path\python.exe") {
            $pythonExe = "$path\python.exe"
            $env:Path = "$path;$env:Path"
            Write-Host "  [OK] Python found at $path" -ForegroundColor Green
            break
        }
    }
}

# Add Node.js to PATH
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs"
)

foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $env:Path += ";$path"
    }
}

# Service 1: Flask Dashboard
Write-Host "[1/3] Starting Flask Dashboard (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\cgm butler\dashboard'; & '$pythonExe' app.py"
Start-Sleep -Seconds 2

# Service 2: Minerva Backend
Write-Host "[2/3] Starting Minerva Backend (port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\cgm butler\minerva'; & '$pythonExe' -m uvicorn main:app --reload --port 8000"
Start-Sleep -Seconds 2

# Service 3: Vite Frontend
Write-Host "[3/3] Starting Vite Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path += ';C:\Program Files\nodejs'; cd 'D:\cgm butler\cgm-avatar-app'; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the 3 new PowerShell windows:" -ForegroundColor Yellow
Write-Host "  1. Flask Dashboard:  http://localhost:5000" -ForegroundColor White
Write-Host "  2. Minerva Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  3. Vite Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Open browser: http://localhost:5173" -ForegroundColor Green
Write-Host ""


