/**
 * 地址模块 API
 *
 * 对接后端 API：
 * - GET /addresses - 获取地址列表
 * - POST /addresses - 创建地址
 * - GET /addresses/:id - 获取单个地址
 * - PUT /addresses/:id - 更新地址
 * - DELETE /addresses/:id - 删除地址
 * - PUT /addresses/:id/default - 设为默认地址
 */

import { get, post, put, del } from './request.js'

// 本地存储 Key
const ADDRESSES_KEY = 'user_addresses'

/**
 * 获取地址列表
 */
export async function getAddresses() {
  try {
    const res = await get('/addresses')
    if (res.code === 200) {
      return { ok: true, list: res.data || [] }
    }
    // 失败时从本地存储获取
    return { ok: true, list: getLocalAddresses() }
  } catch {
    return { ok: true, list: getLocalAddresses() }
  }
}

/**
 * 获取单个地址
 */
export async function getAddress(id) {
  try {
    const res = await get(`/addresses/${id}`)
    if (res.code === 200) {
      return { ok: true, data: res.data }
    }
    // 从本地查找
    const local = getLocalAddresses().find(a => a.id === id)
    if (local) return { ok: true, data: local }
    return { ok: false, message: '地址不存在' }
  } catch {
    const local = getLocalAddresses().find(a => a.id === id)
    if (local) return { ok: true, data: local }
    return { ok: false, message: '获取地址失败' }
  }
}

/**
 * 获取默认地址
 */
export async function getDefaultAddress() {
  const list = await getAddresses()
  if (list.ok && list.list.length > 0) {
    const defaultAddr = list.list.find(a => a.isDefault)
    if (defaultAddr) return { ok: true, data: defaultAddr }
    return { ok: true, data: list.list[0] }
  }
  return { ok: false, data: null }
}

/**
 * 创建地址
 */
export async function createAddress(data) {
  try {
    const res = await post('/addresses', data)
    if (res.code === 200) {
      return { ok: true, id: res.data.id, data: res.data }
    }
    // 本地创建
    const newAddr = saveLocalAddress(data)
    return { ok: true, id: newAddr.id, data: newAddr }
  } catch {
    const newAddr = saveLocalAddress(data)
    return { ok: true, id: newAddr.id, data: newAddr }
  }
}

/**
 * 更新地址
 */
export async function updateAddress(id, data) {
  try {
    const res = await put(`/addresses/${id}`, data)
    if (res.code === 200) {
      return { ok: true, data: res.data }
    }
    // 本地更新
    const updated = updateLocalAddress(id, data)
    return { ok: true, data: updated }
  } catch {
    const updated = updateLocalAddress(id, data)
    return { ok: true, data: updated }
  }
}

/**
 * 删除地址
 */
export async function deleteAddress(id) {
  try {
    const res = await del(`/addresses/${id}`)
    if (res.code === 200) {
      return { ok: true }
    }
    // 本地删除
    deleteLocalAddress(id)
    return { ok: true }
  } catch {
    deleteLocalAddress(id)
    return { ok: true }
  }
}

/**
 * 设为默认地址
 */
export async function setDefaultAddress(id) {
  try {
    const res = await put(`/addresses/${id}/default`)
    if (res.code === 200) {
      return { ok: true }
    }
    // 本地设置
    setLocalDefaultAddress(id)
    return { ok: true }
  } catch {
    setLocalDefaultAddress(id)
    return { ok: true }
  }
}

// ========== 本地存储操作 ==========

export function getLocalAddresses() {
  try {
    const raw = uni.getStorageSync(ADDRESSES_KEY) || '[]'
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveLocalAddress(data) {
  const addresses = getLocalAddresses()
  const newAddr = {
    id: 'addr_' + Date.now(),
    ...data,
    isDefault: addresses.length === 0, // 第一个地址默认为默认地址
    createdAt: new Date().toISOString()
  }
  addresses.unshift(newAddr)
  uni.setStorageSync(ADDRESSES_KEY, JSON.stringify(addresses))
  return newAddr
}

export function updateLocalAddress(id, data) {
  const addresses = getLocalAddresses()
  const index = addresses.findIndex(a => a.id === id)
  if (index !== -1) {
    addresses[index] = { ...addresses[index], ...data, updatedAt: new Date().toISOString() }
    uni.setStorageSync(ADDRESSES_KEY, JSON.stringify(addresses))
    return addresses[index]
  }
  return null
}

export function deleteLocalAddress(id) {
  const addresses = getLocalAddresses().filter(a => a.id !== id)
  uni.setStorageSync(ADDRESSES_KEY, JSON.stringify(addresses))
}

export function setLocalDefaultAddress(id) {
  const addresses = getLocalAddresses().map(a => ({
    ...a,
    isDefault: a.id === id
  }))
  uni.setStorageSync(ADDRESSES_KEY, JSON.stringify(addresses))
}

// 地址类型选项
export const ADDRESS_TYPES = [
  { value: 'home', label: '家', icon: '🏠' },
  { value: 'company', label: '公司', icon: '🏢' },
  { value: 'school', label: '学校', icon: '🏫' },
  { value: 'other', label: '其他', icon: '📍' },
]

// 省份数据（简化版）
export const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾'
]
