"""
认证依赖
从请求头获取用户信息
"""
from fastapi import Header, HTTPException

from app.models.user import User


async def get_current_user(x_user_id: str = Header(None, alias="X-User-Id")):
    """
    从请求头获取当前用户
    X-User-Id 由前端登录后设置
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="未登录，请先登录")

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="无效的用户ID")

    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user
