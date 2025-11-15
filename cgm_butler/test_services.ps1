# Test if all services are running

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Testing Services" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test Flask Dashboard (port 5000)
Write-Host "[1/3] Testing Flask Dashboard (http://localhost:5000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host " OK" -ForegroundColor Green
    Write-Host "      Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test Minerva Backend (port 8000)
Write-Host "[2/3] Testing Minerva Backend (http://localhost:8000)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host " OK" -ForegroundColor Green
    Write-Host "      Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test Vite Frontend (port 5173)
Write-Host "[3/3] Testing Vite Frontend (http://localhost:5173)..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host " OK" -ForegroundColor Green
    Write-Host "      Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

