"""
购物车模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class Cart(Model):
    """购物车表"""
    id = fields.IntField(pk=True, autoincrement=True)
    user_id = fields.IntField(description="用户ID")
    product_id = fields.IntField(description="商品ID")
    title = fields.CharField(max_length=200, description="商品标题")
    cover = fields.CharField(max_length=500, null=True, description="封面图")
    price = fields.DecimalField(max_digits=10, decimal_places=2, description="单价")
    quantity = fields.IntField(default=1, description="数量")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "cart"
