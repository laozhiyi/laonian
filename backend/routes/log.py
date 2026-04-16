from flask import Blueprint, request, jsonify, g
from models import db, BrowseLog, ClickLog
from utils import token_required, optional_token, generate_id

log_bp = Blueprint('log', __name__, url_prefix='/api/logs')


@log_bp.route('/browse', methods=['POST'])
@optional_token
def add_browse_log():
    """添加浏览日志"""
    data = request.get_json() or {}
    course_id = data.get('courseId')
    if not course_id:
        return jsonify({'error': '缺少 courseId'}), 400

    user_id = g.current_user.id if g.current_user else None

    log = BrowseLog(
        id=generate_id(),
        user_id=user_id,
        course_id=course_id,
        course_title=data.get('courseTitle', ''),
        course_cover=data.get('courseCover', ''),
        action=data.get('action', 'view'),
        promote_code=data.get('promoteCode', ''),
        source=data.get('source', ''),
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'success': True}), 201


@log_bp.route('/browse', methods=['GET'])
@token_required
def list_browse_logs():
    """获取浏览历史"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)

    query = BrowseLog.query.filter_by(user_id=g.current_user.id)\
        .order_by(db.desc('created_at'))
    total = query.count()
    logs = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [log.to_dict() for log in logs],
        'total': total,
        'page': page,
        'pageSize': page_size
    })


@log_bp.route('/click', methods=['POST'])
@optional_token
def add_click_log():
    """记录点击跳转（分销追踪）"""
    data = request.get_json() or {}
    course_id = data.get('courseId')
    if not course_id:
        return jsonify({'error': '缺少 courseId'}), 400

    user_id = g.current_user.id if g.current_user else None

    log = ClickLog(
        id=generate_id(),
        user_id=user_id,
        course_id=course_id,
        promote_code=data.get('promoteCode', ''),
        promote_url=data.get('promoteUrl', ''),
        platform=data.get('platform', ''),
        ip=request.remote_addr,
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'success': True}), 201


@log_bp.route('/click', methods=['GET'])
@token_required
def list_click_logs():
    """获取点击记录（用户查看自己）"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)

    query = ClickLog.query.filter_by(user_id=g.current_user.id)\
        .order_by(db.desc('click_time'))
    total = query.count()
    logs = query.offset((page - 1) * page_size).limit(page_size).all()

    return jsonify({
        'success': True,
        'data': [log.to_dict() for log in logs],
        'total': total,
        'page': page,
        'pageSize': page_size
    })