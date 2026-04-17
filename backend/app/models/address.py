"""
地址模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class Address(Model):
    """收货地址表"""
    id = fields.IntField(pk=True, autoincrement=True)
    user_id = fields.IntField(description="用户ID")
    name = fields.CharField(max_length=50, description="收货人姓名")
    phone = fields.CharField(max_length=20, description="联系电话")
    detail = fields.CharField(max_length=255, description="详细地址")
    type = fields.CharField(max_length=20, default="other", description="类型: home/company/school/other")
    is_default = fields.BooleanField(default=False, description="是否默认")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "addresses"
