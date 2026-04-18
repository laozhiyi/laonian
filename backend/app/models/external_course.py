"""
外部课程模型
"""
from tortoise import fields  # type: ignore
from tortoise.models import Model  # type: ignore


class ExternalCourse(Model):
    """外部课程表"""
    id = fields.IntField(pk=True, autoincrement=True)
    title = fields.CharField(max_length=200, description="课程标题")
    cover = fields.CharField(max_length=500, null=True, description="封面图")
    link = fields.CharField(max_length=1000, description="跳转链接")
    description = fields.TextField(null=True, description="课程介绍")
    category = fields.CharField(max_length=50, null=True, description="分类标签")
    price = fields.DecimalField(max_digits=10, decimal_places=2, default=0, description="价格(元)")
    stock = fields.IntField(default=1, description="库存数量")
    sort = fields.IntField(default=0, description="排序")
    status = fields.CharField(max_length=20, default="on", description="状态: on/off")
    # 精选和热门标识
    is_featured = fields.BooleanField(default=False, description="是否精选课程")
    is_hot = fields.BooleanField(default=False, description="是否热门课程")
    created_at = fields.IntField(description="创建时间戳")
    updated_at = fields.IntField(description="更新时间戳")

    class Meta:
        table = "external_courses"


class CourseCategory(Model):
    """课程分类表"""
    id = fields.IntField(pk=True, autoincrement=True)
    name = fields.CharField(max_length=50, description="分类名称")
    icon = fields.CharField(max_length=100, null=True, description="图标/emoji")
    color = fields.CharField(max_length=20, null=True, description="主题色")
    sort = fields.IntField(default=0, description="排序")
    status = fields.CharField(max_length=20, default="on", description="状态: on/off")
    created_at = fields.IntField(description="创建时间戳")

    class Meta:
        table = "course_categories"
