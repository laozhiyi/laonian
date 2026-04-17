"""
清除所有课程数据的脚本（保留分类）
"""
import asyncio

async def clear_courses():
    from app.database import init_db, close_db
    from app.models.course import Course

    print("正在连接数据库...")
    await init_db()

    # 删除所有课程
    course_count = await Course.all().count()
    if course_count > 0:
        await Course.all().delete()
        print(f"已删除 {course_count} 个课程")
    else:
        print("没有课程数据需要删除")

    print("\n数据清除完成！")

    await close_db()

if __name__ == "__main__":
    asyncio.run(clear_courses())
