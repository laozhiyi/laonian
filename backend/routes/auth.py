from flask import Blueprint, request, jsonify, g
from models import db, User
from utils import hash_password, verify_password, generate_token, verify_token, generate_id
from functools import wraps

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def token_required(f):
    """Token 验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': '需要登录'}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': '登录已过期'}), 401
        g.current_user = User.query.get(payload['uid'])
        if not g.current_user:
            return jsonify({'error': '用户不存在'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': '需要登录'}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': '登录已过期'}), 401
        if payload.get('role') != 'admin':
            return jsonify({'error': '需要管理员权限'}), 403
        g.current_user = User.query.get(payload['uid'])
        return f(*args, **kwargs)
    return decorated


def optional_token(f):
    """可选的 Token 验证（用于公开接口）"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        g.current_user = None
        if token:
            payload = verify_token(token)
            if payload:
                g.current_user = User.query.get(payload['uid'])
        return f(*args, **kwargs)
    return decorated


# ==================== 公开接口 ====================

@auth_bp.route('/login', methods=['POST'])
def login():
    """登录"""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    user = User.query.filter_by(openid=username).first()
    if not user:
        return jsonify({'error': '用户名或密码错误'}), 401

    if not verify_password(password, user.password or ''):
        return jsonify({'error': '用户名或密码错误'}), 401

    token = generate_token(user.id, user.role)
    return jsonify({
        'success': True,
        'token': token,
        'userInfo': user.to_dict()
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    """注册"""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    nickname = data.get('nickname', username)

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400
    if len(password) < 6:
        return jsonify({'error': '密码至少6位'}), 400
    if User.query.filter_by(openid=username).first():
        return jsonify({'error': '用户名已存在'}), 409

    user = User(
        id=generate_id(),
        openid=username,
        nickname=nickname,
        password=hash_password(password),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({
        'success': True,
        'token': token,
        'userInfo': user.to_dict()
    })


@auth_bp.route('/user-info', methods=['GET'])
def get_user_info():
    """获取用户信息（无需严格登录，openid 查询）"""
    openid = request.args.get('openid', '').strip()
    if not openid:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if token:
            payload = verify_token(token)
            if payload:
                user = User.query.get(payload['uid'])
                if user:
                    return jsonify({'success': True, 'data': user.to_dict()})
        return jsonify({'error': '未提供标识'}), 400

    user = User.query.filter_by(openid=openid).first()
    if not user:
        return jsonify({'success': False, 'error': '用户不存在'}), 404
    return jsonify({'success': True, 'data': user.to_dict()})


# ==================== 需登录接口 ====================

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile():
    """获取当前用户信息"""
    return jsonify({'success': True, 'data': g.current_user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """更新个人资料"""
    data = request.get_json() or {}
    user = g.current_user

    field_map = {
        'nickname': 'nickname',
        'avatar': 'avatar',
        'fontSize': 'font_size',
    }
    for camel, snake in field_map.items():
        if camel in data:
            setattr(user, snake, data[camel])

    db.session.commit()
    return jsonify({'success': True, 'data': user.to_dict()})


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """登出（前端清除 token 即可，这里仅做记录）"""
    return jsonify({'success': True, 'message': '已退出登录'})


@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """修改密码"""
    data = request.get_json() or {}
    old_pwd = data.get('oldPassword', '')
    new_pwd = data.get('newPassword', '')

    if not verify_password(old_pwd, g.current_user.password or ''):
        return jsonify({'error': '原密码错误'}), 400
    if len(new_pwd) < 6:
        return jsonify({'error': '新密码至少6位'}), 400

    g.current_user.password = hash_password(new_pwd)
    db.session.commit()
    return jsonify({'success': True, 'message': '密码修改成功'})