/**
 * uniCloud 数据库基础封装
 */

/**
 * 获取数据库实例
 */
export function getDB() {
  if (typeof uniCloud === 'undefined' || !uniCloud) {
    return null
  }
  try {
    const db = uniCloud.database()
    return db
  } catch {
    return null
  }
}

// 检查 uniCloud 是否可用
export function isUniCloudAvailable() {
  if (typeof uniCloud === 'undefined' || !uniCloud) return false
  try {
    const db = uniCloud.database()
    return !!db
  } catch {
    return false
  }
}

/**
 * 查询单条记录
 */
export async function dbGet(collection, id) {
  const db = getDB()
  if (!db) {
    return { result: { data: null } }
  }
  try {
    // 确保ID是字符串
    const docId = String(id)
    const res = await db.collection(collection).doc(docId).get()
    // uniCloud 返回格式处理
    if (res && res.result) {
      // JQL 模式返回格式: { result: { data: {...} } }
      return res
    }
    // 其他情况直接返回
    return res
  } catch (error) {
    console.error('dbGet error:', error)
    return { result: { data: null } }
  }
}

/**
 * 添加记录
 */
export async function dbAdd(collection, data) {
  const db = getDB()
  if (!db) {
    return { result: { id: null, error: 'uniCloud not available' } }
  }
  return db.collection(collection).add(data)
}

/**
 * 更新记录
 */
export async function dbUpdate(collection, id, data) {
  const db = getDB()
  if (!db) {
    return { result: null, error: 'uniCloud not available' }
  }
  // 确保ID是字符串
  const docId = String(id)
  return db.collection(collection).doc(docId).update(data)
}

/**
 * 删除记录
 */
export async function dbRemove(collection, id) {
  const db = getDB()
  if (!db) {
    return { result: null, error: 'uniCloud not available' }
  }
  // 确保ID是字符串
  const docId = String(id)
  return db.collection(collection).doc(docId).remove()
}

/**
 * 条件查询
 */
export async function dbWhere(collection, condition, options = {}) {
  const db = getDB()
  if (!db) {
    return { result: { data: [] } }
  }
  try {
    let query = db.collection(collection).where(condition)

    if (options.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction)
    }
    if (options.skip) {
      query = query.skip(options.skip)
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const res = await query.get()
    // uniCloud 返回格式处理
    if (res && res.result) {
      return res
    }
    return res
  } catch (error) {
    console.error('dbWhere error:', error)
    return { result: { data: [] } }
  }
}

/**
 * 上传文件
 */
export async function uploadFile(filePath, cloudPath) {
  const client = uniCloud.uploadFile({
    filePath: filePath,
    cloudPath: cloudPath,
  })
  return client
}

export default {
  getDB,
  dbGet,
  dbAdd,
  dbUpdate,
  dbRemove,
  dbWhere,
  uploadFile,
}
