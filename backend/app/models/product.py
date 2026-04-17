"""
商品模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class Product(Model):
    """商品表"""
    id = fields.IntField(pk=True, autoincrement=True)
    title = fields.CharField(max_length=200, description="商品标题")
    desc = fields.TextField(null=True, description="商品描述")
    cover = fields.CharField(max_length=500, null=True, description="封面图")
    images = fields.JSONField(null=True, description="轮播图列表")
    price = fields.DecimalField(max_digits=10, decimal_places=2, description="原价")
    price_now = fields.DecimalField(max_digits=10, decimal_places=2, description="现价")
    unit = fields.CharField(max_length=20, default="件", description="单位")
    stock = fields.IntField(default=0, description="库存")
    category = fields.CharField(max_length=50, null=True, description="分类")
    tags = fields.JSONField(null=True, description="标签")
    status = fields.CharField(max_length=20, default="on", description="状态: on/off")
    sales = fields.IntField(default=0, description="销量")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "products"
