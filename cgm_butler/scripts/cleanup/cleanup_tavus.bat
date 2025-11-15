@echo off
REM Tavus 对话清理脚本
REM 用于解决 "User has reached maximum concurrent conversations" 错误

chcp 65001 >nul
pushd "%~dp0..\..\"

echo =========================================
echo Tavus 对话清理工具
echo =========================================
echo.

REM 设置环境变量
set "TAVUS_API_KEY=9b6138127c1946fb98a5ad3b5c86300b"
set "TAVUS_PERSONA_ID=p176d7357a2d"

REM 运行清理脚本
python cleanup_tavus.py %*

echo.
echo 清理完成！
echo.
pause
