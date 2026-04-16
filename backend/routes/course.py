from flask import Blueprint, request, jsonify, g
from models import db, Course, Category
from utils import admin_required, generate_id
from sqlalchemy import or_, desc

course_bp = Blueprint('course', __name__, url_prefix='/api/courses')


# ==================== 公开接口 ====================

@course_bp.route('', methods=['GET'])
def list_courses():
    """获取课程列表（支持分页、筛选、搜索）"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    page_size = min(page_size, 100)

    category_id = request.args.get('categoryId', '').strip()
    keyword = request.args.get('keyword', '').strip()
    featured = request.args.get('featured', '')
    hot = request.args.get('hot', '')
    status = request.args.get('status', 'online')

    query = Course.query

    if category_id:
        query = query.filter_by(category_id=category_id)
    if keyword:
        query = query.filter(or_(
            Course.title.like(f'%{keyword}%'),
            Course.subtitle.like(f'%{keyword}%')
        ))
    if featured == 'true':
        query = query.filter_by(is_featured=True)
    if hot == 'true':
        query = query.filter_by(is_hot=True)
    if status:
        query = query.filter_by(status=status)

    query = query.order_by(desc(Course.sort_order), desc(Course.created_at))

    total = query.count()
    courses = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in courses],
        'total': total,
        'page': page,
        'pageSize': page_size
    })


@course_bp.route('/featured', methods=['GET'])
def featured_courses():
    """获取精选课程"""
    courses = Course.query.filter_by(is_featured=True, status='online')\
        .order_by(desc(Course.sort_order)).limit(6).all()
    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in courses]
    })


@course_bp.route('/recommended', methods=['GET'])
def recommended_courses():
    """获取推荐课程（基于浏览记录，可扩展）"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)

    # 简单策略：优先返回热门 + 精选
    query = Course.query.filter_by(status='online')\
        .order_by(desc(Course.is_featured), desc(Course.is_hot), desc(Course.rating))

    total = query.count()
    courses = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in courses],
        'total': total
    })


@course_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    """获取课程详情"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': '课程不存在'}), 404

    # 增加浏览次数
    course.view_count = (course.view_count or 0) + 1
    db.session.commit()

    return jsonify({
        'success': True,
        'data': course.to_dict()
    })


# ==================== 管理员接口 ====================

@course_bp.route('', methods=['POST'])
@admin_required
def create_course():
    """创建课程"""
    data = request.get_json() or {}
    required = ['title', 'priceNow', 'categoryId']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'缺少必填字段: {field}'}), 400

    category = Category.query.get(data['categoryId'])
    category_name = category.name if category else ''

    course = Course(
        id=generate_id(),
        title=data['title'],
        subtitle=data.get('subtitle', ''),
        cover=data.get('cover', ''),
        category_id=data['categoryId'],
        category_name=category_name,
        tags=data.get('tags', []),
        instructor=data.get('instructor'),
        platform=data.get('platform', ''),
        original_url=data.get('originalUrl', ''),
        promote_url=data.get('promoteUrl', ''),
        promote_code=data.get('promoteCode', ''),
        commission_rate=float(data.get('commissionRate', 0)),
        price=int(data.get('price', 0)),
        price_now=int(data.get('priceNow', 0)),
        discount_text=data.get('discountText', ''),
        student_count=int(data.get('studentCount', 0)),
        rating=float(data.get('rating', 0)),
        rating_count=int(data.get('ratingCount', 0)),
        suitable_for=data.get('suitableFor', ''),
        description=data.get('description', ''),
        outline=data.get('outline', []),
        is_featured=bool(data.get('isFeatured', False)),
        is_hot=bool(data.get('isHot', False)),
        status=data.get('status', 'online'),
        sort_order=int(data.get('sortOrder', 0)),
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'success': True, 'data': course.to_dict()}), 201


@course_bp.route('/<course_id>', methods=['PUT'])
@admin_required
def update_course(course_id):
    """更新课程"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': '课程不存在'}), 404

    data = request.get_json() or {}
    fields = [
        'title', 'subtitle', 'cover', 'categoryId', 'categoryName', 'tags',
        'instructor', 'platform', 'originalUrl', 'promoteUrl', 'promoteCode',
        'commissionRate', 'price', 'priceNow', 'discountText', 'studentCount',
        'rating', 'ratingCount', 'suitableFor', 'description', 'outline',
        'isFeatured', 'isHot', 'status', 'sortOrder'
    ]
    for field in fields:
        camel = field
        snake = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
        if camel in data:
            setattr(course, snake, data[camel])

    db.session.commit()
    return jsonify({'success': True, 'data': course.to_dict()})


@course_bp.route('/<course_id>', methods=['DELETE'])
@admin_required
def delete_course(course_id):
    """删除课程"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': '课程不存在'}), 404

    db.session.delete(course)
    db.session.commit()
    return jsonify({'success': True, 'message': '删除成功'})