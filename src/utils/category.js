/**
 * 分类模块 API（支持 Mock 数据）
 */

import { dbAdd, dbWhere, dbUpdate, dbRemove, dbGet } from './cloud-db.js'
import { mockCategories } from './mock-data.js'

const CATEGORIES_COLLECTION = 'categories'
const useMock = () => {
  if (typeof uniCloud === 'undefined' || !uniCloud) return true
  try {
    const db = uniCloud.database()
    return !db
  } catch {
    return true
  }
}

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

export async function getCategoryById(categoryId) {
  if (useMock()) {
    const cat = mockCategories.find(c => (c._id || c.id) === categoryId)
    return { ok: !!cat, data: cat || null }
  }
  try {
    const res = await dbGet(CATEGORIES_COLLECTION, categoryId)
    return res.result && res.result.data ? { ok: true, data: res.result.data } : { ok: false, message: '分类不存在' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export async function addCategory(data) {
  if (useMock()) {
    const cat = { _id: 'cat-' + Date.now(), ...data, createdAt: Date.now() }
    mockCategories.push(cat)
    return { ok: true, id: cat._id }
  }
  try {
    const res = await dbAdd(CATEGORIES_COLLECTION, {
      name: data.name, icon: data.icon || '', sortOrder: data.sortOrder || 0,
      status: data.status || 'active', createdAt: Date.now()
    })
    return res.result && res.result.id ? { ok: true, id: res.result.id } : { ok: false, message: '添加失败' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export async function updateCategory(categoryId, data) {
  if (useMock()) {
    const idx = mockCategories.findIndex(c => (c._id || c.id) === categoryId)
    if (idx >= 0) mockCategories[idx] = { ...mockCategories[idx], ...data }
    return { ok: true }
  }
  try {
    return { ok: true, ...(await dbUpdate(CATEGORIES_COLLECTION, categoryId, data)) }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export async function deleteCategory(categoryId) {
  if (useMock()) {
    const idx = mockCategories.findIndex(c => (c._id || c.id) === categoryId)
    if (idx >= 0) mockCategories.splice(idx, 1)
    return { ok: true }
  }
  try {
    return await dbRemove(CATEGORIES_COLLECTION, categoryId)
  } catch (e) {
    return { ok: false, message: e.message }
  }
}
