<template>
  <view class="page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-blob bg-blob--1"></view>
      <view class="bg-blob bg-blob--2"></view>
    </view>

    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-brand">
          <view class="brand-icon">
            <text>📚</text>
          </view>
          <view class="brand-text">
            <text class="brand-name">颐享学堂</text>
            <text class="brand-slogan">专注老年教育</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="scroll" scroll-y>
      <!-- 英雄横幅 -->
      <view class="hero-banner">
        <view class="hero-banner__content">
          <view class="hero-badge">
            <view class="hero-badge__dot"></view>
            <text>精选课程</text>
          </view>
          <text class="hero-title">发现精彩课程</text>
          <text class="hero-subtitle">丰富退休生活，学习新技能</text>
          <view class="hero-cta" @tap="goMall">
            <text>开始探索</text>
            <text class="hero-cta__arrow">→</text>
          </view>
        </view>
        <view class="hero-visual">
          <view class="hero-shape hero-shape--1"></view>
          <view class="hero-shape hero-shape--2"></view>
          <view class="hero-shape hero-shape--3"></view>
        </view>
      </view>

      <!-- 快速入口 -->
      <view class="quick-entry">
        <view class="quick-entry__item" @tap="goMall">
          <view class="quick-entry__icon quick-entry__icon--blue">
            <text>📚</text>
          </view>
          <text class="quick-entry__text">全部课程</text>
        </view>
        <view class="quick-entry__item" @tap="goMyCourses">
          <view class="quick-entry__icon quick-entry__icon--green">
            <text>🎓</text>
          </view>
          <text class="quick-entry__text">我的课程</text>
        </view>
        <view class="quick-entry__item" @tap="goFavorites">
          <view class="quick-entry__icon quick-entry__icon--pink">
            <text>❤️</text>
          </view>
          <text class="quick-entry__text">我的收藏</text>
        </view>
        <view class="quick-entry__item" @tap="goBalance">
          <view class="quick-entry__icon quick-entry__icon--gold">
            <text>💰</text>
          </view>
          <text class="quick-entry__text">余额充值</text>
        </view>
      </view>

      <!-- 平台统计 -->
      <view class="stats-section">
        <view class="stats-card">
          <view class="stats-header">
            <text class="stats-title">平台数据</text>
          </view>
          <view class="stats-grid">
            <view class="stats-item">
              <text class="stats-value">50+</text>
              <text class="stats-label">精选课程</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">1万+</text>
              <text class="stats-label">学员好评</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">10+</text>
              <text class="stats-label">专业讲师</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务保障 -->
      <view class="service-section">
        <view class="service-card">
          <view class="service-header">
            <text class="service-title">服务保障</text>
          </view>
          <view class="service-grid">
            <view class="service-item">
              <view class="service-item__icon">
                <text>📞</text>
              </view>
              <text class="service-item__text">电话客服</text>
            </view>
            <view class="service-item">
              <view class="service-item__icon">
                <text>🛡️</text>
              </view>
              <text class="service-item__text">品质保证</text>
            </view>
            <view class="service-item">
              <view class="service-item__icon">
                <text>💳</text>
              </view>
              <text class="service-item__text">安全支付</text>
            </view>
            <view class="service-item">
              <view class="service-item__icon">
                <text>📖</text>
              </view>
              <text class="service-item__text">终身学习</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关于我们 -->
      <view class="about-section" @tap="onAboutTap">
        <view class="about-card">
          <view class="about-icon">
            <text>ℹ️</text>
          </view>
          <view class="about-content">
            <text class="about-title">关于我们</text>
            <text class="about-desc">了解颐享学堂</text>
          </view>
          <text class="about-arrow">›</text>
        </view>
      </view>

      <!-- 管理员入口 -->
      <view class="admin-section" v-if="isAdmin" @tap="goAdmin">
        <view class="admin-card">
          <view class="admin-icon">
            <text>⚙️</text>
          </view>
          <view class="admin-content">
            <text class="admin-title">课程管理后台</text>
            <text class="admin-desc">管理课程与内容</text>
          </view>
          <text class="admin-arrow">›</text>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUser } from '@/utils/user.js'
import { getCart } from '@/utils/cart.js'
import { getCourses } from '@/utils/course.js'
import { getExternalCourses } from '@/utils/external-course.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)

// ========== 用户信息 ==========
const userInfo = computed(() => getCurrentUser())
const isAdmin = computed(() => userInfo.value?.role === 'admin')

// ========== 分类封面图 ==========
const categoryCovers = {
  '公民素养': '/static/covers/2-culture.jpg',
  '时代前沿': '/static/covers/6-tech.jpg',
  '时事思政': '/static/covers/8-business.jpg',
  '隔代教育': '/static/covers/7-edu.jpg',
  '数字素养': '/static/covers/6-tech.jpg',
  '摄影': '/static/covers/1-healthcare.jpg',
  '表演': '/static/covers/3-drama.jpg',
  '心理健康': '/static/covers/1-healthcare.jpg',
  '运动健康': '/static/covers/1-healthcare.jpg',
  '中医保健': '/static/covers/1-healthcare.jpg',
  '舞蹈': '/static/covers/5-music.jpg',
  '声乐': '/static/covers/5-music.jpg',
  '书法': '/static/covers/4-calligraphy.jpg',
  '绘画': '/static/covers/4-calligraphy.jpg',
}

const getCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || 'https://picsum.photos/400/300'
}

// ========== 课程数据 ==========
const courseList = ref([])
const externalCourses = ref([])

// ========== 精选课程 ==========
const featuredCourses = computed(() => {
  const internal = courseList.value.slice(0, 4).map(c => ({ ...c, _isExternal: false }))
  const external = externalCourses.value.slice(0, 4).map(c => ({ ...c, _isExternal: true }))
  return [...external, ...internal].slice(0, 6)
})

// ========== 热门课程 ==========
const hotCourses = computed(() => {
  const internal = courseList.value.slice(0, 3).map(c => ({ ...c, _isExternal: false }))
  return internal
})

// ========== 加载数据 ==========
const loadData = async () => {
  try {
    const [courseRes, externalRes] = await Promise.all([
      getCourses(),
      getExternalCourses()
    ])
    courseList.value = (courseRes?.list || []).map(item => ({
      ...item,
      id: item._id || item.id
    }))
    externalCourses.value = externalRes?.list || []
  } catch (e) {
    console.error('加载数据失败:', e)
  }
}

// ========== 页面跳转 ==========
const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

const goMyCourses = () => {
  const token = uni.getStorageSync('demo_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 500)
    return
  }
  uni.navigateTo({ url: '/pages/external-course/list' })
}

const goFavorites = () => {
  const token = uni.getStorageSync('demo_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 500)
    return
  }
  uni.navigateTo({ url: '/pages/favorite/favorite' })
}

const goBalance = () => {
  const token = uni.getStorageSync('demo_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 500)
    return
  }
  uni.navigateTo({ url: '/pages/balance/balance' })
}

const goAdmin = () => {
  uni.navigateTo({ url: '/pages/admin/admin' })
}

const goDetail = (course) => {
  if (course._isExternal) {
    uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
  } else {
    uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
  }
}

const onAboutTap = () => {
  uni.showModal({
    title: '关于我们',
    content: '颐享学堂\n\n专为老年朋友打造的学习平台\n\n我们致力于让每一位老年朋友都能轻松享受学习的乐趣，丰富退休生活。\n\n课程涵盖智能手机使用、健康养生、书法绘画、音乐欣赏等多个领域，简单易学，耐心讲解。',
    showCancel: false
  })
}

// ========== 生命周期 ==========
onMounted(async () => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  await loadData()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
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

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* ========== 背景装饰 ========== */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
}

.bg-blob--1 {
  width: 500rpx;
  height: 500rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  top: -200rpx;
  right: -150rpx;
  opacity: 0.6;
}

.bg-blob--2 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $secondary 0%, #34D399 100%);
  top: -100rpx;
  left: -200rpx;
  opacity: 0.4;
}

/* ========== 导航栏 ========== */
.nav-bar {
  position: relative;
  z-index: 10;
  background: transparent;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-icon {
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.2);

  text {
    font-size: 36rpx;
  }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #000000;
  letter-spacing: 2rpx;
}

.brand-slogan {
  font-size: 22rpx;
  color: rgba(0, 0, 0, 0.6);
}

/* ========== 滚动区域 ========== */
.scroll {
  position: relative;
  z-index: 1;
}

/* ========== 英雄横幅 ========== */
.hero-banner {
  margin: 0 24rpx 32rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 50%, #60A5FA 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(37, 99, 235, 0.3);
  animation: slideUpFade 0.6s ease-out;
}

.hero-banner__content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 30rpx;
  margin-bottom: 24rpx;
}

.hero-badge__dot {
  width: 10rpx;
  height: 10rpx;
  background: $secondary;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

.hero-badge text {
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32rpx;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 44rpx;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: $primary;
  }

  &:active {
    transform: scale(0.96);
  }
}

.hero-cta__arrow {
  font-weight: 300;
}

.hero-visual {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.hero-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.hero-shape--1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -60rpx;
  animation: float 6s ease-in-out infinite;
}

.hero-shape--2 {
  width: 120rpx;
  height: 120rpx;
  top: 40rpx;
  right: 0;
  animation: float 8s ease-in-out infinite 1s;
}

.hero-shape--3 {
  width: 80rpx;
  height: 80rpx;
  bottom: -40rpx;
  right: 60rpx;
  animation: float 5s ease-in-out infinite 2s;
}

/* ========== 快速入口 ========== */
.quick-entry {
  display: flex;
  justify-content: space-around;
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.1s both;
}

.quick-entry__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active {
    opacity: 0.8;
  }
}

.quick-entry__icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);

  text {
    font-size: 44rpx;
  }
}

.quick-entry__icon--blue {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.quick-entry__icon--green {
  background: linear-gradient(135deg, $secondary, #34D399);
}

.quick-entry__icon--pink {
  background: linear-gradient(135deg, #EC4899, #F472B6);
}

.quick-entry__icon--gold {
  background: linear-gradient(135deg, $accent, #FBBF24);
}

.quick-entry__text {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

/* ========== 区块通用 ========== */
.section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.15s both;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section__title-wrap {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.section__title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.section__subtitle {
  font-size: 24rpx;
  color: $text-muted;
}

.section__more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 20rpx;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 500;

  &:active {
    background: rgba(37, 99, 235, 0.15);
  }
}

.section__arrow {
  font-size: 28rpx;
  font-weight: 300;
}

/* ========== 横向滚动课程 ========== */
.course-scroll {
  white-space: nowrap;
}

.course-card {
  display: inline-block;
  width: 280rpx;
  margin-right: 20rpx;
  background: $bg-card;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  vertical-align: top;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.course-card__cover {
  position: relative;
  width: 100%;
  height: 160rpx;
}

.course-card__img {
  width: 100%;
  height: 100%;
}

.course-card__badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 14rpx;
  background: $accent;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.course-card__info {
  padding: 20rpx;
}

.course-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.course-card__category {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 12rpx;
}

.course-card__footer {
  display: flex;
  align-items: center;
}

.course-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.course-card__price--free {
  color: $secondary;
  font-size: 26rpx;
}

/* ========== 课程列表 ========== */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-item {
  display: flex;
  background: $bg-card;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &:active {
    transform: scale(0.99);
    opacity: 0.9;
  }
}

.course-item__cover {
  width: 200rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.course-item__info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.course-item__category {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 8rpx;
}

.course-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-item__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.course-item__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.course-item__btn {
  padding: 10rpx 24rpx;
  background: $primary;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;

  text {
    color: #fff;
  }
}

/* ========== 统计数据 ========== */
.stats-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.2s both;
}

.stats-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stats-header {
  margin-bottom: 28rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stats-value {
  font-size: 44rpx;
  font-weight: 700;
  color: $primary;
}

.stats-label {
  font-size: 24rpx;
  color: $text-muted;
}

/* ========== 服务保障 ========== */
.service-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.25s both;
}

.service-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.service-header {
  margin-bottom: 28rpx;
}

.service-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #F8FAFC;
  border-radius: 16rpx;

  &:active {
    background: #F1F5F9;
  }
}

.service-item__icon {
  width: 56rpx;
  height: 56rpx;
  background: $primary;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 28rpx;
  }
}

.service-item__text {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-primary;
}

/* ========== 关于我们 ========== */
.about-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.3s both;
}

.about-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &:active {
    background: #F8FAFC;
  }
}

.about-icon {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 30rpx;
  }
}

.about-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.about-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.about-desc {
  font-size: 24rpx;
  color: $text-muted;
}

.about-arrow {
  font-size: 32rpx;
  color: $text-muted;
  font-weight: 300;
}

/* ========== 管理员入口 ========== */
.admin-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.35s both;
}

.admin-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.02));
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 24rpx;

  &:active {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.04));
  }
}

.admin-icon {
  width: 80rpx;
  height: 80rpx;
  background: $primary;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);

  text {
    font-size: 38rpx;
  }
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.admin-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.admin-desc {
  font-size: 24rpx;
  color: $text-muted;
}

.admin-arrow {
  font-size: 32rpx;
  color: $text-muted;
  font-weight: 300;
}

/* ========== 底部安全区 ========== */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}
</style>
