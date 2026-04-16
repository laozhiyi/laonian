/**
 * 示例数据初始化脚本
 *
 * 使用方法：
 * 1. 在 uniCloud 控制台中创建云函数 seed-data
 * 2. 将本文件内容复制到云函数入口文件中
 * 3. 运行云函数即可初始化示例数据
 *
 * 注意：运行前请确保已在数据库中创建以下集合：
 * - categories
 * - courses
 * - users (可选)
 */

'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database()
  const now = Date.now()

  // ============ 1. 初始化分类数据 ============
  const categories = [
    { name: '养生健康', icon: '🏃', sortOrder: 1, status: 'active', createdAt: now },
    { name: '兴趣爱好', icon: '🎨', sortOrder: 2, status: 'active', createdAt: now },
    { name: '手机技巧', icon: '📱', sortOrder: 3, status: 'active', createdAt: now },
    { name: '防诈骗', icon: '🛡️', sortOrder: 4, status: 'active', createdAt: now },
    { name: '厨艺美食', icon: '🍳', sortOrder: 5, status: 'active', createdAt: now },
    { name: '摄影摄像', icon: '📸', sortOrder: 6, status: 'active', createdAt: now },
    { name: '职场技能', icon: '💼', sortOrder: 7, status: 'active', createdAt: now },
    { name: '经典阅读', icon: '📚', sortOrder: 8, status: 'active', createdAt: now },
    { name: '音乐舞蹈', icon: '🎵', sortOrder: 9, status: 'active', createdAt: now },
    { name: '金融理财', icon: '💰', sortOrder: 10, status: 'active', createdAt: now }
  ]

  // 清空并插入分类
  await db.collection('categories').remove({})
  const catResult = await db.collection('categories').add(categories)

  // 获取插入的分类ID
  const catIds = catResult.id || []
  const catMap = {}
  categories.forEach((cat, index) => {
    if (catIds[index]) {
      catMap[cat.name] = catIds[index]
    }
  })

  // ============ 2. 初始化课程数据 ============
  const courses = [
    // 养生健康
    {
      title: '中医养生十二讲',
      subtitle: '跟着老中医学养生，调理身体从我做起',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['养生健康'],
      categoryName: '养生健康',
      tags: ['中老年人适用', '零基础'],
      instructor: { name: '李中医', bio: '三甲医院主任中医师，从医40年' },
      platform: '得到',
      originalUrl: 'https://www.dedao.cn/course/123',
      promoteCode: 'smz_yangsheng_001',
      promoteUrl: 'https://www.dedao.cn/course/123?from=smz_learning&promo=smz_yangsheng_001',
      commissionRate: 30,
      price: 9900,
      priceNow: 2990,
      discountText: '限时7折',
      studentCount: 12580,
      rating: 4.8,
      ratingCount: 2341,
      suitableFor: '50岁以上中老年人',
      description: '本课程由三甲医院资深中医师李主任主讲，系统介绍中医养生的核心理念和实用方法。\n\n课程亮点：\n1. 通俗易懂，适合中老年人学习\n2. 实用性强，可以直接应用到日常生活中\n3. 内容全面，覆盖饮食、运动、情志等多个方面\n\n通过本课程，你将学会：\n• 如何根据自身体质选择合适的养生方法\n• 常见慢性病的调理技巧\n• 四季养生的要点\n• 简单的自我按摩手法',
      outline: ['中医基础理论', '体质辨识', '饮食养生', '运动养生', '情志养生', '睡眠养生', '四季养生', '常见病调理', '经络穴位', '自我按摩', '养生误区', '实操练习'],
      isFeatured: true,
      isHot: true,
      status: 'online',
      sortOrder: 1,
      viewCount: 3456,
      clickCount: 892,
      createdAt: now,
      updatedAt: now
    },
    {
      title: '八段锦完整教学',
      subtitle: '国家体育总局推荐，养生健身首选',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['养生健康'],
      categoryName: '养生健康',
      tags: ['健身', '零基础'],
      instructor: { name: '王教练', bio: '国家级健身气功教练' },
      platform: '小鹅通',
      originalUrl: 'https://xiaozhu.com/course/456',
      promoteCode: 'smz_baduanjin_002',
      promoteUrl: 'https://xiaozhu.com/course/456?from=smz_learning&promo=smz_baduanjin_002',
      commissionRate: 25,
      price: 4900,
      priceNow: 1990,
      studentCount: 8923,
      rating: 4.9,
      ratingCount: 1823,
      suitableFor: '中老年人群',
      description: '八段锦是我国传统的健身气功，动作舒缓，适合各年龄段学习。\n\n本课程由国家级教练亲自示范，动作标准规范，讲解清晰详细。',
      outline: ['八段锦简介', '预备式', '双手托天理三焦', '左右开弓似射雕', '调理脾胃须单举', '五劳七伤往后瞧', '摇头摆尾去心火', '双手攀足固肾腰', '攥拳怒目增气力', '背后七颠百病消', '收势', '练习要点总结'],
      isFeatured: true,
      isHot: true,
      status: 'online',
      sortOrder: 2,
      viewCount: 2891,
      clickCount: 756,
      createdAt: now,
      updatedAt: now
    },
    // 兴趣爱好
    {
      title: '零基础学书法',
      subtitle: '从握笔到创作，书法入门全攻略',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['兴趣爱好'],
      categoryName: '兴趣爱好',
      tags: ['书法', '传统文化'],
      instructor: { name: '张书法', bio: '书法协会会员，20年书法教学经验' },
      platform: '荔枝微课',
      originalUrl: 'https://www.lizhiweike.com/course/789',
      promoteCode: 'smz_shufa_003',
      promoteUrl: 'https://www.lizhiweike.com/course/789?from=smz_learning&promo=smz_shufa_003',
      commissionRate: 30,
      price: 8900,
      priceNow: 3990,
      discountText: '新课上架优惠',
      studentCount: 5621,
      rating: 4.7,
      ratingCount: 982,
      suitableFor: '书法爱好者',
      description: '书法是中华传统文化的瑰宝，本课程专为初学者设计，从最基础的执笔、运笔讲起。\n\n课程特色：\n• 讲解详细，适合零基础\n• 配有示范视频和练习指导\n• 循序渐进，稳步提升',
      outline: ['书法工具选择', '正确的执笔姿势', '基本笔画练习', '楷书入门', '简单字的结构', '经典碑帖欣赏', '创作基础'],
      isFeatured: true,
      isHot: false,
      status: 'online',
      sortOrder: 3,
      viewCount: 1892,
      clickCount: 445,
      createdAt: now,
      updatedAt: now
    },
    {
      title: '广场舞入门教程',
      subtitle: '简单易学，每天跳一跳，健康又快乐',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['兴趣爱好'],
      categoryName: '兴趣爱好',
      tags: ['舞蹈', '健身'],
      instructor: { name: '舞蹈老师王芳', bio: '专业广场舞教练' },
      platform: '腾讯课堂',
      originalUrl: 'https://ke.qq.com/course/101',
      promoteCode: 'smz_guangchang_004',
      promoteUrl: 'https://ke.qq.com/course/101?from=smz_learning&promo=smz_guangchang_004',
      commissionRate: 35,
      price: 0,
      priceNow: 0,
      discountText: '免费',
      studentCount: 25680,
      rating: 4.6,
      ratingCount: 4521,
      suitableFor: '中老年朋友',
      description: '广场舞是最受中老年人喜爱的健身活动之一。\n\n本课程精选简单易学的广场舞曲目，配有详细动作分解，轻松学会。\n\n免费学习，适合初学者！',
      outline: ['热身运动', '基础舞步', '第一支舞《欢乐颂》', '第二支舞《走进新时代》', '第三支舞《最炫民族风》', '放松练习', '日常练习建议'],
      isFeatured: false,
      isHot: true,
      status: 'online',
      sortOrder: 4,
      viewCount: 5678,
      clickCount: 1234,
      createdAt: now,
      updatedAt: now
    },
    // 手机技巧
    {
      title: '智能手机使用全攻略',
      subtitle: '专为中老年人设计的手机教程',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['手机技巧'],
      categoryName: '手机技巧',
      tags: ['中老年适用', '零基础'],
      instructor: { name: '小李老师', bio: '老年大学特邀讲师' },
      platform: '喜马拉雅',
      originalUrl: 'https://www.ximalaya.com/album/202',
      promoteCode: 'smz_shouji_005',
      promoteUrl: 'https://www.ximalaya.com/album/202?from=smz_learning&promo=smz_shouji_005',
      commissionRate: 30,
      price: 3900,
      priceNow: 990,
      studentCount: 18923,
      rating: 4.9,
      ratingCount: 5621,
      suitableFor: '50岁以上中老年人',
      description: '智能手机已经成为生活中必不可少的工具，但很多中老年朋友觉得操作困难。\n\n本课程用最通俗易懂的语言，从最基础讲起，让你轻松掌握智能手机的使用方法。\n\n课程内容：\n• 手机基本操作\n• 微信使用技巧\n• 拍照和发朋友圈\n• 如何在网上挂号\n• 手机支付的简单使用\n• 安全使用手机',
      outline: ['认识你的手机', '开关机和基本操作', '手机屏幕的基本手势', '学会使用微信', '微信视频通话', '用手机拍照', '发朋友圈', '手机支付入门', '网上挂号看病', '手机安全设置', '常见问题解答'],
      isFeatured: true,
      isHot: true,
      status: 'online',
      sortOrder: 5,
      viewCount: 8923,
      clickCount: 2341,
      createdAt: now,
      updatedAt: now
    },
    {
      title: '手机摄影从入门到精通',
      subtitle: '用手机也能拍出好照片',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['摄影摄像'],
      categoryName: '摄影摄像',
      tags: ['摄影', '实用技巧'],
      instructor: { name: '摄影师范', bio: '资深摄影师' },
      platform: '得到',
      originalUrl: 'https://www.dedao.cn/course/303',
      promoteCode: 'smz_sheying_006',
      promoteUrl: 'https://www.dedao.cn/course/303?from=smz_learning&promo=smz_sheying_006',
      commissionRate: 25,
      price: 6900,
      priceNow: 1990,
      studentCount: 4521,
      rating: 4.7,
      ratingCount: 892,
      suitableFor: '摄影爱好者',
      description: '现在手机拍照功能越来越强大，本课程教你用手机拍出专业级照片。',
      outline: ['手机摄影优势', '基础构图法则', '光线运用', '人像拍摄技巧', '风景拍摄', '美食拍摄', '后期处理入门', '作品欣赏与分析'],
      isFeatured: false,
      isHot: false,
      status: 'online',
      sortOrder: 6,
      viewCount: 2345,
      clickCount: 567,
      createdAt: now,
      updatedAt: now
    },
    // 防诈骗
    {
      title: '中老年人防诈骗指南',
      subtitle: '提高警惕，远离骗局，守护好自己的钱袋子',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['防诈骗'],
      categoryName: '防诈骗',
      tags: ['安全', '必学'],
      instructor: { name: '公安民警张队', bio: '反诈中心资深民警' },
      platform: '小鹅通',
      originalUrl: 'https://xiaozhu.com/course/404',
      promoteCode: 'smz_fangzha_007',
      promoteUrl: 'https://xiaozhu.com/course/404?from=smz_learning&promo=smz_fangzha_007',
      commissionRate: 40,
      price: 0,
      priceNow: 0,
      discountText: '免费公益课',
      studentCount: 35689,
      rating: 4.9,
      ratingCount: 8923,
      suitableFor: '所有中老年人',
      description: '电信网络诈骗层出不穷，中老年人由于防范意识相对薄弱，成为诈骗分子的重点目标。\n\n本课程由一线反诈民警主讲，通过真实案例分析，帮助大家提高防骗意识。\n\n课程亮点：\n• 真实案例分析\n• 实用的防范技巧\n• 遇到诈骗怎么办\n• 免费学习，守护全家',
      outline: ['当前诈骗形势分析', '常见诈骗类型盘点', '保健品骗局揭秘', '电信诈骗防范技巧', '投资理财骗局识别', '冒充公检法诈骗', '中奖诈骗防范', '遇到诈骗后的正确处理方式', '全民防诈行动'],
      isFeatured: true,
      isHot: true,
      status: 'online',
      sortOrder: 7,
      viewCount: 12345,
      clickCount: 3456,
      createdAt: now,
      updatedAt: now
    },
    // 厨艺美食
    {
      title: '家常菜烹饪技巧',
      subtitle: '学会这些技巧，让你的家常菜更美味',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['厨艺美食'],
      categoryName: '厨艺美食',
      tags: ['烹饪', '实用'],
      instructor: { name: '美食达人老刘', bio: '知名美食博主' },
      platform: '荔枝微课',
      originalUrl: 'https://www.lizhiweike.com/course/505',
      promoteCode: 'smz_chuyi_008',
      promoteUrl: 'https://www.lizhiweike.com/course/505?from=smz_learning&promo=smz_chuyi_008',
      commissionRate: 30,
      price: 4900,
      priceNow: 1990,
      studentCount: 6789,
      rating: 4.8,
      ratingCount: 1234,
      suitableFor: '烹饪爱好者',
      description: '好吃的家常菜，是家的味道。\n\n本课程分享实用的烹饪技巧，让你的厨艺更上一层楼。',
      outline: ['刀工基础', '火候控制', '调料使用', '家常豆腐做法', '红烧肉秘诀', '清蒸鱼技巧', '汤品制作', '凉菜调制'],
      isFeatured: false,
      isHot: true,
      status: 'online',
      sortOrder: 8,
      viewCount: 3456,
      clickCount: 789,
      createdAt: now,
      updatedAt: now
    },
    // 职场技能
    {
      title: '短视频剪辑入门',
      subtitle: '用手机也能做短视频，记录美好生活',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['职场技能'],
      categoryName: '职场技能',
      tags: ['短视频', '副业技能'],
      instructor: { name: '新媒体讲师陈老师', bio: '10年新媒体从业经验' },
      platform: '混沌大学',
      originalUrl: 'https://www.hundun.com/course/606',
      promoteCode: 'smz_duanshipin_009',
      promoteUrl: 'https://www.hundun.com/course/606?from=smz_learning&promo=smz_duanshipin_009',
      commissionRate: 35,
      price: 12900,
      priceNow: 4990,
      studentCount: 4521,
      rating: 4.6,
      ratingCount: 789,
      suitableFor: '有学习意愿的人群',
      description: '短视频已经深入我们生活的方方面面，学会剪辑，记录美好生活。',
      outline: ['短视频发展趋势', '剪辑软件选择', '剪辑基础操作', '添加字幕技巧', '音乐和音效', '转场特效', '热门视频分析', '实操练习'],
      isFeatured: false,
      isHot: false,
      status: 'online',
      sortOrder: 9,
      viewCount: 2345,
      clickCount: 456,
      createdAt: now,
      updatedAt: now
    },
    // 经典阅读
    {
      title: '《论语》智慧解读',
      subtitle: '品味经典，启迪人生智慧',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['经典阅读'],
      categoryName: '经典阅读',
      tags: ['国学', '传统文化'],
      instructor: { name: '国学教授周老师', bio: '知名国学学者' },
      platform: '得到',
      originalUrl: 'https://www.dedao.cn/course/707',
      promoteCode: 'smz_lunyu_010',
      promoteUrl: 'https://www.dedao.cn/course/707?from=smz_learning&promo=smz_lunyu_010',
      commissionRate: 30,
      price: 8900,
      priceNow: 2990,
      studentCount: 3214,
      rating: 4.8,
      ratingCount: 678,
      suitableFor: '传统文化爱好者',
      description: '《论语》是中华文化的瑰宝，其中蕴含的人生智慧至今仍发人深省。\n\n本课程由知名国学教授讲解，带你深入理解《论语》的精髓。',
      outline: ['论语概述', '学而时习之', '孝悌之道', '为人处世', '交友之道', '修身养性', '从政智慧', '人生感悟'],
      isFeatured: false,
      isHot: false,
      status: 'online',
      sortOrder: 10,
      viewCount: 1890,
      clickCount: 345,
      createdAt: now,
      updatedAt: now
    },
    // 待上架课程示例
    {
      title: '太极拳24式教学（即将上线）',
      subtitle: '国家规范太极拳，健身养生首选',
      cover: 'https://img.yzcdn.cn/vant/cat.jpeg',
      categoryId: catMap['养生健康'],
      categoryName: '养生健康',
      tags: ['太极', '养生'],
      instructor: { name: '太极传人陈大师', bio: '陈式太极拳传人' },
      platform: '小鹅通',
      originalUrl: 'https://xiaozhu.com/course/808',
      promoteCode: 'smz_taiji_011',
      promoteUrl: 'https://xiaozhu.com/course/808?from=smz_learning&promo=smz_taiji_011',
      commissionRate: 30,
      price: 7900,
      priceNow: 3990,
      studentCount: 0,
      rating: 0,
      ratingCount: 0,
      suitableFor: '太极爱好者',
      description: '太极拳是中华民族的传统武术，兼具健身养生功能。\n\n本课程教授国家规范的24式太极拳，动作标准规范。',
      outline: ['太极拳简介', '基本功练习', '24式动作详解（分三部分）', '练习要点', '常见错误纠正'],
      isFeatured: false,
      isHot: false,
      status: 'offline',
      sortOrder: 11,
      viewCount: 0,
      clickCount: 0,
      createdAt: now,
      updatedAt: now
    }
  ]

  // 清空并插入课程
  await db.collection('courses').remove({})
  const courseResult = await db.collection('courses').add(courses)

  // ============ 3. 初始化管理员账号 ============
  const adminUser = {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    nickname: '管理员',
    openid: 'admin_default',
    fontSize: 'normal',
    interestTags: [],
    interestWeights: {},
    totalCommission: 0,
    withdrawableCommission: 0,
    createdAt: now,
    lastActiveAt: now
  }

  // 检查是否已存在管理员
  const adminCheck = await db.collection('users').where({ role: 'admin' }).get()
  if (!adminCheck.data || adminCheck.data.length === 0) {
    await db.collection('users').add(adminUser)
  }

  // ============ 返回结果 ============
  return {
    success: true,
    message: '示例数据初始化成功',
    data: {
      categoriesCount: categories.length,
      coursesCount: courses.length,
      adminCreated: adminCheck.data && adminCheck.data.length === 0
    }
  }
}
