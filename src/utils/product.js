/**
 * 商品模块 API（uniCloud 云数据库版）
 */

import { dbAdd, dbWhere, dbUpdate, dbRemove, dbGet } from './cloud-db.js'

// 常量
const PRODUCTS_COLLECTION = 'products'

/**
 * 获取商品列表
 */
export async function getProducts() {
  try {
    const res = await dbWhere(PRODUCTS_COLLECTION, {})
    const list = res?.result?.data || []
    return {
      ok: true,
      list,
      total: list.length
    }
  } catch (error) {
    console.error('获取商品失败:', error)
    return { ok: false, message: error.message, list: [], total: 0 }
  }
}

/**
 * 获取商品详情
 */
export async function getProductDetail(id) {
  try {
    const res = await dbGet(PRODUCTS_COLLECTION, id)
    console.log('getProductDetail raw res:', res)

    if (res?.result?.data) {
      // 处理 uniCloud 返回数组格式的情况
      let productData = res.result.data
      if (Array.isArray(res.result.data)) {
        productData = res.result.data[0] || {}
      }

      console.log('getProductDetail productData:', productData)
      return { ok: true, data: productData }
    }
    return { ok: false, message: '商品不存在' }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return { ok: false, message: error.message || '获取商品详情失败' }
  }
}

/**
 * 创建商品
 */
export async function createProduct(data) {
  try {
    const now = Date.now()
    const res = await dbAdd(PRODUCTS_COLLECTION, {
      ...data,
      status: 'on',
      createdAt: now,
      updatedAt: now
    })
    return { ok: true, id: res.result.id }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 更新商品
 */
export async function updateProduct(id, data) {
  try {
    // 确保ID是字符串
    const docId = String(id)
    await dbUpdate(PRODUCTS_COLLECTION, docId, {
      ...data,
      updatedAt: Date.now()
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 删除商品
 */
export async function deleteProduct(id) {
  try {
    const docId = String(id)
    await dbRemove(PRODUCTS_COLLECTION, docId)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 获取管理员添加的所有商品
 */
export async function getAdminProducts() {
  try {
    const res = await dbWhere(PRODUCTS_COLLECTION, {})
    // 确保返回数组，并转换 _id 为 id
    const data = res?.result?.data
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        id: item._id || item.id
      }))
    }
    return []
  } catch (error) {
    console.error('获取商品失败:', error)
    return []
  }
}

/**
 * 减少商品库存
 */
export async function decreaseStock(items) {
  try {
    console.log('decreaseStock 开始执行, items:', items)
    for (const item of items) {
      // 购物车中商品的ID是 productId 字段
      const productId = item.productId || item.id
      console.log('decreaseStock productId:', productId)

      if (!productId) {
        console.warn('商品ID不存在，跳过:', item)
        continue
      }

      const productRes = await dbGet(PRODUCTS_COLLECTION, productId)
      console.log('decreaseStock productRes:', productRes)

      // 处理 uniCloud 返回数组格式
      let product = productRes?.result?.data
      if (Array.isArray(product)) {
        product = product[0]
      }

      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 0))
        console.log(`减少库存: ${product.title}, 旧库存: ${product.stock}, 购买数量: ${item.quantity}, 新库存: ${newStock}`)
        await dbUpdate(PRODUCTS_COLLECTION, productId, {
          stock: newStock,
          updatedAt: Date.now()
        })
      } else {
        console.warn('未找到商品:', productId)
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('减少库存失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 增加商品库存
 */
export async function increaseStock(items) {
  try {
    console.log('increaseStock 开始执行, items:', items)
    for (const item of items) {
      // 购物车/订单中商品的ID是 productId 字段
      const productId = item.productId || item.id
      console.log('increaseStock productId:', productId)

      if (!productId) {
        console.warn('商品ID不存在，跳过:', item)
        continue
      }

      const productRes = await dbGet(PRODUCTS_COLLECTION, productId)
      console.log('increaseStock productRes:', productRes)

      // 处理 uniCloud 返回数组格式
      let product = productRes?.result?.data
      if (Array.isArray(product)) {
        product = product[0]
      }

      if (product) {
        const newStock = (product.stock || 0) + (item.quantity || 0)
        console.log(`增加库存: ${product.title}, 旧库存: ${product.stock}, 退回数量: ${item.quantity}, 新库存: ${newStock}`)
        await dbUpdate(PRODUCTS_COLLECTION, productId, {
          stock: newStock,
          updatedAt: Date.now()
        })
      } else {
        console.warn('未找到商品:', productId)
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('增加库存失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 获取商品库存
 */
export async function getProductStock(productId) {
  try {
    const res = await dbGet(PRODUCTS_COLLECTION, productId)
    if (res.result.data) {
      return res.result.data.stock || 0
    }
    return 0
  } catch (error) {
    return 0
  }
}

/**
 * 清理管理员商品数据（云数据库版，保留接口兼容性）
 */
export async function cleanAdminProducts() {
  return []
}
