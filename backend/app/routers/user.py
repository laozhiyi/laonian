"""
用户路由
"""
import time
from fastapi import APIRouter, HTTPException

from app.models.user import User
from app.schemas.schemas import UserRegister, UserLogin

router = APIRouter(prefix="/api/users", tags=["用户"])


# 用户注册
@router.post("/register")
async def register(data: UserRegister):
    # 禁止注册 admin 账户
    if data.username.lower() == "admin":
        raise HTTPException(status_code=403, detail="禁止注册管理员账户")

    # 不允许注册管理员角色
    if data.role == "admin":
        raise HTTPException(status_code=403, detail="禁止注册管理员账户")

    # 检查用户名是否已存在
    existing = await User.filter(username=data.username.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")

    now = int(time.time() * 1000)
    
    user = await User.create(
        username=data.username.lower(),
        password=data.password,  # 生产环境应哈希
        role=data.role,
        created_at=now,
        updated_at=now
    )

    return {
        "ok": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }


# 用户登录（优化版）
@router.post("/login")
async def login(data: UserLogin):
    username = data.username.lower()
    password = data.password
    
    # 管理员特殊处理 - 简化逻辑
    # 只有 admin/admin 才能登录，禁止其他账户冒充
    if username == "admin" and password == "admin":
        # 使用 get_or_create 原子操作
        admin, created = await User.get_or_create(
            username="admin",
            defaults={
                "password": "admin",
                "role": "admin",
                "balance": 0,
                "created_at": int(time.time() * 1000),
                "updated_at": int(time.time() * 1000)
            }
        )
        
        # 防止普通用户通过注册 admin 后登录
        if admin.role != "admin":
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        
        return {
            "ok": True,
            "user": {
                "id": admin.id,
                "username": admin.username,
                "role": admin.role,
                "balance": float(admin.balance or 0)
            }
        }

    # 普通用户登录 - 使用单次查询
    user = await User.filter(username=username, password=password).first()

    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    return {
        "ok": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "balance": float(user.balance or 0)
        }
    }


# 登出
@router.post("/logout")
async def logout():
    return {"ok": True, "message": "登出成功"}


# 获取用户信息
@router.get("/{user_id}")
async def get_user(user_id: int):
    user = await User.filter(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return {
        "ok": True,
        "data": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }


# 检查用户名是否存在
@router.get("/check/{username}")
async def check_username(username: str):
    existing = await User.filter(username=username.lower()).first()
    return {"exists": existing is not None}