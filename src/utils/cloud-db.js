/**
 * 后端 API 封装（FastAPI 本地后端版）
 * 
 * H5 开发环境使用 Vite 代理 (/api -> http://localhost:8000)
 * 小程序/APP 环境直接使用后端地址
 */

// 检测是否在浏览器环境中（H5）
const isBrowser = typeof window !== 'undefined'

// 根据环境选择基础URL
function getBaseUrl() {
  // H5 开发环境使用相对路径，让 Vite 代理处理
  if (isBrowser) {
    return ''  // 相对路径，Vite 会代理 /api 到 localhost:8000
  }
  // 其他环境（小程序、APP）直接使用后端地址
  return 'http://localhost:8000'
}

const BASE_URL = getBaseUrl()

// 获取存储的用户信息
function getStoredUser() {
  try {
    const user = uni.getStorageSync('current_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// 通用请求函数
export async function request(method, path, data = null) {
  const user = getStoredUser()
  const header = {
    'Content-Type': 'application/json',
  }
  
  // 如果有登录用户，传递用户ID
  if (user && user.id) {
    header['X-User-Id'] = String(user.id)
    console.log('[Request] User logged in, X-User-Id:', user.id)
  }
  
  let url = BASE_URL + path
  const options = {
    method,
    header,  // uni.request 使用 header 而非 headers
    url,
  }
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.data = data  // uni.request 使用 data 而非 body
    console.log('[Request] POST data:', JSON.stringify(data))
  } else if (data && method === 'GET') {
    const query = new URLSearchParams(data).toString()
    if (query) url += '?' + query
  }
  
  console.log('[Request] URL:', url)
  console.log('[Request] Options:', JSON.stringify(options, null, 2))

  try {
    const res = await uni.request(options)
    console.log('[Response] Status:', res.statusCode)
    console.log('[Response] Data:', JSON.stringify(res.data, null, 2))
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data
    } else {
      console.error(`请求失败 [${res.statusCode}]:`, JSON.stringify(res.data, null, 2))
      const detail = res.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || d).join(', ') : (detail || `请求失败 (${res.statusCode})`)
      throw new Error(msg)
    }
  } catch (error) {
    console.error('请求错误:', error)
    throw error
  }
}

/**
 * 获取数据库实例（兼容旧代码）
 */
export function getDB() {
  return {
    collection: (name) => ({
      get: async () => ({ result: { data: null } }),
      add: async (data) => ({ result: { id: null } }),
      update: async (data) => ({ result: { updated: 0 } }),
      remove: async () => ({ result: { deleted: 0 } }),
    })
  }
}

/**
 * 查询单条记录
 */
export async function dbGet(collection, id) {
  try {
    const res = await request('GET', `/api/${collection}s/${id}`)
    return { result: { data: res.data } }
  } catch (error) {
    console.error('dbGet error:', error)
    return { result: { data: null } }
  }
}

/**
 * 添加记录
 */
export async function dbAdd(collection, data) {
  try {
    const path = collection === 'cart' ? '/api/cart/add' : `/api/${collection}s`
    const res = await request('POST', path, data)
    return { result: { id: res.id } }
  } catch (error) {
    console.error('dbAdd error:', error)
    return { result: { id: null } }
  }
}

/**
 * 更新记录
 */
export async function dbUpdate(collection, id, data) {
  try {
    // cart 使用 PUT /{item_id}?quantity=xxx
    if (collection === 'cart') {
      await request('PUT', `/api/cart/${id}?quantity=${data.quantity}`)
    } else {
      await request('PUT', `/api/${collection}s/${id}`, data)
    }
    return { result: { updated: 1 } }
  } catch (error) {
    console.error('dbUpdate error:', error)
    return { result: { updated: 0 } }
  }
}

/**
 * 删除记录
 */
export async function dbRemove(collection, id) {
  try {
    await request('DELETE', `/api/${collection}s/${id}`)
    return { result: { deleted: 1 } }
  } catch (error) {
    console.error('dbRemove error:', error)
    return { result: { deleted: 0 } }
  }
}

/**
 * 条件查询
 */
export async function dbWhere(collection, condition, options = {}) {
  try {
    // 构建查询参数
    const params = { ...condition }
    
    // 特殊处理：用户查询
    if (condition.userId) {
      params.x_user_id = String(condition.userId)
    }
    
    // 特殊路由映射（复数变单数）
    const routeMap = {
      'cart': 'cart',
      'carts': 'cart',
      'favorites': 'favorites',
    }
    const route = routeMap[collection] || `${collection}s`
    
    const res = await request('GET', `/api/${route}`, params)
    
    // 统一返回格式
    let data = res.list || res.data || []
    if (!Array.isArray(data)) {
      data = [data]
    }
    
    return { result: { data } }
  } catch (error) {
    console.error('dbWhere error:', error)
    return { result: { data: [] } }
  }
}

/**
 * 上传文件（简化版，返回占位符）
 */
export async function uploadFile(filePath, cloudPath) {
  console.log('uploadFile (模拟):', filePath, cloudPath)
  return {
    success: true,
    fileID: 'mock_' + Date.now()
  }
}

export default {
  getDB,
  dbGet,
  dbAdd,
  dbUpdate,
  dbRemove,
  dbWhere,
  uploadFile,
}