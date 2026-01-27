/**
 * 购物车模块 API
 *
 * 对接后端 API：
 * - GET /cart - 获取购物车列表
 * - POST /cart/items - 添加商品到购物车
 * - PUT /cart/items/:id - 修改购物车商品数量
 * - DELETE /cart/items/:id - 删除购物车商品
 * - DELETE /cart - 清空购物车
 */

import { get, post, put, del } from './request.js'

// 购物车本地存储 key
const CART_KEY = 'demo_cart'

/**
 * 获取购物车列表
 */
export async function getCart() {
  try {
    const res = await get('/cart')
    if (res.code === 200) {
      return {
        ok: true,
        list: res.data.list || [],
        totalCount: res.data.totalCount || 0,
        totalPrice: res.data.totalPrice || 0,
      }
    }
    // 获取本地存储
    return getLocalCart()
  } catch (err) {
    // 网络错误时获取本地存储
    return getLocalCart()
  }
}

/**
 * 添加商品到购物车
 * @param {string} productId - 商品ID
 * @param {number} quantity - 数量，默认1
 */
export async function addToCart(productId, quantity = 1) {
  console.log('🛒 Adding to cart:', { productId, quantity })
  try {
    const res = await post('/cart/items', { productId, quantity })
    if (res.code === 200) {
      return { ok: true, message: '添加成功' }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '添加失败' }
  }
}

/**
 * 修改购物车商品数量
 * @param {string} itemId - 购物车商品ID
 * @param {number} quantity - 数量
 */
export async function updateCartItem(itemId, quantity) {
  try {
    const res = await put(`/cart/items/${itemId}`, { quantity })
    if (res.code === 200) {
      return { ok: true, message: '更新成功' }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '更新失败' }
  }
}

/**
 * 删除购物车商品
 * @param {string} itemId - 购物车商品ID
 */
export async function deleteCartItem(itemId) {
  try {
    const res = await del(`/cart/items/${itemId}`)
    if (res.code === 200) {
      return { ok: true, message: '删除成功' }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '删除失败' }
  }
}

/**
 * 清空购物车
 */
export async function clearCart() {
  try {
    const res = await del('/cart')
    if (res.code === 200) {
      return { ok: true, message: '清空成功' }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '清空失败' }
  }
}

// ========== 本地存储购物车（备用） ==========

/**
 * 获取本地购物车
 */
export function getLocalCart() {
  try {
    const raw = uni.getStorageSync(CART_KEY) || '[]'
    const list = JSON.parse(raw)
    const totalCount = list.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = list.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return {
      ok: true,
      list,
      totalCount,
      totalPrice,
    }
  } catch {
    return { ok: true, list: [], totalCount: 0, totalPrice: 0 }
  }
}

/**
 * 保存商品到本地购物车
 */
export function saveToLocalCart(product) {
  const { list } = getLocalCart()
  const existingIndex = list.findIndex(item => item.id === product.id)

  if (existingIndex > -1) {
    list[existingIndex].quantity += 1
  } else {
    list.push({
      id: product.id,
      title: product.title,
      cover: product.cover,
      price: product.priceNow,
      quantity: 1,
    })
  }

  uni.setStorageSync(CART_KEY, JSON.stringify(list))
  return list
}

/**
 * 更新本地购物车商品数量
 */
export function updateLocalCartItem(id, quantity) {
  const { list } = getLocalCart()
  const index = list.findIndex(item => item.id === id)
  if (index > -1) {
    if (quantity <= 0) {
      list.splice(index, 1)
    } else {
      list[index].quantity = quantity
    }
    uni.setStorageSync(CART_KEY, JSON.stringify(list))
  }
  return list
}

/**
 * 删除本地购物车商品
 */
export function deleteLocalCartItem(id) {
  const { list } = getLocalCart()
  const newList = list.filter(item => item.id !== id)
  uni.setStorageSync(CART_KEY, JSON.stringify(newList))
  return newList
}

/**
 * 清空本地购物车
 */
export function clearLocalCart() {
  uni.removeStorageSync(CART_KEY)
  return []
}
