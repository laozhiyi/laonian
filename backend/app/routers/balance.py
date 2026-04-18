"""
余额管理接口
"""
import time
import uuid
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from tortoise.functions import Sum

from app.models.user import User
from app.models.balance import BalanceTransaction
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/balance", tags=["余额管理"])


class RechargeRequest(BaseModel):
    amount: float


class AdminAdjustRequest(BaseModel):
    user_id: int
    amount: float
    remark: str = ""


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    balance_before: float
    balance_after: float
    remark: str = ""
    created_at: int


@router.get("/info")
async def get_balance_info(current_user: User = Depends(get_current_user)):
    """获取当前用户余额信息"""
    return {
        "balance": float(current_user.balance or 0),
        "username": current_user.username,
    }


@router.get("/transactions")
async def get_transactions(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user)
):
    """获取余额变动记录"""
    offset = (page - 1) * page_size
    transactions = await BalanceTransaction.filter(user_id=current_user.id).order_by("-created_at").offset(offset).limit(page_size)
    
    total = await BalanceTransaction.filter(user_id=current_user.id).count()
    
    return {
        "list": [
            {
                "id": t.id,
                "type": t.type,
                "amount": float(t.amount),
                "balance_before": float(t.balance_before),
                "balance_after": float(t.balance_after),
                "remark": t.remark or "",
                "created_at": t.created_at,
            }
            for t in transactions
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/recharge")
async def recharge(
    req: RechargeRequest,
    current_user: User = Depends(get_current_user)
):
    """模拟充值（实际需要对接支付接口）"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="充值金额必须大于0")
    
    amount = Decimal(str(req.amount))
    balance_before = Decimal(str(current_user.balance or 0))
    balance_after = balance_before + amount
    
    order_no = f"RC{time.strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8].upper()}"
    
    current_user.balance = balance_after
    current_user.updated_at = int(time.time())
    await current_user.save()
    
    await BalanceTransaction.create(
        user_id=current_user.id,
        type="recharge",
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        remark="余额充值",
        order_no=order_no,
        created_at=int(time.time()),
    )
    
    return {
        "success": True,
        "balance": float(current_user.balance),
        "order_no": order_no,
    }


@router.get("/admin/users")
async def get_all_users_balance(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    current_user: User = Depends(get_current_user)
):
    """管理员获取所有用户余额列表"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    offset = (page - 1) * page_size
    query = User.all()
    
    if keyword:
        query = query.filter(username__icontains=keyword)
    
    users = await query.order_by("-id").offset(offset).limit(page_size)
    total = await query.count()
    
    result = []
    for user in users:
        total_recharge = await BalanceTransaction.filter(user_id=user.id, type__in=["recharge", "admin_add"]).annotate(total=Sum("amount")).first()
        total_consume = await BalanceTransaction.filter(user_id=user.id, type__in=["purchase", "admin_deduct"]).annotate(total=Sum("amount")).first()
        
        result.append({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "balance": float(user.balance or 0),
            "total_recharge": float(total_recharge.total or 0) if total_recharge else 0,
            "total_consume": abs(float(total_consume.total or 0)) if total_consume else 0,
            "created_at": user.created_at,
        })
    
    return {
        "list": result,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/admin/adjust")
async def admin_adjust_balance(
    req: AdminAdjustRequest,
    current_user: User = Depends(get_current_user)
):
    """管理员调整用户余额"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    target_user = await User.get_or_none(id=req.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    amount = Decimal(str(req.amount))
    balance_before = Decimal(str(target_user.balance or 0))
    
    if amount > 0:
        balance_after = balance_before + amount
        tx_type = "admin_add"
    else:
        balance_after = balance_before + amount
        if balance_after < 0:
            raise HTTPException(status_code=400, detail="余额不足")
        tx_type = "admin_deduct"
    
    target_user.balance = balance_after
    target_user.updated_at = int(time.time())
    await target_user.save()
    
    await BalanceTransaction.create(
        user_id=target_user.id,
        type=tx_type,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        remark=req.remark or ("管理员充值" if amount > 0 else "管理员扣减"),
        operator_id=current_user.id,
        created_at=int(time.time()),
    )
    
    return {
        "success": True,
        "balance": float(target_user.balance),
    }


@router.get("/admin/transactions/{user_id}")
async def get_user_transactions(
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user)
):
    """管理员查看指定用户的余额变动记录"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    offset = (page - 1) * page_size
    transactions = await BalanceTransaction.filter(user_id=user_id).order_by("-created_at").offset(offset).limit(page_size)
    total = await BalanceTransaction.filter(user_id=user_id).count()
    
    return {
        "list": [
            {
                "id": t.id,
                "type": t.type,
                "amount": float(t.amount),
                "balance_before": float(t.balance_before),
                "balance_after": float(t.balance_after),
                "remark": t.remark or "",
                "order_no": t.order_no or "",
                "created_at": t.created_at,
            }
            for t in transactions
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
