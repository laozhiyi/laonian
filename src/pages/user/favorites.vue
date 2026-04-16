<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">我的收藏</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 收藏列表 -->
      <view class="favorite-list" v-if="favorites.length > 0">
        <view
          class="favorite-item"
          v-for="(fav, index) in favorites"
          :key="fav._id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <view class="favorite-content" @tap="goCourseDetail(fav.courseId)">
            <image class="favorite-cover" :src="fav.courseCover" mode="aspectFill" />
            <view class="favorite-info">
              <text class="favorite-title">{{ fav.courseTitle }}</text>
              <text class="favorite-time">收藏于 {{ formatTime(fav.createdAt) }}</text>
            </view>
          </view>
          <view class="favorite-action" @tap.stop="removeFavorite(fav)">
            <text class="action-icon">🤍</text>
            <text class="action-text">取消</text>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-item" v-for="n in 4" :key="n">
          <view class="skeleton-cover"></view>
          <view class="skeleton-info"></view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">⭐</text>
        <text class="empty-text">暂无收藏</text>
        <text class="empty-hint">去发现感兴趣的课程吧</text>
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
import { getFavorites, removeFavorite as apiRemoveFavorite } from '@/utils/favorite.js'
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
const favorites = ref([])
const isLoading = ref(false)

// ========== 格式化时间 ==========
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// ========== 加载收藏 ==========
const loadFavorites = async () => {
  isLoading.value = true
  const userId = getCurrentUserId()

  if (!userId) {
    isLoading.value = false
    return
  }

  const res = await getFavorites(userId)
  if (res.ok && res.list) {
    favorites.value = res.list
  }

  isLoading.value = false
}

// ========== 取消收藏 ==========
const removeFavorite = async (fav) => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消收藏该课程吗？',
    success: async (res) => {
      if (res.confirm) {
        const userId = getCurrentUserId()
        const result = await apiRemoveFavorite(userId, fav.courseId)
        if (result.ok) {
          favorites.value = favorites.value.filter(f => f._id !== fav._id)
          uni.showToast({ title: '已取消', icon: 'none' })
        }
      }
    }
  })
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
  loadFavorites()
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

.scroll {
  position: relative;
  z-index: 1;
}

.favorite-list {
  padding: 20rpx 24rpx;
}

.favorite-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out both;
}

.favorite-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20rpx;
  transition: background 0.2s;

  &:active {
    background: #f8f8f8;
  }
}

.favorite-cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.favorite-title {
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

.favorite-time {
  font-size: 22rpx;
  color: $text-muted;
}

.favorite-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 24rpx;
  background: rgba(255, 71, 87, 0.05);
  transition: background 0.2s;

  &:active {
    background: rgba(255, 71, 87, 0.1);
  }

  .action-icon {
    font-size: 32rpx;
    margin-bottom: 4rpx;
  }

  .action-text {
    font-size: 22rpx;
    color: #ff4d4f;
  }
}

.skeleton-list {
  padding: 20rpx 24rpx;
}

.skeleton-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.skeleton-cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
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

.bottom-spacer {
  height: 40rpx;
}
</style>
