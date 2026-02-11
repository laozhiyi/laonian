/**
 * 购物车模块 API（uniCloud 云数据库版）
 */

import { dbAdd, dbWhere, dbUpdate, dbRemove, dbGet } from './cloud-db.js'
import { getCurrentUserId } from './user.js'

// 常量
const CART_COLLECTION = 'cart'

/**
 * 获取购物车列表
 */
export async function getCart() {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: true, list: [], totalCount: 0, totalPrice: 0 }
    }

    const res = await dbWhere(CART_COLLECTION, { userId })
    const cartItems = res.result.data || []

    // 合并商品详情（从购物车数据中获取）
    const mergedList = cartItems.map(item => ({
      id: item._id,
      productId: item.productId,
      title: item.title || '商品',
      cover: item.cover || '',
      price: item.price || 0,
      quantity: item.quantity
    }))

    const totalCount = mergedList.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = mergedList.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
      ok: true,
      list: mergedList,
      totalCount,
      totalPrice
    }
  } catch (error) {
    console.error('获取购物车失败:', error)
    return { ok: true, list: [], totalCount: 0, totalPrice: 0 }
  }
}

/**
 * 添加商品到购物车
 */
export async function addToCart(product) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    // 检查购物车中是否已存在
    const checkRes = await dbWhere(CART_COLLECTION, {
      userId,
      productId: product.id
    })

    const now = Date.now()

    if (checkRes.result.data && checkRes.result.data.length > 0) {
      // 已存在，更新数量
      const existingItem = checkRes.result.data[0]
      await dbUpdate(CART_COLLECTION, existingItem._id, {
        quantity: existingItem.quantity + 1,
        updatedAt: now
      })
    } else {
      // 不存在，添加新项
      await dbAdd(CART_COLLECTION, {
        userId,
        productId: product.id,
        title: product.title,
        cover: product.cover,
        price: product.priceNow,
        quantity: 1,
        createdAt: now,
        updatedAt: now
      })
    }

    return { ok: true, message: '添加成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 修改购物车商品数量
 */
export async function updateCartItem(id, quantity) {
  try {
    if (quantity <= 0) {
      await dbRemove(CART_COLLECTION, id)
    } else {
      await dbUpdate(CART_COLLECTION, id, {
        quantity,
        updatedAt: Date.now()
      })
    }
    return { ok: true, message: '更新成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 删除购物车商品
 */
export async function deleteCartItem(id) {
  try {
    await dbRemove(CART_COLLECTION, id)
    return { ok: true, message: '删除成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 清空购物车
 */
export async function clearCart() {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: true }
    }

    const res = await dbWhere(CART_COLLECTION, { userId })
    const cartItems = res.result.data || []

    for (const item of cartItems) {
      await dbRemove(CART_COLLECTION, item._id)
    }

    return { ok: true, message: '清空成功' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 获取购物车商品ID列表
 */
export async function getCartProductIds() {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return []
    }

    const res = await dbWhere(CART_COLLECTION, { userId })
    const cartItems = res.result.data || []

    return cartItems.map(item => item.productId)
  } catch (error) {
    return []
  }
}

/**
 * 获取购物车商品数量
 */
export async function getCartCount() {
  try {
    const { list } = await getCart()
    return list.reduce((sum, item) => sum + item.quantity, 0)
  } catch {
    return 0
  }
}

// ========== 本地存储别名（兼容旧代码） ==========

export function getLocalCart() {
  return getCart()
}

export function saveToLocalCart(product) {
  return addToCart(product)
}

export function updateLocalCartItem(id, quantity) {
  return updateCartItem(id, quantity)
}

export function deleteLocalCartItem(id) {
  return deleteCartItem(id)
}

export function clearLocalCart() {
  return clearCart()
}
