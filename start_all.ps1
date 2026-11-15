# CargoMind 3.0 Unified Runner Script
$ScriptDir = $PSScriptRoot
Write-Host "Starting CargoMind 3.0 Platform..." -ForegroundColor Cyan

# Start FastAPI Backend
$backend = Start-Process -FilePath "$ScriptDir\.venv\Scripts\uvicorn.exe" -ArgumentList "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory "$ScriptDir\Backends" -PassThru

Write-Host "FastAPI Backend started on http://127.0.0.1:8000" -ForegroundColor Green

# Start Next.js Frontend
Set-Location "$ScriptDir\frontend"
npm run dev
