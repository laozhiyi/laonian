/**
 * 追踪模块 API（支持 Mock 数据）
 */

import { dbAdd } from './cloud-db.js'
import { mockBrowseHistory } from './mock-data.js'

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
 * 添加浏览记录
 */
export async function addBrowseLog(userId, course, source = 'home') {
  if (useMock() || !userId) {
    mockBrowseHistory.unshift({
      _id: 'browse-' + Date.now(),
      userId,
      courseId: course.id || course._id,
      courseTitle: course.title,
      courseCover: course.cover,
      action: 'view',
      source,
      createdAt: Date.now()
    })
    return { ok: true }
  }
  try {
    await dbAdd('browse-logs', {
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
  if (useMock() || !userId) {
    return { ok: true, list: mockBrowseHistory, total: mockBrowseHistory.length }
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
  if (useMock()) {
    return { ok: true }
  }
  try {
    const db = uniCloud.database()
    await dbAdd('click-logs', {
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
