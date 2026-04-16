from flask import Blueprint, request, jsonify, g
from models import db, Favorite, Course
from utils import token_required, generate_id

favorite_bp = Blueprint('favorite', __name__, url_prefix='/api/favorites')


@favorite_bp.route('', methods=['GET'])
@token_required
def list_favorites():
    """获取当前用户收藏列表"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    page_size = min(page_size, 100)

    query = Favorite.query.filter_by(user_id=g.current_user.id)\
        .order_by(db.desc('created_at'))
    total = query.count()
    favorites = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [f.to_dict() for f in favorites],
        'total': total,
        'page': page,
        'pageSize': page_size
    })


@favorite_bp.route('', methods=['POST'])
@token_required
def add_favorite():
    """添加收藏"""
    data = request.get_json() or {}
    course_id = data.get('courseId')
    if not course_id:
        return jsonify({'error': '缺少 courseId'}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': '课程不存在'}), 404

    # 检查是否已收藏
    existing = Favorite.query.filter_by(
        user_id=g.current_user.id, course_id=course_id
    ).first()
    if existing:
        return jsonify({'success': True, 'data': existing.to_dict(), 'message': '已收藏'})

    favorite = Favorite(
        id=generate_id(),
        user_id=g.current_user.id,
        course_id=course_id,
        course_title=course.title,
        course_cover=course.cover,
    )
    db.session.add(favorite)
    db.session.commit()
    return jsonify({'success': True, 'data': favorite.to_dict()}), 201


@favorite_bp.route('/<fav_id>', methods=['DELETE'])
@token_required
def remove_favorite(fav_id):
    """取消收藏"""
    favorite = Favorite.query.filter_by(id=fav_id, user_id=g.current_user.id).first()
    if not favorite:
        return jsonify({'error': '收藏记录不存在'}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({'success': True, 'message': '已取消收藏'})


@favorite_bp.route('/check', methods=['GET'])
@token_required
def check_favorite():
    """检查是否已收藏某课程"""
    course_id = request.args.get('courseId', '').strip()
    if not course_id:
        return jsonify({'error': '缺少 courseId'}), 400

    favorite = Favorite.query.filter_by(
        user_id=g.current_user.id, course_id=course_id
    ).first()
    return jsonify({'success': True, 'data': {'isFavorite': favorite is not None}})


@favorite_bp.route('/toggle', methods=['POST'])
@token_required
def toggle_favorite():
    """切换收藏状态"""
    data = request.get_json() or {}
    course_id = data.get('courseId')
    if not course_id:
        return jsonify({'error': '缺少 courseId'}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': '课程不存在'}), 404

    existing = Favorite.query.filter_by(
        user_id=g.current_user.id, course_id=course_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'success': True, 'isFavorite': False})
    else:
        favorite = Favorite(
            id=generate_id(),
            user_id=g.current_user.id,
            course_id=course_id,
            course_title=course.title,
            course_cover=course.cover,
        )
        db.session.add(favorite)
        db.session.commit()
        return jsonify({'success': True, 'isFavorite': True})