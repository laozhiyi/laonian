"""
初始化示例数据脚本

使用方法：
    python init_data.py

运行后会自动创建：
- 10 个课程分类
- 10 个示例课程
- 管理员账号（如果不存在）
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, init_admin
from models import db, Category, Course, User
from utils import generate_id, hash_password
from datetime import datetime


def init_categories():
    """初始化分类数据"""
    categories_data = [
        {'name': '养生健康', 'icon': '🏃', 'sortOrder': 1},
        {'name': '兴趣爱好', 'icon': '🎨', 'sortOrder': 2},
        {'name': '手机技巧', 'icon': '📱', 'sortOrder': 3},
        {'name': '防诈骗', 'icon': '🛡️', 'sortOrder': 4},
        {'name': '厨艺美食', 'icon': '🍳', 'sortOrder': 5},
        {'name': '摄影摄像', 'icon': '📸', 'sortOrder': 6},
        {'name': '职场技能', 'icon': '💼', 'sortOrder': 7},
        {'name': '经典阅读', 'icon': '📚', 'sortOrder': 8},
        {'name': '音乐舞蹈', 'icon': '🎵', 'sortOrder': 9},
        {'name': '金融理财', 'icon': '💰', 'sortOrder': 10},
    ]

    for cat_data in categories_data:
        existing = Category.query.filter_by(name=cat_data['name']).first()
        if not existing:
            category = Category(
                id=generate_id(),
                name=cat_data['name'],
                icon=cat_data['icon'],
                sort_order=cat_data['sortOrder'],
                status='active',
            )
            db.session.add(category)

    db.session.commit()
    print(f'分类数据初始化完成，共 {Category.query.count()} 条')


def init_courses():
    """初始化课程数据"""
    categories = {c.name: c for c in Category.query.all()}
    if not categories:
        print('请先初始化分类数据！')
        return

    courses_data = [
        {
            'title': '中医养生十二讲',
            'subtitle': '跟着老中医学养生，调理身体从我做起',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '养生健康',
            'tags': ['中老年人适用', '零基础'],
            'instructor': {'name': '李中医', 'bio': '三甲医院主任中医师，从医40年'},
            'platform': '得到',
            'commission_rate': 30,
            'price': 9900,
            'price_now': 2990,
            'discount_text': '限时7折',
            'student_count': 12580,
            'rating': 4.8,
            'rating_count': 2341,
            'suitable_for': '50岁以上中老年人',
            'is_featured': True,
            'is_hot': True,
            'outline': ['中医基础理论', '体质辨识', '饮食养生', '运动养生', '情志养生', '睡眠养生'],
        },
        {
            'title': '八段锦完整教学',
            'subtitle': '国家体育总局推荐，养生健身首选',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '养生健康',
            'tags': ['健身', '零基础'],
            'instructor': {'name': '王教练', 'bio': '国家级健身气功教练'},
            'platform': '小鹅通',
            'commission_rate': 25,
            'price': 4900,
            'price_now': 1990,
            'student_count': 8923,
            'rating': 4.9,
            'rating_count': 1823,
            'suitable_for': '中老年人群',
            'is_featured': True,
            'is_hot': True,
            'outline': ['八段锦简介', '预备式', '双手托天理三焦', '左右开弓似射雕'],
        },
        {
            'title': '零基础学书法',
            'subtitle': '从握笔到创作，书法入门全攻略',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '兴趣爱好',
            'tags': ['书法', '传统文化'],
            'instructor': {'name': '张书法', 'bio': '书法协会会员，20年书法教学经验'},
            'platform': '荔枝微课',
            'commission_rate': 30,
            'price': 8900,
            'price_now': 3990,
            'discount_text': '新课上架优惠',
            'student_count': 5621,
            'rating': 4.7,
            'rating_count': 982,
            'suitable_for': '书法爱好者',
            'is_featured': True,
            'is_hot': False,
            'outline': ['书法工具选择', '正确的执笔姿势', '基本笔画练习', '楷书入门'],
        },
        {
            'title': '广场舞入门教程',
            'subtitle': '简单易学，每天跳一跳，健康又快乐',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '兴趣爱好',
            'tags': ['舞蹈', '健身'],
            'instructor': {'name': '舞蹈老师王芳', 'bio': '专业广场舞教练'},
            'platform': '腾讯课堂',
            'commission_rate': 35,
            'price': 0,
            'price_now': 0,
            'discount_text': '免费',
            'student_count': 25680,
            'rating': 4.6,
            'rating_count': 4521,
            'suitable_for': '中老年朋友',
            'is_featured': False,
            'is_hot': True,
            'outline': ['热身运动', '基础舞步', '第一支舞《欢乐颂》', '第二支舞《走进新时代》'],
        },
        {
            'title': '智能手机使用全攻略',
            'subtitle': '专为中老年人设计的手机教程',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '手机技巧',
            'tags': ['中老年适用', '零基础'],
            'instructor': {'name': '小李老师', 'bio': '老年大学特邀讲师'},
            'platform': '喜马拉雅',
            'commission_rate': 30,
            'price': 3900,
            'price_now': 990,
            'student_count': 18923,
            'rating': 4.9,
            'rating_count': 5621,
            'suitable_for': '50岁以上中老年人',
            'is_featured': True,
            'is_hot': True,
            'outline': ['认识你的手机', '开关机和基本操作', '学会使用微信', '手机支付入门', '手机安全设置'],
        },
        {
            'title': '中老年人防诈骗指南',
            'subtitle': '提高警惕，远离骗局，守护好自己的钱袋子',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '防诈骗',
            'tags': ['安全', '必学'],
            'instructor': {'name': '公安民警张队', 'bio': '反诈中心资深民警'},
            'platform': '小鹅通',
            'commission_rate': 40,
            'price': 0,
            'price_now': 0,
            'discount_text': '免费公益课',
            'student_count': 35689,
            'rating': 4.9,
            'rating_count': 8923,
            'suitable_for': '所有中老年人',
            'is_featured': True,
            'is_hot': True,
            'outline': ['当前诈骗形势分析', '常见诈骗类型盘点', '保健品骗局揭秘', '电信诈骗防范技巧'],
        },
        {
            'title': '家常菜烹饪技巧',
            'subtitle': '学会这些技巧，让你的家常菜更美味',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '厨艺美食',
            'tags': ['烹饪', '实用'],
            'instructor': {'name': '美食达人老刘', 'bio': '知名美食博主'},
            'platform': '荔枝微课',
            'commission_rate': 30,
            'price': 4900,
            'price_now': 1990,
            'student_count': 6789,
            'rating': 4.8,
            'rating_count': 1234,
            'suitable_for': '烹饪爱好者',
            'is_featured': False,
            'is_hot': True,
            'outline': ['刀工基础', '火候控制', '调料使用', '家常豆腐做法', '红烧肉秘诀'],
        },
        {
            'title': '短视频剪辑入门',
            'subtitle': '用手机也能做短视频，记录美好生活',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '职场技能',
            'tags': ['短视频', '副业技能'],
            'instructor': {'name': '新媒体讲师陈老师', 'bio': '10年新媒体从业经验'},
            'platform': '混沌大学',
            'commission_rate': 35,
            'price': 12900,
            'price_now': 4990,
            'student_count': 4521,
            'rating': 4.6,
            'rating_count': 789,
            'suitable_for': '有学习意愿的人群',
            'is_featured': False,
            'is_hot': False,
            'outline': ['短视频发展趋势', '剪辑软件选择', '剪辑基础操作', '添加字幕技巧'],
        },
        {
            'title': '《论语》智慧解读',
            'subtitle': '品味经典，启迪人生智慧',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '经典阅读',
            'tags': ['国学', '传统文化'],
            'instructor': {'name': '国学教授周老师', 'bio': '知名国学学者'},
            'platform': '得到',
            'commission_rate': 30,
            'price': 8900,
            'price_now': 2990,
            'student_count': 3214,
            'rating': 4.8,
            'rating_count': 678,
            'suitable_for': '传统文化爱好者',
            'is_featured': False,
            'is_hot': False,
            'outline': ['论语概述', '学而时习之', '孝悌之道', '为人处世', '交友之道'],
        },
        {
            'title': '太极拳24式教学（即将上线）',
            'subtitle': '国家规范太极拳，健身养生首选',
            'cover': 'https://img.yzcdn.cn/vant/cat.jpeg',
            'category_name': '养生健康',
            'tags': ['太极', '养生'],
            'instructor': {'name': '太极传人陈大师', 'bio': '陈式太极拳传人'},
            'platform': '小鹅通',
            'commission_rate': 30,
            'price': 7900,
            'price_now': 3990,
            'student_count': 0,
            'rating': 0,
            'rating_count': 0,
            'suitable_for': '太极爱好者',
            'is_featured': False,
            'is_hot': False,
            'status': 'offline',
            'outline': ['太极拳简介', '基本功练习', '24式动作详解'],
        },
    ]

    for course_data in courses_data:
        existing = Course.query.filter_by(title=course_data['title']).first()
        if existing:
            continue

        category = categories.get(course_data['category_name'])
        course = Course(
            id=generate_id(),
            title=course_data['title'],
            subtitle=course_data.get('subtitle', ''),
            cover=course_data.get('cover', ''),
            category_id=category.id if category else None,
            category_name=course_data['category_name'],
            tags=course_data.get('tags', []),
            instructor=course_data.get('instructor'),
            platform=course_data.get('platform', ''),
            commission_rate=float(course_data.get('commission_rate', 0)),
            price=int(course_data.get('price', 0)),
            price_now=int(course_data.get('price_now', 0)),
            discount_text=course_data.get('discount_text', ''),
            student_count=int(course_data.get('student_count', 0)),
            rating=float(course_data.get('rating', 0)),
            rating_count=int(course_data.get('rating_count', 0)),
            suitable_for=course_data.get('suitable_for', ''),
            outline=course_data.get('outline', []),
            is_featured=course_data.get('is_featured', False),
            is_hot=course_data.get('is_hot', False),
            status=course_data.get('status', 'online'),
            sort_order=Course.query.count() + 1,
        )
        db.session.add(course)

    db.session.commit()
    print(f'课程数据初始化完成，共 {Course.query.count()} 条')


if __name__ == '__main__':
    app = create_app('development')

    with app.app_context():
        db.create_all()
        print('数据库表创建完成')
        init_admin()
        init_categories()
        init_courses()
        print('=' * 50)
        print('初始化完成！')
        print('=' * 50)