"""
课程路由
"""
import time
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Body

from app.models.course import Course, Category
from app.models.cart import Cart
from app.schemas.schemas import CourseCreate, CourseUpdate

router = APIRouter(prefix="/api/courses", tags=["课程"])


def _c(course):
    """转换课程数据格式"""
    return {
        "id": course.id,
        "title": course.title,
        "desc": course.desc,
        "cover": course.cover,
        "images": course.images,
        "price": str(course.price),
        "priceNow": str(course.price_now),
        "price_now": str(course.price_now),
        "unit": course.unit,
        "stock": course.stock,
        "category": course.category,
        "tags": course.tags,
        "instructor": course.instructor,
        "rating": str(course.rating) if course.rating else None,
        "studentCount": course.student_count,
        "student_count": course.student_count,
        "duration": course.duration,
        "level": course.level,
        "video_url": course.video_url,
        "videoUrl": course.video_url,
        "status": course.status,
        "sales": course.sales,
        "is_featured": course.is_featured,
        "is_hot": course.is_hot,
    }


# ========== 课程分类接口 ==========

@router.get("/categories", response_model=dict)
async def get_categories():
    """获取所有课程分类"""
    categories = await Category.all().filter(status="on").order_by("sort")
    return {
        "ok": True,
        "list": [{"id": c.id, "name": c.name, "icon": c.icon, "color": c.color} for c in categories]
    }


@router.post("/categories", response_model=dict)
async def create_category(name: str, icon: str = None, color: str = None, sort: int = 0):
    """创建课程分类"""
    now = int(time.time() * 1000)
    cat = await Category.create(name=name, icon=icon, color=color, sort=sort, status="on", created_at=now)
    return {"ok": True, "id": cat.id}


# ========== 课程接口 ==========

# 获取课程列表
@router.get("")
async def get_courses(
    category: str = Query(None, description="分类名称"),
    keyword: str = Query(None, description="搜索关键词"),
    status: str = Query("on", description="状态筛选"),
):
    """获取课程列表，支持分类筛选和关键词搜索"""
    query = Course.all()

    if status:
        query = query.filter(status=status)

    if category:
        query = query.filter(category=category)

    if keyword:
        query = query.filter(title__icontains=keyword)

    courses = await query.order_by("-created_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


# 获取课程详情
@router.get("/{course_id}")
async def get_course(course_id: int):
    course = await Course.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    return {
        "ok": True,
        "data": _c(course)
    }


# 创建课程
@router.post("")
async def create_course(data: CourseCreate):
    now = int(time.time() * 1000)
    course = await Course.create(
        title=data.title,
        desc=data.desc,
        cover=data.cover,
        images=data.images,
        price=data.price,
        price_now=data.price_now,
        unit=data.unit or "课程",
        stock=data.stock or 0,
        category=data.category,
        tags=data.tags,
        instructor=data.instructor,
        rating=data.rating,
        duration=data.duration,
        level=data.level,
        video_url=data.video_url,
        status="on",
        created_at=now,
        updated_at=now
    )

    return {"ok": True, "id": course.id}


# 更新课程
@router.put("/{course_id}")
async def update_course(course_id: int, data: CourseUpdate):
    course = await Course.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = int(time.time() * 1000)

    await course.update_from_dict(update_data)
    await course.save()

    return {"ok": True}


# 删除课程
@router.delete("/{course_id}")
async def delete_course(course_id: int):
    course = await Course.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    await course.delete()
    return {"ok": True}


# ========== 库存管理 ==========

@router.post("/decrease-stock")
async def decrease_stock(items: list):
    """减少课程库存"""
    for item in items:
        course_id = item.get("courseId") or item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)

        course = await Course.filter(id=course_id).first()
        if course:
            new_stock = max(0, course.stock - quantity)
            await Course.filter(id=course_id).update(stock=new_stock)

    return {"ok": True}


@router.post("/increase-stock")
async def increase_stock(items: list):
    """增加课程库存"""
    for item in items:
        course_id = item.get("courseId") or item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)

        course = await Course.filter(id=course_id).first()
        if course:
            new_stock = course.stock + quantity
            await Course.filter(id=course_id).update(stock=new_stock)

    return {"ok": True}


@router.get("/{course_id}/stock")
async def get_course_stock(course_id: int):
    course = await Course.filter(id=course_id).first()
    if not course:
        return {"ok": False, "message": "课程不存在"}

    return {"ok": True, "stock": course.stock}


# ========== 精选和热门课程 ==========

@router.get("/featured/list")
async def get_featured_courses():
    """获取精选课程列表"""
    courses = await Course.filter(status="on", is_featured=True).order_by("-updated_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


@router.get("/hot/list")
async def get_hot_courses():
    """获取热门课程列表"""
    courses = await Course.filter(status="on", is_hot=True).order_by("-updated_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


@router.post("/set-featured")
async def set_featured_courses(body: dict = Body(...)):
    """设置精选课程（替换模式）"""
    # 支持 { course_ids: [...] } 格式
    course_ids = body.get("course_ids", body) if isinstance(body, dict) else body
    if not isinstance(course_ids, list):
        course_ids = []
    # 先取消所有精选
    await Course.all().update(is_featured=False)
    # 再设置新的精选
    if course_ids:
        await Course.filter(id__in=course_ids).update(is_featured=True)
    return {"ok": True, "message": "精选课程已更新"}


@router.post("/set-hot")
async def set_hot_courses(body: dict = Body(...)):
    """设置热门课程（替换模式）"""
    # 支持 { course_ids: [...] } 格式
    course_ids = body.get("course_ids", body) if isinstance(body, dict) else body
    if not isinstance(course_ids, list):
        course_ids = []
    # 先取消所有热门
    await Course.all().update(is_hot=False)
    # 再设置新的热门
    if course_ids:
        await Course.filter(id__in=course_ids).update(is_hot=True)
    return {"ok": True, "message": "热门课程已更新"}
