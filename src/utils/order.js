/**
 * 订单模块 API（支持 Mock 数据）
 */

import { dbAdd, dbUpdate } from './cloud-db.js'
import { mockOrders } from './mock-data.js'

const ORDERS_COLLECTION = 'orders'
const useMock = () => {
  if (typeof uniCloud === 'undefined' || !uniCloud) return true
  try {
    const db = uniCloud.database()
    return !db
  } catch {
    return true
  }
}

/**
 * 获取订单列表
 */
export async function getOrders(userId, status = '', page = 1, limit = 20) {
  if (useMock()) {
    let list = [...mockOrders]
    if (userId) list = list.filter(o => o.userId === userId)
    if (status) list = list.filter(o => o.status === status)
    return { ok: true, list, total: list.length }
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
  if (useMock()) {
    let list = [...mockOrders]
    if (status) list = list.filter(o => o.status === status)
    return { ok: true, list, total: list.length }
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
  if (useMock()) {
    let orders = [...mockOrders]
    if (userId) orders = orders.filter(o => o.userId === userId)
    const settled = orders.filter(o => o.status === 'settled')
    const pending = orders.filter(o => o.status !== 'settled')
    const total = orders.reduce((sum, o) => sum + (o.commission || 0), 0)
    const settledAmt = settled.reduce((sum, o) => sum + (o.commission || 0), 0)
    const pendingAmt = pending.reduce((sum, o) => sum + (o.commission || 0), 0)
    return { ok: true, data: { totalOrders: orders.length, totalCommission: total, withdrawableCommission: pendingAmt } }
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
  if (useMock()) {
    const total = mockOrders.reduce((sum, o) => sum + (o.commission || 0), 0)
    const settled = mockOrders.filter(o => o.status === 'settled').reduce((sum, o) => sum + (o.commission || 0), 0)
    const pending = mockOrders.filter(o => o.status !== 'settled').reduce((sum, o) => sum + (o.commission || 0), 0)
    return { ok: true, data: { totalOrders: mockOrders.length, totalCommission: total, settledCommission: settled, pendingCommission: pending } }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(ORDERS_COLLECTION).get()
    const orders = res.result.data || []
    let totalCommission = 0, settledCommission = 0, pendingCommission = 0
    orders.forEach(o => {
      const commission = o.commission || 0
      totalCommission += commission
      if (o.status === 'settled') settledCommission += commission
      else if (o.status === 'pending' || o.status === 'confirmed') pendingCommission += commission
    })
    return { ok: true, data: { totalOrders: orders.length, totalCommission, settledCommission, pendingCommission } }
  } catch (e) {
    return { ok: true, data: { totalOrders: 0, totalCommission: 0, settledCommission: 0, pendingCommission: 0 } }
  }
}

/**
 * 添加订单（管理员录入）
 */
export async function addOrder(orderData) {
  if (useMock()) {
    const order = { _id: 'order-' + Date.now(), ...orderData, createdAt: Date.now() }
    mockOrders.unshift(order)
    return { ok: true, id: order._id }
  }
  try {
    const res = await dbAdd(ORDERS_COLLECTION, { ...orderData, status: orderData.status || 'pending', createdAt: Date.now() })
    return res.result && res.result.id ? { ok: true, id: res.result.id } : { ok: false, message: '添加失败' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(orderId, status) {
  if (useMock()) {
    const order = mockOrders.find(o => o._id === orderId)
    if (order) order.status = status
    return { ok: true }
  }
  try {
    const updateData = { status }
    if (status === 'confirmed') updateData.confirmedAt = Date.now()
    else if (status === 'settled') updateData.settledAt = Date.now()
    await dbUpdate(ORDERS_COLLECTION, orderId, updateData)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}
