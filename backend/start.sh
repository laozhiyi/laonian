#!/bin/bash
# 橘上生香 - 后端服务启动脚本

cd "$(dirname "$0")"

echo "========================================"
echo "   橘上生香 - 后端服务启动"
echo "========================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python3，请先安装"
    exit 1
fi

# 安装依赖
if ! pip show fastapi &> /dev/null; then
    echo "[提示] 正在安装依赖..."
    pip3 install -r requirements.txt
fi

# 创建数据目录
mkdir -p data

echo "[启动] 后端服务运行在 http://localhost:8000"
echo "[提示] API 文档: http://localhost:8000/docs"
echo ""

python3 main.py