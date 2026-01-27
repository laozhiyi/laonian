/**
 * 用户管理模块
 *
 * 对接后端 API：
 * - POST /auth/register - 注册
 * - POST /auth/login - 登录
 * - POST /auth/logout - 登出
 * - GET /user/profile - 获取用户信息
 */

import { ref } from 'vue'
import { get, post, put } from './request.js'
import { getToken, setToken, removeToken } from './request.js'

// 响应式当前用户状态
const currentUser = ref(null)

// 初始化
function init() {
  const token = getToken()
  if (token) {
    // 有token时获取用户信息
    getUserProfile().catch(() => {
      // 获取失败说明token无效，清除
      removeToken()
      currentUser.value = null
    })
  }
}
init()

/**
 * 用户注册
 */
export async function registerUser({ username, password, role = 'user' }) {
  try {
    const res = await post('/auth/register', { username, password, role })
    if (res.code === 200) {
      // 保存token和用户信息
      setToken(res.data.token)
      currentUser.value = {
        id: res.data.id,
        username: res.data.username,
        role: res.data.role,
      }
      return { ok: true, user: currentUser.value }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '注册失败' }
  }
}

/**
 * 用户登录
 */
export async function loginUser({ username, password }) {
  try {
    const res = await post('/auth/login', { username, password })
    if (res.code === 200) {
      // 保存token和用户信息
      console.log('📝 Login success, token:', res.data.token?.substring(0, 20) + '...')
      setToken(res.data.token)
      console.log('📝 Token saved, checking storage:', getToken()?.substring(0, 20) + '...')
      currentUser.value = {
        id: res.data.id,
        username: res.data.username,
        avatar: res.data.avatar || '',
        role: res.data.role,
      }
      return { ok: true, user: currentUser.value }
    }
    return { ok: false, message: res.message }
  } catch (err) {
    return { ok: false, message: err.message || '登录失败' }
  }
}

/**
 * 用户登出
 */
export async function logout() {
  try {
    await post('/auth/logout')
  } catch (err) {
    // 登出接口失败不影响本地登出
  }
  removeToken()
  currentUser.value = null
}

/**
 * 获取当前用户信息
 */
export async function getUserProfile() {
  const res = await get('/user/profile')
  if (res.code === 200) {
    currentUser.value = {
      id: res.data.id,
      username: res.data.username,
      avatar: res.data.avatar || '',
      role: res.data.role,
      createdAt: res.data.createdAt,
    }
    return currentUser.value
  }
  throw new Error(res.message || '获取用户信息失败')
}

/**
 * 修改用户信息
 */
export async function updateUserProfile({ avatar }) {
  const res = await put('/user/profile', { avatar })
  if (res.code === 200) {
    currentUser.value = {
      ...currentUser.value,
      avatar: res.data.avatar,
    }
    return { ok: true }
  }
  return { ok: false, message: res.message }
}

/**
 * 获取当前用户
 */
export function getCurrentUser() {
  return currentUser.value
}

/**
 * 是否已登录
 */
export function isLoggedIn() {
  return !!getToken() && !!currentUser.value
}

/**
 * 是否是管理员
 */
export function isAdmin() {
  return currentUser.value?.role === 'admin'
}
