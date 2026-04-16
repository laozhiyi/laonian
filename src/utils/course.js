/**
 * 课程模块 API（支持 Mock 数据 fallback）
 */

import { dbAdd, dbWhere, dbUpdate, dbGet, dbRemove } from './cloud-db.js'
import { mockCourses, mockCategories, updateMockCourse, removeMockCourse, addMockCourse } from './mock-data.js'

const COURSES_COLLECTION = 'courses'
const CATEGORIES_COLLECTION = 'categories'

// 检查是否使用 mock 数据
const useMock = () => {
  if (typeof uniCloud === 'undefined' || !uniCloud) return true
  try {
    // 尝试获取数据库实例，如果失败则使用 mock
    const db = uniCloud.database()
    return !db
  } catch {
    return true
  }
}

// 转换 _id 为 id
function transformCourse(course) {
  if (!course) return null
  return { ...course, id: course._id || course.id }
}

function transformCourses(data) {
  if (!data || !Array.isArray(data)) return []
  return data.map(transformCourse)
}

/**
 * 获取课程列表
 */
export async function getCourses(params = {}) {
  const {
    categoryId = '',
    sortBy = 'comprehensive',
    isFeatured = null,
    status = 'online',
    page = 1,
    limit = 20
  } = params

  if (useMock()) {
    let list = [...mockCourses]

    if (categoryId) {
      list = list.filter(c => c.categoryId === categoryId)
    }
    if (isFeatured !== null) {
      list = list.filter(c => c.isFeatured === isFeatured)
    }
    if (status) {
      list = list.filter(c => c.status === status)
    }

    // 排序
    if (sortBy === 'hot') {
      list.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    } else if (sortBy === 'new') {
      list.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0))
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.priceNow || 0) - (b.priceNow || 0))
    } else {
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    }

    const start = (page - 1) * limit
    const paged = list.slice(start, start + limit)
    return { ok: true, list: paged, total: list.length }
  }

  try {
    const db = uniCloud.database()
    // 所有条件合并到同一个 where 对象中，避免多次调用 where 导致前面的条件被覆盖
    const whereCondition = {}
    whereCondition.status = status
    if (categoryId) {
      whereCondition.categoryId = categoryId
    }
    if (isFeatured !== null) {
      whereCondition.isFeatured = isFeatured
    }
    let query = db.collection(COURSES_COLLECTION).where(whereCondition)

    let orderField = 'sortOrder'
    let orderDirection = 'desc'
    if (sortBy === 'hot') {
      orderField = 'clickCount'
    } else if (sortBy === 'new') {
      orderField = 'createdAt'
    } else if (sortBy === 'price') {
      orderField = 'priceNow'
      orderDirection = 'asc'
    }

    const res = await query.orderBy(orderField, orderDirection).skip((page - 1) * limit).limit(limit).get()
    return { ok: true, list: transformCourses(res.result.data), total: res.result.affectedDocs || 0 }
  } catch (e) {
    console.error('getCourses error:', e)
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取精选课程（Banner）
 */
export async function getFeaturedCourses(limit = 5) {
  if (useMock()) {
    const featured = mockCourses.filter(c => c.isFeatured).slice(0, limit)
    return { ok: true, list: featured }
  }

  try {
    const db = uniCloud.database()
    const res = await db.collection(COURSES_COLLECTION)
      .where({ isFeatured: true, status: 'online' })
      .orderBy('sortOrder', 'desc')
      .limit(limit).get()
    return { ok: true, list: transformCourses(res.result.data) }
  } catch (e) {
    console.error('getFeaturedCourses error:', e)
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取热门课程
 */
export async function getHotCourses(limit = 10) {
  if (useMock()) {
    const hot = [...mockCourses].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, limit)
    return { ok: true, list: hot }
  }

  try {
    const db = uniCloud.database()
    const res = await db.collection(COURSES_COLLECTION)
      .where({ status: 'online' })
      .orderBy('clickCount', 'desc')
      .limit(limit).get()
    return { ok: true, list: transformCourses(res.result.data) }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取课程详情
 */
export async function getCourseDetail(courseId) {
  if (useMock()) {
    const course = mockCourses.find(c => (c._id || c.id) === courseId)
    return { ok: !!course, data: course || null }
  }

  try {
    const res = await dbGet(COURSES_COLLECTION, courseId)
    if (res.result && res.result.data) {
      const course = transformCourse(res.result.data)
      dbUpdate(COURSES_COLLECTION, courseId, { viewCount: (course.viewCount || 0) + 1 }).catch(() => {})
      return { ok: true, data: course }
    }
    return { ok: false, message: '课程不存在' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 搜索课程
 */
export async function searchCourses(keyword, page = 1, limit = 20) {
  if (useMock()) {
    const kw = keyword.toLowerCase()
    const list = mockCourses.filter(c =>
      (c.title && c.title.toLowerCase().includes(kw)) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(kw)) ||
      (c.platform && c.platform.toLowerCase().includes(kw)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(kw)))
    )
    const start = (page - 1) * limit
    return { ok: true, list: list.slice(start, start + limit), total: list.length }
  }

  try {
    const db = uniCloud.database()
    const res = await db.collection(COURSES_COLLECTION)
      .where({
        status: 'online',
        title: db.command.regex(keyword)
      })
      .orderBy('clickCount', 'desc')
      .skip((page - 1) * limit).limit(limit).get()
    return { ok: true, list: transformCourses(res.result.data), total: res.result.affectedDocs || 0 }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取个性化推荐
 */
export async function getRecommendations(userId, interestTags = [], limit = 20) {
  if (useMock()) {
    let list = [...mockCourses]
    if (interestTags.length > 0) {
      list = list.filter(c => c.tags && c.tags.some(t => interestTags.includes(t)))
    }
    list.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    return { ok: true, list: list.slice(0, limit) }
  }

  try {
    const db = uniCloud.database()
    let query
    if (interestTags.length > 0) {
      query = db.collection(COURSES_COLLECTION)
        .where({ status: 'online', tags: db.command.in(interestTags) })
        .orderBy('clickCount', 'desc').limit(limit)
    } else {
      query = db.collection(COURSES_COLLECTION)
        .where({ status: 'online' })
        .orderBy('clickCount', 'desc').limit(limit)
    }
    const res = await query.get()
    return { ok: true, list: transformCourses(res.result.data) }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}

/**
 * 获取课程总数
 */
export async function getCourseCount() {
  if (useMock()) {
    return { ok: true, total: mockCourses.length }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(COURSES_COLLECTION).count()
    return { ok: true, total: res.result.total }
  } catch (e) {
    return { ok: false, total: 0 }
  }
}

/**
 * 添加课程（管理员）
 */
export async function addCourse(courseData) {
  if (useMock()) {
    const newCourse = addMockCourse(courseData)
    return { ok: true, id: newCourse._id }
  }
  try {
    const now = Date.now()
    const data = {
      ...courseData,
      viewCount: 0,
      clickCount: 0,
      status: courseData.status || 'offline',
      isFeatured: courseData.isFeatured || false,
      sortOrder: courseData.sortOrder || 0,
      createdAt: now,
      updatedAt: now
    }
    if (!data.promoteCode) {
      data.promoteCode = 'smz_' + now.toString(36)
    }
    if (data.originalUrl && data.promoteCode) {
      data.promoteUrl = data.originalUrl + (data.originalUrl.includes('?') ? '&' : '?') +
        'from=smz_learning&promo=' + data.promoteCode
    }
    const res = await dbAdd(COURSES_COLLECTION, data)
    return res.result && res.result.id ? { ok: true, id: res.result.id } : { ok: false, message: '添加失败' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 更新课程
 */
export async function updateCourse(courseId, courseData) {
  if (useMock()) {
    const success = updateMockCourse(courseId, courseData)
    return { ok: success }
  }
  try {
    courseData.updatedAt = Date.now()
    const res = await dbUpdate(COURSES_COLLECTION, courseId, courseData)
    return { ok: true, ...res }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 切换课程状态
 */
export async function toggleCourseStatus(courseId, status) {
  return updateCourse(courseId, { status })
}

/**
 * 删除课程
 */
export async function deleteCourse(courseId) {
  if (useMock()) {
    const success = removeMockCourse(courseId)
    return { ok: success }
  }
  try {
    return await dbRemove(COURSES_COLLECTION, courseId)
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

/**
 * 获取分类列表（也放在 course.js 中方便统一导出）
 */
export async function getCategories() {
  if (useMock()) {
    return { ok: true, list: mockCategories }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(CATEGORIES_COLLECTION)
      .where({ status: 'active' })
      .orderBy('sortOrder', 'asc').get()
    return { ok: true, list: res.result.data || [] }
  } catch (e) {
    return { ok: false, list: [], message: e.message }
  }
}
