@echo off
chcp 65001 >nul
pushd "%~dp0..\..\"

echo ========================================
echo CGM Butler - Video Avatar (Tavus CVI)
echo ========================================
echo.

echo [1/2] Starting Dashboard Service...
start "CGM Dashboard" cmd /k cd /d "%~dp0..\..\dashboard" ^&^& python app.py

timeout /t 3 /nobreak >nul

echo [2/2] Starting Video Avatar App...
start "Video Avatar" cmd /k cd /d "%~dp0..\..\cgm-avatar-app" ^&^& npm run dev

echo.
echo ========================================
echo Video Avatar is starting!
echo ========================================
echo.
echo Services:
echo - Dashboard: http://localhost:5000
echo - Video Avatar: http://localhost:5173
echo.
echo Instructions:
echo 1. Wait for browser to open (http://localhost:5173)
echo 2. Click "Start Video Conversation"
echo 3. Allow camera and microphone permissions
echo 4. Start talking with Olivia!
echo.
echo Press any key to close this window...
pause >nul
