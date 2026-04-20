<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">🎬</text>
        <text class="brand-name">课程详情</text>
      </view>
      <view class="glass-nav__home" @tap="goHome">
        <text class="home-icon">🏠</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-page" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 课程不存在 -->
    <view class="empty-page" v-else-if="productNotFound">
      <view class="empty-icon">📭</view>
      <text class="empty-text">课程不存在</text>
      <view class="btn-back" @tap="goMall">返回商城</view>
    </view>

    <template v-else>
      <!-- 封面图/视频区域（固定在顶部） -->
      <view class="media-wrap" :style="{ paddingTop: (statusBarHeight + navHeight) + 'px' }">
        <!-- 无视频时显示封面图 -->
        <image class="cover" :src="course.cover" mode="aspectFill" v-if="!hasVideo" />

        <!-- 有视频时显示视频播放器 -->
        <view class="video-section" v-if="hasVideo">
          <video
            v-if="isPurchased"
            class="video-player"
            :src="(videos.length > 0 ? videos[currentVideoIndex]?.url : fullVideoUrl) || ''"
            controls
            object-fit="contain"
            :poster="course.cover"
          />
          <view v-else class="video-locked">
            <view class="video-locked__icon">🔒</view>
            <text class="video-locked__text">购买后可观看视频</text>
            <view class="video-locked__cover">
              <image class="video-locked__img" :src="course.cover" mode="aspectFill" />
              <view class="video-locked__mask">
                <view class="video-locked__play">▶</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 级别标签 -->
        <view class="level-badge" v-if="course.level">{{ course.level }}</view>
      </view>

      <!-- 课程信息 -->
      <scroll-view class="scroll" :style="scrollStyle" scroll-y>
        <view class="info-wrap">
          <!-- 标题和收藏 -->
          <view class="title-row">
            <view class="title">{{ course.title || '课程标题' }}</view>
            <view class="favorite-btn" @tap="toggleFavorite">
              <text>{{ isFavorited ? '❤️' : '🤍' }}</text>
            </view>
          </view>

          <!-- 课程元信息 -->
          <view class="meta-row">
            <view class="meta-item" v-if="course.instructor">
              <text class="meta-icon">👨‍🏫</text>
              <text class="meta-text">{{ course.instructor }}</text>
            </view>
            <view class="meta-item" v-if="course.rating">
              <text class="meta-icon">⭐</text>
              <text class="meta-text">{{ course.rating }}</text>
            </view>
            <view class="meta-item" v-if="course.studentCount">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ formatCount(course.studentCount) }}人在学</text>
            </view>
            <view class="meta-item" v-if="course.duration">
              <text class="meta-icon">⏱️</text>
              <text class="meta-text">{{ course.duration }}</text>
            </view>
            <view class="meta-item" v-if="course.level">
              <text class="meta-icon">📊</text>
              <text class="meta-text">{{ course.level }}</text>
            </view>
          </view>

          <!-- 分类标签 -->
          <view class="tags" v-if="course.tags && course.tags.length > 0">
            <text class="tag" v-for="tag in course.tags" :key="tag">#{{ tag }}</text>
          </view>

          <!-- 视频提示（有视频但未购买） -->
          <view class="video-hint" v-if="hasVideo && !isPurchased">
            <text class="video-hint__icon">🎬</text>
            <text class="video-hint__text">本课程包含视频，购买后可学习</text>
          </view>

          <!-- 课程内容切换标签 -->
          <view class="content-tabs">
            <view
              class="content-tab"
              :class="{ 'content-tab--active': activeTab === 'intro' }"
              @tap="activeTab = 'intro'"
            >
              <text>课程介绍</text>
            </view>
            <view
              class="content-tab"
              :class="{ 'content-tab--active': activeTab === 'videos' }"
              @tap="switchToVideos"
              v-if="hasVideo"
            >
              <text>课程视频 ({{ videos.length || (fullVideoUrl ? 1 : 0) }})</text>
            </view>
          </view>

          <!-- 课程介绍内容 -->
          <view class="desc-section" v-show="activeTab === 'intro'">
            <view class="desc-content">{{ course.desc || course.description || '暂无介绍' }}</view>
          </view>

          <!-- 课程视频内容（只显示视频名称列表） -->
          <view class="videos-section" v-show="activeTab === 'videos' && hasVideo">
            <view class="video-name-list">
              <view
                class="video-name-item"
                :class="{ 'video-name-item--active': idx === currentVideoIndex }"
                v-for="(video, idx) in (videos.length > 0 ? videos : (fullVideoUrl ? [{ url: fullVideoUrl, title: '视频 1' }] : []))"
                :key="idx"
                @tap="switchVideo(idx)"
              >
                <view class="video-name-item__play">{{ idx === currentVideoIndex ? '▶' : '' }}</view>
                <text class="video-name-item__num">{{ idx + 1 }}</text>
                <text class="video-name-item__text">{{ video.title || '视频 ' + (idx + 1) }}</text>
              </view>
            </view>
          </view>



          <view class="bottom-spacer" />
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCourseDetail, purchaseInternalCourse, checkInternalCoursePurchased } from '@/utils/course.js'
import { getCurrentUser } from '@/utils/user.js'
import { getFavorites, addFavorite, removeFavoriteByCourse } from '@/utils/favorite.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)

const loading = ref(true)
const productNotFound = ref(false)
const course = ref({})
const isPurchased = ref(false)
const purchasedVideoUrl = ref('')
const currentVideoIndex = ref(0)
const activeTab = ref('intro')

// 收藏功能
const isFavorited = ref(false)
const favoriteId = ref(null)

const hasVideo = computed(() => !!(course.value.videoUrl || course.value.video_url || (course.value.videos && course.value.videos.length > 0)))

const videos = computed(() => {
  if (course.value.videos && course.value.videos.length > 0) {
    return course.value.videos
  }
  return []
})

const fullVideoUrl = computed(() => {
  const url = course.value.videoUrl || course.value.video_url || ''
  if (!url) return ''
  if (url.startsWith('/')) {
    return url
  }
  return url
})

// 当前显示价格（整数）
const displayPrice = computed(() => {
  const price = Number(course.value.priceNow) || Number(course.value.price) || 0
  return price === 0 ? '0' : price.toFixed(0)
})

// 原价（如果有折扣）
const displayOriginalPrice = computed(() => {
  const current = Number(course.value.priceNow) || Number(course.value.price) || 0
  const origin = Number(course.value.priceOrigin) || 0
  if (origin > current && origin > 0) {
    return origin.toFixed(0)
  }
  return null
})

// scroll-view 样式（固定定位，动态计算 top）
const scrollStyle = computed(() => {
  const navTotal = statusBarHeight.value + navHeight.value

  return {
    paddingTop: '0',
  }
})

const formatCount = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num > 0 ? num : '0'
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/mall/mall' })
  }
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

// 开始学习
const startLearn = () => {
  if (videos.value && videos.value.length > 0) {
    // 切换到第一个视频
    switchVideo(0)
    uni.pageScrollTo({ scrollTop: 0, duration: 300 })
    uni.showToast({ title: '视频已加载，开始学习吧', icon: 'none', duration: 2000 })
  } else {
    const url = course.value.videoUrl || course.value.video_url
    if (url) {
      uni.showModal({
        title: '开始学习',
        content: '点击确定跳转视频页面',
        confirmText: '确定',
        success: () => {
          uni.pageScrollTo({ scrollTop: 0, duration: 300 })
          uni.showToast({ title: '视频已加载，开始学习吧', icon: 'none', duration: 2000 })
        }
      })
    } else {
      uni.showToast({ title: '暂无视频内容', icon: 'none' })
    }
  }
}

const switchVideo = (index) => {
  currentVideoIndex.value = index
  activeTab.value = 'videos'
}

const switchToVideos = () => {
  activeTab.value = 'videos'
}

// 加载收藏状态
const loadFavoriteStatus = async () => {
  const user = getCurrentUser()
  if (!user?.id || !course.value.id) return
  
  try {
    const res = await getFavorites(user.id)
    if (res.ok) {
      const favorite = res.list.find(item => 
        item.course_id === course.value.id && item.is_external === false
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
    const res = await removeFavoriteByCourse(user.id, course.value.id, false)
    if (res.ok) {
      isFavorited.value = false
      favoriteId.value = null
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    }
  } else {
    // 添加收藏
    const res = await addFavorite(user.id, course.value.id, false)
    if (res.ok) {
      isFavorited.value = true
      favoriteId.value = res.id
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  }
}

const onVideoSwiperChange = (e) => {
  currentVideoIndex.value = e.detail.current
}

// 免费领取（直接购买）
const freeEnroll = async () => {
  const user = getCurrentUser()
  if (!user?.id) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/auth/login' }), 1000)
    return
  }

  uni.showLoading({ title: '领取中...' })
  const res = await purchaseInternalCourse(course.value.id)
  uni.hideLoading()

  if (res.ok) {
    isPurchased.value = true
    uni.showToast({ title: '领取成功', icon: 'success' })
  } else {
    // 如果已购买，也显示已购买
    if (res.message && res.message.includes('已购买')) {
      isPurchased.value = true
    } else {
      uni.showToast({ title: res.message || '领取失败', icon: 'none' })
    }
  }
}

// 加载课程详情
const loadCourse = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  const id = options.id || ''

  if (!id) {
    loading.value = false
    productNotFound.value = true
    return
  }

  loading.value = true
  try {
    const res = await getCourseDetail(id)
    if (res.ok && res.data) {
      course.value = {
        ...res.data,
        id: res.data.id || res.data._id
      }
      productNotFound.value = false

      // 检查购买状态和收藏状态
      await checkPurchaseStatus()
      await loadFavoriteStatus()
    } else {
      productNotFound.value = true
    }
  } catch (e) {
    console.error('加载课程失败:', e)
    productNotFound.value = true
  } finally {
    loading.value = false
  }
}

// 检查购买状态
const checkPurchaseStatus = async () => {
  if (!course.value.id) return

  const user = getCurrentUser()
  if (!user?.id) return

  try {
    const res = await checkInternalCoursePurchased(course.value.id)
    if (res.ok) {
      isPurchased.value = res.purchased
      purchasedVideoUrl.value = res.video_url || ''
    }
  } catch (e) {
    console.error('检查购买状态失败:', e)
  }
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourse()
})

// onShow 中加载收藏状态（每次进入页面时刷新）
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

@keyframes slideUp {
  from { transform: translateY(40rpx); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* 导航栏 */
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
  .home-icon { font-size: 32rpx; }
}

.loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading-text {
  font-size: 28rpx;
  color: $text-muted;
}

.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: $text-muted;
  margin-bottom: 48rpx;
}

.btn-back {
  padding: 24rpx 64rpx;
  border-radius: 48rpx;
  background: $primary;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);
}

/* 媒体区域（封面图/视频轮播） */
.media-wrap {
  position: relative;
  width: 100%;
  background: #f0f0f0;
}

.cover {
  width: 100%;
  height: 480rpx;
  display: block;
}

.level-badge {
  position: absolute;
  right: 32rpx;
  bottom: 32rpx;
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.video-section {
  width: 100%;
  height: 480rpx;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
}

.video-locked {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  position: relative;
}

.video-locked__icon {
  font-size: 100rpx;
  opacity: 0.6;
}

.video-locked__text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.video-locked__cover {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.video-locked__img {
  width: 100%;
  height: 100%;
  opacity: 0.3;
  filter: blur(4rpx);
}

.video-locked__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-locked__play {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: $primary;
  padding-left: 12rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
}

/* 封面图 */
.cover-wrap {
  position: relative;
  width: 100%;
  background: #f0f0f0;
  overflow: hidden;
}

.cover-wrap .cover {
  width: 100%;
  height: 600rpx;
  display: block;
}

.back-btn {
  position: fixed;
  left: 32rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: $text-primary;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  z-index: 110;
  &:active { transform: scale(0.9); }
}

/* 课程信息 */
.scroll {
  background: $bg-card;
  padding-bottom: env(safe-area-inset-bottom);
}

.info-wrap {
  background: $bg-card;
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -24rpx;
  position: relative;
  padding: 48rpx 32rpx 40rpx;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.price-symbol {
  font-size: 36rpx;
  color: $primary;
  font-weight: 600;
}

.price-value {
  font-size: 72rpx;
  color: $primary;
  font-weight: 800;
  letter-spacing: -2rpx;
}

.price-original {
  font-size: 28rpx;
  color: $text-muted;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.price-tag {
  margin-left: 12rpx;
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #EF4444, #F87171);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  gap: 16rpx;
}

.title {
  flex: 1;
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.5;
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

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: $bg-light;
  border-radius: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon { font-size: 26rpx; }
.meta-text { font-size: 26rpx; color: $text-secondary; }

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(37, 99, 235, 0.1);
  color: $primary;
  font-size: 24rpx;
  font-weight: 500;
}

/* 视频提示 */
.video-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(37, 99, 235, 0.1);
}

.video-hint__icon { font-size: 36rpx; }
.video-hint__text { font-size: 28rpx; color: $primary; font-weight: 500; }

/* 课程视频列表 */
.videos-section {
  padding: 16rpx 0;
}

.video-player-box {
  width: 100%;
  height: 400rpx;
  background: #000;
  margin-bottom: 24rpx;
}

.video-player-box .video-player {
  width: 100%;
  height: 100%;
}

/* 视频名称列表 */
.video-name-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 0 8rpx;
}

.video-name-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: $bg-light;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &--active {
    background: rgba(37, 99, 235, 0.08);
    border-color: $primary;
  }

  &:active {
    transform: scale(0.98);
  }

  &__play {
    width: 40rpx;
    height: 40rpx;
    background: $primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    color: #fff;
    flex-shrink: 0;
  }

  &__num {
    width: 48rpx;
    height: 48rpx;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    color: $primary;
    flex-shrink: 0;
  }

  &--active &__num {
    background: $primary;
    color: #fff;
  }

  &__text {
    flex: 1;
    font-size: 28rpx;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--active &__text {
    color: $primary;
    font-weight: 600;
  }
}

/* 课程内容切换标签 */
.content-tabs {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #E2E8F0;
  margin-bottom: 24rpx;
}

.content-tab {
  padding: 12rpx 32rpx;
  background: $bg-light;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: $text-secondary;
  transition: all 0.3s;

  &--active {
    background: $primary;
    color: #fff;
    font-weight: 600;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* 课程视频列表 */
.videos-section {
  padding: 16rpx 0;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.video-list .video-item {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 16rpx;
  overflow: hidden;
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &--active {
    border-color: $primary;
    transform: scale(1.02);
  }

  .video-thumb {
    width: 100%;
    height: 100%;
    background: #000;
  }

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__play {
    width: 56rpx;
    height: 56rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: $primary;
    padding-left: 4rpx;
  }

  &__label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8rpx 12rpx;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    font-size: 24rpx;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__num {
    position: absolute;
    top: 8rpx;
    left: 8rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 已购买提示 */
.purchased-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(16, 185, 129, 0.15);
}

.purchased-hint__icon { font-size: 36rpx; }
.purchased-hint__text { font-size: 28rpx; color: $secondary; font-weight: 500; }

/* 课程描述 */
.desc-section {
  padding-top: 32rpx;
  border-top: 1rpx solid #F1F5F9;
}

.desc-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 48rpx;
    height: 4rpx;
    background: $primary;
    border-radius: 2rpx;
  }
}

.desc-content {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 2;
  margin-top: 24rpx;
}

.bottom-spacer {
  height: 40rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: 600;
  height: 96rpx;
  &:active { transform: scale(0.97); }

  &--secondary {
    background: $bg-light;
    color: $text-secondary;
    flex-shrink: 0;
    padding: 0 28rpx;
  }

  &--buy {
    flex: 1;
    background: $primary;
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.35);
  }

  &--learn {
    flex: 1;
    background: $secondary;
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(16, 185, 129, 0.35);
  }

  &--info {
    flex: 1;
    background: #94A3B8;
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(148, 163, 184, 0.35);
  }

  &__icon { font-size: 32rpx; }
  &__text { font-size: 30rpx; font-weight: 600; letter-spacing: 1rpx; }
}
</style>
