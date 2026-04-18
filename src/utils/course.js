/**
 * 课程模块 API
 */

import { request } from './cloud-db.js'

const COURSES_COLLECTION = 'courses'

/**
 * 获取课程列表
 */
export async function getCourses(params = {}) {
  try {
    const res = await request('GET', '/api/courses', params)
    const list = res?.list || []
    return {
      ok: true,
      list,
      total: list.length
    }
  } catch (error) {
    console.error('获取课程失败:', error)
    return { ok: false, message: error.message, list: [], total: 0 }
  }
}

/**
 * 获取课程分类
 */
export async function getCategories() {
  try {
    const res = await request('GET', '/api/courses/categories')
    return {
      ok: true,
      list: res?.list || []
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    return { ok: false, list: [] }
  }
}

/**
 * 获取课程详情
 */
export async function getCourseDetail(id) {
  try {
    const res = await request('GET', `/api/courses/${id}`)
    if (res?.data) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: '课程不存在' }
  } catch (error) {
    console.error('获取课程详情失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 创建课程
 */
export async function createCourse(data) {
  try {
    const res = await request('POST', '/api/courses', data)
    return { ok: true, id: res.id }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 更新课程
 */
export async function updateCourse(id, data) {
  try {
    await request('PUT', `/api/courses/${id}`, data)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 删除课程
 */
export async function deleteCourse(id) {
  try {
    await request('DELETE', `/api/courses/${id}`)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 获取管理员添加的所有课程
 */
export async function getAdminCourses() {
  try {
    const res = await getCourses()
    if (Array.isArray(res?.list)) {
      return res.list.map(item => ({
        ...item,
        id: item.id
      }))
    }
    return []
  } catch (error) {
    console.error('获取课程失败:', error)
    return []
  }
}

/**
 * 减少课程库存
 */
export async function decreaseStock(items) {
  try {
    for (const item of items) {
      const courseId = item.courseId || item.productId || item.id
      if (!courseId) continue

      const res = await request('POST', '/api/courses/decrease-stock', [{
        courseId,
        quantity: item.quantity || 1
      }])

      if (!res?.ok) {
        console.warn('减少库存失败:', courseId)
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('减少库存失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 增加课程库存
 */
export async function increaseStock(items) {
  try {
    for (const item of items) {
      const courseId = item.courseId || item.productId || item.id
      if (!courseId) continue

      const res = await request('POST', '/api/courses/increase-stock', [{
        courseId,
        quantity: item.quantity || 1
      }])

      if (!res?.ok) {
        console.warn('增加库存失败:', courseId)
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('增加库存失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 购买课程
 */
export async function purchaseCourse(courseId, userId) {
  try {
    const res = await request('POST', '/api/course-orders', {
      course_id: courseId,
      user_id: userId
    })
    if (res?.ok) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: res?.detail || '购买失败' }
  } catch (error) {
    console.error('购买课程失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 检查课程购买状态
 */
export async function checkCoursePurchased(userId, courseId) {
  try {
    const res = await request('GET', `/api/course-orders/check/${courseId}`)
    if (res?.ok) {
      return {
        ok: true,
        purchased: res.purchased,
        course_link: res.course_link,
        course_type: res.course_type
      }
    }
    return { ok: false, purchased: false }
  } catch (error) {
    console.error('检查购买状态失败:', error)
    return { ok: false, purchased: false }
  }
}

/**
 * 购买内部课程（带视频）
 */
export async function purchaseInternalCourse(courseId) {
  try {
    const res = await request('POST', '/api/course-orders/internal', {
      course_id: courseId
    })
    if (res?.ok) {
      return { ok: true, data: res.data }
    }
    return { ok: false, message: res?.detail || '购买失败' }
  } catch (error) {
    console.error('购买内部课程失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 检查内部课程购买状态
 */
export async function checkInternalCoursePurchased(courseId) {
  try {
    const res = await request('GET', `/api/course-orders/check-internal/${courseId}`)
    if (res?.ok) {
      return {
        ok: true,
        purchased: res.purchased,
        video_url: res.video_url
      }
    }
    return { ok: false, purchased: false }
  } catch (error) {
    console.error('检查内部课程购买状态失败:', error)
    return { ok: false, purchased: false }
  }
}

/**
 * 获取用户已购买的课程列表
 */
export async function getPurchasedCourses(userId) {
  try {
    const res = await request('GET', '/api/course-orders/purchased')
    if (res?.ok) {
      return { ok: true, list: res.list || [] }
    }
    return { ok: false, list: [] }
  } catch (error) {
    console.error('获取已购课程失败:', error)
    return { ok: false, list: [] }
  }
}

/**
 * 获取用户的课程订单
 */
export async function getCourseOrders(userId) {
  try {
    const res = await request('GET', '/api/course-orders/user')
    if (res?.ok) {
      return { ok: true, list: res.list || [] }
    }
    return { ok: false, list: [] }
  } catch (error) {
    console.error('获取课程订单失败:', error)
    return { ok: false, list: [] }
  }
}
