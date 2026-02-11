/**
 * 用户模块 API（uniCloud 云数据库版）
 */

import { dbAdd, dbWhere, dbUpdate, dbGet } from './cloud-db.js'

// 常量
const USERS_COLLECTION = 'users'

// 获取当前用户信息（从本地存储）
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

// 清除当前用户
function clearCurrentUser() {
  uni.removeStorageSync('current_user')
  uni.removeStorageSync('demo_token')
}

/**
 * 用户注册
 */
export async function registerUser({ username, password, role = 'user' }) {
  try {
    // 检查用户名是否已存在
    const checkRes = await dbWhere(USERS_COLLECTION, {
      username: username.trim().toLowerCase()
    })

    if (checkRes.result.data && checkRes.result.data.length > 0) {
      return { ok: false, message: '用户名已存在' }
    }

    const now = Date.now()
    const userData = {
      username: username.trim().toLowerCase(),
      password: password.trim(),
      role: role,
      createdAt: now,
      updatedAt: now
    }

    const addRes = await dbAdd(USERS_COLLECTION, userData)

    if (addRes.result.id) {
      const user = {
        id: addRes.result.id,
        username: userData.username,
        role: userData.role
      }
      saveCurrentUser(user)
      uni.setStorageSync('demo_token', 'local_' + userData.username + '_' + now)
      return { ok: true, user }
    }

    return { ok: false, message: '注册失败' }
  } catch (error) {
    console.error('注册失败:', error)
    return { ok: false, message: error.message || '注册失败' }
  }
}

/**
 * 用户登录
 */
export async function loginUser({ username, password }) {
  try {
    const name = username.trim().toLowerCase()
    const pwd = password.trim()

    // 默认管理员账号
    if (name === 'admin' && pwd === 'admin') {
      // 检查管理员是否存在，不存在则创建
      const checkRes = await dbWhere(USERS_COLLECTION, { username: 'admin' })
      let adminId

      if (!checkRes.result.data || checkRes.result.data.length === 0) {
        const now = Date.now()
        const adminData = {
          username: 'admin',
          password: 'admin',
          role: 'admin',
          createdAt: now,
          updatedAt: now
        }
        const addRes = await dbAdd(USERS_COLLECTION, adminData)
        adminId = addRes.result.id
      } else {
        adminId = checkRes.result.data[0]._id
      }

      const user = {
        id: adminId,
        username: 'admin',
        role: 'admin'
      }
      saveCurrentUser(user)
      uni.setStorageSync('demo_token', 'local_admin_' + Date.now())
      return { ok: true, user }
    }

    // 普通用户登录
    const loginRes = await dbWhere(USERS_COLLECTION, {
      username: name,
      password: pwd
    })

    if (loginRes.result.data && loginRes.result.data.length > 0) {
      const userData = loginRes.result.data[0]
      const user = {
        id: userData._id,
        username: userData.username,
        role: userData.role
      }
      saveCurrentUser(user)
      uni.setStorageSync('demo_token', 'local_' + name + '_' + Date.now())
      return { ok: true, user }
    }

    return { ok: false, message: '用户名或密码错误' }
  } catch (error) {
    console.error('登录失败:', error)
    return { ok: false, message: error.message || '登录失败' }
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
    const res = await dbGet(USERS_COLLECTION, userId)
    if (res.result.data) {
      return { ok: true, data: res.result.data }
    }
    return { ok: false, message: '用户不存在' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(userId, data) {
  try {
    await dbUpdate(USERS_COLLECTION, userId, {
      ...data,
      updatedAt: Date.now()
    })
    return { ok: true, message: '更新成功' }
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
