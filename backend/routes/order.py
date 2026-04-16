from flask import Blueprint, request, jsonify, g
from models import db, Order
from utils import token_required, admin_required, generate_id, generate_order_no
from datetime import datetime

order_bp = Blueprint('order', __name__, url_prefix='/api/orders')


@order_bp.route('', methods=['GET'])
@token_required
def list_orders():
    """获取订单列表"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    status = request.args.get('status', '')

    query = Order.query.filter_by(user_id=g.current_user.id)
    if status:
        query = query.filter_by(status=status)

    total = query.count()
    orders = query.order_by(db.desc('created_at'))\
        .offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [o.to_dict() for o in orders],
        'total': total,
        'page': page,
        'pageSize': page_size
    })


@order_bp.route('', methods=['POST'])
@token_required
def create_order():
    """创建订单（记录分销订单）"""
    data = request.get_json() or {}
    course_id = data.get('courseId')
    promote_code = data.get('promoteCode', '')
    order_amount = int(data.get('orderAmount', 0))
    commission_rate = float(data.get('commissionRate', 0))
    platform = data.get('platform', '')

    commission = int(order_amount * commission_rate / 100) if commission_rate else 0

    order = Order(
        id=generate_id(),
        order_no=generate_order_no(),
        course_id=course_id,
        user_id=g.current_user.id,
        promote_code=promote_code,
        platform=platform,
        order_amount=order_amount,
        commission=commission,
        commission_rate=commission_rate,
        status='pending',
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({'success': True, 'data': order.to_dict()}), 201


# ==================== 管理员接口 ====================

@order_bp.route('/admin/list', methods=['GET'])
@admin_required
def admin_list_orders():
    """管理员获取所有订单"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    status = request.args.get('status', '')
    user_id = request.args.get('userId', '').strip()

    query = Order.query
    if status:
        query = query.filter_by(status=status)
    if user_id:
        query = query.filter_by(user_id=user_id)

    total = query.count()
    orders = query.order_by(db.desc('created_at'))\
        .offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [o.to_dict() for o in orders],
        'total': total,
        'page': page,
        'pageSize': page_size
    })


@order_bp.route('/<order_id>/confirm', methods=['POST'])
@admin_required
def confirm_order(order_id):
    """确认订单"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': '订单不存在'}), 404
    if order.status != 'pending':
        return jsonify({'error': '订单状态不可操作'}), 400

    order.status = 'confirmed'
    order.confirmed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'data': order.to_dict()})


@order_bp.route('/<order_id>/settle', methods=['POST'])
@admin_required
def settle_order(order_id):
    """结算订单（给用户结算佣金）"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': '订单不存在'}), 404
    if order.status != 'confirmed':
        return jsonify({'error': '订单状态不可结算'}), 400

    from models import User
    user = User.query.get(order.user_id)
    if user:
        user.withdrawable_commission += order.commission
        user.total_commission += order.commission

    order.status = 'settled'
    order.settled_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'data': order.to_dict()})


@order_bp.route('/stats', methods=['GET'])
@admin_required
def order_stats():
    """订单统计（管理员）"""
    from sqlalchemy import func

    total_orders = Order.query.count()
    pending_count = Order.query.filter_by(status='pending').count()
    confirmed_count = Order.query.filter_by(status='confirmed').count()
    settled_count = Order.query.filter_by(status='settled').count()

    total_amount = db.session.query(func.sum(Order.order_amount)).filter_by(status='settled').scalar() or 0
    total_commission = db.session.query(func.sum(Order.commission)).filter_by(status='settled').scalar() or 0

    return jsonify({
        'success': True,
        'data': {
            'totalOrders': total_orders,
            'pendingCount': pending_count,
            'confirmedCount': confirmed_count,
            'settledCount': settled_count,
            'totalAmount': total_amount,
            'totalCommission': total_commission,
        }
    })