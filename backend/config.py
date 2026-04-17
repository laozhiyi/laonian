"""
橘上生香 - 后端配置文件
"""
import os

# 数据库配置
DATABASE_URL = "sqlite:///data/orangeprod.db"

# API 配置
API_HOST = "0.0.0.0"
API_PORT = 8000

# CORS 配置（允许前端 dev server 访问）
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",  # 开发环境允许所有
]

# JWT 密钥（开发环境）
SECRET_KEY = "dev-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7天

# 分页配置
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100