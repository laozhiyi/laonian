/**
 * 用户模块 API
 * 直接调用后端 FastAPI
 */

const BASE_URL = 'http://localhost:8000'

// 获取可用的 API 地址（支持在 localStorage 中覆盖）
function getApiBaseUrl() {
  const customUrl = uni.getStorageSync('api_base_url')
  return customUrl || BASE_URL
}

// 设置自定义 API 地址（用于真机调试）
export function setApiBaseUrl(url) {
  if (url) {
    uni.setStorageSync('api_base_url', url)
  } else {
    uni.removeStorageSync('api_base_url')
  }
}

// 获取存储的用户信息
export function getCurrentUser() {
  try {
    const user = uni.getStorageSync('current_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// 保存当前用户到本地
function saveCurrentUser(user) {
  uni.setStorageSync('current_user', JSON.stringify(user))
}

// 更新当前用户信息
export function updateCurrentUser(user) {
  saveCurrentUser(user)
}

// 清除当前用户
function clearCurrentUser() {
  uni.removeStorageSync('current_user')
  uni.removeStorageSync('demo_token')
}

// 通用请求函数
async function apiRequest(method, path, data = null) {
  const user = getCurrentUser()
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (user && user.id) {
    headers['X-User-Id'] = String(user.id)
  }
  
  let url = getApiBaseUrl() + path
  const options = {
    method,
    headers,
    timeout: 15000, // 15秒超时
  }
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.data = data
  } else if (data && method === 'GET') {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
    const query = params.toString()
    if (query) url += '?' + query
  }
  
  try {
    const res = await uni.request({ ...options, url })
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data
    } else {
      throw new Error(res.data?.detail || `请求失败 (${res.statusCode})`)
    }
  } catch (error) {
    // 区分超时错误和其他错误
    const errMsg = error.errMsg || error.message || ''
    if (errMsg.includes('timeout')) {
      throw new Error('请求超时，请检查网络或服务器是否运行')
    }
    if (errMsg.includes('request:fail')) {
      throw new Error('网络请求失败，请检查网络连接')
    }
    console.error('请求错误:', error)
    throw error
  }
}

/**
 * 用户注册
 */
export async function registerUser({ username, password, role = 'user' }) {
  try {
    const res = await apiRequest('POST', '/api/users/register', {
      username: username.trim(),
      password: password.trim(),
      role: role
    })
    
    if (res.ok && res.user) {
      saveCurrentUser(res.user)
      uni.setStorageSync('demo_token', 'local_' + res.user.username + '_' + Date.now())
      return { ok: true, user: res.user }
    }
    
    return { ok: false, message: res.detail || '注册失败' }
  } catch (error) {
    console.error('注册失败:', error)
    return { ok: false, message: error.message || '注册失败，请检查服务器是否运行' }
  }
}

/**
 * 用户登录
 */
export async function loginUser({ username, password }) {
  try {
    const res = await apiRequest('POST', '/api/users/login', {
      username: username.trim(),
      password: password.trim()
    })
    
    if (res.ok && res.user) {
      saveCurrentUser(res.user)
      uni.setStorageSync('demo_token', 'local_' + res.user.username + '_' + Date.now())
      return { ok: true, user: res.user }
    }
    
    return { ok: false, message: res.detail || '登录失败' }
  } catch (error) {
    console.error('登录失败:', error)
    return { ok: false, message: error.message || '登录失败，请检查服务器是否运行' }
  }
}

/**
 * 用户登出
 */
export async function logout() {
  clearCurrentUser()
  return { ok: true, message: '登出成功' }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(userId) {
  try {
    const res = await apiRequest('GET', `/api/users/${userId}`)
    if (res.ok) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: res.detail || '用户不存在' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!uni.getStorageSync('demo_token') && !!getCurrentUser()
}

/**
 * 是否是管理员
 */
export function isAdmin() {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

/**
 * 获取当前用户ID
 */
export function getCurrentUserId() {
  const user = getCurrentUser()
  return user ? user.id : null
}
