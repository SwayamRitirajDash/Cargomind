@echo off
chcp 65001 > nul
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

echo ======================================================================
echo   Starting CargoMind 3.0 Platform (Smart India Hackathon 2026)
echo   Team NASCENT - Rural Last-Mile Multi-Modal Logistics Network
echo ======================================================================

set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "VENV_DIR=%PROJECT_ROOT%\.venv"
set "BACKEND_DIR=%PROJECT_ROOT%\Backends"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"

if exist "%VENV_DIR%\Scripts\python.exe" (
    set "PYTHON_EXEC=%VENV_DIR%\Scripts\python.exe"
    set "UVICORN_EXEC=%VENV_DIR%\Scripts\uvicorn.exe"
) else (
    set "PYTHON_EXEC=python"
    set "UVICORN_EXEC=uvicorn"
)

echo.
echo [1/3] Verifying and Seeding Multi-Modal Rural Logistics Data...
cd /d "%BACKEND_DIR%"
"%PYTHON_EXEC%" -m scripts.load_ner_data

echo.
echo [2/3] Launching FastAPI Dynamic Dispatch Engine on http://127.0.0.1:8000 ...
start "CargoMind Backend" cmd /k "chcp 65001 > nul & cd /d %BACKEND_DIR% & set PYTHONUTF8=1 & set PYTHONIOENCODING=utf-8 & %UVICORN_EXEC% app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Launching Next.js Swiss Logistics Dashboard on http://localhost:3000 ...
start "CargoMind Frontend" cmd /k "cd /d %FRONTEND_DIR% & npm run dev"

echo.
echo ======================================================================
echo   CARGOMIND IS LIVE AND RUNNING!
echo   * Web Portal Dashboard: http://localhost:3000
echo   * FastAPI API Docs:     http://127.0.0.1:8000/docs
echo   * Multi-Modal Modes:    Road, Rail (FOIS), Mountain (SRTM), Riverine
echo   * AI Assistant:         Multi-lingual Voice & Offline-First Assistant
echo ======================================================================
