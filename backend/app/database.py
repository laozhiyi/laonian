"""
数据库初始化模块
使用 Tortoise ORM 连接 SQLite 数据库
"""
import os
from tortoise import Tortoise  # type: ignore

# 获取后端目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 数据库文件路径
DB_PATH = os.path.join(BASE_DIR, "data", "orangeprod.db")

# 确保 data 目录存在
data_dir = os.path.join(BASE_DIR, "data")
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

# Tortoise ORM 配置
TORTOISE_ORM = {
    "connections": {
        "default": {
            "engine": "tortoise.backends.sqlite",
            "credentials": {
                "file_path": DB_PATH,
            },
        },
    },
    "apps": {
        "models": {
            "models": [
                "app.models.user",
                "app.models.product",
                "app.models.cart",
                "app.models.order",
                "app.models.address",
                "app.models.course",
                "app.models.external_course",
            ],
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "Asia/Shanghai",
}


async def init_db():
    """初始化数据库连接"""
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()


async def close_db():
    """关闭数据库连接"""
    await Tortoise.close_connections()


async def get_db():
    """获取数据库实例（用于依赖注入）"""
    return Tortoise
