"""
购物车路由
"""
import time
from fastapi import APIRouter, HTTPException, Header

from app.models.cart import Cart
from app.models.course import Course

router = APIRouter(prefix="/api/cart", tags=["购物车"])


def _get_user_id(x_user_id: str = Header(None)):
    """从请求头获取用户ID"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="请先登录")
    return int(x_user_id)


def _cart_item(item):
    """转换购物车项格式"""
    return {
        "id": item.id,
        "courseId": item.product_id,
        "productId": item.product_id,
        "title": item.title,
        "cover": item.cover,
        "price": str(item.price),
        "quantity": item.quantity,
    }


# 获取购物车列表
@router.get("")
async def get_cart(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)

    items = await Cart.filter(user_id=user_id).order_by("-created_at")
    total_count = sum(item.quantity for item in items)
    total_price = sum(float(item.price) * item.quantity for item in items)

    return {
        "ok": True,
        "list": [_cart_item(i) for i in items],
        "totalCount": total_count,
        "totalPrice": total_price
    }


# 添加到购物车
@router.post("/add")
async def add_to_cart(course_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)

    course = await Course.filter(id=course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    existing = await Cart.filter(user_id=user_id, product_id=course_id).first()
    now = int(time.time() * 1000)

    if existing:
        await Cart.filter(id=existing.id).update(
            quantity=existing.quantity + 1,
            updated_at=now
        )
    else:
        await Cart.create(
            user_id=user_id,
            product_id=course_id,
            title=course.title,
            cover=course.cover,
            price=course.price_now,
            quantity=1,
            created_at=now,
            updated_at=now
        )

    return {"ok": True, "message": "添加成功"}


# 更新购物车课程数量
@router.put("/{item_id}")
async def update_cart_item(item_id: int, quantity: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)

    item = await Cart.filter(id=item_id, user_id=user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="购物车项不存在")

    if quantity <= 0:
        await item.delete()
    else:
        await Cart.filter(id=item_id).update(
            quantity=quantity,
            updated_at=int(time.time() * 1000)
        )

    return {"ok": True, "message": "更新成功"}


# 删除购物车课程
@router.delete("/{item_id}")
async def delete_cart_item(item_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)

    item = await Cart.filter(id=item_id, user_id=user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="购物车项不存在")

    await item.delete()
    return {"ok": True, "message": "删除成功"}


# 清空购物车
@router.delete("")
async def clear_cart(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    await Cart.filter(user_id=user_id).delete()
    return {"ok": True, "message": "清空成功"}


# 获取购物车课程ID列表
@router.get("/ids")
async def get_cart_ids(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    items = await Cart.filter(user_id=user_id).all()
    return [item.product_id for item in items]


# 获取购物车课程数量
@router.get("/count")
async def get_cart_count(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    items = await Cart.filter(user_id=user_id).all()
    total = sum(item.quantity for item in items)
    return {"ok": True, "count": total}
