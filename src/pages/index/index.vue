<template>
  <view class="page">
    <!-- 动态背景 -->
    <view class="ambient-bg">
      <view class="ambient-blob ambient-blob--1"></view>
      <view class="ambient-blob ambient-blob--2"></view>
    </view>

    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__brand">
        <text class="brand-emoji">📚</text>
        <text class="brand-name">什么值得学</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ top: (statusBarHeight + navHeight) + 'px' }" @tap="goSearch">
      <view class="search-box">
        <view class="search-icon">
          <text class="icon-text icon-text--search">🔍</text>
        </view>
        <text class="search-placeholder">{{ searchKeyword || '搜索感兴趣的课程...' }}</text>
      </view>
    </view>

    <scroll-view
      class="scroll"
      :style="scrollStyle"
      scroll-y
      @scrolltolower="loadMoreRecommend"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- Banner 轮播 -->
      <view class="banner-section" v-if="bannerList.length > 0">
        <swiper class="banner-swiper" :autoplay="true" :interval="4000" :circular="true" @change="onBannerChange">
          <swiper-item v-for="(course, index) in bannerList" :key="course.id" @tap="goCourseDetail(course)">
            <view class="banner-item">
              <image class="banner-image" :src="course.cover" mode="aspectFill" />
              <view class="banner-overlay">
                <view class="banner-tag">精选推荐</view>
                <text class="banner-title">{{ course.title }}</text>
                <text class="banner-subtitle">{{ course.instructor?.name }} · {{ course.platform }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="banner-indicator">
          <view
            v-for="(item, index) in bannerList"
            :key="index"
            class="indicator-dot"
            :class="{ active: bannerIndex === index }"
          ></view>
        </view>
      </view>

      <!-- 骨架屏 Banner -->
      <view class="banner-section skeleton-banner" v-else-if="isLoading && bannerList.length === 0">
        <view class="skeleton-banner-img"></view>
      </view>

      <!-- 分类快捷入口 -->
      <view class="category-section">
        <scroll-view class="category-scroll" scroll-x>
          <view
            class="category-item"
            v-for="cat in categoryList"
            :key="cat.id"
            @tap="goCategory(cat)"
          >
            <view class="category-icon">
              <text>{{ cat.icon || '📖' }}</text>
            </view>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </scroll-view>

        <!-- 快捷功能按钮 -->
        <view class="quick-btns">
          <view class="quick-btn quick-btn--guide" @tap="goGuide">
            <text class="quick-btn__icon">📖</text>
            <text class="quick-btn__text">新人攻略</text>
          </view>
          <view class="quick-btn quick-btn--contact" @tap="goContact">
            <text class="quick-btn__icon">📞</text>
            <text class="quick-btn__text">联系我们</text>
          </view>
        </view>
      </view>

      <!-- 为你推荐 -->
      <view class="recommend-section">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">📌</text>
            <text class="section-title">为你推荐</text>
          </view>
          <view class="section-action" @tap="changeRecommend">
            <text>换一批</text>
            <text class="refresh-icon">🔄</text>
          </view>
        </view>
        <text class="section-subtitle" v-if="userInterestTags.length > 0">
          基于你的兴趣：{{ userInterestTags.slice(0, 3).join('、') }}
        </text>
        <text class="section-subtitle" v-else>发现值得学习的课程</text>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-waterfall" v-if="isLoading && recommendList.length === 0">
        <view class="skeleton-column">
          <view class="skeleton-card" v-for="n in 4" :key="'left-' + n">
            <view class="skeleton-image"></view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text short"></view>
          </view>
        </view>
        <view class="skeleton-column">
          <view class="skeleton-card" v-for="n in 4" :key="'right-' + n">
            <view class="skeleton-image"></view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text short"></view>
          </view>
        </view>
      </view>

      <!-- 课程瀑布流 -->
      <view class="product-waterfall" v-else>
        <view class="waterfall-column waterfall-column--left">
          <view
            class="product-mega-card"
            v-for="(course, index) in leftCourses"
            :key="course.id || index"
            :style="{ animationDelay: (index * 0.08) + 's' }"
            @tap="goCourseDetail(course)"
          >
            <view class="mega-card__image-wrap">
              <image class="mega-card__image" :src="course.cover" mode="aspectFill" />
              <view class="mega-card__platform-tag">{{ course.platform }}</view>
            </view>
            <view class="mega-card__body">
              <text class="mega-card__title">{{ course.title }}</text>
              <text class="mega-card__instructor">{{ course.instructor?.name || '讲师' }}</text>
              <view class="mega-card__tags" v-if="course.tags && course.tags.length > 0">
                <view class="mini-tag" v-for="tag in course.tags.slice(0, 2)" :key="tag">{{ tag }}</view>
              </view>
              <view class="mega-card__footer">
                <view class="price-group">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
                  <text class="price-original" v-if="course.price && course.price > course.priceNow">
                    ¥{{ ((course.price || 0) / 100).toFixed(2) }}
                  </text>
                </view>
                <view class="go-btn" @tap.stop="goLearn(course)">
                  <text>去看看</text>
                </view>
              </view>
              <view class="mega-card__meta">
                <text class="meta-rating" v-if="course.rating">⭐ {{ course.rating }}分</text>
                <text class="meta-students" v-if="course.studentCount">{{ course.studentCount }}人在学</text>
              </view>
            </view>
          </view>
        </view>

        <view class="waterfall-column waterfall-column--right">
          <view
            class="product-mega-card"
            v-for="(course, index) in rightCourses"
            :key="course.id || index"
            :style="{ animationDelay: (index * 0.08) + 's' }"
            @tap="goCourseDetail(course)"
          >
            <view class="mega-card__image-wrap">
              <image class="mega-card__image" :src="course.cover" mode="aspectFill" />
              <view class="mega-card__platform-tag">{{ course.platform }}</view>
            </view>
            <view class="mega-card__body">
              <text class="mega-card__title">{{ course.title }}</text>
              <text class="mega-card__instructor">{{ course.instructor?.name || '讲师' }}</text>
              <view class="mega-card__tags" v-if="course.tags && course.tags.length > 0">
                <view class="mini-tag" v-for="tag in course.tags.slice(0, 2)" :key="tag">{{ tag }}</view>
              </view>
              <view class="mega-card__footer">
                <view class="price-group">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
                  <text class="price-original" v-if="course.price && course.price > course.priceNow">
                    ¥{{ ((course.price || 0) / 100).toFixed(2) }}
                  </text>
                </view>
                <view class="go-btn" @tap.stop="goLearn(course)">
                  <text>去看看</text>
                </view>
              </view>
              <view class="mega-card__meta">
                <text class="meta-rating" v-if="course.rating">⭐ {{ course.rating }}分</text>
                <text class="meta-students" v-if="course.studentCount">{{ course.studentCount }}人在学</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="load-more" v-if="recommendList.length > 0">
        <text class="load-more__text">— 已经到底啦 —</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!isLoading && recommendList.length === 0">
        <text class="empty-icon">📚</text>
        <text class="empty-text">暂无推荐课程</text>
        <text class="empty-hint">去发现页看看更多课程吧</text>
        <view class="empty-btn" @tap="goDiscover">
          <text>去发现</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getFeaturedCourses, getCourses, getRecommendations } from '@/utils/course.js'
import { getCategories } from '@/utils/category.js'
import { getCurrentUser, getCurrentUserId } from '@/utils/user.js'
import { addBrowseLog, recordClick } from '@/utils/track.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const searchBarHeight = 100

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + searchBarHeight
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px - ${safeBottom}px)`,
  }
})

// ========== 加载状态 ==========
const isLoading = ref(false)
const isRefreshing = ref(false)

// ========== 用户信息 ==========
const userInfo = computed(() => getCurrentUser())
const userId = computed(() => getCurrentUserId())
const userInterestTags = ref([])

// ========== Banner 数据 ==========
const bannerList = ref([])
const bannerIndex = ref(0)

// ========== 分类数据 ==========
const categoryList = ref([])

// ========== 推荐课程数据 ==========
const recommendList = ref([])
const recommendPage = ref(1)
const hasMoreRecommend = ref(true)

// ========== 搜索关键词 ==========
const searchKeyword = ref('')

// ========== 瀑布流分组 ==========
const leftCourses = computed(() => {
  return recommendList.value.filter((_, index) => index % 2 === 0)
})

const rightCourses = computed(() => {
  return recommendList.value.filter((_, index) => index % 2 === 1)
})

// ========== Banner 切换 ==========
const onBannerChange = (e) => {
  bannerIndex.value = e.detail.current
}

// ========== 加载 Banner ==========
const loadBanner = async () => {
  const res = await getFeaturedCourses(5)
  if (res.ok && res.list) {
    bannerList.value = res.list
  }
}

// ========== 加载分类 ==========
const loadCategories = async () => {
  const res = await getCategories()
  if (res.ok && res.list) {
    categoryList.value = res.list
  }
}

// ========== 加载推荐课程 ==========
const loadRecommend = async (refresh = false) => {
  if (refresh) {
    recommendPage.value = 1
    hasMoreRecommend.value = true
  }

  if (!hasMoreRecommend.value) return

  const res = await getRecommendations(
    userId.value,
    userInterestTags.value,
    20
  )

  if (res.ok && res.list) {
    if (refresh) {
      recommendList.value = res.list
    } else {
      recommendList.value = [...recommendList.value, ...res.list]
    }
    hasMoreRecommend.value = res.list.length >= 20
    recommendPage.value++
  }
}

// ========== 加载更多推荐 ==========
const loadMoreRecommend = () => {
  if (hasMoreRecommend.value && !isLoading.value) {
    loadRecommend()
  }
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await Promise.all([loadBanner(), loadRecommend(true)])
  isRefreshing.value = false
}

// ========== 换一批推荐 ==========
const changeRecommend = async () => {
  isLoading.value = true
  recommendList.value = []
  await loadRecommend(true)
  isLoading.value = false
  uni.showToast({ title: '已换一批', icon: 'none' })
}

// ========== 页面跳转 ==========
const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}

const goCategory = (cat) => {
  uni.navigateTo({ url: `/pages/discover/discover?categoryId=${cat._id || cat.id}&categoryName=${encodeURIComponent(cat.name)}` })
}

const goCourseDetail = async (course) => {
  // 记录浏览
  if (userId.value) {
    addBrowseLog(userId.value, course, 'home').catch(() => {})
  }
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id || course._id}` })
}

const goLearn = async (course) => {
  const courseId = course.id || course._id

  // 记录点击
  if (userId.value) {
    await recordClick(courseId, userId.value, course.promoteCode)
  }

  // 显示跳转提示
  uni.showLoading({ title: '正在跳转...' })

  // 构建推广链接
  let promoteUrl = course.promoteUrl || course.originalUrl

  if (!promoteUrl) {
    uni.hideLoading()
    uni.showToast({ title: '暂无可用购买链接', icon: 'none' })
    return
  }

  // H5 环境直接跳转
  // #ifdef H5
  setTimeout(() => {
    uni.hideLoading()
    window.location.href = promoteUrl
  }, 500)
  // #endif

  // 小程序环境复制链接
  // #ifdef MP-WEIXIN
  setTimeout(() => {
    uni.hideLoading()
    uni.setClipboardData({
      data: promoteUrl,
      success: () => {
        uni.showModal({
          title: '提示',
          content: '链接已复制，请在浏览器中打开购买，或截图发给客服帮您下单',
          confirmText: '知道了',
          showCancel: false
        })
      }
    })
  }, 500)
  // #endif
}

const goDiscover = () => {
  uni.switchTab({ url: '/pages/discover/discover' })
}

const goGuide = () => {
  uni.navigateTo({ url: '/pages/user/guide' })
}

const goContact = () => {
  uni.navigateTo({ url: '/pages/user/contact' })
}

// ========== 初始化用户兴趣 ==========
const initUserInterests = () => {
  if (userInfo.value && userInfo.value.interestTags) {
    userInterestTags.value = userInfo.value.interestTags
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0

  isLoading.value = true
  initUserInterests()

  await Promise.all([
    loadBanner(),
    loadCategories(),
    loadRecommend()
  ])

  isLoading.value = false
})

onShow(() => {
  // 每次显示刷新推荐
  initUserInterests()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.88);
$glass-border: rgba(255, 255, 255, 0.5);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

// 动画定义
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

@keyframes blob-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes bump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* 动态背景 */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100rpx);
  animation: blob-pulse 10s ease-in-out infinite;
}

.ambient-blob--1 {
  width: 500rpx;
  height: 500rpx;
  background: linear-gradient(135deg, $primary 0%, rgba(255, 159, 90, 0.4) 100%);
  top: -150rpx;
  right: -100rpx;
}

.ambient-blob--2 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $secondary 0%, rgba(78, 205, 196, 0.3) 100%);
  bottom: 200rpx;
  left: -150rpx;
  animation-delay: 3s;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-emoji {
  font-size: 40rpx;
  animation: float 4s ease-in-out infinite;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
}

/* 搜索栏 */
.search-bar {
  position: fixed;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 99;
  padding: 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.search-box {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  color: $text-muted;
}

.search-placeholder {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-muted;
  letter-spacing: 1rpx;
}

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* Banner 轮播 */
.banner-section {
  margin: 20rpx 24rpx;
  position: relative;
}

.banner-swiper {
  width: 100%;
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 100rpx 28rpx 28rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.banner-tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
}

.banner-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.banner-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.banner-indicator {
  position: absolute;
  bottom: 20rpx;
  right: 28rpx;
  display: flex;
  gap: 8rpx;
}

.indicator-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;

  &.active {
    width: 24rpx;
    background: #fff;
  }
}

/* 骨架屏 Banner */
.skeleton-banner {
  margin: 20rpx 24rpx;
}

.skeleton-banner-img {
  width: 100%;
  height: 320rpx;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 分类快捷入口 */
.category-section {
  padding: 20rpx 0 10rpx;
}

.category-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.category-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 140rpx;
  padding: 16rpx 8rpx;
  margin-right: 8rpx;
  background: $glass-bg;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20rpx);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.95);
  }
}

.category-icon {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 159, 90, 0.05));
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  text {
    font-size: 36rpx;
  }
}

.category-name {
  font-size: 24rpx;
  font-weight: 500;
  color: $text-secondary;
  white-space: nowrap;
}

/* 快捷功能按钮 */
.quick-btns {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx 0;
}

.quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 80rpx;
  border-radius: 20rpx;
  transition: all 0.2s;

  &:active {
    transform: scale(0.96);
    opacity: 0.85;
  }

  &--guide {
    background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
    .quick-btn__icon { background: #2196F3; }
  }

  &--contact {
    background: linear-gradient(135deg, #FFF8E1, #FFECB3);
    .quick-btn__icon { background: #FF9800; }
  }
}

.quick-btn__icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.quick-btn__text {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

/* 为你推荐 */
.recommend-section {
  padding: 24rpx 24rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  background: rgba(255, 107, 53, 0.08);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $primary;

  &:active {
    background: rgba(255, 107, 53, 0.15);
  }

  .refresh-icon {
    font-size: 24rpx;
  }
}

.section-subtitle {
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 4rpx;
}

/* 骨架屏 */
.skeleton-waterfall {
  display: flex;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}

.skeleton-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 28rpx;
  margin: 20rpx 20rpx 10rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.short {
    width: 60%;
    margin-top: 10rpx;
    margin-bottom: 20rpx;
  }
}

/* 瀑布流布局 */
.product-waterfall {
  display: flex;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 课程卡片 */
.product-mega-card {
  background: $glass-bg;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUpFade 0.6s ease-out both;

  &:active {
    transform: scale(0.97) translateY(-4rpx);
    box-shadow: 0 12rpx 36rpx rgba(255, 107, 53, 0.12);
  }
}

.mega-card__image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.mega-card__image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;

  .product-mega-card:active & {
    transform: scale(1.05);
  }
}

.mega-card__platform-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 14rpx;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}

.mega-card__body {
  padding: 20rpx;
}

.mega-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mega-card__instructor {
  display: block;
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 10rpx;
}

.mega-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.mini-tag {
  padding: 4rpx 10rpx;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
  border: 1rpx solid rgba(78, 205, 196, 0.2);
  border-radius: 8rpx;
  font-size: 18rpx;
  color: $secondary;
  font-weight: 500;
}

.mega-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;
}

.price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
}

.price-original {
  font-size: 22rpx;
  color: $text-muted;
  text-decoration: line-through;
  margin-left: 6rpx;
}

.go-btn {
  padding: 10rpx 24rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);

  text {
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
}

.mega-card__meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.meta-rating,
.meta-students {
  font-size: 22rpx;
  color: $text-muted;
}

/* 加载更多 */
.load-more {
  padding: 40rpx 0;
  text-align: center;

  &__text {
    font-size: 24rpx;
    color: $text-muted;
    letter-spacing: 2rpx;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }

  .empty-hint {
    font-size: 26rpx;
    color: $text-muted;
    margin-bottom: 32rpx;
  }

  .empty-btn {
    padding: 20rpx 48rpx;
    background: $orange-gradient;
    border-radius: 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);

    text {
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }
  }
}

.bottom-spacer {
  height: 40rpx;
}

/* 图标样式 */
.icon-text {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--search {
  font-size: 36rpx;
}
</style>
