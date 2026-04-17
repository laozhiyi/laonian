"""
订单模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class Order(Model):
    """订单表"""
    id = fields.IntField(pk=True, autoincrement=True)
    order_no = fields.CharField(max_length=30, unique=True, description="订单号")
    user_id = fields.IntField(description="用户ID")
    items = fields.JSONField(description="订单商品列表")
    address_name = fields.CharField(max_length=50, description="收货人姓名")
    address_phone = fields.CharField(max_length=20, description="联系电话")
    address_detail = fields.CharField(max_length=255, description="详细地址")
    total_price = fields.DecimalField(max_digits=10, decimal_places=2, description="总金额")
    remark = fields.CharField(max_length=500, null=True, description="备注")
    status = fields.CharField(max_length=20, default="pending", description="状态")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")
    completed_at = fields.IntField(null=True, description="完成时间戳")
    refunded_at = fields.IntField(null=True, description="退货时间戳")

    class Meta:
        table = "orders"
