"""
课程模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class Course(Model):
    """课程表"""
    id = fields.IntField(pk=True, autoincrement=True)
    title = fields.CharField(max_length=200, description="课程标题")
    desc = fields.TextField(null=True, description="课程描述")
    cover = fields.CharField(max_length=500, null=True, description="封面图")
    images = fields.JSONField(null=True, description="轮播图列表")
    price = fields.DecimalField(max_digits=10, decimal_places=2, description="原价")
    price_now = fields.DecimalField(max_digits=10, decimal_places=2, description="现价")
    unit = fields.CharField(max_length=20, default="课程", description="单位")
    stock = fields.IntField(default=0, description="库存/购买人数限制")
    category = fields.CharField(max_length=50, null=True, description="课程分类")
    tags = fields.JSONField(null=True, description="标签")
    # 课程特有字段
    instructor = fields.CharField(max_length=100, null=True, description="讲师")
    rating = fields.DecimalField(max_digits=3, decimal_places=1, null=True, description="评分")
    student_count = fields.IntField(default=0, description="学习人数")
    duration = fields.CharField(max_length=50, null=True, description="课程时长")
    level = fields.CharField(max_length=20, null=True, description="难度等级: 入门/进阶/高级")
    video_url = fields.CharField(max_length=500, null=True, description="视频地址")
    status = fields.CharField(max_length=20, default="on", description="状态: on/off")
    sales = fields.IntField(default=0, description="销量")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "courses"


# ========== 分类模型 ==========
class Category(Model):
    """课程分类表"""
    id = fields.IntField(pk=True, autoincrement=True)
    name = fields.CharField(max_length=50, description="分类名称")
    icon = fields.CharField(max_length=100, null=True, description="图标/emoji")
    color = fields.CharField(max_length=20, null=True, description="主题色")
    sort = fields.IntField(default=0, description="排序")
    status = fields.CharField(max_length=20, default="on", description="状态: on/off")
    created_at = fields.IntField(description="创建时间戳")

    class Meta:
        table = "categories"
