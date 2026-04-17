@echo off
chcp 65001 >nul
title 橘上生香 - 后端服务

cd /d "%~dp0"

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查依赖
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 确保数据目录存在
if not exist "data" mkdir data

REM 解析命令行参数
set HOST=0.0.0.0
set PORT=8000
set RELOAD=

:parse_args
if "%~1"=="" goto run
if /i "%~1"=="-H" (
    set HOST=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="--host" (
    set HOST=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="-p" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="-r" (
    set RELOAD=--reload
    shift
    goto parse_args
)
if /i "%~1"=="--reload" (
    set RELOAD=--reload
    shift
    goto parse_args
)
shift
goto parse_args

:run
echo.
echo ========================================
echo    橘上生香 - 后端服务启动
echo ========================================
echo.
echo    地址: http://%HOST%:%PORT%
echo    文档: http://%HOST%:%PORT%/docs
if defined RELOAD (
    echo    热更新: 开启
) else (
    echo    热更新: 关闭
)
echo.
echo    参数说明:
echo    -H, --host    设置监听地址
echo    -p, --port    设置监听端口
echo    -r, --reload  启用热更新
echo.
echo ========================================
echo.

python main.py -H %HOST% -p %PORT% %RELOAD%