"""
商品路由
"""
import time
from fastapi import APIRouter, HTTPException
from decimal import Decimal

from app.models.product import Product
from app.models.cart import Cart
from app.schemas.schemas import ProductCreate, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["商品"])


# 获取商品列表
@router.get("")
async def get_products():
    products = await Product.all().order_by("-created_at")
    return {
        "ok": True,
        "list": [_p(p) for p in products],
        "total": len(products)
    }


def _p(product):
    """转换商品数据格式"""
    return {
        "id": product.id,
        "title": product.title,
        "desc": product.desc,
        "cover": product.cover,
        "images": product.images,
        "price": str(product.price),
        "priceNow": str(product.price_now),
        "price_now": str(product.price_now),
        "unit": product.unit,
        "stock": product.stock,
        "category": product.category,
        "tags": product.tags,
        "status": product.status,
        "sales": product.sales,
    }


# 获取商品详情
@router.get("/{product_id}")
async def get_product(product_id: int):
    product = await Product.filter(id=product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    return {
        "ok": True,
        "data": _p(product)
    }


# 创建商品
@router.post("")
async def create_product(data: ProductCreate):
    now = int(time.time() * 1000)
    product = await Product.create(
        title=data.title,
        desc=data.desc,
        cover=data.cover,
        images=data.images,
        price=data.price,
        price_now=data.price_now,
        unit=data.unit,
        stock=data.stock,
        category=data.category,
        tags=data.tags,
        status="on",
        created_at=now,
        updated_at=now
    )
    
    return {"ok": True, "id": product.id}


# 更新商品
@router.put("/{product_id}")
async def update_product(product_id: int, data: ProductUpdate):
    product = await Product.filter(id=product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = int(time.time() * 1000)
    
    await product.update_from_dict(update_data)
    await product.save()
    
    return {"ok": True}


# 删除商品
@router.delete("/{product_id}")
async def delete_product(product_id: int):
    product = await Product.filter(id=product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    await product.delete()
    return {"ok": True}


# ========== 库存管理 ==========

# 减少库存（下单时调用）
@router.post("/decrease-stock")
async def decrease_stock(items: list):
    """减少商品库存，items 格式: [{"productId": 1, "quantity": 2}, ...]"""
    for item in items:
        product_id = item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)
        
        product = await Product.filter(id=product_id).first()
        if product:
            new_stock = max(0, product.stock - quantity)
            await Product.filter(id=product_id).update(stock=new_stock)
    
    return {"ok": True}


# 增加库存（退货时调用）
@router.post("/increase-stock")
async def increase_stock(items: list):
    """增加商品库存，items 格式: [{"productId": 1, "quantity": 2}, ...]"""
    for item in items:
        product_id = item.get("productId") or item.get("id")
        quantity = item.get("quantity", 1)
        
        product = await Product.filter(id=product_id).first()
        if product:
            new_stock = product.stock + quantity
            await Product.filter(id=product_id).update(stock=new_stock)
    
    return {"ok": True}


# 获取商品库存
@router.get("/{product_id}/stock")
async def get_product_stock(product_id: int):
    product = await Product.filter(id=product_id).first()
    if not product:
        return {"ok": False, "message": "商品不存在"}
    
    return {"ok": True, "stock": product.stock}