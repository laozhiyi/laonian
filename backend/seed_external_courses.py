"""
外部课程种子数据 - 7个分类
"""
import os
import time

data_dir = os.path.join(os.path.dirname(__file__), "data")
db_path = os.path.join(data_dir, "orangeprod.db")


def seed():
    import sqlite3
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 清空旧数据
    cursor.execute("DELETE FROM external_courses")
    cursor.execute("DELETE FROM course_categories")

    now = int(time.time() * 1000)

    # 7个分类
    categories = [
        ('老年健康', '🏥', '#4ECDC4', 1),
        ('传统文化', '🏛️', '#A855F7', 2),
        ('戏曲文艺', '🎭', '#FF6B9D', 3),
        ('书法绘画', '🖌️', '#F59E0B', 4),
        ('声乐舞蹈', '🎵', '#10B981', 5),
        ('智能技术', '💻', '#3B82F6', 6),
        ('综合课程', '📚', '#FF6B35', 7),
    ]

    for name, icon, color, sort in categories:
        cursor.execute(
            "INSERT INTO course_categories (name, icon, color, sort, status, created_at) VALUES (?, ?, ?, ?, 'on', ?)",
            (name, icon, color, sort, now)
        )

    print(f"成功插入 {len(categories)} 个分类！")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    seed()
