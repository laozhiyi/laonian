/**
 * 订单模块 API（uniCloud 云数据库版）
 */

import { dbAdd, dbWhere, dbUpdate, dbGet } from './cloud-db.js'
import { decreaseStock, increaseStock } from './product.js'
import { getCurrentUserId } from './user.js'

// 常量
const ORDERS_COLLECTION = 'orders'

// 订单状态常量
export const ORDER_STATUS = {
  PENDING: 'pending',      // 待发货
  SHIPPED: 'shipped',     // 已发货
  COMPLETED: 'completed',  // 已完成
  REFUNDED: 'refunded',   // 已退货
}

// 订单状态文本
export const ORDER_STATUS_TEXT = {
  pending: '待发货',
  shipped: '已发货',
  completed: '已完成',
  refunded: '已退货',
}

/**
 * 生成订单号
 */
function generateOrderNo() {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `ORD${yyyy}${mm}${dd}${random}`
}

/**
 * 创建订单
 */
export async function createOrder(data) {
  try {
    const { cartItems, address, remark } = data
    const userId = getCurrentUserId()

    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    if (!cartItems || cartItems.length === 0) {
      return { ok: false, message: '购物车为空' }
    }

    if (!address) {
      return { ok: false, message: '请选择收货地址' }
    }

    const orderNo = generateOrderNo()
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const now = Date.now()

    const newOrder = {
      orderNo,
      userId,
      items: cartItems.map(item => ({
        id: item.productId || item.id,
        title: item.title,
        cover: item.cover || '',
        price: item.price,
        quantity: item.quantity
      })),
      address: {
        name: address.name,
        phone: address.phone,
        detail: address.detail
      },
      totalPrice,
      remark: remark || '',
      status: ORDER_STATUS.SHIPPED,
      createdAt: now,
      updatedAt: now
    }

    const res = await dbAdd(ORDERS_COLLECTION, newOrder)
    console.log('createOrder res:', res)

    if (res.result?.id) {
      // 下单成功，减少库存
      console.log('开始减少库存, cartItems:', cartItems)
      await decreaseStock(cartItems)

      return {
        ok: true,
        data: {
          orderId: res.result.id,
          orderNo,
          totalPrice
        }
      }
    }

    return { ok: false, message: '创建订单失败' }
  } catch (error) {
    console.error('创建订单失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 获取订单列表
 */
export async function getOrders(params = {}) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: true, list: [], total: 0 }
    }

    let query = { userId }
    if (params.status) {
      query.status = params.status
    }

    const res = await dbWhere(ORDERS_COLLECTION, query)
    const rawOrders = res?.result?.data || []

    // 确保是数组
    const orders = Array.isArray(rawOrders) ? rawOrders : []

    // 转换为标准格式（确保有 cover 字段）
    const ordersWithCovers = orders.map(order => ({
      ...order,
      id: order._id,
      items: (order.items || []).map(item => ({
        ...item,
        cover: item.cover || ''
      }))
    }))

    // 按时间倒序
    ordersWithCovers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    return {
      ok: true,
      list: ordersWithCovers,
      total: ordersWithCovers.length
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    return { ok: false, message: error.message, list: [], total: 0 }
  }
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(id) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    const res = await dbGet(ORDERS_COLLECTION, id)
    console.log('getOrderDetail raw res:', res)

    if (res?.result?.data) {
      // 处理 uniCloud 返回数组格式的情况
      let orderData = res.result.data
      if (Array.isArray(res.result.data)) {
        orderData = res.result.data[0] || {}
      }

      const orderWithCover = {
        ...orderData,
        id: orderData._id,
        items: (orderData.items || []).map(item => ({
          ...item,
          cover: item.cover || ''
        }))
      }

      console.log('getOrderDetail orderWithCover:', orderWithCover)
      return { ok: true, data: orderWithCover }
    }

    return { ok: false, message: '订单不存在' }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return { ok: false, message: error.message || '获取订单详情失败' }
  }
}

/**
 * 确认收货
 */
export async function confirmOrder(id) {
  try {
    await dbUpdate(ORDERS_COLLECTION, id, {
      status: ORDER_STATUS.COMPLETED,
      completedAt: Date.now(),
      updatedAt: Date.now()
    })
    return { ok: true, message: '确认收货成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 退货/取消订单
 */
export async function refundOrder(id) {
  try {
    // 获取订单信息
    const orderRes = await dbGet(ORDERS_COLLECTION, id)
    console.log('refundOrder orderRes:', orderRes)

    // 处理 uniCloud 返回数组格式
    let order = orderRes?.result?.data
    if (Array.isArray(order)) {
      order = order[0]
    }

    if (!order) {
      return { ok: false, message: '订单不存在' }
    }

    console.log('refundOrder order:', order)

    // 退货成功，增加库存
    await increaseStock(order.items || [])

    await dbUpdate(ORDERS_COLLECTION, id, {
      status: ORDER_STATUS.REFUNDED,
      refundedAt: Date.now(),
      updatedAt: Date.now()
    })

    return { ok: true, message: '退货成功' }
  } catch (error) {
    console.error('退货失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 删除订单
 */
export async function deleteOrder(id) {
  try {
    // 软删除：更新状态为 refunded
    await dbUpdate(ORDERS_COLLECTION, id, {
      status: ORDER_STATUS.REFUNDED,
      deleted: true,
      updatedAt: Date.now()
    })
    return { ok: true, message: '删除成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}
