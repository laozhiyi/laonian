"""
用户模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class User(Model):
    """用户表"""
    id = fields.IntField(pk=True, autoincrement=True)
    username = fields.CharField(max_length=50, unique=True, description="用户名")
    password = fields.CharField(max_length=255, description="密码（哈希存储）")
    role = fields.CharField(max_length=20, default="user", description="角色: admin/user")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "users"
