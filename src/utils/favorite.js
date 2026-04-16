/**
 * 收藏模块 API（支持本地后端 HTTP 模式 + uniCloud 模式）
 */

import { favorites as favoritesApi } from './cloud-db.js'

const FAVORITES_COLLECTION = 'favorites'

// 是否使用本地后端
const useBackend = () => {
  try {
    if (typeof uniCloud === 'undefined' || !uniCloud) return true
    if (typeof uniCloud.database !== 'function') return true
    return false
  } catch {
    return true
  }
}

/**
 * 获取收藏列表
 */
export async function getFavorites(userId, page = 1, limit = 20) {
  if (useBackend()) {
    try {
      const res = await favoritesApi.list(page, limit)
      return { ok: res.success !== false, list: res.data || [], total: res.total || 0 }
    } catch (e) {
      return { ok: false, list: [], message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(FAVORITES_COLLECTION)
      .where({ userId })
      .orderBy('createdAt', 'desc').get()
    return { ok: true, list: res.result.data || [], total: res.result.affectedDocs || 0 }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 添加收藏
 */
export async function addFavorite(userId, course) {
  if (useBackend()) {
    try {
      const res = await favoritesApi.add(course.id || course._id)
      return res.success ? { ok: true } : { ok: false, message: res.error || '收藏失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 取消收藏（HTTP 模式：通过 courseId 查找对应收藏记录后删除）
 */
export async function removeFavorite(userId, courseId) {
  if (useBackend()) {
    try {
      // 遍历收藏列表找到对应 courseId 的记录
      const res = await favoritesApi.list(1, 100)
      const fav = (res.data || []).find(f => f.courseId === courseId)
      if (fav) {
        const delRes = await favoritesApi.remove(fav._id || fav.id)
        return delRes.success ? { ok: true } : { ok: false, message: delRes.error || '取消失败' }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 检查是否已收藏
 */
export async function checkFavorite(userId, courseId) {
  if (useBackend()) {
    try {
      const res = await favoritesApi.check(courseId)
      return { ok: res.success !== false, isFavorite: res.data?.isFavorite || false }
    } catch (e) {
      return { ok: false, isFavorite: false }
    }
  }
  return { ok: false, isFavorite: false }
}
