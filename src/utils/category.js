/**
 * 分类模块 API（支持本地后端 HTTP 模式 + uniCloud 模式）
 */

import { categories as categoriesApi } from './cloud-db.js'

const CATEGORIES_COLLECTION = 'categories'

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

export async function getCategoryById(categoryId) {
  if (useBackend()) {
    const res = await categoriesApi.list()
    const cat = (res.data || []).find(c => (c._id || c.id) === categoryId)
    return { ok: !!cat, data: cat || null }
  }
  try {
    const db = uniCloud.database()
    const res = await db.collection(CATEGORIES_COLLECTION).doc(categoryId).get()
    return res.result && res.result.data ? { ok: true, data: res.result.data } : { ok: false, message: '分类不存在' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export async function addCategory(data) {
  if (useBackend()) {
    try {
      const res = await categoriesApi.create(data)
      return res.success ? { ok: true, id: res.data?._id || res.data?.id } : { ok: false, message: res.error || '添加失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

export async function updateCategory(categoryId, data) {
  if (useBackend()) {
    try {
      const res = await categoriesApi.update(categoryId, data)
      return res.success ? { ok: true } : { ok: false, message: res.error || '更新失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}

export async function deleteCategory(categoryId) {
  if (useBackend()) {
    try {
      const res = await categoriesApi.delete(categoryId)
      return res.success ? { ok: true } : { ok: false, message: res.error || '删除失败' }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }
  return { ok: false, message: 'uniCloud 模式请使用云函数' }
}
