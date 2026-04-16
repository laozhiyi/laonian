<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">学习记录</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y @scrolltolower="loadMore" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 按时间分组 -->
      <view class="record-list" v-if="recordGroups.length > 0">
        <view class="record-group" v-for="group in recordGroups" :key="group.date">
          <view class="group-header">{{ group.date }}</view>
          <view
            class="record-item"
            v-for="(record, index) in group.list"
            :key="record._id"
            @tap="goCourseDetail(record.courseId)"
          >
            <image class="record-cover" :src="record.courseCover" mode="aspectFill" />
            <view class="record-info">
              <text class="record-title">{{ record.courseTitle }}</text>
              <text class="record-time">浏览于 {{ formatTime(record.createdAt) }}</text>
            </view>
            <text class="record-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-item" v-for="n in 5" :key="n">
          <view class="skeleton-cover"></view>
          <view class="skeleton-info"></view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📖</text>
        <text class="empty-text">暂无学习记录</text>
        <text class="empty-hint">去首页发现感兴趣的课程吧</text>
        <view class="empty-btn" @tap="goDiscover">
          <text>去发现</text>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="load-more" v-if="recordGroups.length > 0 && !hasMore">
        <text class="load-more__text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getBrowseHistory } from '@/utils/track.js'
import { getCurrentUserId } from '@/utils/user.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px)`,
  }
})

// ========== 数据 ==========
const records = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// ========== 按时间分组 ==========
const recordGroups = computed(() => {
  const groups = []
  const dateMap = {}

  records.value.forEach(record => {
    const date = formatDate(record.createdAt)
    if (!dateMap[date]) {
      dateMap[date] = []
      groups.push({ date, list: dateMap[date] })
    }
    dateMap[date].push(record)
  })

  return groups
})

// ========== 格式化日期 ==========
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)

  if (date >= today) return '今天'
  if (date >= yesterday) return '昨天'

  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// ========== 格式化时间 ==========
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 加载数据 ==========
const loadData = async (refresh = false) => {
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
    records.value = []
  }

  if (!hasMore.value) return
  isLoading.value = true

  const userId = getCurrentUserId()
  if (!userId) {
    isLoading.value = false
    return
  }

  const res = await getBrowseHistory(userId, currentPage.value, 20)

  if (res.ok && res.list) {
    if (refresh) {
      records.value = res.list
    } else {
      records.value = [...records.value, ...res.list]
    }
    hasMore.value = res.list.length >= 20
    currentPage.value++
  }

  isLoading.value = false
}

// ========== 加载更多 ==========
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadData()
  }
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await loadData(true)
  isRefreshing.value = false
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

const goCourseDetail = (courseId) => {
  if (courseId) {
    uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` })
  }
}

const goDiscover = () => {
  uni.switchTab({ url: '/pages/discover/discover' })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  isLoading.value = true
  loadData(true)
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.page {
  min-height: 100vh;
  background: $bg-light;
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
  justify-content: space-between;
  padding: 0 24rpx;
}

.glass-nav__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
  }
}

.glass-nav__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.glass-nav__placeholder {
  width: 64rpx;
}

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 记录列表 */
.record-list {
  padding: 20rpx 24rpx;
}

.record-group {
  margin-bottom: 24rpx;
}

.group-header {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.3s ease-out;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  }
}

.record-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.record-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.record-time {
  font-size: 22rpx;
  color: $text-muted;
}

.record-arrow {
  font-size: 40rpx;
  color: $text-muted;
  opacity: 0.5;
}

/* 骨架屏 */
.skeleton-list {
  padding: 20rpx 24rpx;
}

.skeleton-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
}

.skeleton-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-right: 16rpx;
}

.skeleton-info {
  flex: 1;
  height: 80rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

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

    text {
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }
  }
}

.load-more {
  padding: 40rpx 0;
  text-align: center;

  &__text {
    font-size: 24rpx;
    color: $text-muted;
  }
}

.bottom-spacer {
  height: 40rpx;
}
</style>
