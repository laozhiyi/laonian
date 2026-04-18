"""
余额变动记录模型
"""
from tortoise import fields
from tortoise.models import Model


class BalanceTransaction(Model):
    """余额变动记录表"""
    id = fields.IntField(pk=True, autoincrement=True)
    user_id = fields.IntField(description="用户ID")
    type = fields.CharField(max_length=20, description="类型: recharge/withdraw/purchase/admin_add/admin_deduct")
    amount = fields.DecimalField(max_digits=12, decimal_places=2, description="变动金额(正负)")
    balance_before = fields.DecimalField(max_digits=12, decimal_places=2, description="变动前余额")
    balance_after = fields.DecimalField(max_digits=12, decimal_places=2, description="变动后余额")
    remark = fields.CharField(max_length=255, null=True, description="备注")
    order_no = fields.CharField(max_length=64, null=True, description="关联订单号")
    operator_id = fields.IntField(null=True, description="操作人ID(admin操作时)")
    created_at = fields.IntField(description="创建时间戳")

    class Meta:
        table = "balance_transactions"
