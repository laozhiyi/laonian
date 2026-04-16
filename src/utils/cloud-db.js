/**
 * uniCloud 数据库基础封装（本地后端适配版）
 *
 * 同时支持两种模式：
 * 1. 本地后端模式：通过 HTTP 请求访问 http://localhost:3001/api
 * 2. uniCloud 模式：在 uniCloud 环境运行（自动检测）
 *
 * 使用方式：设置 BASE_URL 来切换模式
 */

// ==================== Token 管理（内部） ====================
function getToken() {
  try {
    return uni.getStorageSync('auth_token') || ''
  } catch {
    return ''
  }
}

function setToken(token) {
  try {
    uni.setStorageSync('auth_token', token)
  } catch {}
}

function removeToken() {
  try {
    uni.removeStorageSync('auth_token')
  } catch {}
}

// ==================== Token 导出（供其他模块使用） ====================
export { getToken, setToken, removeToken }

// ==================== 配置 ====================
const BASE_URL = 'http://localhost:3002'  // 本地后端地址（生产环境改为实际地址）

// 自动检测是否在 uniCloud 环境（函数内检测，避免初始化时问题）
const isInUniCloud = () => typeof uniCloud !== 'undefined' && uniCloud && typeof uniCloud.database === 'function'

// ==================== 工具函数 ====================

function getTokenHeader() {
  const token = getToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

/**
 * HTTP 请求封装
 */
async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  const headers = {
    'Content-Type': 'application/json',
    ...getTokenHeader(),
    ...(options.headers || {})
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    })

    const text = await response.text()
    if (!text || !text.trim()) {
      throw new Error(`请求失败 (${response.status})`)
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`响应格式错误 (${response.status})`)
    }

    if (!response.ok) {
      if (response.status === 401) {
        removeToken()
        uni.showToast({ title: '请重新登录', icon: 'none' })
      }
      throw new Error(data.error || `请求失败 (${response.status})`)
    }

    return data
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// ==================== uniCloud 封装（兼容） ====================

/**
 * 获取数据库实例
 */
export function getDB() {
  if (isInUniCloud()) {
    return uniCloud.database()
  }
  return null  // 本地模式返回 null，使用 HTTP 接口
}

/**
 * 检查 uniCloud 是否可用
 */
export function isUniCloudAvailable() {
  return isInUniCloud()
}

// ==================== 通用 CRUD（本地后端模式） ====================

/**
 * 查询单条记录（通用）
 * @param {string} collection - 表名
 * @param {string} id - 记录ID
 */
export async function dbGet(collection, id) {
  if (isInUniCloud()) {
    // uniCloud 模式
    const db = uniCloud.database()
    return db.collection(collection).doc(id).get()
  }

  // 本地后端模式
  const data = await request(`/api/${collection}/${id}`)
  return { result: { data: data.data } }
}

/**
 * 添加记录（通用）
 * @param {string} collection - 表名
 * @param {object} data - 数据
 */
export async function dbAdd(collection, data) {
  if (isInUniCloud) {
    const db = uniCloud.database()
    return db.collection(collection).add(data)
  }

  const result = await request(`/api/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return { result: { id: result.data?._id || result.data?.id } }
}

/**
 * 更新记录（通用）
 * @param {string} collection - 表名
 * @param {string} id - 记录ID
 * @param {object} data - 数据
 */
export async function dbUpdate(collection, id, data) {
  if (isInUniCloud) {
    const db = uniCloud.database()
    return db.collection(collection).doc(id).update(data)
  }

  const result = await request(`/api/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  return { result: result }
}

/**
 * 删除记录（通用）
 * @param {string} collection - 表名
 * @param {string} id - 记录ID
 */
export async function dbRemove(collection, id) {
  if (isInUniCloud) {
    const db = uniCloud.database()
    return db.collection(collection).doc(id).remove()
  }

  const result = await request(`/api/${collection}/${id}`, {
    method: 'DELETE'
  })
  return { result: result }
}

/**
 * 条件查询（通用）
 * @param {string} collection - 表名
 * @param {object|string} condition - 查询条件
 * @param {object} options - 分页/排序选项
 */
export async function dbWhere(collection, condition, options = {}) {
  if (isInUniCloud()) {
    const db = uniCloud.database()
    let query = db.collection(collection)

    // 处理 JQL 条件
    if (typeof condition === 'object' && Object.keys(condition).length > 0) {
      query = query.where(condition)
    }

    if (options.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction)
    }
    if (options.skip) {
      query = query.skip(options.skip)
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }

    return await query.get()
  }

  // 本地后端模式
  const params = new URLSearchParams()

  if (typeof condition === 'object') {
    for (const [key, value] of Object.entries(condition)) {
      params.append(key, value)
    }
  }

  if (options.orderBy) {
    params.append('orderBy', `${options.orderBy.field},${options.orderBy.direction}`)
  }
  if (options.skip) {
    params.append('page', String(Math.floor(options.skip / (options.limit || 20)) + 1))
  }
  if (options.limit) {
    params.append('pageSize', String(options.limit))
  }

  const queryString = params.toString()
  const url = queryString ? `/api/${collection}?${queryString}` : `/api/${collection}`

  const result = await request(url)
  return {
    result: {
      data: result.data || [],
      success: result.success
    }
  }
}

/**
 * 上传文件（uniCloud 模式下使用）
 */
export async function uploadFile(filePath, cloudPath) {
  if (isInUniCloud()) {
    const client = uniCloud.uploadFile({
      filePath: filePath,
      cloudPath: cloudPath,
    })
    return client
  }
  // 本地模式暂不支持文件上传
  console.warn('uploadFile: 本地后端模式不支持文件上传')
  return null
}

// ==================== 业务接口封装 ====================

// 认证相关
export const auth = {
  async login(username, password) {
    const result = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    if (result.token) {
      setToken(result.token)
    }
    return result
  },

  async register(username, password, nickname) {
    const result = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname })
    })
    if (result.token) {
      setToken(result.token)
    }
    return result
  },

  async getProfile() {
    return await request('/api/auth/profile')
  },

  async updateProfile(data) {
    return await request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async changePassword(oldPassword, newPassword) {
    return await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    })
  }
}

// 课程相关
export const courses = {
  async list(params = {}) {
    const query = new URLSearchParams()
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.keyword) query.set('keyword', params.keyword)
    if (params.featured) query.set('featured', String(params.featured))
    if (params.hot) query.set('hot', String(params.hot))
    if (params.status) query.set('status', params.status)
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))

    const queryStr = query.toString()
    return await request(`/api/courses${queryStr ? '?' + queryStr : ''}`)
  },

  async getFeatured() {
    return await request('/api/courses/featured')
  },

  async getRecommended(page = 1, pageSize = 20) {
    return await request(`/api/courses/recommended?page=${page}&pageSize=${pageSize}`)
  },

  async getById(id) {
    return await request(`/api/courses/${id}`)
  },

  async create(data) {
    return await request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async update(id, data) {
    return await request(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async delete(id) {
    return await request(`/api/courses/${id}`, {
      method: 'DELETE'
    })
  }
}

// 分类相关
export const categories = {
  async list(status = 'active') {
    return await request(`/api/categories?status=${status}`)
  },

  async create(data) {
    return await request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async update(id, data) {
    return await request(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async delete(id) {
    return await request(`/api/categories/${id}`, {
      method: 'DELETE'
    })
  }
}

// 收藏相关
export const favorites = {
  async list(page = 1, pageSize = 20) {
    return await request(`/api/favorites?page=${page}&pageSize=${pageSize}`)
  },

  async add(courseId) {
    return await request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ courseId })
    })
  },

  async remove(favId) {
    return await request(`/api/favorites/${favId}`, {
      method: 'DELETE'
    })
  },

  async toggle(courseId) {
    return await request('/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ courseId })
    })
  },

  async check(courseId) {
    return await request(`/api/favorites/check?courseId=${courseId}`)
  }
}

// 订单相关
export const orders = {
  async list(page = 1, pageSize = 20, status = '') {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (status) query.set('status', status)
    return await request(`/api/orders?${query.toString()}`)
  },

  async create(data) {
    return await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async adminList(params = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))
    if (params.status) query.set('status', params.status)
    if (params.userId) query.set('userId', params.userId)
    return await request(`/api/orders/admin/list?${query.toString()}`)
  },

  async stats() {
    return await request('/api/orders/stats')
  },

  async confirm(orderId) {
    return await request(`/api/orders/${orderId}/confirm`, {
      method: 'POST'
    })
  },

  async settle(orderId) {
    return await request(`/api/orders/${orderId}/settle`, {
      method: 'POST'
    })
  }
}

// 日志相关
export const logs = {
  async addBrowse(data) {
    return await request('/api/logs/browse', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async getBrowseHistory(page = 1, pageSize = 20) {
    return await request(`/api/logs/browse?page=${page}&pageSize=${pageSize}`)
  },

  async addClick(data) {
    return await request('/api/logs/click', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// ==================== 导出 ====================

export default {
  // 基础方法
  getDB,
  isUniCloudAvailable,
  dbGet,
  dbAdd,
  dbUpdate,
  dbRemove,
  dbWhere,
  uploadFile,

  // 业务接口
  auth,
  courses,
  categories,
  favorites,
  orders,
  logs,

  // Token 管理
  getToken,
  setToken,
  removeToken,
}