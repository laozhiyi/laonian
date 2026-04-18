"""
课程收藏路由
"""
import time
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body, Header
from pydantic import BaseModel

from app.models.favorite import CourseFavorite
from app.models.external_course import ExternalCourse

router = APIRouter(prefix="/api/favorites", tags=["课程收藏"])


class FavoriteResponse(BaseModel):
    id: int
    course_id: int
    is_external: bool
    created_at: int
    course: dict = None


def _get_user_id(x_user_id: str = Header(None), user_id: int = Query(None)):
    """从请求头或查询参数获取用户ID"""
    if x_user_id:
        return int(x_user_id)
    if user_id:
        return user_id
    return None


@router.get("")
async def get_favorites(x_user_id: str = Header(None), user_id: int = Query(None)):
    """获取用户的所有收藏"""
    uid = _get_user_id(x_user_id, user_id)
    if not uid:
        return {"ok": True, "list": [], "total": 0}
    
    favorites = await CourseFavorite.all().filter(user_id=uid).order_by("-created_at")

    result = []
    for fav in favorites:
        course_info = None
        if fav.is_external:
            course = await ExternalCourse.filter(id=fav.course_id).first()
            if course:
                course_info = {
                    "id": course.id,
                    "title": course.title,
                    "cover": course.cover,
                    "link": course.link,
                    "description": course.description,
                    "category": course.category,
                }

        result.append({
            "id": fav.id,
            "course_id": fav.course_id,
            "is_external": fav.is_external,
            "created_at": fav.created_at,
            "course": course_info
        })

    return {"ok": True, "list": result, "total": len(result)}


class AddFavoriteBody(BaseModel):
    user_id: Optional[int] = None
    course_id: int
    is_external: bool = True


@router.post("")
async def add_favorite(
    body: AddFavoriteBody,
    x_user_id: str = Header(None)
):
    """添加收藏"""
    # 优先使用 header 中的用户ID
    if x_user_id:
        user_id = int(x_user_id)
    elif body.user_id:
        user_id = body.user_id
    else:
        raise HTTPException(status_code=401, detail="请先登录")
    
    course_id = body.course_id
    is_external = body.is_external

    # 检查是否已收藏
    existing = await CourseFavorite.filter(
        user_id=user_id,
        course_id=course_id,
        is_external=is_external
    ).first()

    if existing:
        return {"ok": True, "id": existing.id, "message": "已收藏"}

    now = int(time.time() * 1000)
    favorite = await CourseFavorite.create(
        user_id=user_id,
        course_id=course_id,
        is_external=is_external,
        created_at=now
    )

    return {"ok": True, "id": favorite.id}


@router.delete("/course")
async def remove_favorite_by_course(
    x_user_id: str = Header(None),
    user_id: int = Query(None),
    course_id: int = Query(...),
    is_external: str = Query("true")
):
    """根据课程ID取消收藏"""
    uid = _get_user_id(x_user_id, user_id)
    if not uid:
        raise HTTPException(status_code=401, detail="请先登录")

    # 转换字符串到布尔值
    is_ext = is_external.lower() in ('true', '1', 'yes') if isinstance(is_external, str) else bool(is_external)

    favorite = await CourseFavorite.filter(
        user_id=uid,
        course_id=course_id,
        is_external=is_ext
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="收藏不存在")

    await favorite.delete()
    return {"ok": True}


@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: int):
    """取消收藏"""
    favorite = await CourseFavorite.filter(id=favorite_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="收藏不存在")

    await favorite.delete()
    return {"ok": True}


@router.get("/check")
async def check_favorite(
    x_user_id: str = Header(None),
    user_id: int = Query(None),
    course_id: int = Query(...),
    is_external: bool = Query(True)
):
    """检查是否已收藏"""
    uid = _get_user_id(x_user_id, user_id)
    if not uid:
        return {"ok": True, "is_favorited": False, "favorite_id": None}
    
    favorite = await CourseFavorite.filter(
        user_id=uid,
        course_id=course_id,
        is_external=is_external
    ).first()

    return {"ok": True, "is_favorited": favorite is not None, "favorite_id": favorite.id if favorite else None}
