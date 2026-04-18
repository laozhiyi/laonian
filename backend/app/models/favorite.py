"""
课程收藏模型
"""
from tortoise import fields
from tortoise.models import Model


class CourseFavorite(Model):
    """课程收藏表"""
    id = fields.IntField(pk=True, autoincrement=True)
    user_id = fields.IntField(description="用户ID")
    course_id = fields.IntField(description="课程ID")
    is_external = fields.BooleanField(default=True, description="是否外部课程")
    created_at = fields.IntField(description="收藏时间戳")

    class Meta:
        table = "course_favorites"
        # 同一用户不能重复收藏同一课程
        unique_together = (("user_id", "course_id", "is_external"),)
