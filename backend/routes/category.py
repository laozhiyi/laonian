from flask import Blueprint, request, jsonify, g
from models import db, Category
from utils import admin_required, generate_id

category_bp = Blueprint('category', __name__, url_prefix='/api/categories')


@category_bp.route('', methods=['GET'])
def list_categories():
    """获取分类列表（公开）"""
    status = request.args.get('status', 'active')
    categories = Category.query
    if status:
        categories = categories.filter_by(status=status)
    categories = categories.order_by(Category.sort_order).all()
    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in categories]
    })


@category_bp.route('', methods=['POST'])
@admin_required
def create_category():
    """创建分类"""
    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({'error': '分类名称不能为空'}), 400

    category = Category(
        id=generate_id(),
        name=data['name'],
        icon=data.get('icon', ''),
        sort_order=int(data.get('sortOrder', 0)),
        status=data.get('status', 'active'),
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({'success': True, 'data': category.to_dict()}), 201


@category_bp.route('/<cat_id>', methods=['PUT'])
@admin_required
def update_category(cat_id):
    """更新分类"""
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({'error': '分类不存在'}), 404

    data = request.get_json() or {}
    for field in ['name', 'icon', 'sortOrder', 'status']:
        camel = field
        snake = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
        if camel in data:
            setattr(category, snake, data[camel])

    db.session.commit()
    return jsonify({'success': True, 'data': category.to_dict()})


@category_bp.route('/<cat_id>', methods=['DELETE'])
@admin_required
def delete_category(cat_id):
    """删除分类"""
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({'error': '分类不存在'}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({'success': True, 'message': '删除成功'})