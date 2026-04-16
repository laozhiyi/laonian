/**
 * 收藏模块 API（支持 Mock 数据）
 */

import { dbAdd, dbWhere, dbRemove } from './cloud-db.js'
import { mockFavorites } from './mock-data.js'

const FAVORITES_COLLECTION = 'favorites'
const useMock = () => {
  if (typeof uniCloud === 'undefined' || !uniCloud) return true
  try {
    const db = uniCloud.database()
    return !db
  } catch {
    return true
  }
}

/**
 * 获取收藏列表
 */
export async function getFavorites(userId) {
  if (useMock() || !userId) {
    return { ok: true, list: mockFavorites }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(FAVORITES_COLLECTION)
      .where({ userId })
      .orderBy('createdAt', 'desc').get()
    return { ok: true, list: res.result.data || [] }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 添加收藏
 */
export async function addFavorite(userId, course) {
  if (useMock() || !userId) {
    const fav = { _id: 'fav-' + Date.now(), userId, courseId: course.id || course._id, courseTitle: course.title, courseCover: course.cover, createdAt: Date.now() }
    const exists = mockFavorites.find(f => f.courseId === (course.id || course._id))
    if (!exists) mockFavorites.unshift(fav)
    return { ok: true }
  }
  try {
    const db = uniCloud.database()
    const checkRes = await db.collection(FAVORITES_COLLECTION)
      .where({ userId, courseId: course.id || course._id }).get()
    if (checkRes.result.data && checkRes.result.data.length > 0) return { ok: true, message: '已收藏' }
    const res = await dbAdd(FAVORITES_COLLECTION, {
      userId, courseId: course.id || course._id, courseTitle: course.title,
      courseCover: course.cover, createdAt: Date.now()
    })
    return res.result && res.result.id ? { ok: true, id: res.result.id } : { ok: false, message: '收藏失败' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 取消收藏
 */
export async function removeFavorite(userId, courseId) {
  if (useMock() || !userId) {
    const idx = mockFavorites.findIndex(f => f.courseId === courseId)
    if (idx >= 0) mockFavorites.splice(idx, 1)
    return { ok: true }
  }
  try {
    const db = uniCloud.database()
    await db.collection(FAVORITES_COLLECTION)
      .where({ userId, courseId }).remove()
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 检查是否已收藏
 */
export async function checkFavorite(userId, courseId) {
  if (useMock() || !userId) {
    return { ok: true, isFavorite: mockFavorites.some(f => f.courseId === courseId) }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(FAVORITES_COLLECTION)
      .where({ userId, courseId }).get()
    return { ok: true, isFavorite: !!(res.result.data && res.result.data.length > 0) }
  } catch (e) {
    return { ok: false, isFavorite: false }
  }
}
