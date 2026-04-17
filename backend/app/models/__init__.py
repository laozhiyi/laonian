"""
数据模型初始化
"""
from app.models.user import User
from app.models.product import Product
from app.models.course import Course, Category
from app.models.cart import Cart
from app.models.order import Order
from app.models.address import Address
from app.models.external_course import ExternalCourse, CourseCategory

__all__ = ["User", "Product", "Course", "Category", "Cart", "Order", "Address", "ExternalCourse", "CourseCategory"]
