"""
FastAPI 应用入口 - 让后端可以通过 uvicorn 运行

python -m uvicorn main:app --reload --port 8000
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Any
import json

from app import create_app as create_flask_app, init_admin
from models import db, User, Category, Course, Order, Favorite, BrowseLog, ClickLog
from utils import generate_id, generate_token, verify_token, hash_password, verify_password

# 创建 FastAPI 应用
app = FastAPI(title="什么值得学 API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Flask 应用（在请求中访问数据库）
flask_app = None


def get_flask_app():
    global flask_app
    if flask_app is None:
        flask_app = create_flask_app('development')
        with flask_app.app_context():
            db.create_all()
            init_admin()
    return flask_app


# 获取当前用户
def get_current_user(request: Request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    return User.query.get(payload['uid'])


# 错误处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={'error': str(exc)})


# ========== 健康检查 ==========
@app.get("/api/health")
async def health():
    return {'status': 'ok', 'message': 'Backend is running'}


# ========== 认证相关 ==========
class LoginForm(BaseModel):
    username: str
    password: str


class RegisterForm(BaseModel):
    username: str
    password: str
    nickname: Optional[str] = None


@app.post("/api/auth/login")
async def login(form: LoginForm):
    user = User.query.filter_by(openid=form.username).first()
    if not user:
        raise HTTPException(status_code=401, detail='用户名或密码错误')
    if not verify_password(form.password, user.password or ''):
        raise HTTPException(status_code=401, detail='用户名或密码错误')
    token = generate_token(user.id, user.role)
    return {'success': True, 'token': token, 'userInfo': user.to_dict()}


@app.post("/api/auth/register")
async def register(form: RegisterForm):
    if User.query.filter_by(openid=form.username).first():
        raise HTTPException(status_code=409, detail='用户名已存在')
    user = User(
        id=generate_id(),
        openid=form.username,
        nickname=form.nickname or form.username,
        password=hash_password(form.password),
        role='user'
    )
    db.session.add(user)
    db.session.commit()
    token = generate_token(user.id, user.role)
    return {'success': True, 'token': token, 'userInfo': user.to_dict()}


@app.get("/api/auth/profile")
async def get_profile(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail='需要登录')
    return {'success': True, 'data': user.to_dict()}


@app.get("/api/auth/user-info")
async def get_user_info(openid: Optional[str] = None, request: Request = None):
    if openid:
        user = User.query.filter_by(openid=openid).first()
        if not user:
            raise HTTPException(status_code=404, detail='用户不存在')
        return {'success': True, 'data': user.to_dict()}
    # 通过 token 获取
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token:
        payload = verify_token(token)
        if payload:
            user = User.query.get(payload['uid'])
            if user:
                return {'success': True, 'data': user.to_dict()}
    raise HTTPException(status_code=400, detail='未提供标识')


# ========== 分类相关 ==========
@app.get("/api/categories")
async def list_categories(status: str = 'active'):
    query = Category.query
    if status:
        query = query.filter_by(status=status)
    categories = query.order_by(Category.sort_order).all()
    return {'success': True, 'data': [c.to_dict() for c in categories]}


@app.post("/api/categories")
async def create_category(request: Request, data: dict = None):
    user = get_current_user(request)
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail='需要管理员权限')
    if not data.get('name'):
        raise HTTPException(status_code=400, detail='分类名称不能为空')
    category = Category(
        id=generate_id(),
        name=data['name'],
        icon=data.get('icon', ''),
        sort_order=int(data.get('sortOrder', 0)),
        status=data.get('status', 'active'),
    )
    db.session.add(category)
    db.session.commit()
    return {'success': True, 'data': category.to_dict()}, 201


# ========== 课程相关 ==========
@app.get("/api/courses")
async def list_courses(
    page: int = 1,
    pageSize: int = 20,
    categoryId: str = '',
    keyword: str = '',
    featured: str = '',
    hot: str = '',
    status: str = 'online'
):
    query = Course.query

    if categoryId:
        query = query.filter_by(category_id=categoryId)
    if keyword:
        from sqlalchemy import or_
        query = query.filter(or_(
            Course.title.like(f'%{keyword}%'),
            Course.subtitle.like(f'%{keyword}%')
        ))
    if featured == 'true':
        query = query.filter_by(is_featured=True)
    if hot == 'true':
        query = query.filter_by(is_hot=True)
    if status:
        query = query.filter_by(status=status)

    from sqlalchemy import desc
    query = query.order_by(desc(Course.sort_order), desc(Course.created_at))

    total = query.count()
    courses = query.offset((page - 1) * pageSize).limit(pageSize).all()

    return {
        'success': True,
        'data': [c.to_dict() for c in courses],
        'total': total,
        'page': page,
        'pageSize': pageSize
    }


@app.get("/api/courses/featured")
async def featured_courses():
    from sqlalchemy import desc
    courses = Course.query.filter_by(is_featured=True, status='online')\
        .order_by(desc(Course.sort_order)).limit(6).all()
    return {'success': True, 'data': [c.to_dict() for c in courses]}


@app.get("/api/courses/recommended")
async def recommended_courses(page: int = 1, pageSize: int = 20):
    from sqlalchemy import desc
    query = Course.query.filter_by(status='online')\
        .order_by(desc(Course.is_featured), desc(Course.is_hot), desc(Course.rating))
    total = query.count()
    courses = query.offset((page - 1) * pageSize).limit(pageSize).all()
    return {'success': True, 'data': [c.to_dict() for c in courses], 'total': total}


@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    course = Course.query.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail='课程不存在')
    # 增加浏览次数
    course.view_count = (course.view_count or 0) + 1
    db.session.commit()
    return {'success': True, 'data': course.to_dict()}


@app.post("/api/courses")
async def create_course(request: Request, data: dict):
    user = get_current_user(request)
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail='需要管理员权限')
    required = ['title', 'priceNow', 'categoryId']
    for field in required:
        if not data.get(field):
            raise HTTPException(status_code=400, detail=f'缺少必填字段: {field}')

    category = Category.query.get(data['categoryId'])
    category_name = category.name if category else ''

    course = Course(
        id=generate_id(),
        title=data['title'],
        subtitle=data.get('subtitle', ''),
        cover=data.get('cover', ''),
        category_id=data['categoryId'],
        category_name=category_name,
        tags=data.get('tags', []),
        instructor=data.get('instructor'),
        platform=data.get('platform', ''),
        original_url=data.get('originalUrl', ''),
        promote_url=data.get('promoteUrl', ''),
        promote_code=data.get('promoteCode', ''),
        commission_rate=float(data.get('commissionRate', 0)),
        price=int(data.get('price', 0)),
        price_now=int(data.get('priceNow', 0)),
        discount_text=data.get('discountText', ''),
        student_count=int(data.get('studentCount', 0)),
        rating=float(data.get('rating', 0)),
        rating_count=int(data.get('ratingCount', 0)),
        suitable_for=data.get('suitableFor', ''),
        description=data.get('description', ''),
        outline=data.get('outline', []),
        is_featured=bool(data.get('isFeatured', False)),
        is_hot=bool(data.get('isHot', False)),
        status=data.get('status', 'online'),
        sort_order=int(data.get('sortOrder', 0)),
    )
    db.session.add(course)
    db.session.commit()
    return {'success': True, 'data': course.to_dict()}, 201


# ========== 收藏相关 ==========
@app.get("/api/favorites")
async def list_favorites(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail='需要登录')
    favorites = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.created_at.desc()).all()
    return {'success': True, 'data': [f.to_dict() for f in favorites]}


@app.post("/api/favorites")
async def add_favorite(request: Request, data: dict):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail='需要登录')
    course_id = data.get('courseId')
    course = Course.query.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail='课程不存在')

    existing = Favorite.query.filter_by(user_id=user.id, course_id=course_id).first()
    if existing:
        return {'success': True, 'message': '已收藏'}

    favorite = Favorite(
        id=generate_id(),
        user_id=user.id,
        course_id=course_id,
        course_title=course.title,
        course_cover=course.cover,
    )
    db.session.add(favorite)
    db.session.commit()
    return {'success': True, 'data': favorite.to_dict()}


@app.delete("/api/favorites/{course_id}")
async def remove_favorite(course_id: str, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail='需要登录')
    favorite = Favorite.query.filter_by(user_id=user.id, course_id=course_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
    return {'success': True, 'message': '取消收藏成功'}


# ========== 日志相关 ==========
@app.post("/api/logs/browse")
async def add_browse_log(request: Request, data: dict):
    user = get_current_user(request)
    user_id = user.id if user else None

    log = BrowseLog(
        id=generate_id(),
        user_id=user_id,
        course_id=data.get('courseId'),
        course_title=data.get('courseTitle', ''),
        course_cover=data.get('courseCover', ''),
        action=data.get('action', 'view'),
        promote_code=data.get('promoteCode'),
        source=data.get('source', 'home'),
    )
    db.session.add(log)
    db.session.commit()
    return {'success': True}


@app.post("/api/logs/click")
async def add_click_log(request: Request, data: dict):
    user = get_current_user(request)
    user_id = user.id if user else None

    log = ClickLog(
        id=generate_id(),
        user_id=user_id,
        course_id=data.get('courseId'),
        promote_code=data.get('promoteCode'),
        promote_url=data.get('promoteUrl', ''),
        platform=data.get('platform', ''),
        ip=request.client.host if request.client else None,
    )
    db.session.add(log)
    db.session.commit()
    return {'success': True}


if __name__ == '__main__':
    print('=' * 50)
    print('什么值得学 - 后端服务 (FastAPI)')
    print('本地访问地址: http://localhost:8000')
    print('API 文档: http://localhost:8000/docs')
    print('=' * 50)
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)