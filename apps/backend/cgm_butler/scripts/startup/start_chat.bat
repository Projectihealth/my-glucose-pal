@echo off
chcp 65001 >nul
pushd "%~dp0.."

echo ========================================
echo CGM Butler - 启动智能对话系统
echo ========================================
echo.

echo [1/3] 启动Dashboard服务...
start "CGM Dashboard" cmd /k cd /d "%~dp0..\..\dashboard" ^&^& python app.py

echo [2/3] 启动Video Avatar前端服务 (Vite 5173)...
start "Video Avatar" cmd /k cd /d "%~dp0..\..\cgm-avatar-app" ^&^& npm run dev

timeout /t 3 /nobreak >nul

echo [3/3] 打开聊天界面...
start "" "%~dp0..\..\digital_avatar\chat.html"

echo.
echo ========================================
echo ✓ 服务已启动！
echo ========================================
echo.
echo 服务信息：
echo - Dashboard: http://localhost:5000
echo - Video Avatar: http://localhost:5173
echo - 聊天界面: 已在浏览器中打开
echo.
echo 按任意键关闭此窗口...
pause >nul
