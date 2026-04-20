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
// ========== 新中式水墨风格设计规范 ==========
// 色彩系统 - 融合传统水墨与现代简约
$primary: #4A6FA5;           // 藏蓝色 - 书法绘画
$primary-light: #6B8BB8;    // 浅藏蓝
$secondary: #7BA05B;         // 松石绿 - 音乐类
$accent: #D4915C;            // 赭石色 - 文史语言
$accent-warm: #C4785C;       // 暖赭色
$text-primary: #2C3E50;      // 墨色
$text-secondary: #5D6D7E;    // 淡墨色
$text-muted: #95A5A6;        // 浅墨色
$bg-light: #FAF8F5;          // 宣纸白
$bg-card: #FFFFFF;          // 卡片白
$ink-red: #C94043;          // 梅花红
$ink-brown: #8B7355;         // 棕褐色

// 水墨渐变色
$ink-gradient: linear-gradient(180deg, #E8E4DD 0%, #FAF8F5 100%);
$mist-gradient: linear-gradient(180deg, rgba(139, 115, 85, 0.05) 0%, rgba(139, 115, 85, 0.02) 100%);

@mixin ink-border {
  border: 1px solid rgba(139, 115, 85, 0.15);
  box-shadow: 0 4rpx 20rpx rgba(139, 115, 85, 0.08);
}

@mixin plum-blossom-decoration {
  position: relative;
  &::before {
    content: '❀';
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    font-size: 24rpx;
    color: $ink-red;
    opacity: 0.6;
  }
}

@mixin ink-brush-stroke {
  background: linear-gradient(135deg, rgba(74, 111, 165, 0.08) 0%, rgba(74, 111, 165, 0.02) 100%);
  border-left: 4rpx solid $primary;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

@keyframes mist-float {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 0.5; transform: translateX(10rpx); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* ========== 背景装饰 - 水墨山水意境 ========== */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  
  // 水墨渐变背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $ink-gradient;
    opacity: 0.5;
  }
}

.bg-blob {
  position: absolute;
  opacity: 0.15;
}

// 远山剪影
.bg-blob--1 {
  width: 100%;
  height: 400rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 400"><path fill="%238B7355" opacity="0.3" d="M0,400 L0,300 Q200,200 400,280 Q600,360 720,250 Q840,140 960,220 Q1080,300 1200,200 Q1320,100 1440,180 L1440,400 Z"/></svg>') no-repeat center bottom;
  background-size: cover;
  top: 0;
  filter: blur(2px);
}

// 近景山峦
.bg-blob--2 {
  width: 100%;
  height: 300rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 300"><path fill="%234A6FA5" opacity="0.15" d="M0,300 L0,200 Q300,100 600,180 Q900,260 1200,150 Q1350,80 1440,120 L1440,300 Z"/></svg>') no-repeat center bottom;
  background-size: cover;
  bottom: 0;
  top: auto;
  filter: blur(1px);
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
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include ink-border;
  @include plum-blossom-decoration;
  
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
  color: $text-primary;
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif; // 华文楷体风格
}

.brand-slogan {
  font-size: 22rpx;
  color: $text-muted;
  letter-spacing: 2rpx;
}

/* ========== 滚动区域 ========== */
.scroll {
  position: relative;
  z-index: 1;
}

/* ========== 英雄横幅 - 水墨画风格 ========== */
.hero-banner {
  margin: 0 24rpx 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  position: relative;
  overflow: hidden;
  @include ink-border;
  animation: slideUpFade 0.6s ease-out;
  
  // 水墨山峦装饰
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 80%;
    height: 120rpx;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120"><path fill="%234A6FA5" opacity="0.08" d="M0,120 L0,80 Q100,40 200,70 Q300,100 400,50 L400,120 Z"/></svg>') no-repeat right bottom;
    background-size: contain;
    pointer-events: none;
  }
  
  // 梅花装饰
  &::after {
    content: '✿';
    position: absolute;
    top: 20rpx;
    right: 30rpx;
    font-size: 32rpx;
    color: $ink-red;
    opacity: 0.5;
  }
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
  background: $mist-gradient;
  border: 1rpx solid rgba(74, 111, 165, 0.15);
  border-radius: 30rpx;
  margin-bottom: 24rpx;
}

.hero-badge__dot {
  width: 10rpx;
  height: 10rpx;
  background: $secondary;
  border-radius: 50%;
  animation: float 2s ease-in-out infinite;
}

.hero-badge text {
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;
  letter-spacing: 2rpx;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 6rpx;
  margin-bottom: 16rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 32rpx;
  letter-spacing: 1rpx;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 44rpx;
  background: $bg-card;
  border-radius: 40rpx;
  @include ink-border;
  @include ink-brush-stroke;

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: $primary;
  }

  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.hero-cta__arrow {
  font-weight: 300;
  color: $primary;
}

.hero-visual {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  opacity: 0.3;
}

.hero-shape {
  position: absolute;
  opacity: 0.2;
}

.hero-shape--1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -60rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="%238B7355" opacity="0.3" d="M100,20 L180,180 L20,180 Z"/></svg>') no-repeat center;
  background-size: contain;
  animation: mist-float 6s ease-in-out infinite;
}

.hero-shape--2 {
  width: 120rpx;
  height: 120rpx;
  top: 40rpx;
  right: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%234A6FA5" opacity="0.2"/></svg>') no-repeat center;
  background-size: contain;
  animation: mist-float 8s ease-in-out infinite 1s;
}

.hero-shape--3 {
  width: 80rpx;
  height: 80rpx;
  bottom: -40rpx;
  right: 60rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><path fill="%23C94043" opacity="0.3" d="M30,5 L35,25 L55,30 L35,35 L30,55 L25,35 L5,30 L25,25 Z"/></svg>') no-repeat center;
  background-size: contain;
  animation: float 5s ease-in-out infinite 2s;
}

/* ========== 快速入口 - 圆形图标 ========== */
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
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include ink-border;
  background: $bg-card;
  position: relative;
  
  // 梅花装饰
  &::before {
    content: '❀';
    position: absolute;
    top: -5rpx;
    right: -5rpx;
    font-size: 16rpx;
    color: $ink-red;
    opacity: 0.4;
    transform: rotate(30deg);
  }

  text {
    font-size: 44rpx;
  }
}

.quick-entry__icon--blue {
  border-left: 4rpx solid $primary;
}

.quick-entry__icon--green {
  border-left: 4rpx solid $secondary;
}

.quick-entry__icon--pink {
  border-left: 4rpx solid $ink-red;
}

.quick-entry__icon--gold {
  border-left: 4rpx solid $accent;
}

.quick-entry__text {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

/* ========== 区块通用 - 水墨风格 ========== */
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
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  background: $mist-gradient;
  border: 1rpx solid rgba(74, 111, 165, 0.1);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 500;

  &:active {
    background: rgba(74, 111, 165, 0.08);
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
  border-radius: 16rpx;
  overflow: hidden;
  @include ink-border;
  vertical-align: top;
  position: relative;
  
  // 水墨边框效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rpx;
    background: linear-gradient(90deg, $primary, $secondary, $accent);
    opacity: 0.6;
  }

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
  background: $bg-card;
  border: 1px solid rgba(74, 111, 165, 0.2);
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: $primary;
  @include ink-border;
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
  letter-spacing: 1rpx;
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
  color: $accent-warm;
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
  border-radius: 16rpx;
  overflow: hidden;
  @include ink-border;
  @include ink-brush-stroke;

  &:active {
    transform: scale(0.99);
    opacity: 0.9;
  }
}

.course-item__cover {
  width: 200rpx;
  height: 160rpx;
  flex-shrink: 0;
  position: relative;
  
  // 水墨边框
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4rpx;
    height: 100%;
    background: linear-gradient(180deg, $primary, $secondary);
    opacity: 0.3;
  }
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
  letter-spacing: 1rpx;
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
  color: $accent-warm;
}

.course-item__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.course-item__btn {
  padding: 10rpx 24rpx;
  background: $bg-card;
  border: 1px solid $primary;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;

  text {
    color: $primary;
  }
}

/* ========== 统计数据 - 水墨卡片 ========== */
.stats-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.2s both;
}

.stats-card {
  background: $bg-card;
  border-radius: 20rpx;
  padding: 32rpx;
  @include ink-border;
  position: relative;
  overflow: hidden;
  
  // 梅花装饰
  &::before {
    content: '❀';
    position: absolute;
    top: 10rpx;
    right: 20rpx;
    font-size: 40rpx;
    color: $ink-red;
    opacity: 0.15;
  }
}

.stats-header {
  margin-bottom: 28rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  letter-spacing: 2rpx;
}

.stats-label {
  font-size: 24rpx;
  color: $text-muted;
}

/* ========== 服务保障 - 印章风格 ========== */
.service-section {
  padding: 0 24rpx 32rpx;
  animation: slideUpFade 0.6s ease-out 0.25s both;
}

.service-card {
  background: $bg-card;
  border-radius: 20rpx;
  padding: 32rpx;
  @include ink-border;
}

.service-header {
  margin-bottom: 28rpx;
}

.service-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  background: $mist-gradient;
  border-radius: 16rpx;
  border-left: 3px solid $ink-brown;

  &:active {
    background: rgba(139, 115, 85, 0.08);
  }
}

.service-item__icon {
  width: 56rpx;
  height: 56rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include ink-border;

  text {
    font-size: 28rpx;
  }
}

.service-item__text {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-primary;
}

/* ========== 关于我们 - 水墨风格 ========== */
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
  border-radius: 20rpx;
  @include ink-border;
  @include ink-brush-stroke;

  &:active {
    background: rgba(74, 111, 165, 0.02);
  }
}

.about-icon {
  width: 64rpx;
  height: 64rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include ink-border;
  @include plum-blossom-decoration;

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
  letter-spacing: 2rpx;
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
  background: $bg-card;
  border-radius: 20rpx;
  @include ink-border;
  border-left: 4px solid $primary;

  &:active {
    background: rgba(74, 111, 165, 0.02);
  }
}

.admin-icon {
  width: 80rpx;
  height: 80rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @include ink-border;

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
  letter-spacing: 2rpx;
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
