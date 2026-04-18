"""
初始化数据库脚本
"""
import os
import asyncio
import sqlite3

# 确保数据目录存在
data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)

DB_PATH = os.path.join(data_dir, "orangeprod.db")


def migrate_external_courses():
    """迁移 external_courses 表，添加缺失的列"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 检查表是否存在
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='external_courses'")
        if not cursor.fetchone():
            print("external_courses 表不存在，跳过迁移")
            conn.close()
            return
        
        # 获取当前表的列
        cursor.execute("PRAGMA table_info(external_courses)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # 添加 is_featured 列（如果不存在）
        if "is_featured" not in columns:
            cursor.execute("ALTER TABLE external_courses ADD COLUMN is_featured INTEGER DEFAULT 0")
            print("已添加 is_featured 列")
        
        # 添加 is_hot 列（如果不存在）
        if "is_hot" not in columns:
            cursor.execute("ALTER TABLE external_courses ADD COLUMN is_hot INTEGER DEFAULT 0")
            print("已添加 is_hot 列")
        
        conn.commit()
        conn.close()
        print("external_courses 表迁移完成")
    except Exception as e:
        print(f"迁移 external_courses 表时出错: {e}")


async def init():
    from app.database import init_db, close_db
    
    # 先执行迁移
    print("正在执行数据库迁移...")
    migrate_external_courses()
    
    print("正在初始化数据库...")
    await init_db()
    print("数据库初始化完成！")
    print(f"数据库文件: {DB_PATH}")
    await close_db()
    print("数据库连接已关闭。")

if __name__ == "__main__":
    asyncio.run(init())