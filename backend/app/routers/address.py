"""
地址路由
"""
import time
from fastapi import APIRouter, HTTPException, Header

from app.models.address import Address

router = APIRouter(prefix="/api/addresses", tags=["地址"])


def _get_user_id(x_user_id: str = Header(None)):
    """从请求头获取用户ID"""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="请先登录")
    return int(x_user_id)


def _addr(address):
    """转换地址格式"""
    return {
        "id": address.id,
        "userId": address.user_id,
        "name": address.name,
        "phone": address.phone,
        "detail": address.detail,
        "type": address.type,
        "isDefault": address.is_default,
    }


# 获取地址列表
@router.get("")
async def get_addresses(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    addresses = await Address.filter(user_id=user_id).order_by("-is_default", "-created_at")
    
    # 清理：确保只有一个默认地址
    default_count = sum(1 for a in addresses if a.is_default)
    if default_count > 1:
        # 保留第一个默认，其余取消
        first_default = True
        for addr in addresses:
            if addr.is_default:
                if first_default:
                    first_default = False
                else:
                    await Address.filter(id=addr.id).update(is_default=False, updated_at=int(time.time() * 1000))
    
    # 只有一个地址时自动设为默认
    if len(addresses) == 1 and not addresses[0].is_default:
        await Address.filter(id=addresses[0].id).update(is_default=True, updated_at=int(time.time() * 1000))
        addresses[0].is_default = True
    
    return {
        "ok": True,
        "list": [_addr(a) for a in addresses]
    }


# 获取单个地址
@router.get("/{address_id}")
async def get_address(address_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    address = await Address.filter(id=address_id, user_id=user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    return {"ok": True, "data": _addr(address)}


# 获取默认地址
@router.get("/default")
async def get_default_address(x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    # 优先找默认地址
    address = await Address.filter(user_id=user_id, is_default=True).first()
    if not address:
        # 找第一个
        address = await Address.filter(user_id=user_id).first()
    
    if address:
        return {"ok": True, "data": _addr(address)}
    
    return {"ok": False, "data": None}


# 创建地址
@router.post("")
async def create_address(data: dict, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    now = int(time.time() * 1000)
    
    # 如果设为默认，取消其他默认
    if data.get("isDefault") or data.get("is_default"):
        await Address.filter(user_id=user_id).update(is_default=False)
    
    address = await Address.create(
        user_id=user_id,
        name=data.get("name", ""),
        phone=data.get("phone", ""),
        detail=data.get("detail", ""),
        type=data.get("type", "other"),
        is_default=data.get("isDefault") or data.get("is_default", False),
        created_at=now,
        updated_at=now
    )
    
    return {"ok": True, "id": address.id}


# 更新地址
@router.put("/{address_id}")
async def update_address(address_id: int, data: dict, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    address = await Address.filter(id=address_id, user_id=user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    # 如果设为默认，取消其他默认
    if data.get("isDefault") or data.get("is_default"):
        await Address.filter(user_id=user_id).exclude(id=address_id).update(is_default=False)
    
    update_data = {
        "updated_at": int(time.time() * 1000)
    }
    for field in ["name", "phone", "detail", "type"]:
        if field in data:
            update_data[field] = data[field]
    
    if "isDefault" in data:
        update_data["is_default"] = data["isDefault"]
    elif "is_default" in data:
        update_data["is_default"] = data["is_default"]
    
    await Address.filter(id=address_id).update(**update_data)
    
    return {"ok": True}


# 删除地址
@router.delete("/{address_id}")
async def delete_address(address_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    
    address = await Address.filter(id=address_id, user_id=user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    await address.delete()
    return {"ok": True}


# 设为默认地址
@router.post("/{address_id}/default")
async def set_default_address(address_id: int, x_user_id: str = Header(None)):
    user_id = _get_user_id(x_user_id)
    now = int(time.time() * 1000)
    
    address = await Address.filter(id=address_id, user_id=user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    # 取消所有默认
    await Address.filter(user_id=user_id).update(is_default=False)
    # 设置当前为默认
    await Address.filter(id=address_id).update(is_default=True, updated_at=now)
    
    return {"ok": True}