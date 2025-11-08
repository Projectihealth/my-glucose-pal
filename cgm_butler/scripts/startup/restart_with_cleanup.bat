@echo off
REM 完整重启脚本 - 自动清理旧对话然后启动应用
REM 这是推荐的启动方式

chcp 65001 >nul
pushd "%~dp0..\..\"

echo ============================================================
echo  CGM Butler - 完整重启（包含清理）
echo ============================================================
echo.

REM 第1步：清理旧的 Tavus 对话
echo [1/2] 清理旧的 Tavus 对话...
echo.
python cleanup_tavus.py

echo.
echo [2/2] 等待 5 秒后启动应用...
timeout /t 5 /nobreak >nul

echo.
echo 启动应用...
call scripts\startup\start_chat.bat
