import uuid
import time


def generate_id():
    """生成唯一 ID（格式兼容 uniCloud）"""
    return f'{int(time.time() * 1000):013d}{uuid.uuid4().hex[:7]}'


def generate_order_no():
    """生成订单号"""
    return f'ORD{int(time.time() * 1000)}{uuid.uuid4().hex[:6].upper()}'