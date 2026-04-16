/**
 * 用户模块 API（支持 Mock 数据 fallback + 本地后端 HTTP 模式）
 */

import { auth, setToken, getToken, removeToken } from './cloud-db.js'

// 是否使用本地后端（浏览器/H5/小程序非uniCloud环境都使用后端API）
const useBackend = () => {
  try {
    // uniCloud 不存在或无效时，使用本地后端
    if (typeof uniCloud === 'undefined' || !uniCloud) return true
    // uniCloud 存在但 database 方法无效时，使用本地后端
    if (typeof uniCloud.database !== 'function') return true
    // uniCloud 可用时，不使用本地后端
    return false
  } catch {
    return true
  }
}

// 存储当前用户
let _currentUser = null

// 获取当前用户信息
export function getCurrentUser() {
  if (useBackend()) {
    if (_currentUser) return _currentUser
    try {
      const user = uni.getStorageSync('current_user')
      if (user) {
        _currentUser = JSON.parse(user)
        return _currentUser
      }
    } catch {}
    return null
  }
  try {
    const user = uni.getStorageSync('current_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

function saveCurrentUser(user) {
  _currentUser = user
  uni.setStorageSync('current_user', JSON.stringify(user))
}

function clearCurrentUser() {
  _currentUser = null
  uni.removeStorageSync('current_user')
  uni.removeStorageSync('auth_token')
}

/**
 * 微信快捷登录（本地后端模式）
 */
export async function wechatLogin(userInfo) {
  if (useBackend()) {
    try {
      const res = await auth.register(
        'wx_' + Date.now(),
        'wx_' + Date.now(),
        userInfo?.nickname || '微信用户'
      )
      if (res.success) {
        setToken(res.token)
        saveCurrentUser(res.userInfo)
        return { ok: true, user: res.userInfo }
      }
      return { ok: false, message: res.error || '登录失败' }
    } catch (e) {
      return { ok: false, message: e.message || '登录失败' }
    }
  }
  return { ok: false, message: 'uniCloud 模式暂不支持微信登录' }
}

/**
 * 用户登录
 */
export async function loginUser({ username, password }) {
  if (useBackend()) {
    try {
      const res = await auth.login(username.trim(), password.trim())
      if (res.success) {
        setToken(res.token)
        saveCurrentUser(res.userInfo)
        return { ok: true, user: res.userInfo, role: res.userInfo?.role }
      }
      return { ok: false, message: res.error || '用户名或密码错误' }
    } catch (e) {
      return { ok: false, message: e.message || '登录失败' }
    }
  }
  return { ok: false, message: '请使用微信登录' }
}

/**
 * 用户注册
 */
export async function registerUser({ username, password, nickname }) {
  if (useBackend()) {
    try {
      const res = await auth.register(username.trim(), password.trim(), nickname || username.trim())
      if (res.success) {
        setToken(res.token)
        saveCurrentUser(res.userInfo)
        return { ok: true, user: res.userInfo }
      }
      return { ok: false, message: res.error || '注册失败' }
    } catch (e) {
      return { ok: false, message: e.message || '注册失败' }
    }
  }
  return { ok: false, message: 'uniCloud 模式暂不支持' }
}

/**
 * 用户登出
 */
export async function logout() {
  clearCurrentUser()
  return { ok: true }
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(userId, data) {
  if (useBackend()) {
    try {
      const res = await auth.updateProfile(data)
      if (res.success) {
        const localUser = getCurrentUser()
        if (localUser && localUser.id === userId) {
          saveCurrentUser({ ...localUser, ...data })
        }
        return { ok: true }
      }
      return { ok: false, message: res.error }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式暂不支持' }
}

/**
 * 更新用户兴趣标签
 */
export async function updateInterestTag(userId, tag, weight = 5) {
  const user = getCurrentUser()
  if (!user) return { ok: false }
  const interestWeights = user.interestWeights || {}
  interestWeights[tag] = (interestWeights[tag] || 0) + weight
  const sortedTags = Object.entries(interestWeights).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t)
  saveCurrentUser({ ...user, interestTags: sortedTags, interestWeights })
  return { ok: true }
}

export function isLoggedIn() {
  return !!getToken() || _currentUser !== null
}

export function isAdmin() {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

export function getCurrentUserId() {
  const user = getCurrentUser()
  return user ? user.id : null
}

/**
 * 获取用户统计数据
 */
export async function getUserStats(userId) {
  if (useBackend()) {
    return { ok: true, data: { favoriteCount: 0, browseCount: 0, orderCount: 0 } }
  }
  return { ok: true, data: { favoriteCount: 0, browseCount: 0, orderCount: 0 } }
}

// ==================== Token 管理 ====================

export { getToken, setToken, removeToken }
