# CGM Butler - Start All Services
# Run in PowerShell: .\start_all_services.ps1

Write-Host "=" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  CGM Butler - Starting All Services" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow

# Try multiple possible Python paths
$pythonPaths = @(
    "C:\Python313",
    "C:\Python312",
    "C:\Python311",
    "C:\Python310",
    "$env:LOCALAPPDATA\Programs\Python\Python313",
    "$env:LOCALAPPDATA\Programs\Python\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python311"
)

$pythonExe = "python"
$pythonFound = $false

# First try system python
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    $pythonFound = $true
    Write-Host "  [OK] Python found in PATH: $pythonVersion" -ForegroundColor Green
} else {
    # Try to find Python in common installation directories
    foreach ($path in $pythonPaths) {
        if (Test-Path "$path\python.exe") {
            $pythonExe = "$path\python.exe"
            $env:Path = "$path;$env:Path"
            $pythonVersion = & $pythonExe --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $pythonFound = $true
                Write-Host "  [OK] Python found at $path : $pythonVersion" -ForegroundColor Green
                break
            }
        }
    }
}

if (-not $pythonFound) {
    Write-Host "  [ERROR] Python not found! Please install Python first" -ForegroundColor Red
    Write-Host "  Searched locations:" -ForegroundColor Yellow
    foreach ($path in $pythonPaths) {
        Write-Host "    - $path" -ForegroundColor Gray
    }
    exit 1
}

# Check Node.js/npm
Write-Host "Checking Node.js..." -ForegroundColor Yellow

# Try multiple possible Node.js paths
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm"
)

$nodeFound = $false
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $env:Path += ";$path"
        $nodeFound = $true
    }
}

$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] npm not found! Will skip frontend service" -ForegroundColor Yellow
    $skipFrontend = $true
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Service 1: Flask Dashboard
Write-Host "Starting service 1/3: Flask Dashboard (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'D:\cgm butler\dashboard'; Write-Host 'Flask Dashboard starting...' -ForegroundColor Green; & '$pythonExe' app.py"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Service 2: Minerva FastAPI Backend
Write-Host "Starting service 2/3: Minerva Backend (port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'D:\cgm butler\minerva'; Write-Host 'Minerva Backend starting...' -ForegroundColor Green; & '$pythonExe' -m uvicorn main:app --reload --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Service 3: Vite Frontend
if (-not $skipFrontend) {
    Write-Host "Starting service 3/3: Vite Frontend (port 5173)..." -ForegroundColor Cyan
    
    # Build npm path setup command
    $pathSetup = ""
    foreach ($path in $nodePaths) {
        if (Test-Path $path) {
            $pathSetup += "`$env:Path += ';$path'; "
        }
    }
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "$pathSetup cd 'D:\cgm butler\cgm-avatar-app'; Write-Host 'Vite Frontend starting...' -ForegroundColor Green; npm run dev"
    ) -WindowStyle Normal
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "[WARNING] Skipping frontend service (npm not found)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  [SUCCESS] All service startup commands executed!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the 3 new PowerShell windows to confirm services started:" -ForegroundColor Yellow
Write-Host "   1. Flask Dashboard:  http://localhost:5000" -ForegroundColor White
Write-Host "   2. Minerva Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   3. Vite Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Open browser at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "If any service failed to start, check the error message in its window" -ForegroundColor Yellow
Write-Host ""
