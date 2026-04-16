/**
 * Mock 数据 - 用于测试阶段，在没有真实数据库时提供示例数据
 */

const MOCK_COURSES_KEY = 'mock_courses_data'

export const mockCategories = [
  { _id: 'cat-1', name: '养生健康', icon: '🏃', sortOrder: 1, status: 'active' },
  { _id: 'cat-2', name: '兴趣爱好', icon: '🎨', sortOrder: 2, status: 'active' },
  { _id: 'cat-3', name: '手机技巧', icon: '📱', sortOrder: 3, status: 'active' },
  { _id: 'cat-4', name: '防诈骗', icon: '🛡️', sortOrder: 4, status: 'active' },
  { _id: 'cat-5', name: '厨艺美食', icon: '🍳', sortOrder: 5, status: 'active' },
  { _id: 'cat-6', name: '摄影摄像', icon: '📸', sortOrder: 6, status: 'active' },
  { _id: 'cat-7', name: '职场技能', icon: '💼', sortOrder: 7, status: 'active' },
  { _id: 'cat-8', name: '经典阅读', icon: '📚', sortOrder: 8, status: 'active' },
  { _id: 'cat-9', name: '音乐舞蹈', icon: '🎵', sortOrder: 9, status: 'active' },
  { _id: 'cat-10', name: '金融理财', icon: '💰', sortOrder: 10, status: 'active' },
]

const MOCK_COURSES_DEFAULT = [
  {
    _id: 'course-1',
    title: '中医养生十二讲',
    subtitle: '跟着老中医学养生，调理身体从我做起',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-1',
    categoryName: '养生健康',
    tags: ['中老年人适用', '零基础'],
    instructor: { name: '李中医', bio: '三甲医院主任中医师，从医40年', avatar: '' },
    platform: '得到',
    originalUrl: 'https://www.dedao.cn/course/123',
    promoteUrl: 'https://www.dedao.cn/course/123?from=smz_learning',
    promoteCode: 'smz_yangsheng_001',
    commissionRate: 30,
    price: 9900,
    priceNow: 2990,
    discountText: '限时7折',
    studentCount: 12580,
    rating: 4.8,
    suitableFor: '50岁以上中老年人',
    description: '本课程由三甲医院资深中医师李主任主讲，系统介绍中医养生的核心理念和实用方法。',
    isFeatured: true,
    isHot: true,
    status: 'online',
    sortOrder: 1,
    viewCount: 3456,
    clickCount: 892,
  },
  {
    _id: 'course-2',
    title: '八段锦完整教学',
    subtitle: '国家体育总局推荐，养生健身首选',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-1',
    categoryName: '养生健康',
    tags: ['健身', '零基础'],
    instructor: { name: '王教练', bio: '国家级健身气功教练', avatar: '' },
    platform: '小鹅通',
    originalUrl: 'https://xiaozhu.com/course/456',
    promoteCode: 'smz_baduanjin_002',
    commissionRate: 25,
    price: 4900,
    priceNow: 1990,
    studentCount: 8923,
    rating: 4.9,
    suitableFor: '中老年人群',
    description: '八段锦是我国传统的健身气功，动作舒缓，适合各年龄段学习。',
    isFeatured: true,
    isHot: true,
    status: 'online',
    sortOrder: 2,
    viewCount: 2891,
    clickCount: 756,
  },
  {
    _id: 'course-3',
    title: '零基础学书法',
    subtitle: '从握笔到创作，书法入门全攻略',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-2',
    categoryName: '兴趣爱好',
    tags: ['书法', '传统文化'],
    instructor: { name: '张书法', bio: '书法协会会员，20年书法教学经验', avatar: '' },
    platform: '荔枝微课',
    originalUrl: 'https://www.lizhiweike.com/course/789',
    promoteCode: 'smz_shufa_003',
    commissionRate: 30,
    price: 8900,
    priceNow: 3990,
    discountText: '新课上架优惠',
    studentCount: 5621,
    rating: 4.7,
    suitableFor: '书法爱好者',
    description: '书法是中华传统文化的瑰宝，本课程专为初学者设计。',
    isFeatured: true,
    isHot: false,
    status: 'online',
    sortOrder: 3,
    viewCount: 1892,
    clickCount: 445,
  },
  {
    _id: 'course-4',
    title: '广场舞入门教程',
    subtitle: '简单易学，每天跳一跳，健康又快乐',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-2',
    categoryName: '兴趣爱好',
    tags: ['舞蹈', '健身'],
    instructor: { name: '舞蹈老师王芳', bio: '专业广场舞教练', avatar: '' },
    platform: '腾讯课堂',
    originalUrl: 'https://ke.qq.com/course/101',
    promoteCode: 'smz_guangchang_004',
    commissionRate: 35,
    price: 0,
    priceNow: 0,
    discountText: '免费',
    studentCount: 25680,
    rating: 4.6,
    suitableFor: '中老年朋友',
    description: '广场舞是最受中老年人喜爱的健身活动之一。',
    isFeatured: false,
    isHot: true,
    status: 'online',
    sortOrder: 4,
    viewCount: 5678,
    clickCount: 1234,
  },
  {
    _id: 'course-5',
    title: '智能手机使用全攻略',
    subtitle: '专为中老年人设计的手机教程',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-3',
    categoryName: '手机技巧',
    tags: ['中老年适用', '零基础'],
    instructor: { name: '小李老师', bio: '老年大学特邀讲师', avatar: '' },
    platform: '喜马拉雅',
    originalUrl: 'https://www.ximalaya.com/album/202',
    promoteCode: 'smz_shouji_005',
    commissionRate: 30,
    price: 3900,
    priceNow: 990,
    studentCount: 18923,
    rating: 4.9,
    suitableFor: '50岁以上中老年人',
    description: '智能手机已经成为生活中必不可少的工具，本课程用最通俗易懂的语言教你使用。',
    isFeatured: true,
    isHot: true,
    status: 'online',
    sortOrder: 5,
    viewCount: 8923,
    clickCount: 2341,
  },
  {
    _id: 'course-6',
    title: '中老年人防诈骗指南',
    subtitle: '提高警惕，远离骗局，守护好自己的钱袋子',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-4',
    categoryName: '防诈骗',
    tags: ['安全', '必学'],
    instructor: { name: '公安民警张队', bio: '反诈中心资深民警', avatar: '' },
    platform: '小鹅通',
    originalUrl: 'https://xiaozhu.com/course/404',
    promoteCode: 'smz_fangzha_007',
    commissionRate: 40,
    price: 0,
    priceNow: 0,
    discountText: '免费公益课',
    studentCount: 35689,
    rating: 4.9,
    suitableFor: '所有中老年人',
    description: '电信网络诈骗层出不穷，本课程由一线反诈民警主讲，帮助大家提高防骗意识。',
    isFeatured: true,
    isHot: true,
    status: 'online',
    sortOrder: 7,
    viewCount: 12345,
    clickCount: 3456,
  },
  {
    _id: 'course-7',
    title: '家常菜烹饪技巧',
    subtitle: '学会这些技巧，让你的家常菜更美味',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-5',
    categoryName: '厨艺美食',
    tags: ['烹饪', '实用'],
    instructor: { name: '美食达人老刘', bio: '知名美食博主', avatar: '' },
    platform: '荔枝微课',
    originalUrl: 'https://www.lizhiweike.com/course/505',
    promoteCode: 'smz_chuyi_008',
    commissionRate: 30,
    price: 4900,
    priceNow: 1990,
    studentCount: 6789,
    rating: 4.8,
    suitableFor: '烹饪爱好者',
    description: '好吃的家常菜，是家的味道。本课程分享实用的烹饪技巧。',
    isFeatured: false,
    isHot: true,
    status: 'online',
    sortOrder: 8,
    viewCount: 3456,
    clickCount: 789,
  },
  {
    _id: 'course-8',
    title: '手机摄影从入门到精通',
    subtitle: '用手机也能拍出好照片',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-6',
    categoryName: '摄影摄像',
    tags: ['摄影', '实用技巧'],
    instructor: { name: '摄影师范', bio: '资深摄影师', avatar: '' },
    platform: '得到',
    originalUrl: 'https://www.dedao.cn/course/303',
    promoteCode: 'smz_sheying_006',
    commissionRate: 25,
    price: 6900,
    priceNow: 1990,
    studentCount: 4521,
    rating: 4.7,
    suitableFor: '摄影爱好者',
    description: '现在手机拍照功能越来越强大，本课程教你用手机拍出专业级照片。',
    isFeatured: false,
    isHot: false,
    status: 'online',
    sortOrder: 6,
    viewCount: 2345,
    clickCount: 567,
  },
  {
    _id: 'course-9',
    title: '短视频剪辑入门',
    subtitle: '用手机也能做短视频，记录美好生活',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-7',
    categoryName: '职场技能',
    tags: ['短视频', '副业技能'],
    instructor: { name: '新媒体讲师陈老师', bio: '10年新媒体从业经验', avatar: '' },
    platform: '混沌大学',
    originalUrl: 'https://www.hundun.com/course/606',
    promoteCode: 'smz_duanshipin_009',
    commissionRate: 35,
    price: 12900,
    priceNow: 4990,
    studentCount: 4521,
    rating: 4.6,
    suitableFor: '有学习意愿的人群',
    description: '短视频已经深入我们生活的方方面面，学会剪辑，记录美好生活。',
    isFeatured: false,
    isHot: false,
    status: 'online',
    sortOrder: 9,
    viewCount: 2345,
    clickCount: 456,
  },
  {
    _id: 'course-10',
    title: '《论语》智慧解读',
    subtitle: '品味经典，启迪人生智慧',
    cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 'cat-8',
    categoryName: '经典阅读',
    tags: ['国学', '传统文化'],
    instructor: { name: '国学教授周老师', bio: '知名国学学者', avatar: '' },
    platform: '得到',
    originalUrl: 'https://www.dedao.cn/course/707',
    promoteCode: 'smz_lunyu_010',
    commissionRate: 30,
    price: 8900,
    priceNow: 2990,
    studentCount: 3214,
    rating: 4.8,
    suitableFor: '传统文化爱好者',
    description: '《论语》是中华文化的瑰宝，其中蕴含的人生智慧至今仍发人深省。',
    isFeatured: false,
    isHot: false,
    status: 'online',
    sortOrder: 10,
    viewCount: 1890,
    clickCount: 345,
  },
]

// ========== 课程数据持久化 ==========
function loadCoursesFromStorage() {
  try {
    const stored = uni.getStorageSync(MOCK_COURSES_KEY)
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored
    }
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(MOCK_COURSES_DEFAULT))
}

function saveCoursesToStorage(data) {
  try {
    uni.setStorageSync(MOCK_COURSES_KEY, data)
  } catch (e) {
    console.error('saveCoursesToStorage error:', e)
  }
}

// 导出课程数据（可读写）
export let mockCourses = loadCoursesFromStorage()

// 外部可通过此方法重置为默认数据
export function resetMockCourses() {
  mockCourses = JSON.parse(JSON.stringify(MOCK_COURSES_DEFAULT))
  saveCoursesToStorage(mockCourses)
}

// 供 course.js 内部调用：更新并保存
export function updateMockCourse(courseId, updateData) {
  const idx = mockCourses.findIndex(c => (c._id || c.id) === courseId)
  if (idx >= 0) {
    mockCourses[idx] = { ...mockCourses[idx], ...updateData, updatedAt: Date.now() }
    saveCoursesToStorage(mockCourses)
    return true
  }
  return false
}

// 供 course.js 内部调用：删除并保存
export function removeMockCourse(courseId) {
  const idx = mockCourses.findIndex(c => (c._id || c.id) === courseId)
  if (idx >= 0) {
    mockCourses.splice(idx, 1)
    saveCoursesToStorage(mockCourses)
    return true
  }
  return false
}

// 供 course.js 内部调用：添加并保存
export function addMockCourse(courseData) {
  const newCourse = {
    _id: 'course-' + Date.now(),
    ...courseData,
    viewCount: 0,
    clickCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  mockCourses.push(newCourse)
  saveCoursesToStorage(mockCourses)
  return newCourse
}

// 模拟浏览历史
export const mockBrowseHistory = [
  { _id: 'browse-1', courseId: 'course-1', courseTitle: '中医养生十二讲', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 30 },
  { _id: 'browse-2', courseId: 'course-5', courseTitle: '智能手机使用全攻略', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
  { _id: 'browse-3', courseId: 'course-6', courseTitle: '中老年人防诈骗指南', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 60 * 24 },
  { _id: 'browse-4', courseId: 'course-4', courseTitle: '广场舞入门教程', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
]

// 模拟收藏
export const mockFavorites = [
  { _id: 'fav-1', courseId: 'course-1', courseTitle: '中医养生十二讲', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 30 },
  { _id: 'fav-2', courseId: 'course-6', courseTitle: '中老年人防诈骗指南', courseCover: 'https://img.yzcdn.cn/vant/cat.jpeg', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
]

// 模拟订单
export const mockOrders = [
  { _id: 'order-1', userId: 'test-001', courseId: 'course-5', courseTitle: '智能手机使用全攻略', orderNo: 'ORD20260416001', orderAmount: 99000, commission: 2970, commissionRate: 30, status: 'settled', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, platform: '喜马拉雅', promoteCode: 'smz_shouji_005' },
  { _id: 'order-2', userId: 'test-001', courseId: 'course-2', courseTitle: '八段锦完整教学', orderNo: 'ORD20260415002', orderAmount: 199000, commission: 4975, commissionRate: 25, status: 'confirmed', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, platform: '小鹅通', promoteCode: 'smz_baduanjin_002' },
  { _id: 'order-3', userId: 'test-001', courseId: 'course-1', courseTitle: '中医养生十二讲', orderNo: 'ORD20260414003', orderAmount: 299000, commission: 8970, commissionRate: 30, status: 'pending', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, platform: '得到', promoteCode: 'smz_yangsheng_001' },
]

// 当前 mock 用户
export const mockUser = {
  id: 'user-test-001',
  openid: 'mock_openid_001',
  nickname: '张三',
  avatar: '',
  role: 'admin',
  fontSize: 'normal',
  interestTags: ['养生健康', '防诈骗'],
  interestWeights: { '养生健康': 8, '防诈骗': 6 },
  promoteCode: 'smz_user_zhangsan',
  totalCommission: 168915,
  withdrawableCommission: 119400,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
}
