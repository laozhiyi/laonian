/**
 * 地址模块 API（uniCloud 云数据库版）
 */

import { dbAdd, dbWhere, dbUpdate, dbRemove, dbGet } from './cloud-db.js'
import { getCurrentUserId } from './user.js'

// 常量
const ADDRESSES_COLLECTION = 'addresses'

// 地址类型选项
export const ADDRESS_TYPES = [
  { value: 'home', label: '家', icon: '🏠' },
  { value: 'company', label: '公司', icon: '🏢' },
  { value: 'school', label: '学校', icon: '🏫' },
  { value: 'other', label: '其他', icon: '📍' },
]

// 省份数据
export const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾'
]

/**
 * 获取所有地址
 */
export async function getAddresses() {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: true, list: [] }
    }

    const res = await dbWhere(ADDRESSES_COLLECTION, { userId })
    let list = res.result.data || []

    // 转换 _id 为 id
    list = list.map(addr => ({
      ...addr,
      id: addr._id
    }))

    // 清理：确保只有一个默认地址
    list = cleanupAddresses(list)

    return { ok: true, list }
  } catch (error) {
    console.error('获取地址失败:', error)
    return { ok: true, list: [] }
  }
}

/**
 * 清理地址数据，确保只有一个默认地址
 */
function cleanupAddresses(addresses) {
  if (addresses.length === 0) return addresses

  // 如果只有一个地址，自动设为默认
  if (addresses.length === 1 && !addresses[0].isDefault) {
    return [{ ...addresses[0], isDefault: true }]
  }

  // 找到所有默认地址，保留最后一个（最新的）
  const defaultIndex = addresses.findIndex(a => a.isDefault)
  if (defaultIndex === -1) return addresses

  return addresses.map((addr, index) => {
    if (addr.isDefault && index !== defaultIndex) {
      return { ...addr, isDefault: false }
    }
    return addr
  })
}

/**
 * 获取单个地址
 */
export async function getAddress(id) {
  try {
    const res = await dbGet(ADDRESSES_COLLECTION, id)
    if (res.result.data) {
      return { ok: true, data: { ...res.result.data, id: res.result.data._id } }
    }
    return { ok: false, message: '地址不存在' }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 获取默认地址
 */
export async function getDefaultAddress() {
  try {
    const { list } = await getAddresses()
    if (list.length > 0) {
      const defaultAddr = list.find(a => a.isDefault)
      if (defaultAddr) return { ok: true, data: defaultAddr }
      return { ok: true, data: list[0] }
    }
    return { ok: false, data: null }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 创建地址
 */
export async function createAddress(data) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    const { list } = await getAddresses()
    const now = Date.now()

    let newAddr = {
      userId,
      ...data,
      createdAt: now,
      updatedAt: now
    }

    // 如果用户选择了设为默认，或者列表为空，则设为默认
    if (data.isDefault || list.length === 0) {
      // 取消其他地址的默认状态
      for (const addr of list) {
        await dbUpdate(ADDRESSES_COLLECTION, addr.id, {
          isDefault: false,
          updatedAt: now
        })
      }
      newAddr.isDefault = true
    }

    const res = await dbAdd(ADDRESSES_COLLECTION, newAddr)

    return { ok: true, id: res.result.id }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 更新地址
 */
export async function updateAddress(id, data) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    // 如果设置为默认地址，取消其他地址的默认状态
    if (data.isDefault) {
      const { list } = await getAddresses()
      for (const addr of list) {
        if (addr.id !== id) {
          await dbUpdate(ADDRESSES_COLLECTION, addr.id, {
            isDefault: false,
            updatedAt: Date.now()
          })
        }
      }
    }

    await dbUpdate(ADDRESSES_COLLECTION, id, {
      ...data,
      updatedAt: Date.now()
    })

    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 删除地址
 */
export async function deleteAddress(id) {
  try {
    await dbRemove(ADDRESSES_COLLECTION, id)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 设为默认地址
 */
export async function setDefaultAddress(id) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return { ok: false, message: '请先登录' }
    }

    const { list } = await getAddresses()
    const now = Date.now()

    // 取消所有默认
    for (const addr of list) {
      await dbUpdate(ADDRESSES_COLLECTION, addr.id, {
        isDefault: addr.id === id,
        updatedAt: now
      })
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

/**
 * 获取选中的地址（用于下单页面）
 */
export function getSelectedAddress() {
  try {
    const raw = uni.getStorageSync('selected_address')
    if (raw) {
      return JSON.parse(raw)
    }
    return null
  } catch {
    return null
  }
}

/**
 * 设置选中的地址
 */
export function setSelectedAddress(address) {
  if (address) {
    uni.setStorageSync('selected_address', JSON.stringify(address))
  } else {
    uni.removeStorageSync('selected_address')
  }
}
