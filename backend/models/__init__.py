from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(32), primary_key=True)
    openid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    nickname = db.Column(db.String(64))
    avatar = db.Column(db.String(512))
    password = db.Column(db.String(128))  # bcrypt 加密存储
    role = db.Column(db.String(16), default='user')  # user / admin
    font_size = db.Column(db.String(16), default='normal')  # normal / large / extra
    interest_tags = db.Column(db.JSON, default=list)  # 兴趣标签数组
    interest_weights = db.Column(db.JSON, default=dict)  # 兴趣权重
    total_commission = db.Column(db.Integer, default=0)  # 累计佣金（分）
    withdrawable_commission = db.Column(db.Integer, default=0)  # 可提现佣金（分）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'openid': self.openid,
            'nickname': self.nickname,
            'avatar': self.avatar,
            'role': self.role,
            'fontSize': self.font_size,
            'interestTags': self.interest_tags,
            'interestWeights': self.interest_weights,
            'totalCommission': self.total_commission,
            'withdrawableCommission': self.withdrawable_commission,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastActiveAt': self.last_active_at.isoformat() if self.last_active_at else None,
        }


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(32), nullable=False)
    icon = db.Column(db.String(32))  # emoji 或图标 URL
    sort_order = db.Column(db.Integer, default=0)
    status = db.Column(db.String(16), default='active')  # active / inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'name': self.name,
            'icon': self.icon,
            'sortOrder': self.sort_order,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.String(32), primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    subtitle = db.Column(db.String(256))
    cover = db.Column(db.String(512))
    category_id = db.Column(db.String(32), db.ForeignKey('categories.id'))
    category_name = db.Column(db.String(32))
    tags = db.Column(db.JSON, default=list)
    instructor = db.Column(db.JSON)  # {name, avatar, bio}
    platform = db.Column(db.String(32))
    original_url = db.Column(db.String(512))
    promote_url = db.Column(db.String(512))
    promote_code = db.Column(db.String(64), index=True)
    commission_rate = db.Column(db.Float, default=0)  # 百分比
    price = db.Column(db.Integer, default=0)  # 原价（分）
    price_now = db.Column(db.Integer, default=0)  # 现价（分）
    discount_text = db.Column(db.String(32))
    student_count = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0)
    rating_count = db.Column(db.Integer, default=0)
    suitable_for = db.Column(db.String(128))
    description = db.Column(db.Text)
    outline = db.Column(db.JSON, default=list)  # 课程大纲数组
    is_featured = db.Column(db.Boolean, default=False)
    is_hot = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(16), default='online')  # online / offline
    sort_order = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    click_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'title': self.title,
            'subtitle': self.subtitle,
            'cover': self.cover,
            'categoryId': self.category_id,
            'categoryName': self.category_name,
            'tags': self.tags,
            'instructor': self.instructor,
            'platform': self.platform,
            'originalUrl': self.original_url,
            'promoteUrl': self.promote_url,
            'promoteCode': self.promote_code,
            'commissionRate': self.commission_rate,
            'price': self.price,
            'priceNow': self.price_now,
            'discountText': self.discount_text,
            'studentCount': self.student_count,
            'rating': self.rating,
            'ratingCount': self.rating_count,
            'suitableFor': self.suitable_for,
            'description': self.description,
            'outline': self.outline,
            'isFeatured': self.is_featured,
            'isHot': self.is_hot,
            'status': self.status,
            'sortOrder': self.sort_order,
            'viewCount': self.view_count,
            'clickCount': self.click_count,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.String(32), primary_key=True)
    order_no = db.Column(db.String(64), unique=True, index=True)
    course_id = db.Column(db.String(32), db.ForeignKey('courses.id'))
    course_title = db.Column(db.String(128))
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    promote_code = db.Column(db.String(64), index=True)
    platform = db.Column(db.String(32))
    order_amount = db.Column(db.Integer, default=0)  # 订单金额（分）
    commission = db.Column(db.Integer, default=0)  # 佣金金额（分）
    commission_rate = db.Column(db.Float, default=0)
    status = db.Column(db.String(16), default='pending')  # pending / confirmed / settled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime)
    settled_at = db.Column(db.DateTime)

    # 关联
    course = db.relationship('Course', backref='orders')
    user = db.relationship('User', backref='orders')

    def to_dict(self):
        return {
            '_id': self.id,
            'orderNo': self.order_no,
            'courseId': self.course_id,
            'courseTitle': self.course_title,
            'userId': self.user_id,
            'promoteCode': self.promote_code,
            'platform': self.platform,
            'orderAmount': self.order_amount,
            'commission': self.commission,
            'commissionRate': self.commission_rate,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'confirmedAt': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'settledAt': self.settled_at.isoformat() if self.settled_at else None,
        }


class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    course_id = db.Column(db.String(32), db.ForeignKey('courses.id'))
    course_title = db.Column(db.String(128))
    course_cover = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 防止重复收藏
    __table_args__ = (
        db.UniqueConstraint('user_id', 'course_id', name='unique_user_course_favorite'),
    )

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'courseId': self.course_id,
            'courseTitle': self.course_title,
            'courseCover': self.course_cover,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class BrowseLog(db.Model):
    __tablename__ = 'browse_logs'

    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    course_id = db.Column(db.String(32), db.ForeignKey('courses.id'))
    course_title = db.Column(db.String(128))
    course_cover = db.Column(db.String(512))
    action = db.Column(db.String(16))  # view / click / favorite
    promote_code = db.Column(db.String(64))
    source = db.Column(db.String(32))  # home / recommend / search / category
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'courseId': self.course_id,
            'courseTitle': self.course_title,
            'courseCover': self.course_cover,
            'action': self.action,
            'promoteCode': self.promote_code,
            'source': self.source,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class ClickLog(db.Model):
    __tablename__ = 'click_logs'

    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    course_id = db.Column(db.String(32), db.ForeignKey('courses.id'))
    promote_code = db.Column(db.String(64), index=True)
    promote_url = db.Column(db.String(512))
    platform = db.Column(db.String(32))
    ip = db.Column(db.String(32))
    click_time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'courseId': self.course_id,
            'promoteCode': self.promote_code,
            'promoteUrl': self.promote_url,
            'platform': self.platform,
            'ip': self.ip,
            'clickTime': self.click_time.isoformat() if self.click_time else None,
        }


class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    name = db.Column(db.String(32))
    phone = db.Column(db.String(20))
    province = db.Column(db.String(32))
    city = db.Column(db.String(32))
    district = db.Column(db.String(32))
    detail = db.Column(db.String(256))  # 详细地址
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'province': self.province,
            'city': self.city,
            'district': self.district,
            'detail': self.detail,
            'isDefault': self.is_default,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Cart(db.Model):
    __tablename__ = 'cart'

    id = db.Column(db.String(32), primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), index=True)
    course_id = db.Column(db.String(32), db.ForeignKey('courses.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'course_id', name='unique_user_course_cart'),
    )

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'courseId': self.course_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }