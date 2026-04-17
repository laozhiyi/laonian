"""
数据库迁移脚本 - 添加 video_url 字段
"""
import os
import sqlite3

data_dir = os.path.join(os.path.dirname(__file__), "data")
db_path = os.path.join(data_dir, "orangeprod.db")


def migrate():
    if not os.path.exists(db_path):
        print("数据库文件不存在，请先运行 init_db.py")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 检查 courses 表结构
    cursor.execute("PRAGMA table_info(courses)")
    columns = [col[1] for col in cursor.fetchall()]

    if "video_url" not in columns:
        print("正在添加 video_url 字段到 courses 表...")
        cursor.execute("ALTER TABLE courses ADD COLUMN video_url VARCHAR(500)")
        conn.commit()
        print("字段添加成功！")
    else:
        print("video_url 字段已存在，无需迁移。")

    conn.close()


if __name__ == "__main__":
    migrate()
