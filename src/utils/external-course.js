/**
 * 外部课程 API
 */

import { request } from './cloud-db.js'

/**
 * 获取外部课程分类
 */
export async function getExternalCategories() {
  try {
    const res = await request('GET', '/api/external-courses/categories')
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
 * 创建外部课程分类
 */
export async function createCategory(name, icon = null, color = null, sort = 0) {
  try {
    const res = await request('POST', '/api/external-courses/categories', {
      name,
      icon,
      color,
      sort
    })
    return { ok: true, id: res.id }
  } catch (error) {
    console.error('创建分类失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 更新外部课程分类
 */
export async function updateCategory(id, data = {}) {
  try {
    const params = new URLSearchParams()
    if (data.name !== undefined) params.append('name', data.name)
    if (data.icon !== undefined) params.append('icon', data.icon)
    if (data.color !== undefined) params.append('color', data.color)
    if (data.sort !== undefined) params.append('sort', String(data.sort))

    const res = await request('PUT', `/api/external-courses/categories/${id}?${params.toString()}`)
    return { ok: true }
  } catch (error) {
    console.error('更新分类失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 删除外部课程分类
 */
export async function deleteCategory(id) {
  try {
    await request('DELETE', `/api/external-courses/categories/${id}`)
    return { ok: true }
  } catch (error) {
    console.error('删除分类失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 获取外部课程列表
 */
export async function getExternalCourses(params = {}) {
  try {
    const res = await request('GET', '/api/external-courses', params)
    return {
      ok: true,
      list: res?.list || [],
      total: res?.total || 0
    }
  } catch (error) {
    console.error('获取外部课程失败:', error)
    return { ok: false, list: [], total: 0 }
  }
}

/**
 * 获取外部课程详情
 */
export async function getExternalCourseDetail(id) {
  try {
    const res = await request('GET', `/api/external-courses/${id}`)
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
 * 创建外部课程
 */
export async function createExternalCourse(data) {
  try {
    const params = new URLSearchParams()
    params.append('title', data.title)
    if (data.cover) params.append('cover', data.cover)
    if (data.link) params.append('link', data.link)
    if (data.description) params.append('description', data.description)
    if (data.category) params.append('category', data.category)
    if (data.price !== undefined) params.append('price', String(data.price))
    if (data.stock !== undefined) params.append('stock', String(data.stock))
    if (data.sort !== undefined) params.append('sort', String(data.sort))

    const res = await request('POST', `/api/external-courses?${params.toString()}`)
    return { ok: true, id: res.id }
  } catch (error) {
    console.error('创建外部课程失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 更新外部课程
 */
export async function updateExternalCourse(id, data) {
  try {
    const params = new URLSearchParams()
    if (data.title !== undefined) params.append('title', data.title)
    if (data.cover !== undefined) params.append('cover', data.cover)
    if (data.link !== undefined) params.append('link', data.link)
    if (data.description !== undefined) params.append('description', data.description)
    if (data.category !== undefined) params.append('category', data.category)
    if (data.price !== undefined) params.append('price', String(data.price))
    if (data.stock !== undefined) params.append('stock', String(data.stock))
    if (data.sort !== undefined) params.append('sort', String(data.sort))
    if (data.status !== undefined) params.append('status', data.status)

    const res = await request('PUT', `/api/external-courses/${id}?${params.toString()}`)
    return { ok: true }
  } catch (error) {
    console.error('更新外部课程失败:', error)
    return { ok: false, message: error.message }
  }
}

/**
 * 删除外部课程
 */
export async function deleteExternalCourse(id) {
  try {
    await request('DELETE', `/api/external-courses/${id}`)
    return { ok: true }
  } catch (error) {
    console.error('删除外部课程失败:', error)
    return { ok: false, message: error.message }
  }
}
