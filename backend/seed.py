"""
添加测试数据的脚本
"""
import os
import asyncio

data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)

async def seed():
    from app.database import init_db, close_db
    from app.models.user import User
    from app.models.course import Course, Category

    print("正在初始化数据库...")
    await init_db()

    # 创建管理员账号
    admin_count = await User.filter(username="admin").count()
    if admin_count == 0:
        print("创建管理员账号...")
        now = int(__import__('time').time() * 1000)
        await User.create(
            username="admin",
            password="admin",
            role="admin",
            created_at=now,
            updated_at=now
        )
        print("管理员账号创建成功 (admin/admin)")
    else:
        print("管理员账号已存在")

    # 创建课程分类（老年教育分类）
    cat_count = await Category.all().count()
    if cat_count == 0:
        print("创建课程分类...")
        now = int(__import__('time').time() * 1000)

        categories = [
            # 公民素养
            {"name": "公民素养", "icon": "🏛️", "color": "#4A90D9", "sort": 1},
            {"name": "时代前沿", "icon": "🚀", "color": "#7B68EE", "sort": 2},
            {"name": "时事思政", "icon": "📰", "color": "#DC143C", "sort": 3},
            {"name": "隔代教育", "icon": "👨‍👩‍👧", "color": "#FF69B4", "sort": 4},
            {"name": "哲学", "icon": "🧠", "color": "#4169E1", "sort": 5},
            {"name": "文学", "icon": "📚", "color": "#8B4513", "sort": 6},
            {"name": "数字素养", "icon": "💻", "color": "#2E8B57", "sort": 7},
            {"name": "摄影", "icon": "📷", "color": "#FF6347", "sort": 8},
            {"name": "表演", "icon": "🎭", "color": "#9370DB", "sort": 9},
            {"name": "社会科学", "icon": "🔬", "color": "#20B2AA", "sort": 10},
            {"name": "自然科学", "icon": "🌍", "color": "#3CB371", "sort": 11},
            {"name": "农学", "icon": "🌾", "color": "#DAA520", "sort": 12},
            {"name": "语言", "icon": "🗣️", "color": "#FF8C00", "sort": 13},
            {"name": "数学", "icon": "📐", "color": "#4682B4", "sort": 14},
            {"name": "学历教育", "icon": "🎓", "color": "#8B0000", "sort": 15},
            {"name": "论文写作", "icon": "✍️", "color": "#556B2F", "sort": 16},
            {"name": "医学", "icon": "🏥", "color": "#B22222", "sort": 17},
            {"name": "家庭照护", "icon": "🏠", "color": "#FF7F50", "sort": 18},
            {"name": "中医保健", "icon": "🌿", "color": "#228B22", "sort": 19},
            {"name": "用药安全", "icon": "💊", "color": "#CD5C5C", "sort": 20},
            {"name": "食品营养", "icon": "🍎", "color": "#32CD32", "sort": 21},
            {"name": "心理健康", "icon": "💚", "color": "#6B8E23", "sort": 22},
            {"name": "运动健康", "icon": "🏃", "color": "#FF4500", "sort": 23},
            {"name": "慢病管理", "icon": "🩺", "color": "#8FBC8F", "sort": 24},
            {"name": "口腔健康", "icon": "🦷", "color": "#87CEEB", "sort": 25},
            {"name": "生命教育", "icon": "🌱", "color": "#98FB98", "sort": 26},
            {"name": "老年痴呆防治", "icon": "🧩", "color": "#D8BFD8", "sort": 27},
            {"name": "舞蹈", "icon": "💃", "color": "#FF1493", "sort": 28},
            {"name": "声乐", "icon": "🎤", "color": "#FFD700", "sort": 29},
            {"name": "器乐", "icon": "🎸", "color": "#C0C0C0", "sort": 30},
            {"name": "书法", "icon": "🖌️", "color": "#8B4513", "sort": 31},
            {"name": "绘画", "icon": "🎨", "color": "#FF69B4", "sort": 32},
            {"name": "模特", "icon": "👗", "color": "#DDA0DD", "sort": 33},
            {"name": "戏剧", "icon": "🎬", "color": "#FFA07A", "sort": 34},
            {"name": "手工", "icon": "🧶", "color": "#F0E68C", "sort": 35},
            {"name": "生活休闲", "icon": "☕", "color": "#DEB887", "sort": 36},
            {"name": "历史地理", "icon": "🗺️", "color": "#778899", "sort": 37},
            {"name": "文化", "icon": "🏺", "color": "#D2691E", "sort": 38},
            {"name": "退休生涯规划", "icon": "🌅", "color": "#FF8C00", "sort": 39},
            {"name": "投资理财", "icon": "💰", "color": "#FFD700", "sort": 40},
            {"name": "志愿服务", "icon": "❤️", "color": "#FF6B6B", "sort": 41},
            {"name": "创新创业", "icon": "💡", "color": "#9ACD32", "sort": 42},
            {"name": "农业养殖", "icon": "🐄", "color": "#8FBC8F", "sort": 43},
            {"name": "职业技能", "icon": "💼", "color": "#6495ED", "sort": 44},
        ]

        for cat in categories:
            await Category.create(**cat, status="on", created_at=now)

        print(f"已创建 {len(categories)} 个课程分类")
    else:
        print(f"已有 {cat_count} 个分类")

    # 内部课程数据已禁用，暂不使用
    print("内部课程数据已禁用")

    print("\n数据库初始化完成！")
    print("请运行 start.bat 启动后端服务")

    await close_db()

if __name__ == "__main__":
    asyncio.run(seed())
