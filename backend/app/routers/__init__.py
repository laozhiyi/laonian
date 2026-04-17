"""
路由初始化
"""
from app.routers.user import router as user_router
from app.routers.product import router as product_router
from app.routers.cart import router as cart_router
from app.routers.order import router as order_router
from app.routers.address import router as address_router
from app.routers.course import router as course_router
from app.routers.external_course import router as external_course_router

__all__ = ["user_router", "product_router", "cart_router", "order_router", "address_router", "course_router", "external_course_router"]