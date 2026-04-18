"""
课程订单模型
"""
from tortoise import fields
from tortoise.models import Model


class CourseOrder(Model):
    """课程订单表"""
    id = fields.IntField(pk=True, autoincrement=True)
    order_no = fields.CharField(max_length=50, unique=True, description="订单号")
    user_id = fields.IntField(description="用户ID")
    course_id = fields.IntField(description="课程ID")
    course_title = fields.CharField(max_length=200, description="课程标题")
    course_cover = fields.CharField(max_length=500, null=True, description="课程封面")
    price = fields.DecimalField(max_digits=10, decimal_places=2, description="购买价格")
    status = fields.CharField(max_length=20, default="paid", description="状态: paid/shipped/completed/refunded")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "course_orders"


class UserCourse(Model):
    """用户已购买课程表"""
    id = fields.IntField(pk=True, autoincrement=True)
    user_id = fields.IntField(description="用户ID")
    course_id = fields.IntField(description="课程ID（外部或内部课程ID）")
    course_type = fields.CharField(max_length=20, default="external", description="课程类型: external/internal")
    order_no = fields.CharField(max_length=50, description="关联订单号")
    course_title = fields.CharField(max_length=200, description="课程标题")
    course_cover = fields.CharField(max_length=500, null=True, description="课程封面")
    course_link = fields.CharField(max_length=1000, description="课程链接（外部课程链接或内部课程视频URL）")
    purchased_at = fields.IntField(description="购买时间戳")

    class Meta:
        table = "user_courses"
