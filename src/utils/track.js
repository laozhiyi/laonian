/**
 * 追踪模块 API（支持本地后端 HTTP 模式 + uniCloud 模式）
 */

import { logs as logsApi } from './cloud-db.js'
import { mockBrowseHistory } from './mock-data.js'

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
 * 添加浏览记录
 */
export async function addBrowseLog(userId, course, source = 'home') {
  if (useBackend()) {
    try {
      await logsApi.addBrowse({
        courseId: course.id || course._id,
        courseTitle: course.title,
        courseCover: course.cover,
        action: 'view',
        source,
      })
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    await db.collection('browse-logs').add({
      userId,
      courseId: course.id || course._id,
      courseTitle: course.title,
      courseCover: course.cover,
      action: 'view',
      source,
      createdAt: Date.now()
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 获取浏览历史
 */
export async function getBrowseHistory(userId, page = 1, limit = 20) {
  if (useBackend()) {
    try {
      const res = await logsApi.getBrowseHistory(page, limit)
      return { ok: res.success !== false, list: res.data || [], total: res.total || 0 }
    } catch (e) {
      return { ok: false, list: [], message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection('browse-logs')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit).limit(limit).get()
    return { ok: true, list: res.result.data || [], total: res.result.affectedDocs || 0 }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 记录点击跳转
 */
export async function recordClick(courseId, userId, promoteCode = '') {
  if (useBackend()) {
    try {
      await logsApi.addClick({ courseId, promoteCode })
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  try {
    const db = uniCloud.database()
    await db.collection('click-logs').add({
      userId, courseId, promoteCode, clickTime: Date.now()
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 热门搜索词
 */
export function getHotKeywords() {
  return [
    '广场舞入门', '手机摄影', '养生太极', '防诈骗', '国画基础',
    '家常菜', '书法入门', '太极拳', '健康养生', '智能手机'
  ]
}
