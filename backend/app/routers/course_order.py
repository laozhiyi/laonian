"""
课程订单路由
"""
import time
import random
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.course_order import CourseOrder, UserCourse
from app.models.external_course import ExternalCourse
from app.models.course import Course
from app.models.user import User
from app.models.balance import BalanceTransaction
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/course-orders", tags=["课程订单"])


def generate_order_no():
    """生成订单号"""
    timestamp = int(time.time() * 1000)
    random_str = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=6))
    return f"CO{timestamp}{random_str}"


class CreateOrderRequest(BaseModel):
    course_id: int


@router.post("")
async def create_order(data: CreateOrderRequest, current_user: User = Depends(get_current_user)):
    """创建课程订单并使用余额支付"""
    # 获取课程信息
    course = await ExternalCourse.filter(id=data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    if course.status != "on":
        raise HTTPException(status_code=400, detail="课程已下架")

    if course.stock < 1:
        raise HTTPException(status_code=400, detail="课程库存不足")

    # 检查是否已购买
    existing = await UserCourse.filter(
        user_id=current_user.id,
        course_id=data.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已购买过该课程")

    # 检查余额
    price = Decimal(str(course.price))
    balance = Decimal(str(current_user.balance or 0))
    if balance < price:
        raise HTTPException(status_code=400, detail=f"余额不足，需要 {float(price):.2f} 元，当前余额 {float(balance):.2f} 元")

    now = int(time.time() * 1000)
    order_no = generate_order_no()

    # 扣减余额
    balance_before = balance
    balance_after = balance - price
    current_user.balance = balance_after
    current_user.updated_at = now
    await current_user.save()

    # 记录余额变动
    await BalanceTransaction.create(
        user_id=current_user.id,
        type="purchase",
        amount=-price,
        balance_before=balance_before,
        balance_after=balance_after,
        remark=f"购买课程：{course.title}",
        order_no=order_no,
        created_at=now,
    )

    # 创建订单
    order = await CourseOrder.create(
        order_no=order_no,
        user_id=current_user.id,
        course_id=course.id,
        course_title=course.title,
        course_cover=course.cover,
        price=price,
        status="paid",
        created_at=now,
        updated_at=now
    )

    # 减少库存
    course.stock -= 1
    course.updated_at = now
    await course.save()

    # 添加用户课程记录
    await UserCourse.create(
        user_id=current_user.id,
        course_id=course.id,
        order_no=order_no,
        course_title=course.title,
        course_cover=course.cover,
        course_link=course.link,
        purchased_at=now
    )

    return {
        "ok": True,
        "data": {
            "order_id": order.id,
            "order_no": order_no,
            "course_title": course.title,
            "price": float(price),
            "balance": float(balance_after)
        }
    }


@router.get("/user")
async def get_user_orders(current_user: User = Depends(get_current_user)):
    """获取用户的课程订单列表"""
    orders = await CourseOrder.filter(user_id=current_user.id).order_by("-created_at")
    return {
        "ok": True,
        "list": [
            {
                "id": o.id,
                "order_no": o.order_no,
                "course_id": o.course_id,
                "course_title": o.course_title,
                "course_cover": o.course_cover,
                "price": float(o.price),
                "status": o.status,
                "created_at": o.created_at
            }
            for o in orders
        ]
    }


@router.get("/purchased")
async def get_purchased_courses(current_user: User = Depends(get_current_user)):
    """获取用户已购买的课程"""
    courses = await UserCourse.filter(user_id=current_user.id).order_by("-purchased_at")
    return {
        "ok": True,
        "list": [
            {
                "id": c.id,
                "course_id": c.course_id,
                "course_type": c.course_type,
                "course_title": c.course_title,
                "course_cover": c.course_cover,
                "course_link": c.course_link,
                "purchased_at": c.purchased_at
            }
            for c in courses
        ]
    }


@router.get("/check/{course_id}")
async def check_purchased(course_id: int, current_user: User = Depends(get_current_user)):
    """检查用户是否已购买某课程"""
    existing = await UserCourse.filter(
        user_id=current_user.id,
        course_id=course_id
    ).first()
    return {
        "ok": True,
        "purchased": existing is not None,
        "course_link": existing.course_link if existing else None,
        "course_type": existing.course_type if existing else None
    }


# ========== 内部课程订单（购买内部课程含视频） ==========

class CreateInternalOrderRequest(BaseModel):
    course_id: int


@router.post("/internal")
async def create_internal_order(data: CreateInternalOrderRequest, current_user: User = Depends(get_current_user)):
    """购买内部课程（含视频）"""
    # 获取课程信息
    course = await Course.filter(id=data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    if course.status != "on":
        raise HTTPException(status_code=400, detail="课程已下架")

    # 检查是否已购买
    existing = await UserCourse.filter(
        user_id=current_user.id,
        course_id=data.course_id,
        course_type="internal"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已购买过该课程")

    # 检查余额
    price = Decimal(str(course.price_now))
    balance = Decimal(str(current_user.balance or 0))
    if balance < price:
        raise HTTPException(
            status_code=400,
            detail=f"余额不足，需要 {float(price):.2f} 元，当前余额 {float(balance):.2f} 元"
        )

    now = int(time.time() * 1000)
    order_no = generate_order_no()

    # 扣减余额
    balance_before = balance
    balance_after = balance - price
    current_user.balance = balance_after
    current_user.updated_at = now
    await current_user.save()

    # 记录余额变动
    await BalanceTransaction.create(
        user_id=current_user.id,
        type="purchase",
        amount=-price,
        balance_before=balance_before,
        balance_after=balance_after,
        remark=f"购买内部课程：{course.title}",
        order_no=order_no,
        created_at=now,
    )

    # 创建订单
    order = await CourseOrder.create(
        order_no=order_no,
        user_id=current_user.id,
        course_id=course.id,
        course_title=course.title,
        course_cover=course.cover,
        price=price,
        status="paid",
        created_at=now,
        updated_at=now
    )

    # 课程销量+1
    course.sales = (course.sales or 0) + 1
    course.updated_at = now
    await course.save()

    # 添加用户课程记录（内部课程存视频URL）
    await UserCourse.create(
        user_id=current_user.id,
        course_id=course.id,
        course_type="internal",
        order_no=order_no,
        course_title=course.title,
        course_cover=course.cover,
        course_link=course.video_url or "",
        purchased_at=now
    )

    return {
        "ok": True,
        "data": {
            "order_id": order.id,
            "order_no": order_no,
            "course_title": course.title,
            "price": float(price),
            "balance": float(balance_after),
            "video_url": course.video_url
        }
    }


@router.get("/check-internal/{course_id}")
async def check_internal_purchased(course_id: int, current_user: User = Depends(get_current_user)):
    """检查用户是否已购买某内部课程"""
    existing = await UserCourse.filter(
        user_id=current_user.id,
        course_id=course_id,
        course_type="internal"
    ).first()
    return {
        "ok": True,
        "purchased": existing is not None,
        "video_url": existing.course_link if existing else None,
        "course_type": "internal"
    }
