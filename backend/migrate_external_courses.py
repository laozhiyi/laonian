"""
数据库迁移脚本 - 添加外部课程相关表
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

    # 检查 external_courses 表是否存在
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='external_courses'")
    if not cursor.fetchone():
        print("正在创建 external_courses 表...")
        cursor.execute("""
            CREATE TABLE external_courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(200) NOT NULL,
                cover VARCHAR(500),
                link VARCHAR(1000) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                sort INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'on',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        """)
        print("external_courses 表创建成功！")
    else:
        print("external_courses 表已存在")

    # 检查 course_categories 表是否存在
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='course_categories'")
    if not cursor.fetchone():
        print("正在创建 course_categories 表...")
        cursor.execute("""
            CREATE TABLE course_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL,
                icon VARCHAR(100),
                color VARCHAR(20),
                sort INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'on',
                created_at INTEGER NOT NULL
            )
        """)
        print("course_categories 表创建成功！")
    else:
        print("course_categories 表已存在")

    conn.commit()
    conn.close()
    print("迁移完成！")


if __name__ == "__main__":
    migrate()
