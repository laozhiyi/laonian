import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from models import db, User, Category, Course

# 蓝图
from routes import (
    auth_bp, course_bp, category_bp,
    favorite_bp, order_bp, log_bp
)


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # 跨域
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # 初始化数据库
    db.init_app(app)

    # 创建 instance 目录
    instance_dir = os.path.join(app.root_path, 'instance')
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)

    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(log_bp)

    # 健康检查
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'Backend is running'})

    # 全局错误处理
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': '接口不存在'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': '服务器内部错误'}), 500

    return app


def init_admin():
    """初始化管理员账号"""
    admin = User.query.filter_by(openid='admin').first()
    if not admin:
        from utils import hash_password, generate_id
        admin = User(
            id=generate_id(),
            openid='admin',
            nickname='管理员',
            password=hash_password('admin'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print('管理员账号已创建: admin / admin')
    else:
        print('管理员账号已存在: admin / admin')


if __name__ == '__main__':
    app = create_app('development')

    with app.app_context():
        db.create_all()
        init_admin()

    print('=' * 50)
    print('什么值得学 - 后端服务')
    print('本地访问地址: http://localhost:3002')
    print('API 文档: http://localhost:3002/api/health')
    print('=' * 50)

    app.run(host='0.0.0.0', port=3002, debug=True)