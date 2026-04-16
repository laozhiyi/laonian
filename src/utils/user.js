/**
 * 用户模块 API（支持 Mock 数据 fallback）
 */

import { dbAdd, dbWhere, dbUpdate, dbGet } from './cloud-db.js'
import { mockUser, mockOrders } from './mock-data.js'

const USERS_COLLECTION = 'users'

const useMock = () => {
  if (typeof uniCloud === 'undefined' || !uniCloud) return true
  try {
    const db = uniCloud.database()
    return !db
  } catch {
    return true
  }
}

// 存储当前用户
let _currentUser = null

// 获取当前用户信息
export function getCurrentUser() {
  if (useMock()) {
    if (_currentUser) return _currentUser
    try {
      const user = uni.getStorageSync('mock_current_user')
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
  if (useMock()) {
    uni.setStorageSync('mock_current_user', JSON.stringify(user))
    uni.setStorageSync('demo_token', 'mock_token_' + Date.now())
  } else {
    uni.setStorageSync('current_user', JSON.stringify(user))
    uni.setStorageSync('demo_token', 'local_' + user.id + '_' + Date.now())
  }
}

function clearCurrentUser() {
  _currentUser = null
  uni.removeStorageSync('current_user')
  uni.removeStorageSync('mock_current_user')
  uni.removeStorageSync('demo_token')
}

/**
 * 微信快捷登录
 */
export async function wechatLogin(userInfo) {
  if (useMock()) {
    const user = {
      ...mockUser,
      id: 'user-' + Date.now(),
      nickname: userInfo?.nickname || '微信用户',
      avatar: userInfo?.avatarUrl || '',
    }
    saveCurrentUser(user)
    return { ok: true, user }
  }

  try {
    const openid = userInfo.openid || 'wx_' + Date.now()
    const checkRes = await dbWhere(USERS_COLLECTION, { openid: openid })
    let userId
    let isNew = false

    if (checkRes.result.data && checkRes.result.data.length > 0) {
      userId = checkRes.result.data[0]._id
      await dbUpdate(USERS_COLLECTION, userId, {
        nickname: userInfo.nickname || '用户',
        avatar: userInfo.avatar || '',
        lastActiveAt: Date.now()
      })
    } else {
      isNew = true
      const addRes = await dbAdd(USERS_COLLECTION, {
        openid: openid,
        nickname: userInfo.nickname || '新用户',
        avatar: userInfo.avatar || '',
        role: 'user',
        fontSize: 'normal',
        interestTags: [],
        interestWeights: {},
        totalCommission: 0,
        withdrawableCommission: 0,
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      })
      userId = addRes.result && addRes.result.id
    }

    if (userId) {
      const user = { id: userId, openid, nickname: userInfo.nickname || '新用户', avatar: userInfo.avatar || '', role: 'user', isNew }
      saveCurrentUser(user)
      return { ok: true, user }
    }
    return { ok: false, message: '登录失败' }
  } catch (error) {
    return { ok: false, message: error.message || '登录失败' }
  }
}

/**
 * 用户登录
 */
export async function loginUser({ username, password }) {
  if (useMock()) {
    const name = username.trim().toLowerCase()
    const pwd = password.trim()

    // 管理员账号 admin/admin
    if (name === 'admin' && pwd === 'admin') {
      const user = { ...mockUser, id: 'admin-001', role: 'admin', nickname: '管理员' }
      saveCurrentUser(user)
      return { ok: true, user }
    }

    // 测试用户 test/test
    if (name === 'test' && pwd === 'test') {
      const user = { ...mockUser, id: 'test-001', role: 'user', nickname: '测试用户' }
      saveCurrentUser(user)
      return { ok: true, user }
    }

    return { ok: false, message: '用户名或密码错误' }
  }

  try {
    const name = username.trim().toLowerCase()
    const pwd = password.trim()
    if (name === 'admin' && pwd === 'admin') {
      const checkRes = await dbWhere(USERS_COLLECTION, { role: 'admin' })
      let adminId
      if (!checkRes.result.data || checkRes.result.data.length === 0) {
        const addRes = await dbAdd(USERS_COLLECTION, {
          username: 'admin', password: 'admin', role: 'admin', nickname: '管理员',
          createdAt: Date.now(), updatedAt: Date.now()
        })
        adminId = addRes.result && addRes.result.id
      } else {
        adminId = checkRes.result.data[0]._id
      }
      const user = { id: adminId, username: 'admin', role: 'admin' }
      saveCurrentUser(user)
      return { ok: true, user }
    }
    const loginRes = await dbWhere(USERS_COLLECTION, { username: name, password: pwd })
    if (loginRes.result.data && loginRes.result.data.length > 0) {
      const userData = loginRes.result.data[0]
      const user = { id: userData._id, username: userData.username, nickname: userData.nickname, avatar: userData.avatar, role: userData.role }
      saveCurrentUser(user)
      return { ok: true, user }
    }
    return { ok: false, message: '用户名或密码错误' }
  } catch (error) {
    return { ok: false, message: error.message || '登录失败' }
  }
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
  if (useMock()) {
    const user = getCurrentUser()
    if (user && user.id === userId) {
      saveCurrentUser({ ...user, ...data })
    }
    return { ok: true }
  }
  try {
    await dbUpdate(USERS_COLLECTION, userId, { ...data, updatedAt: Date.now() })
    const localUser = getCurrentUser()
    if (localUser && localUser.id === userId) {
      saveCurrentUser({ ...localUser, ...data })
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 更新用户兴趣标签
 */
export async function updateInterestTag(userId, tag, weight = 5) {
  if (useMock()) {
    const user = getCurrentUser()
    if (!user) return { ok: false }
    const interestWeights = user.interestWeights || {}
    interestWeights[tag] = (interestWeights[tag] || 0) + weight
    const sortedTags = Object.entries(interestWeights).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t)
    saveCurrentUser({ ...user, interestTags: sortedTags, interestWeights })
    return { ok: true }
  }
  try {
    const res = await dbGet(USERS_COLLECTION, userId)
    if (!res.result || !res.result.data) return { ok: false, message: '用户不存在' }
    const userData = res.result.data
    const interestWeights = userData.interestWeights || {}
    interestWeights[tag] = (interestWeights[tag] || 0) + weight
    const sortedTags = Object.entries(interestWeights).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t)
    await dbUpdate(USERS_COLLECTION, userId, { interestTags: sortedTags, interestWeights, lastActiveAt: Date.now() })
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export function isLoggedIn() {
  if (useMock()) {
    return !!uni.getStorageSync('demo_token') || _currentUser !== null
  }
  return !!uni.getStorageSync('demo_token') && !!getCurrentUser()
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
  if (useMock()) {
    const user = getCurrentUser()
    if (!user) return { ok: true, data: { favoriteCount: 0, browseCount: 0, orderCount: 0 } }
    return {
      ok: true,
      data: {
        favoriteCount: mockOrders.filter(o => o.status === 'settled').length * 3 + 2,
        browseCount: 15,
        orderCount: mockOrders.filter(o => o.status === 'settled').length
      }
    }
  }
  try {
    const db = uniCloud.database()
    const [favRes, browseRes, orderRes] = await Promise.all([
      db.collection('favorites').where({ userId }).count(),
      db.collection('browse-logs').where({ userId }).count(),
      db.collection('orders').where({ userId }).count()
    ])
    return {
      ok: true,
      data: {
        favoriteCount: favRes.result?.total || 0,
        browseCount: browseRes.result?.total || 0,
        orderCount: orderRes.result?.total || 0
      }
    }
  } catch (e) {
    return { ok: false, data: { favoriteCount: 0, browseCount: 0, orderCount: 0 } }
  }
}
