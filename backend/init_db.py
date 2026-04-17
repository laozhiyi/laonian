"""
初始化数据库脚本
"""
import os
import asyncio

# 确保数据目录存在
data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)

async def init():
    from app.database import init_db, close_db
    print("正在初始化数据库...")
    await init_db()
    print("数据库初始化完成！")
    print(f"数据库文件: {os.path.join(data_dir, 'orangeprod.db')}")
    await close_db()
    print("数据库连接已关闭。")

if __name__ == "__main__":
    asyncio.run(init())