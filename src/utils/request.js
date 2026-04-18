/**
 * 通用请求工具
 */

const BASE_URL = 'http://localhost:8000'

// 获取可用的 API 地址
function getApiBaseUrl() {
  const customUrl = uni.getStorageSync('api_base_url')
  return customUrl || BASE_URL
}

// 获取当前用户
function getCurrentUser() {
  try {
    const user = uni.getStorageSync('current_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// 请求封装
async function sendRequest(options) {
  const { url, method = 'GET', data = {}, header = {} } = options
  const user = getCurrentUser()
  
  const headers = {
    'Content-Type': 'application/json',
    ...header
  }
  
  if (user && user.id) {
    headers['X-User-Id'] = String(user.id)
  }
  
  let fullUrl = getApiBaseUrl() + url
  const params = []
  
  if (method === 'GET' && data) {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    if (params.length > 0) {
      fullUrl += '?' + params.join('&')
    }
  }
  
  try {
    const res = await uni.request({
      url: fullUrl,
      method,
      header: headers,
      data: method !== 'GET' ? data : undefined,
      timeout: 15000
    })
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data
    } else {
      const error = new Error(res.data?.detail || `请求失败 (${res.statusCode})`)
      error.detail = res.data?.detail
      throw error
    }
  } catch (error) {
    if (error.errMsg?.includes('timeout')) {
      const err = new Error('请求超时，请检查网络或服务器是否运行')
      throw err
    }
    if (error.errMsg?.includes('request:fail')) {
      const err = new Error('网络请求失败，请检查网络连接')
      throw err
    }
    throw error
  }
}

// 导出便捷方法
export const request = {
  get: (url, data) => sendRequest({ url, method: 'GET', data }),
  post: (url, data) => sendRequest({ url, method: 'POST', data }),
  put: (url, data) => sendRequest({ url, method: 'PUT', data }),
  delete: (url, data) => sendRequest({ url, method: 'DELETE', data }),
}

export default request
