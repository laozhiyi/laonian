"""
外部课程路由
"""
import time
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Body

from app.models.external_course import ExternalCourse, CourseCategory

router = APIRouter(prefix="/api/external-courses", tags=["外部课程"])


def _c(course):
    """转换外部课程数据格式"""
    return {
        "id": course.id,
        "title": course.title,
        "cover": course.cover,
        "link": course.link,
        "description": course.description,
        "category": course.category,
        "price": float(getattr(course, 'price', 0) or 0),
        "stock": getattr(course, 'stock', 1) or 1,
        "sort": course.sort,
        "status": course.status,
    }


# ========== 课程分类接口 ==========

@router.get("/categories", response_model=dict)
async def get_categories():
    """获取所有课程分类"""
    categories = await CourseCategory.all().filter(status="on").order_by("sort")
    return {
        "ok": True,
        "list": [
            {"id": c.id, "name": c.name, "icon": c.icon, "color": c.color}
            for c in categories
        ]
    }


@router.post("/categories", response_model=dict)
async def create_category(name: str, icon: str = None, color: str = None, sort: int = 0):
    """创建课程分类"""
    now = int(time.time() * 1000)
    cat = await CourseCategory.create(
        name=name, icon=icon, color=color, sort=sort, status="on", created_at=now
    )
    return {"ok": True, "id": cat.id}


@router.put("/categories/{category_id}", response_model=dict)
async def update_category(category_id: int, name: str = None, icon: str = None, color: str = None, sort: int = None):
    """更新课程分类"""
    cat = await CourseCategory.filter(id=category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")

    if name is not None:
        cat.name = name
    if icon is not None:
        cat.icon = icon
    if color is not None:
        cat.color = color
    if sort is not None:
        cat.sort = sort

    await cat.save()
    return {"ok": True}


@router.delete("/categories/{category_id}", response_model=dict)
async def delete_category(category_id: int):
    """删除课程分类"""
    cat = await CourseCategory.filter(id=category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")

    await cat.delete()
    return {"ok": True}


# ========== 外部课程接口 ==========

@router.get("")
async def get_courses(
    category: str = Query(None, description="分类名称"),
    status: str = Query("on", description="状态筛选"),
):
    """获取外部课程列表"""
    query = ExternalCourse.all()

    if status:
        query = query.filter(status=status)

    if category:
        query = query.filter(category=category)

    courses = await query.order_by("sort", "-created_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


@router.get("/{course_id}")
async def get_course(course_id: int):
    """获取外部课程详情"""
    course = await ExternalCourse.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    return {
        "ok": True,
        "data": _c(course)
    }


@router.post("")
async def create_course(
    title: str,
    cover: str = None,
    link: str = None,
    description: str = None,
    category: str = None,
    price: float = 0,
    stock: int = 1,
    sort: int = 0,
):
    """创建外部课程"""
    now = int(time.time() * 1000)
    course = await ExternalCourse.create(
        title=title,
        cover=cover,
        link=link,
        description=description,
        category=category,
        price=price,
        stock=stock,
        sort=sort,
        status="on",
        created_at=now,
        updated_at=now
    )
    return {"ok": True, "id": course.id}


@router.put("/{course_id}")
async def update_course(
    course_id: int,
    title: str = None,
    cover: str = None,
    link: str = None,
    description: str = None,
    category: str = None,
    price: float = None,
    stock: int = None,
    sort: int = None,
    status: str = None,
    is_featured: bool = None,
    is_hot: bool = None,
):
    """更新外部课程"""
    course = await ExternalCourse.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    if title is not None:
        course.title = title
    if cover is not None:
        course.cover = cover
    if link is not None:
        course.link = link
    if description is not None:
        course.description = description
    if category is not None:
        course.category = category
    if price is not None:
        course.price = price
    if stock is not None:
        course.stock = stock
    if sort is not None:
        course.sort = sort
    if status is not None:
        course.status = status
    if is_featured is not None:
        course.is_featured = is_featured
    if is_hot is not None:
        course.is_hot = is_hot

    course.updated_at = int(time.time() * 1000)
    await course.save()

    return {"ok": True}


@router.delete("/{course_id}")
async def delete_course(course_id: int):
    """删除外部课程"""
    course = await ExternalCourse.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    await course.delete()
    return {"ok": True}


# ========== 精选和热门课程 ==========

@router.get("/featured/list")
async def get_featured_courses():
    """获取精选外部课程列表"""
    courses = await ExternalCourse.filter(status="on", is_featured=True).order_by("-updated_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


@router.get("/hot/list")
async def get_hot_courses():
    """获取热门外部课程列表"""
    courses = await ExternalCourse.filter(status="on", is_hot=True).order_by("-updated_at")
    return {
        "ok": True,
        "list": [_c(c) for c in courses],
        "total": len(courses)
    }


@router.post("/set-featured")
async def set_featured_courses(body: dict = Body(...)):
    """设置精选外部课程（替换模式）"""
    # 支持 { course_ids: [...] } 格式
    course_ids = body.get("course_ids", body) if isinstance(body, dict) else body
    if not isinstance(course_ids, list):
        course_ids = []
    # 先取消所有精选
    await ExternalCourse.all().update(is_featured=False)
    # 再设置新的精选
    if course_ids:
        await ExternalCourse.filter(id__in=course_ids).update(is_featured=True)
    return {"ok": True, "message": "精选课程已更新"}


@router.post("/set-hot")
async def set_hot_courses(body: dict = Body(...)):
    """设置热门外部课程（替换模式）"""
    # 支持 { course_ids: [...] } 格式
    course_ids = body.get("course_ids", body) if isinstance(body, dict) else body
    if not isinstance(course_ids, list):
        course_ids = []
    # 先取消所有热门
    await ExternalCourse.all().update(is_hot=False)
    # 再设置新的热门
    if course_ids:
        await ExternalCourse.filter(id__in=course_ids).update(is_hot=True)
    return {"ok": True, "message": "热门课程已更新"}
