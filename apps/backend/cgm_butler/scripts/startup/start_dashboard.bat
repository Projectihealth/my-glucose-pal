@echo off
chcp 65001 >nul
pushd "%~dp0..\..\"

echo ============================================================
echo  CGM Butler Dashboard 启动脚本
echo ============================================================
echo.
echo 正在启动 Web Dashboard...
echo.

cd dashboard
python app.py
pause
