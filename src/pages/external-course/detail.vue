<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">🎓</text>
        <text class="brand-name">课程介绍</text>
      </view>
      <view class="glass-nav__home" @tap="goHome">
        <text class="home-icon">🏠</text>
      </view>
    </view>

    <!-- 课程封面 -->
    <view class="course-cover">
      <image class="cover-image" :src="course.cover || getDetailCategoryCover(course.category)" mode="aspectFill" />
      <view class="cover-overlay">
        <view class="category-tag" v-if="course.category">
          <text>{{ course.category }}</text>
        </view>
      </view>
    </view>

    <!-- 课程信息 -->
    <view class="course-content">
      <view class="course-header">
        <view class="title-row">
          <text class="course-title">{{ course.title }}</text>
          <view class="favorite-btn" @tap="toggleFavorite">
            <text>{{ isFavorited ? '❤️' : '🤍' }}</text>
          </view>
        </view>
        <view class="price-row" v-if="course.price > 0">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ course.price }}</text>
        </view>
        <view class="price-row price-row--free" v-else>
          <text class="price-text">免费</text>
        </view>
        <view class="stock-row" v-if="course.stock !== undefined">
          <text class="stock-text">库存: {{ course.stock }}</text>
        </view>
      </view>

      <!-- 课程介绍 -->
      <view class="section" v-if="course.description">
        <view class="section__title">
          <text class="section-icon">📖</text>
          <text>课程介绍</text>
        </view>
        <view class="section__body">
          <text class="description-text">{{ course.description }}</text>
        </view>
      </view>

      <!-- 按钮区域 -->
      <view class="action-area">
        <!-- 已购买或免费课程 -->
        <view class="action-btn action-btn--learn" v-if="isPurchased || course.price == 0" @tap="goToLearn">
          <text class="action-icon">🚀</text>
          <text class="action-text">开始学习</text>
        </view>
        <!-- 未购买 -->
        <view class="action-btn" v-else @tap="handleBuy">
          <text class="action-icon">💳</text>
          <text class="action-text">立即购买</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-if="!loading && !course.id">
      <text class="error-icon">😢</text>
      <text class="error-text">课程不存在</text>
      <view class="error-btn" @tap="goBack">
        <text>返回</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getExternalCourseDetail } from '@/utils/external-course.js'
import { getCurrentUser } from '@/utils/user.js'
import { checkCoursePurchased, purchaseCourse } from '@/utils/course.js'
import { getFavorites, addFavorite, removeFavoriteByCourse } from '@/utils/favorite.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)
const loading = ref(true)
const course = ref({})
const isPurchased = ref(false)
const courseLink = ref('')

// 收藏功能
const isFavorited = ref(false)
const favoriteId = ref(null)

// 分类默认封面图（本地图片）
const categoryCovers = {
  '公民素养': '/static/covers/2-culture.jpg',
  '时代前沿': '/static/covers/6-tech.jpg',
  '时事思政': '/static/covers/8-business.jpg',
  '隔代教育': '/static/covers/7-edu.jpg',
  '哲学': '/static/covers/2-culture.jpg',
  '文学': '/static/covers/2-culture.jpg',
  '数字素养': '/static/covers/6-tech.jpg',
  '摄影': '/static/covers/1-healthcare.jpg',
  '表演': '/static/covers/3-drama.jpg',
  '社会科学': '/static/covers/9-learning.jpg',
  '自然科学': '/static/covers/11-elderly.jpg',
  '农学': '/static/covers/12-cooking.jpg',
  '语言': '/static/covers/9-learning.jpg',
  '数学': '/static/covers/9-learning.jpg',
  '学历教育': '/static/covers/7-edu.jpg',
  '论文写作': '/static/covers/9-learning.jpg',
  '医学': '/static/covers/1-healthcare.jpg',
  '家庭照护': '/static/covers/1-healthcare.jpg',
  '中医保健': '/static/covers/1-healthcare.jpg',
  '用药安全': '/static/covers/1-healthcare.jpg',
  '食品营养': '/static/covers/12-cooking.jpg',
  '心理健康': '/static/covers/1-healthcare.jpg',
  '运动健康': '/static/covers/1-healthcare.jpg',
  '慢病管理': '/static/covers/1-healthcare.jpg',
  '口腔健康': '/static/covers/1-healthcare.jpg',
  '生命教育': '/static/covers/1-healthcare.jpg',
  '老年痴呆防治': '/static/covers/1-healthcare.jpg',
  '舞蹈': '/static/covers/5-music.jpg',
  '声乐': '/static/covers/5-music.jpg',
  '器乐': '/static/covers/5-music.jpg',
  '书法': '/static/covers/4-calligraphy.jpg',
  '绘画': '/static/covers/4-calligraphy.jpg',
  '模特': '/static/covers/5-music.jpg',
  '戏剧': '/static/covers/3-drama.jpg',
  '手工': '/static/covers/12-cooking.jpg',
  '生活休闲': '/static/covers/10-chess.jpg',
  '历史地理': '/static/covers/2-culture.jpg',
  '文化': '/static/covers/2-culture.jpg',
  '退休生涯规划': '/static/covers/7-edu.jpg',
  '投资理财': '/static/covers/8-business.jpg',
  '志愿服务': '/static/covers/7-edu.jpg',
  '创新创业': '/static/covers/8-business.jpg',
  '农业养殖': '/static/covers/12-cooking.jpg',
  '职业技能': '/static/covers/6-tech.jpg',
}

const getDetailCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || '/static/covers/7-edu.jpg'
}

// 获取课程ID
const getCourseId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  return options.id || ''
}

// 加载课程详情
const loadCourse = async () => {
  const id = getCourseId()
  if (!id) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await getExternalCourseDetail(parseInt(id))
    if (res.ok && res.data) {
      course.value = res.data
      // 检查是否已购买
      await checkPurchaseStatus()
      // 加载收藏状态
      await loadFavoriteStatus()
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  } finally {
    loading.value = false
  }
}

// 检查购买状态
const checkPurchaseStatus = async () => {
  const user = getCurrentUser()
  if (!user?.id) return

  try {
    const res = await checkCoursePurchased(user.id, course.value.id)
    if (res.ok) {
      isPurchased.value = res.purchased
      courseLink.value = res.course_link || ''
    }
  } catch (error) {
    console.error('检查购买状态失败:', error)
  }
}

// 加载收藏状态
const loadFavoriteStatus = async () => {
  const user = getCurrentUser()
  if (!user?.id || !course.value.id) return

  try {
    const res = await getFavorites(user.id)
    if (res.ok) {
      const favorite = res.list.find(item =>
        item.course_id === course.value.id && item.is_external === true
      )
      if (favorite) {
        isFavorited.value = true
        favoriteId.value = favorite.id
      }
    }
  } catch (e) {
    console.error('加载收藏状态失败:', e)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  const user = getCurrentUser()
  if (!user?.id) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/auth/login' }), 1000)
    return
  }

  if (isFavorited.value) {
    // 取消收藏
    const res = await removeFavoriteByCourse(user.id, course.value.id, true)
    if (res.ok) {
      isFavorited.value = false
      favoriteId.value = null
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    }
  } else {
    // 添加收藏
    const res = await addFavorite(user.id, course.value.id, true)
    if (res.ok) {
      isFavorited.value = true
      favoriteId.value = res.id
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  }
}

// 处理购买
const handleBuy = async () => {
  const user = getCurrentUser()
  if (!user?.id) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 1000)
    return
  }

  if (course.value.stock < 1) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认购买',
    content: `是否购买《${course.value.title}》？\n价格：¥${course.value.price}`,
    confirmText: '立即购买',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '购买中...' })
        try {
          const result = await purchaseCourse(course.value.id, user.id)
          uni.hideLoading()
          if (result.ok) {
            uni.showToast({ title: '购买成功', icon: 'success' })
            isPurchased.value = true
            courseLink.value = course.value.link
            // 更新库存显示
            course.value.stock = Math.max(0, (course.value.stock || 1) - 1)
          } else {
            uni.showToast({ title: result.message || '购买失败', icon: 'none' })
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({ title: '购买失败', icon: 'none' })
          console.error('购买失败:', error)
        }
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

// 跳转到学习页面
const goToLearn = () => {
  const link = courseLink.value || course.value.link
  if (!link) {
    uni.showToast({ title: '暂无学习链接', icon: 'none' })
    return
  }

  // #ifdef H5
  window.open(link, '_blank')
  // #endif
  // #ifndef H5
  plus.runtime.openURL(link)
  // #endif
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourse()
})

// 每次进入页面时刷新收藏状态
onShow(() => {
  if (course.value.id) {
    loadFavoriteStatus()
  }
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 - 专业课程平台风格 ==========
$primary: #2563EB;
$primary-light: #3B82F6;
$primary-dark: #1D4ED8;
$secondary: #10B981;
$accent: #F59E0B;
$text-primary: #1E293B;
$text-secondary: #64748B;
$text-muted: #94A3B8;
$bg-light: #F8FAFC;
$bg-card: #FFFFFF;

.page {
  min-height: 100vh;
  background: $bg-light;
}

.glass-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: auto; min-height: 88rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid #E2E8F0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 64rpx; height: 64rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #E2E8F0;

  &:active {
    background: rgba(37, 99, 235, 0.1);
    transform: scale(0.9);
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
    line-height: 1;
  }
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.brand-emoji {
  font-size: 36rpx;
}

.brand-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.glass-nav__home {
  width: 64rpx; height: 64rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #E2E8F0;

  &:active {
    background: rgba(37, 99, 235, 0.1);
    transform: scale(0.9);
  }

  .home-icon {
    font-size: 32rpx;
  }
}

.course-cover {
  width: 100%;
  height: 500rpx;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  padding-top: calc(24rpx + var(--status-bar-height, 0px) + 88rpx);
}

.category-tag {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

.course-content {
  padding: 32rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.course-header {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
}

.course-title {
  flex: 1;
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
  display: block;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.favorite-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 50%;
  font-size: 36rpx;
  flex-shrink: 0;

  &:active {
    transform: scale(0.9);
    background: rgba(37, 99, 235, 0.15);
  }
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: $primary;
  font-weight: 600;
  margin-right: 4rpx;
}

.price-value {
  font-size: 48rpx;
  color: $primary;
  font-weight: 700;
}

.price-row--free {
  .price-text {
    font-size: 36rpx;
    color: $secondary;
    font-weight: 700;
  }
}

.stock-row {
  margin-top: 8rpx;
}

.stock-text {
  font-size: 24rpx;
  color: $text-muted;
}

.section {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
}

.section__title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-icon {
  font-size: 36rpx;
}

.section__body {
  padding: 0 8rpx;
}

.description-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.8;
}

.action-area {
  margin-top: 40rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 100rpx;
  background: $primary;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.35);

  &:active {
    transform: scale(0.98);
  }

  &--learn {
    background: $secondary;
    box-shadow: 0 8rpx 32rpx rgba(16, 185, 129, 0.35);
  }
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  font-size: 28rpx;
  color: $text-muted;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.error-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.error-text {
  font-size: 28rpx;
  color: $text-muted;
  margin-bottom: 32rpx;
}

.error-btn {
  padding: 20rpx 48rpx;
  background: $primary;
  border-radius: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
  }
}
</style>
