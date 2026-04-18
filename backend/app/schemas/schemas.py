"""
Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal


# ========== 用户 ==========
class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


# ========== 商品 ==========
class ProductCreate(BaseModel):
    title: str
    desc: Optional[str] = None
    cover: Optional[str] = None
    images: Optional[List[str]] = None
    price: Decimal
    price_now: Decimal
    unit: Optional[str] = "件"
    stock: int = 0
    category: Optional[str] = None
    tags: Optional[List[str]] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    cover: Optional[str] = None
    images: Optional[List[str]] = None
    price: Optional[Decimal] = None
    price_now: Optional[Decimal] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


# ========== 课程 ==========
class CourseCreate(BaseModel):
    title: str
    desc: Optional[str] = None
    cover: Optional[str] = None
    images: Optional[List[str]] = None
    price: Decimal
    price_now: Decimal
    unit: Optional[str] = "课程"
    stock: int = 0
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    instructor: Optional[str] = None
    rating: Optional[Decimal] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    video_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    cover: Optional[str] = None
    images: Optional[List[str]] = None
    price: Optional[Decimal] = None
    price_now: Optional[Decimal] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    instructor: Optional[str] = None
    rating: Optional[Decimal] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    video_url: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    is_hot: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    desc: Optional[str]
    cover: Optional[str]
    images: Optional[List[str]]
    price: Decimal
    price_now: Decimal
    unit: str
    stock: int
    category: Optional[str]
    tags: Optional[List[str]]
    instructor: Optional[str]
    rating: Optional[Decimal]
    duration: Optional[str]
    level: Optional[str]
    video_url: Optional[str]
    status: str
    sales: int
    is_featured: bool = False
    is_hot: bool = False

    class Config:
        from_attributes = True


# ========== 分类 ==========
class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    color: Optional[str]

    class Config:
        from_attributes = True


# ========== 购物车 ==========
class CartItemCreate(BaseModel):
    course_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    course_id: int
    title: str
    cover: Optional[str]
    price: Decimal
    quantity: int

    class Config:
        from_attributes = True


# ========== 订单 ==========
class OrderItem(BaseModel):
    course_id: int
    title: str
    cover: Optional[str]
    price: Decimal
    quantity: int


class OrderAddress(BaseModel):
    name: str
    phone: str
    detail: str


class OrderCreate(BaseModel):
    items: List[OrderItem]
    address: OrderAddress
    remark: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_no: str
    items: List[dict]
    address_name: str
    address_phone: str
    address_detail: str
    total_price: Decimal
    remark: Optional[str]
    status: str

    class Config:
        from_attributes = True


# ========== 地址 ==========
class AddressCreate(BaseModel):
    name: str
    phone: str
    detail: str
    type: str = "other"
    is_default: bool = False


class AddressUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    detail: Optional[str] = None
    type: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    detail: str
    type: str
    is_default: bool

    class Config:
        from_attributes = True


# ========== 通用响应 ==========
class MessageResponse(BaseModel):
    ok: bool = True
    message: str = "操作成功"


class ListResponse(BaseModel):
    ok: bool = True
    list: List
    total: int = 0
