<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">课程详情</text>
      <view class="glass-nav__share" @tap="onShare">
        <text>↗</text>
      </view>
    </view>

    <scroll-view class="scroll" scroll-y :style="scrollStyle">
      <!-- 骨架屏 -->
      <view class="skeleton-detail" v-if="isLoading">
        <view class="skeleton-cover"></view>
        <view class="skeleton-content">
          <view class="skeleton-title"></view>
          <view class="skeleton-sub"></view>
          <view class="skeleton-price"></view>
        </view>
      </view>

      <!-- 课程详情内容 -->
      <view class="detail-content" v-else-if="courseDetail">
        <!-- 封面图 -->
        <view class="cover-section">
          <image class="cover-image" :src="courseDetail.cover" mode="aspectFill" />
          <view class="cover-overlay">
            <view class="platform-tag">{{ courseDetail.platform }}</view>
          </view>
        </view>

        <!-- 价格区域 -->
        <view class="price-card">
          <view class="price-main">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ ((courseDetail.priceNow || 0) / 100).toFixed(2) }}</text>
            <text class="price-original" v-if="courseDetail.price && courseDetail.price > courseDetail.priceNow">
              ¥{{ ((courseDetail.price || 0) / 100).toFixed(2) }}
            </text>
          </view>
          <view class="price-tags">
            <view class="discount-tag" v-if="courseDetail.discountText">{{ courseDetail.discountText }}</view>
            <text class="meta-text">{{ courseDetail.studentCount || 0 }}人在学</text>
            <text class="meta-text" v-if="courseDetail.rating">⭐ {{ courseDetail.rating }}分</text>
          </view>
        </view>

        <!-- 课程标题 -->
        <view class="title-section">
          <text class="course-title">{{ courseDetail.title }}</text>
          <text class="course-subtitle" v-if="courseDetail.subtitle">{{ courseDetail.subtitle }}</text>
        </view>

        <!-- 讲师信息 -->
        <view class="instructor-section" v-if="courseDetail.instructor">
          <image
            class="instructor-avatar"
            :src="courseDetail.instructor.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="instructor-info">
            <text class="instructor-name">{{ courseDetail.instructor.name || '讲师' }}</text>
            <text class="instructor-bio" v-if="courseDetail.instructor.bio">
              {{ courseDetail.instructor.bio }}
            </text>
          </view>
        </view>

        <!-- 适合人群 -->
        <view class="suitable-section" v-if="courseDetail.suitableFor || courseDetail.tags?.length > 0">
          <text class="section-label">适合人群</text>
          <view class="tag-list">
            <view class="tag-item" v-if="courseDetail.suitableFor">{{ courseDetail.suitableFor }}</view>
            <view class="tag-item" v-for="tag in courseDetail.tags?.slice(0, 3)" :key="tag">{{ tag }}</view>
          </view>
        </view>

        <!-- 课程介绍 -->
        <view class="desc-section">
          <view class="section-header">
            <text class="section-title">课程介绍</text>
          </view>
          <view class="desc-content" :class="{ expanded: showFullDesc }">
            <text class="desc-text">{{ courseDetail.description || '暂无课程介绍' }}</text>
          </view>
          <view class="desc-toggle" @tap="toggleDesc">
            <text>{{ showFullDesc ? '收起' : '展开全部' }}</text>
            <text class="toggle-icon">{{ showFullDesc ? '▲' : '▼' }}</text>
          </view>
        </view>

        <!-- 课程大纲 -->
        <view class="outline-section" v-if="courseDetail.outline?.length > 0">
          <view class="section-header">
            <text class="section-title">课程大纲</text>
            <text class="section-count">{{ courseDetail.outline.length }}个章节</text>
          </view>
          <view class="outline-list">
            <view
              class="outline-item"
              v-for="(chapter, index) in courseDetail.outline.slice(0, showAllOutline ? undefined : 5)"
              :key="index"
              @tap="toggleOutlineItem(index)"
            >
              <view class="outline-item__header">
                <text class="outline-item__num">{{ index + 1 }}</text>
                <text class="outline-item__title">{{ chapter }}</text>
                <text class="outline-item__arrow">{{ expandedOutline === index ? '▲' : '▼' }}</text>
              </view>
              <view class="outline-item__content" v-if="expandedOutline === index">
                <text>本章节包含详细教学内容...</text>
              </view>
            </view>
          </view>
          <view class="outline-more" v-if="courseDetail.outline.length > 5" @tap="showAllOutline = !showAllOutline">
            <text>{{ showAllOutline ? '收起' : '查看全部' }} {{ courseDetail.outline.length }} 个章节</text>
          </view>
        </view>

        <!-- 数据统计 -->
        <view class="stats-section">
          <view class="stats-item">
            <text class="stats-value">{{ courseDetail.viewCount || 0 }}</text>
            <text class="stats-label">浏览</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">{{ courseDetail.clickCount || 0 }}</text>
            <text class="stats-label">点击</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">{{ courseDetail.studentCount || 0 }}</text>
            <text class="stats-label">已学</text>
          </view>
        </view>
      </view>

      <!-- 错误/空状态 -->
      <view class="error-state" v-else>
        <text class="error-icon">📚</text>
        <text class="error-text">课程不存在或已下架</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar" v-if="courseDetail">
      <view class="action-favorite" @tap="toggleFavorite">
        <text class="favorite-icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
        <text class="favorite-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="action-learn" @tap="goLearn">
        <text class="learn-text">去看看</text>
        <text class="learn-price">¥{{ ((courseDetail.priceNow || 0) / 100).toFixed(2) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getCourseDetail } from '@/utils/course.js'
import { getCurrentUserId } from '@/utils/user.js'
import { addBrowseLog, recordClick } from '@/utils/track.js'
import { addFavorite, removeFavorite, checkFavorite } from '@/utils/favorite.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    height: `calc(100vh - ${statusBarHeight.value + navHeight.value}px - 140rpx - ${safeBottom}px)`,
  }
})

// ========== 课程数据 ==========
const courseDetail = ref(null)
const isLoading = ref(false)
const courseId = ref('')

// ========== 用户数据 ==========
const userId = computed(() => getCurrentUserId())

// ========== 收藏状态 ==========
const isFavorite = ref(false)

// ========== 展开状态 ==========
const showFullDesc = ref(false)
const expandedOutline = ref(-1)
const showAllOutline = ref(false)

// ========== 加载课程详情 ==========
const loadCourseDetail = async () => {
  isLoading.value = true

  const res = await getCourseDetail(courseId.value)

  if (res.ok && res.data) {
    courseDetail.value = res.data

    // 记录浏览
    if (userId.value) {
      addBrowseLog(userId.value, res.data, 'detail').catch(() => {})

      // 检查收藏状态
      const favRes = await checkFavorite(userId.value, courseId.value)
      if (favRes.ok) {
        isFavorite.value = favRes.isFavorite
      }
    }
  }

  isLoading.value = false
}

// ========== 切换收藏 ==========
const toggleFavorite = async () => {
  if (!userId.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 1000)
    return
  }

  if (isFavorite.value) {
    const res = await removeFavorite(userId.value, courseId.value)
    if (res.ok) {
      isFavorite.value = false
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    }
  } else {
    const res = await addFavorite(userId.value, courseDetail.value)
    if (res.ok) {
      isFavorite.value = true
      uni.showToast({ title: '收藏成功', icon: 'success' })
    }
  }
}

// ========== 展开/收起描述 ==========
const toggleDesc = () => {
  showFullDesc.value = !showFullDesc.value
}

// ========== 展开/收起章节 ==========
const toggleOutlineItem = (index) => {
  expandedOutline.value = expandedOutline.value === index ? -1 : index
}

// ========== 跳转到学习（第三方购买页） ==========
const goLearn = async () => {
  if (!courseDetail.value) return

  // 记录点击
  if (userId.value) {
    await recordClick(courseId.value, userId.value, courseDetail.value.promoteCode)
  }

  let promoteUrl = courseDetail.value.promoteUrl || courseDetail.value.originalUrl

  if (!promoteUrl) {
    uni.showToast({ title: '暂无可用购买链接', icon: 'none' })
    return
  }

  uni.showLoading({ title: '正在跳转...' })

  // #ifdef H5
  setTimeout(() => {
    uni.hideLoading()
    window.location.href = promoteUrl
  }, 500)
  // #endif
  // #ifdef MP-WEIXIN
  setTimeout(() => {
    uni.hideLoading()
    uni.setClipboardData({
      data: promoteUrl,
      success: () => {
        uni.showModal({
          title: '提示',
          content: '链接已复制，请在浏览器中打开购买',
          confirmText: '知道了',
          showCancel: false
        })
      }
    })
  }, 500)
  // #endif
}

// ========== 分享 ==========
const onShare = () => {
  if (!courseDetail.value) return

  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

// ========== 页面跳转 ==========
const goBack = () => {
  const pages = getCurrentPages()
  // 如果页面栈里有多个页面，可以正常返回
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // 没有历史记录，跳转到首页
    uni.switchTab({ url: '/pages/index/index' })
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
})

onLoad(async (options) => {
  if (options.id) {
    courseId.value = options.id
    await loadCourseDetail()
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
})

// ========== 分享配置 ==========
onShareAppMessage(() => {
  if (!courseDetail.value) return {}
  return {
    title: courseDetail.value.title,
    path: `/pages/course/detail?id=${courseId.value}`,
    imageUrl: courseDetail.value.cover
  }
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
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
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background: rgba(255, 144, 0, 0.1);
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
  }
}

.glass-nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.glass-nav__share {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 36rpx;
    color: $text-secondary;
  }
}

/* 滚动区域 */
.scroll {
  padding-top: calc(var(--status-bar-height, 0px) + 88rpx);
}

/* 骨架屏 */
.skeleton-detail {
  padding: 24rpx;
}

.skeleton-cover {
  width: 100%;
  height: 400rpx;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 24rpx;
}

.skeleton-title {
  height: 40rpx;
  width: 90%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 16rpx;
}

.skeleton-sub {
  height: 28rpx;
  width: 60%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 24rpx;
}

.skeleton-price {
  height: 48rpx;
  width: 40%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 课程详情内容 */
.detail-content {
  animation: slideUpFade 0.4s ease-out;
}

/* 封面图 */
.cover-section {
  position: relative;
  width: 100%;
  height: 400rpx;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.platform-tag {
  display: inline-block;
  padding: 10rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $primary;
}

/* 价格卡片 */
.price-card {
  background: #fff;
  margin: 0 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  margin-bottom: 12rpx;
}

.price-symbol {
  font-size: 28rpx;
  font-weight: 600;
  color: $primary;
}

.price-value {
  font-size: 56rpx;
  font-weight: 700;
  color: $primary;
}

.price-original {
  font-size: 28rpx;
  color: $text-muted;
  text-decoration: line-through;
  margin-left: 12rpx;
}

.price-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.discount-tag {
  padding: 6rpx 16rpx;
  background: rgba(255, 107, 53, 0.1);
  border: 1rpx solid rgba(255, 107, 53, 0.2);
  border-radius: 12rpx;
  font-size: 22rpx;
  color: $primary;
}

.meta-text {
  font-size: 24rpx;
  color: $text-muted;
}

/* 标题区域 */
.title-section {
  background: #fff;
  margin: 20rpx 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
}

.course-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.course-subtitle {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* 讲师信息 */
.instructor-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.instructor-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.instructor-info {
  flex: 1;
}

.instructor-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.instructor-bio {
  display: block;
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 适合人群 */
.suitable-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  padding: 10rpx 20rpx;
  background: rgba(78, 205, 196, 0.1);
  border: 1rpx solid rgba(78, 205, 196, 0.2);
  border-radius: 16rpx;
  font-size: 24rpx;
  color: $secondary;
}

/* 课程介绍 */
.desc-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.section-count {
  font-size: 24rpx;
  color: $text-muted;
}

.desc-content {
  max-height: 300rpx;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.expanded {
    max-height: 2000rpx;
  }
}

.desc-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.8;
  white-space: pre-wrap;
}

.desc-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding-top: 16rpx;
  font-size: 26rpx;
  color: $primary;

  .toggle-icon {
    font-size: 20rpx;
  }
}

/* 课程大纲 */
.outline-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.outline-item {
  background: #f8f8f8;
  border-radius: 12rpx;
  overflow: hidden;
}

.outline-item__header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  gap: 16rpx;
}

.outline-item__num {
  width: 40rpx;
  height: 40rpx;
  background: $orange-gradient;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.outline-item__title {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.outline-item__arrow {
  font-size: 22rpx;
  color: $text-muted;
}

.outline-item__content {
  padding: 0 20rpx 20rpx 76rpx;
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
}

.outline-more {
  text-align: center;
  padding-top: 20rpx;
  font-size: 26rpx;
  color: $primary;
}

/* 数据统计 */
.stats-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 32rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: $text-muted;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .error-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .error-text {
    font-size: 30rpx;
    color: $text-secondary;
  }
}

.bottom-spacer {
  height: 40rpx;
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 0 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  display: flex;
  align-items: center;
  gap: 20rpx;
  z-index: 100;
}

.action-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  background: #f8f8f8;

  .favorite-icon {
    font-size: 40rpx;
  }

  .favorite-text {
    font-size: 22rpx;
    color: $text-secondary;
  }
}

.action-learn {
  flex: 1;
  height: 96rpx;
  background: $orange-gradient;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);

  .learn-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }

  .learn-price {
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
    background: rgba(0, 0, 0, 0.15);
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
  }
}
</style>
