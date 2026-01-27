/**
 * 橘上生香｜请求封装
 *
 * 功能：
 * - 封装 uni.request 为 Promise 风格
 * - 统一 token 认证
 * - 统一错误处理
 */

// ========== 配置项 ==========
const BASE_URL = 'https://cslsgwpuqrsi.sealoshzh.site/v1'
const TIMEOUT = 10000 // 请求超时时间(ms)

// ========== Token 管理 ==========
const TOKEN_KEY = 'demo_token'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

// ========== 请求拦截器 ==========
const requestInterceptor = (config) => {
  // 添加 token
  const token = getToken()
  console.log('🔐 Token from storage:', token ? token.substring(0, 30) + '...' : 'empty')
  if (token) {
    config.header = {
      ...config.header,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  } else {
    config.header = {
      ...config.header,
      'Content-Type': 'application/json',
    }
  }
  return config
}

// ========== 响应拦截器 ==========
const responseInterceptor = (response) => {
  const { statusCode, data } = response

  // HTTP 成功状态码处理
  if (statusCode >= 200 && statusCode < 300) {
    return { ok: true, data, status: statusCode }
  }

  // 401 未授权 - 清除 token 并提示
  if (statusCode === 401) {
    removeToken()
    // 只有在非登录页面时才跳转
    const pages = getCurrentPages()
    if (pages.length > 0 && !pages[pages.length - 1].route.includes('login')) {
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/auth/login' })
      }, 1500)
    }
    return { ok: false, message: '未授权', status: statusCode }
  }

  // 其他错误 - 不弹出 toast，由调用方决定
  return { ok: false, message: data?.message || `请求失败 (${statusCode})`, status: statusCode }
}

// ========== 请求核心函数 ==========
function request(options) {
  const fullUrl = BASE_URL + options.url
  console.log('🚀 Request:', options.method, fullUrl) // 调试日志
  return new Promise((resolve, reject) => {
    // 请求拦截
    const config = requestInterceptor({
      url: fullUrl,
      timeout: options.timeout || TIMEOUT,
      method: options.method || 'GET',
      data: options.data,
      header: options.header || {},
    })

    uni.request({
      url: config.url,
      method: config.method,
      data: config.data,
      header: config.header,
      timeout: config.timeout,
      success: (res) => {
        console.log('✅ Response:', config.method, config.url, res.statusCode)
        const result = responseInterceptor(res)
        if (result.ok) {
          resolve(result.data)
        } else {
          reject(result)
        }
      },
      fail: (err) => {
        console.log('❌ Request Failed:', config.method, config.url, err)
        uni.showToast({ title: '网络请求失败，请检查网络', icon: 'none' })
        reject({ ok: false, message: '网络请求失败', err })
      },
    })
  })
}

// ========== 便捷方法 ==========
export const get = (url, params = {}) => request({ url, method: 'GET', data: params })
export const post = (url, data = {}) => request({ url, method: 'POST', data })
export const put = (url, data = {}) => request({ url, method: 'PUT', data })
export const del = (url, data = {}) => request({ url, method: 'DELETE', data })

// ========== 图片上传 ==========
export function uploadFile(url, filePath, name = 'file') {
  return new Promise((resolve, reject) => {
    const token = getToken()
    console.log('📤 Uploading file:', filePath.substring(0, 50) + '...')
    uni.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: name,
      header: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        console.log('📥 Upload response:', res.statusCode)
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            // 拼接完整图片 URL
            const fullUrl = data.data.url.startsWith('http')
              ? data.data.url
              : BASE_URL.replace('/v1', '') + data.data.url
            resolve({ ok: true, url: fullUrl })
          } else {
            reject({ ok: false, message: data.message || '上传失败' })
          }
        } else {
          reject({ ok: false, message: `上传失败 (${res.statusCode})` })
        }
      },
      fail: (err) => {
        console.log('❌ Upload failed:', err)
        reject({ ok: false, message: '网络请求失败', err })
      },
    })
  })
}

export default request
