/**
 * 本地缓存工具
 * 用于减少重复的网络请求，提升页面加载速度
 */

// 缓存前缀
const PREFIX = 'orange_'

// 默认缓存时间（5分钟）
const DEFAULT_TTL = 5 * 60 * 1000

/**
 * 设置缓存
 * @param {string} key - 缓存键名
 * @param {any} data - 缓存数据
 * @param {number} ttl - 缓存时间（毫秒），默认5分钟
 */
export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const cacheData = {
      data,
      expire: Date.now() + ttl,
    }
    uni.setStorageSync(PREFIX + key, JSON.stringify(cacheData))
  } catch (e) {
    console.error('setCache error:', e)
  }
}

/**
 * 获取缓存
 * @param {string} key - 缓存键名
 * @returns {any|null} 缓存的数据或null
 */
export function getCache(key) {
  try {
    const cacheStr = uni.getStorageSync(PREFIX + key)
    if (!cacheStr) return null

    const cacheData = JSON.parse(cacheStr)
    // 检查是否过期
    if (Date.now() > cacheData.expire) {
      uni.removeStorageSync(PREFIX + key)
      return null
    }
    return cacheData.data
  } catch (e) {
    console.error('getCache error:', e)
    return null
  }
}

/**
 * 清除指定缓存
 * @param {string} key - 缓存键名
 */
export function removeCache(key) {
  try {
    uni.removeStorageSync(PREFIX + key)
  } catch (e) {
    console.error('removeCache error:', e)
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  try {
    const keys = uni.getStorageInfoSync().keys || []
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
  } catch (e) {
    console.error('clearAllCache error:', e)
  }
}

/**
 * 带缓存的数据获取函数
 * @param {string} key - 缓存键名
 * @param {Function} fetchFn - 获取数据的函数（返回Promise）
 * @param {number} ttl - 缓存时间
 * @returns {Promise<any>} 数据
 */
export async function getWithCache(key, fetchFn, ttl = DEFAULT_TTL) {
  // 先尝试从缓存获取
  const cached = getCache(key)
  if (cached !== null) {
    console.log('[Cache Hit]', key)
    return cached
  }

  // 缓存不存在，从接口获取
  console.log('[Cache Miss]', key)
  try {
    const data = await fetchFn()
    if (data) {
      setCache(key, data, ttl)
    }
    return data
  } catch (e) {
    console.error('[Cache Fetch Error]', key, e)
    return null
  }
}

export default {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  getWithCache,
}
