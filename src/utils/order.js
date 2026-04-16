/**
 * 订单模块 API（支持本地后端 HTTP 模式 + uniCloud 模式）
 */

import { orders as ordersApi } from './cloud-db.js'

const ORDERS_COLLECTION = 'orders'

// 是否使用本地后端
const useBackend = () => {
  try {
    if (typeof uniCloud === 'undefined' || !uniCloud) return true
    if (typeof uniCloud.database !== 'function') return true
    return false
  } catch {
    return true
  }
}

/**
 * 获取订单列表
 */
export async function getOrders(userId, status = '', page = 1, limit = 20) {
  if (useBackend()) {
    try {
      const res = await ordersApi.list(page, limit, status)
      return { ok: res.success !== false, list: res.data || [], total: res.total || 0 }
    } catch (e) {
      return { ok: false, list: [], message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(ORDERS_COLLECTION)
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit).limit(limit).get()
    let list = res.result.data || []
    if (status) list = list.filter(o => o.status === status)
    return { ok: true, list, total: res.result.affectedDocs || 0 }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取所有订单（管理员）
 */
export async function getAllOrders(status = '', page = 1, limit = 20) {
  if (useBackend()) {
    try {
      const res = await ordersApi.adminList({ status, page, pageSize: limit })
      return { ok: res.success !== false, list: res.data || [], total: res.total || 0 }
    } catch (e) {
      return { ok: false, list: [], message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(ORDERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit).limit(limit).get()
    let list = res.result.data || []
    if (status) list = list.filter(o => o.status === status)
    return { ok: true, list, total: res.result.affectedDocs || 0 }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取佣金统计数据
 */
export async function getCommissionStats(userId) {
  if (useBackend()) {
    return { ok: true, data: { totalOrders: 0, totalCommission: 0, withdrawableCommission: 0 } }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(ORDERS_COLLECTION).where({ userId }).get()
    const orders = res.result.data || []
    let totalCommission = 0, withdrawableCommission = 0
    orders.forEach(o => {
      totalCommission += o.commission || 0
      if (o.status === 'pending' || o.status === 'confirmed') withdrawableCommission += o.commission || 0
    })
    return { ok: true, data: { totalOrders: orders.length, totalCommission, withdrawableCommission } }
  } catch (e) {
    return { ok: true, data: { totalOrders: 0, totalCommission: 0, withdrawableCommission: 0 } }
  }
}

/**
 * 获取全部佣金统计（管理员）
 */
export async function getAllCommissionStats() {
  if (useBackend()) {
    try {
      const res = await ordersApi.stats()
      return { ok: res.success !== false, data: res.data || {} }
    } catch (e) {
      return { ok: true, data: { totalOrders: 0, totalCommission: 0, settledCommission: 0, pendingCommission: 0 } }
    }
  }
  return { ok: true, data: { totalOrders: 0, totalCommission: 0, settledCommission: 0, pendingCommission: 0 } }
}

/**
 * 添加订单（管理员录入）
 */
export async function addOrder(orderData) {
  if (useBackend()) {
    try {
      // 参数映射：前端 camelCase -> 后端 snake_case
      const mapped = {
        courseId: orderData.courseId,
        promoteCode: orderData.promoteCode || '',
        orderAmount: orderData.orderAmount || 0,
        commissionRate: orderData.commissionRate || 0,
        platform: orderData.platform || '',
      }
      const res = await ordersApi.create(mapped)
      return res.success ? { ok: true, id: res.data?.id } : { ok: false, message: res.error || '添加失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(orderId, status) {
  if (useBackend()) {
    try {
      let res
      if (status === 'confirmed') res = await ordersApi.confirm(orderId)
      else if (status === 'settled') res = await ordersApi.settle(orderId)
      else return { ok: false, message: '未知状态' }
      return res.success ? { ok: true } : { ok: false, message: res.error || '操作失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 获取订单详情（通过列表查找）
 */
export async function getOrderDetail(orderId) {
  if (useBackend()) {
    try {
      const res = await ordersApi.list(1, 100)
      const order = (res.data || []).find(o => (o._id || o.id) === orderId)
      if (order) return { ok: true, data: order }
      return { ok: false, message: '订单不存在' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 确认订单
 */
export async function confirmOrder(orderId) {
  return updateOrderStatus(orderId, 'confirmed')
}

/**
 * 退款/取消订单
 */
export async function refundOrder(orderId) {
  if (useBackend()) {
    return { ok: false, message: '暂不支持' }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 创建订单（别名）
 */
export async function createOrder(orderData) {
  return addOrder(orderData)
}

// 订单状态常量
export const ORDER_STATUS_TEXT = {
  pending: '待确认',
  confirmed: '已确认',
  settled: '已结算',
  cancelled: '已取消',
  refunded: '已退款',
}
