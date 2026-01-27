/**
 * 订单模块 API
 *
 * 对接后端 API：
 * - POST /orders - 创建订单（直接返回已支付+已发货状态）
 * - GET /orders - 获取订单列表
 * - GET /orders/:id - 获取订单详情
 * - POST /orders/:id/confirm - 确认收货
 */

import { get, post, del } from './request.js'

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {string[]} data.cartItemIds - 购物车商品ID数组
 * @param {string} data.addressId - 收货地址ID
 * @param {string} data.remark - 订单备注
 */
export async function createOrder(data) {
  const res = await post('/orders', data)
  if (res.code === 200) {
    return {
      ok: true,
      data: {
        orderId: res.data.orderId,
        orderNo: res.data.orderNo,
        totalPrice: res.data.totalPrice,
      },
    }
  }
  // 抛出错误以便调用方捕获
  throw new Error(res.message || '订单创建失败')
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 订单状态
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 */
export async function getOrders(params = {}) {
  try {
    const res = await get('/orders', params)
    if (res.code === 200) {
      return {
        ok: true,
        list: res.data.list || [],
        total: res.data.total || 0,
      }
    }
    return { ok: false, message: res.message, list: [], total: 0 }
  } catch (err) {
    return { ok: false, message: err.message || '获取订单列表失败', list: [], total: 0 }
  }
}

/**
 * 获取订单详情
 * @param {string} id - 订单ID
 */
export async function getOrderDetail(id) {
  try {
    const res = await get(`/orders/${id}`)
    if (res.code === 200) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '获取订单详情失败' }
  }
}

/**
 * 确认收货
 * @param {string} id - 订单ID
 */
export async function confirmOrder(id) {
  const res = await post(`/orders/${id}/confirm`)
  if (res.code === 200) {
    return { ok: true, message: '确认收货成功' }
  }
  return { ok: false, message: res.message }
}

/**
 * 退货/取消订单
 * @param {string} id - 订单ID
 */
export async function refundOrder(id) {
  const res = await post(`/orders/${id}/refund`)
  if (res.code === 200) {
    return { ok: true, message: '退货成功' }
  }
  return { ok: false, message: res.message }
}

/**
 * 删除订单
 * @param {string} id - 订单ID
 */
export async function deleteOrder(id) {
  const res = await del(`/orders/${id}`)
  if (res.code === 200) {
    return { ok: true, message: '删除成功' }
  }
  return { ok: false, message: res.message }
}

// 订单状态常量
export const ORDER_STATUS = {
  PAID: 'paid',          // 已支付（已发货）
  SHIPPED: 'shipped',    // 已发货
  COMPLETED: 'completed', // 已完成
}

// 订单状态文本
export const ORDER_STATUS_TEXT = {
  paid: '已发货',
  shipped: '已发货',
  completed: '已完成',
}
