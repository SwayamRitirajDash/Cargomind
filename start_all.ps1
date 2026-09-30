# CargoMind 3.0 Unified Runner Script
Write-Host "Starting CargoMind 3.0 Platform..." -ForegroundColor Cyan

# Start FastAPI Backend
$backend = Start-Process -FilePath "c:\Users\swaya\OneDrive\Desktop\Cargomind3.0\.venv\Scripts\uvicorn.exe" -ArgumentList "Backends.app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory "c:\Users\swaya\OneDrive\Desktop\Cargomind3.0" -PassThru -NoNewWindow

Write-Host "FastAPI Backend started on http://127.0.0.1:8000" -ForegroundColor Green

# Start Next.js Frontend
Set-Location "c:\Users\swaya\OneDrive\Desktop\Cargomind3.0\frontend"
npm run dev
