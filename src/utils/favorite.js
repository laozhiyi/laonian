/**
 * 课程收藏 API
 */

import { request } from './cloud-db.js'

/**
 * 获取用户收藏列表
 */
export async function getFavorites(userId) {
  try {
    const res = await request('GET', '/api/favorites', { user_id: userId })
    return {
      ok: true,
      list: res?.list || [],
      total: res?.total || 0
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return { ok: false, list: [], total: 0 }
  }
}

/**
 * 添加收藏
 */
export async function addFavorite(userId, courseId, isExternal = true) {
  try {
    const res = await request('POST', '/api/favorites', {
      user_id: userId,  // 添加 user_id 到请求体
      course_id: courseId,
      is_external: isExternal
    })
    return { ok: true, id: res.id }
  } catch (error) {
    console.error('添加收藏失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 取消收藏
 */
export async function removeFavorite(favoriteId) {
  try {
    await request('DELETE', `/api/favorites/${favoriteId}`)
    return { ok: true }
  } catch (error) {
    console.error('取消收藏失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 根据课程ID取消收藏
 */
export async function removeFavoriteByCourse(userId, courseId, isExternal = true) {
  try {
    await request('DELETE', `/api/favorites/course?user_id=${userId}&course_id=${courseId}&is_external=${isExternal}`)
    return { ok: true }
  } catch (error) {
    console.error('取消收藏失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 检查是否已收藏
 */
export async function checkFavorite(userId, courseId, isExternal = true) {
  try {
    const res = await request('GET', '/api/favorites/check', {
      user_id: userId,
      course_id: courseId,
      is_external: isExternal
    })
    return {
      ok: true,
      isFavorited: res?.is_favorited || false,
      favoriteId: res?.favorite_id || null
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return { ok: false, isFavorited: false, favoriteId: null }
  }
}
