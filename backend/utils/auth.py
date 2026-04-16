import hashlib
import hmac
import base64
import json
import time
from functools import wraps
from flask import request, jsonify, g
from .id_generator import generate_id


def hash_password(password, salt=None):
    """哈希密码"""
    if salt is None:
        salt = 'smz-secret-salt'
    combined = f'{password}{salt}'.encode('utf-8')
    return hashlib.sha256(combined).hexdigest()


def verify_password(password, hashed, salt=None):
    """验证密码"""
    return hash_password(password, salt) == hashed


def generate_token(user_id, role='user'):
    """生成简单 token（生产环境请换用 JWT）"""
    payload = {
        'uid': user_id,
        'role': role,
        'iat': int(time.time()),
        'exp': int(time.time()) + 86400 * 7,
    }
    data = json.dumps(payload, sort_keys=True)
    sig = hmac.new('smz-token-secret'.encode(), data.encode(), hashlib.sha256).digest()
    token = base64.b64encode(f'{data}.{sig.hex()}'.encode()).decode()
    return token


def verify_token(token):
    """验证并解析 token"""
    try:
        decoded = base64.b64decode(token.encode()).decode()
        data, sig = decoded.rsplit('.', 1)
        expected_sig = hmac.new('smz-token-secret'.encode(), data.encode(), hashlib.sha256).hexdigest()
        if sig != expected_sig:
            return None
        payload = json.loads(data)
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def token_required(f):
    """Token 验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        from models import User
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
        from models import User
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
        from models import User
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        g.current_user = None
        if token:
            payload = verify_token(token)
            if payload:
                g.current_user = User.query.get(payload['uid'])
        return f(*args, **kwargs)
    return decorated