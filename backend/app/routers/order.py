"""
订单路由
"""
import time
import random
import string
from fastapi import APIRouter, HTTPException, Header

from app.models.order import Order
from app.models.product import Product

router = APIRouter(prefix="/api/orders", tags=["订单"])


def _get_user_id(x_user_id: str = Header(None)):
    """从请求头获取用户ID"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="请先登录")
    return int(x_user_id)


def generate_order_no():
    """生成订单号"""
    date = time.strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD{date}{random_str}"


def _order(order):
    """转换订单格式"""
    return {
        "id": order.id,
        "orderNo": order.order_no,
        "order_no": order.order_no,
        "items": order.items,
        "address": {
            "name": order.address_name,
            "phone": order.address_phone,
            "detail": order.address_detail
        },
        "totalPrice": str(order.total_price),
        "total_price": str(order.total_price),
        "remark": order.remark,
        "status": order.status,
        "createdAt": order.created_at,
    }


# 创建订单
@router.post("")
async def create_order(data: dict, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    cart_items = data.get("items", [])
    address = data.get("address", {})
    remark = data.get("remark", "")
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="购物车为空")
    
    if not address or not address.get("name"):
        raise HTTPException(status_code=400, detail="请选择收货地址")
    
    order_no = generate_order_no()
    total_price = sum(item.get("price", 0) * item.get("quantity", 0) for item in cart_items)
    now = int(time.time() * 1000)
    
    order = await Order.create(
        order_no=order_no,
        user_id=user_id,
        items=cart_items,
        address_name=address.get("name", ""),
        address_phone=address.get("phone", ""),
        address_detail=address.get("detail", ""),
        total_price=total_price,
        remark=remark,
        status="shipped",  # 直接设为已发货
        created_at=now,
        updated_at=now
    )
    
    # 减少库存
    for item in cart_items:
        product_id = item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)
        product = await Product.filter(id=product_id).first()
        if product:
            new_stock = max(0, product.stock - quantity)
            await Product.filter(id=product_id).update(stock=new_stock)
    
    return {
        "ok": True,
        "data": {
            "orderId": order.id,
            "orderNo": order.order_no,
            "totalPrice": str(order.total_price)
        }
    }


# 获取订单列表
@router.get("")
async def get_orders(status: str = None, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    query = Order.filter(user_id=user_id)
    if status:
        query = query.filter(status=status)
    
    orders = await query.order_by("-created_at")
    
    return {
        "ok": True,
        "list": [_order(o) for o in orders],
        "total": len(orders)
    }


# 获取订单详情
@router.get("/{order_id}")
async def get_order(order_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    order = await Order.filter(id=order_id, user_id=user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    return {
        "ok": True,
        "data": _order(order)
    }


# 确认收货
@router.post("/{order_id}/confirm")
async def confirm_order(order_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    order = await Order.filter(id=order_id, user_id=user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    await Order.filter(id=order_id).update(
        status="completed",
        completed_at=int(time.time() * 1000),
        updated_at=int(time.time() * 1000)
    )
    
    return {"ok": True, "message": "确认收货成功"}


# 退货/取消订单
@router.post("/{order_id}/refund")
async def refund_order(order_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    order = await Order.filter(id=order_id, user_id=user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 增加库存
    for item in (order.items or []):
        product_id = item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)
        product = await Product.filter(id=product_id).first()
        if product:
            new_stock = product.stock + quantity
            await Product.filter(id=product_id).update(stock=new_stock)
    
    await Order.filter(id=order_id).update(
        status="refunded",
        refunded_at=int(time.time() * 1000),
        updated_at=int(time.time() * 1000)
    )
    
    return {"ok": True, "message": "退货成功"}


# 删除订单（软删除）
@router.delete("/{order_id}")
async def delete_order(order_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    order = await Order.filter(id=order_id, user_id=user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    await Order.filter(id=order_id).update(
        status="refunded",
        deleted=True,
        updated_at=int(time.time() * 1000)
    )
    
    return {"ok": True, "message": "删除成功"}