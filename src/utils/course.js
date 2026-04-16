/**
 * 课程模块 API（支持本地后端 HTTP 模式 + uniCloud 模式）
 */

import { courses as coursesApi, categories as categoriesApi } from './cloud-db.js'

const COURSES_COLLECTION = 'courses'
const CATEGORIES_COLLECTION = 'categories'

// 是否使用本地后端（浏览器环境默认使用后端 API）
const useBackend = () => {
  try {
    if (typeof uniCloud === 'undefined' || !uniCloud) return true
    if (typeof uniCloud.database !== 'function') return true
    return false
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

  if (useBackend()) {
    const res = await coursesApi.list({
      categoryId: categoryId || undefined,
      featured: isFeatured,
      hot: undefined,
      status: status,
      page: page,
      pageSize: limit,
    })
    let list = res.data || []
    if (sortBy === 'hot') {
      list.sort((a, b) => (b.clickCount || b.viewCount || 0) - (a.clickCount || a.viewCount || 0))
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.priceNow || 0) - (b.priceNow || 0))
    } else if (sortBy === 'new') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    return { ok: res.success !== false, list, total: res.total || list.length }
  }

  try {
    const db = uniCloud.database()
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
  if (useBackend()) {
    const res = await coursesApi.getFeatured()
    return { ok: res.success !== false, list: res.data || [] }
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
  if (useBackend()) {
    const res = await coursesApi.list({ hot: true, status: 'online', pageSize: limit })
    return { ok: res.success !== false, list: res.data || [] }
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
  if (useBackend()) {
    const res = await coursesApi.getById(courseId)
    if (res.success && res.data) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: '课程不存在' }
  }

  try {
    const db = uniCloud.database()
    const res = await db.collection(COURSES_COLLECTION).doc(courseId).get()
    if (res.result && res.result.data) {
      const course = transformCourse(res.result.data)
      db.collection(COURSES_COLLECTION).doc(courseId).update({ viewCount: (course.viewCount || 0) + 1 }).catch(() => {})
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
  if (useBackend()) {
    const res = await coursesApi.list({ keyword, status: 'online', page, pageSize: limit })
    return { ok: res.success !== false, list: res.data || [], total: res.total || 0 }
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
  if (useBackend()) {
    const res = await coursesApi.getRecommended(1, limit)
    return { ok: res.success !== false, list: res.data || [] }
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
  if (useBackend()) {
    const res = await coursesApi.list({ pageSize: 1 })
    return { ok: res.success !== false, total: res.total || 0 }
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
  if (useBackend()) {
    try {
      const res = await coursesApi.create(courseData)
      return res.success ? { ok: true, id: res.data?._id || res.data?.id } : { ok: false, message: res.error || '添加失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 更新课程
 */
export async function updateCourse(courseId, courseData) {
  if (useBackend()) {
    try {
      const res = await coursesApi.update(courseId, courseData)
      return res.success ? { ok: true } : { ok: false, message: res.error || '更新失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
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
  if (useBackend()) {
    try {
      const res = await coursesApi.delete(courseId)
      return res.success ? { ok: true } : { ok: false, message: res.error || '删除失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

/**
 * 获取分类列表
 */
export async function getCategories() {
  if (useBackend()) {
    const res = await categoriesApi.list()
    return { ok: res.success !== false, list: res.data || [] }
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
