/**
 * 商品模块 API
 *
 * 对接后端 API：
 * - GET /products - 获取商品列表
 * - GET /products/:id - 获取商品详情
 * - POST /products - 创建商品（管理员）
 * - PUT /products/:id - 更新商品（管理员）
 * - DELETE /products/:id - 删除商品（管理员）
 */

import { get, post, put, del } from './request.js'

// 默认商品数据（当后端无数据时使用）
export const defaultProducts = [
  {
    id: 'sp-1',
    title: '沙糖橘 5kg 产地直发',
    cover: 'https://ai-public.mastergo.com/ai/img_res/d75a41382e8c11369027b0b72c12194c.jpg',
    tags: ['助农产品', '当季鲜果'],
    priceNow: 59.9,
    priceOrigin: 79.9,
    stock: 100,
    description: '精选广西桂林沙糖橘，现摘现发，保证新鲜。每一颗都经过人工筛选，果大皮薄，汁多味甜。',
  },
  {
    id: 'sp-2',
    title: '橘皮香薰蜡烛',
    cover: 'https://ai-public.mastergo.com/ai/img_res/676ebc08f9cd6f6157b4ab4bf3191e00.jpg',
    tags: ['纯天然', '手作香薰'],
    priceNow: 39.0,
    priceOrigin: 59.0,
    stock: 50,
    description: '采用天然橘皮精油手工制作，燃烧时长约40小时，香味清新自然，适合卧室、客厅使用。',
  },
  {
    id: 'sp-3',
    title: '手工橘子皂 2块装',
    cover: 'https://ai-public.mastergo.com/ai/img_res/8ec05ea994723f11149f07973200f60a.jpg',
    tags: ['低敏', '纯手工'],
    priceNow: 29.9,
    priceOrigin: 39.9,
    stock: 80,
    description: '温和配方，适合敏感肌使用。',
  },
  {
    id: 'sp-4',
    title: '橘皮香膏',
    cover: 'https://ai-public.mastergo.com/ai/img_res/dbbb9c89cc81190c79241bd5ea6d6fb9.jpg',
    tags: ['香氛', '随身携带'],
    priceNow: 49.0,
    priceOrigin: 69.0,
    stock: 60,
    description: '小巧便携，随时享受柑橘芬芳。',
  },
  {
    id: 'sp-5',
    title: '橘皮陈化香包',
    cover: 'https://ai-public.mastergo.com/ai/img_res/5d74e41e4b02c61a95e7ca2683e3b53b.jpg',
    tags: ['环保再生'],
    priceNow: 19.9,
    priceOrigin: 29.9,
    stock: 120,
    description: '天然橘皮制作，可放置衣柜、车内，自然留香。',
  },
  {
    id: 'sp-6',
    title: '橘子精油扩香石',
    cover: 'https://ai-public.mastergo.com/ai/img_res/92aad15142aebf09a3fbf12a7c6b8362.jpg',
    tags: ['扩香', '居家好物'],
    priceNow: 69.0,
    priceOrigin: 89.0,
    stock: 40,
    description: '无需点燃，滴入精油即可扩香，安全持久。',
  },
]

// 管理员商品 Storage Key
const ADMIN_PRODUCTS_KEY = 'admin_products'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.keyword - 搜索关键词
 */
export async function getProducts(params = {}) {
  try {
    const res = await get('/products', params)
    if (res.code === 200) {
      // 将 _id 映射为 id
      const list = (res.data.list || []).map(p => ({
        ...p,
        id: p._id || p.id
      }))
      return {
        ok: true,
        list,
        total: res.data.total || 0,
      }
    }
    // 如果后端无数据，返回默认商品
    return { ok: true, list: defaultProducts, total: defaultProducts.length }
  } catch (err) {
    // 网络错误时返回默认商品
    return { ok: true, list: defaultProducts, total: defaultProducts.length }
  }
}

/**
 * 获取商品详情
 * @param {string} id - 商品ID
 */
export async function getProductDetail(id) {
  try {
    const res = await get(`/products/${id}`)
    if (res.code === 200) {
      // 将 _id 映射为 id
      const data = {
        ...res.data,
        id: res.data._id || res.data.id
      }
      return { ok: true, data }
    }
    // 从默认商品中查找
    const product = defaultProducts.find(p => p.id === id)
    if (product) {
      return { ok: true, data: product }
    }
    return { ok: false, message: res.message || '商品不存在' }
  } catch (err) {
    const product = defaultProducts.find(p => p.id === id)
    if (product) {
      return { ok: true, data: product }
    }
    return { ok: false, message: '获取商品详情失败' }
  }
}

/**
 * 创建商品（管理员）
 */
export async function createProduct(data) {
  const res = await post('/products', data)
  if (res.code === 200) {
    return { ok: true, id: res.data.id }
  }
  return { ok: false, message: res.message }
}

/**
 * 更新商品（管理员）
 */
export async function updateProduct(id, data) {
  const res = await put(`/products/${id}`, data)
  if (res.code === 200) {
    return { ok: true, data: res.data }
  }
  return { ok: false, message: res.message }
}

/**
 * 删除商品（管理员）
 */
export async function deleteProduct(id) {
  const res = await del(`/products/${id}`)
  if (res.code === 200) {
    return { ok: true }
  }
  return { ok: false, message: res.message }
}

/**
 * 获取管理员添加的商品（本地存储）
 */
export function getAdminProducts() {
  try {
    const raw = uni.getStorageSync(ADMIN_PRODUCTS_KEY) || '[]'
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/**
 * 保存管理员商品到本地存储
 */
export function saveAdminProduct(product) {
  const products = getAdminProducts()
  products.unshift(product)
  uni.setStorageSync(ADMIN_PRODUCTS_KEY, JSON.stringify(products))
  return products
}

/**
 * 从本地存储删除管理员商品
 */
export function deleteAdminProduct(id) {
  const products = getAdminProducts().filter(p => p.id !== id)
  uni.setStorageSync(ADMIN_PRODUCTS_KEY, JSON.stringify(products))
  return products
}
