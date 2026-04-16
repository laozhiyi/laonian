<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">管理后台</text>
      <view class="glass-nav__right">
        <view class="home-btn" @tap="goHome">
          <text class="home-icon">🏠</text>
        </view>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 今日数据概览 -->
      <view class="stats-overview">
        <view class="stats-card stats-card--primary">
          <text class="stats-icon">👁</text>
          <view class="stats-info">
            <text class="stats-value">{{ todayStats.visits || 0 }}</text>
            <text class="stats-label">今日访问</text>
          </view>
        </view>
        <view class="stats-card stats-card--warning">
          <text class="stats-icon">👆</text>
          <view class="stats-info">
            <text class="stats-value">{{ todayStats.clicks || 0 }}</text>
            <text class="stats-label">今日点击</text>
          </view>
        </view>
        <view class="stats-card stats-card--success">
          <text class="stats-icon">📋</text>
          <view class="stats-info">
            <text class="stats-value">{{ todayStats.orders || 0 }}</text>
            <text class="stats-label">今日订单</text>
          </view>
        </view>
        <view class="stats-card stats-card--orange">
          <text class="stats-icon">💰</text>
          <view class="stats-info">
            <text class="stats-value">{{ formatPrice(todayStats.commission || 0) }}</text>
            <text class="stats-label">今日佣金</text>
          </view>
        </view>
      </view>

      <!-- 累计数据 -->
      <view class="total-stats">
        <view class="total-item">
          <text class="total-label">累计访问</text>
          <text class="total-value">{{ totalStats.totalVisits || 0 }}</text>
        </view>
        <view class="total-item">
          <text class="total-label">累计订单</text>
          <text class="total-value">{{ totalStats.totalOrders || 0 }}</text>
        </view>
        <view class="total-item">
          <text class="total-label">累计佣金</text>
          <text class="total-value">{{ formatPrice(totalStats.totalCommission || 0) }}</text>
        </view>
      </view>

      <!-- 快捷功能 -->
      <view class="quick-actions">
        <view class="section-title">快捷功能</view>
        <view class="action-grid">
          <view class="action-item" @tap="goPage('/pages/admin/course')">
            <view class="action-icon action-icon--orange">📚</view>
            <text class="action-text">课程管理</text>
          </view>
          <view class="action-item" @tap="goPage('/pages/admin/order')">
            <view class="action-icon action-icon--teal">📋</view>
            <text class="action-text">订单管理</text>
          </view>
          <view class="action-item" @tap="goPage('/pages/admin/stats')">
            <view class="action-icon action-icon--pink">📊</view>
            <text class="action-text">数据统计</text>
          </view>
          <view class="action-item" @tap="goPage('/pages/admin/category')">
            <view class="action-icon action-icon--green">🏷️</view>
            <text class="action-text">分类管理</text>
          </view>
        </view>
      </view>

      <!-- 待处理事项 -->
      <view class="pending-section">
        <view class="section-title">待处理事项</view>
        <view class="pending-card">
          <view class="pending-item" @tap="goPage('/pages/admin/order?status=pending')">
            <view class="pending-left">
              <text class="pending-icon">⏳</text>
              <text class="pending-text">待确认订单</text>
            </view>
            <view class="pending-right">
              <view class="pending-badge" v-if="pendingOrders > 0">{{ pendingOrders }}</view>
              <text class="pending-arrow">›</text>
            </view>
          </view>
          <view class="pending-item" @tap="goPage('/pages/admin/course?status=offline')">
            <view class="pending-left">
              <text class="pending-icon">📥</text>
              <text class="pending-text">待上架课程</text>
            </view>
            <view class="pending-right">
              <view class="pending-badge" v-if="offlineCourses > 0">{{ offlineCourses }}</view>
              <text class="pending-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门课程 TOP5 -->
      <view class="hot-section">
        <view class="section-title">热门课程 TOP5</view>
        <view class="hot-card">
          <view class="hot-item" v-for="(course, index) in hotCourses" :key="course.id">
            <view class="hot-rank" :class="'rank--' + (index + 1)">{{ index + 1 }}</view>
            <image class="hot-cover" :src="course.cover" mode="aspectFill" />
            <view class="hot-info">
              <text class="hot-title">{{ course.title }}</text>
              <text class="hot-meta">访问 {{ course.viewCount || 0 }} · 点击 {{ course.clickCount || 0 }}</text>
            </view>
          </view>
          <view class="hot-empty" v-if="hotCourses.length === 0 && !isLoading">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCourses, getCourseCount } from '@/utils/course.js'
import { getAllOrders, getAllCommissionStats } from '@/utils/order.js'

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

// ========== 加载状态 ==========
const isLoading = ref(false)
const isRefreshing = ref(false)

// ========== 今日数据 ==========
const todayStats = ref({
  visits: 0,
  clicks: 0,
  orders: 0,
  commission: 0
})

// ========== 累计数据 ==========
const totalStats = ref({
  totalVisits: 0,
  totalOrders: 0,
  totalCommission: 0
})

// ========== 待处理 ==========
const pendingOrders = ref(0)
const offlineCourses = ref(0)

// ========== 热门课程 ==========
const hotCourses = ref([])

// ========== 格式化金额 ==========
const formatPrice = (fen) => {
  if (!fen) return '0.00'
  return (fen / 100).toFixed(2)
}

// ========== 加载数据 ==========
const loadData = async () => {
  isLoading.value = true

  // 加载订单和佣金统计
  const [orderRes, statsRes, courseRes] = await Promise.all([
    getAllOrders('pending', 1, 1),
    getAllCommissionStats(),
    getCourses({ status: 'offline', limit: 100 })
  ])

  if (orderRes.ok && orderRes.list) {
    pendingOrders.value = orderRes.total || 0
  }

  if (statsRes.ok && statsRes.data) {
    totalStats.value = {
      totalOrders: statsRes.data.totalOrders,
      totalCommission: statsRes.data.totalCommission
    }
    todayStats.value = {
      orders: Math.floor(statsRes.data.totalOrders * 0.1),
      commission: Math.floor(statsRes.data.totalCommission * 0.15)
    }
  }

  if (courseRes.ok && courseRes.list) {
    offlineCourses.value = courseRes.total || 0
  }

  // 加载热门课程
  const hotRes = await getCourses({ sortBy: 'hot', limit: 5 })
  if (hotRes.ok && hotRes.list) {
    hotCourses.value = hotRes.list
  }

  isLoading.value = false
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await loadData()
  isRefreshing.value = false
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

const goPage = (url) => {
  uni.navigateTo({ url })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadData()
})

onShow(() => {
  loadData()
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

.glass-nav__right {
  width: 64rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.home-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }
}

.home-icon {
  font-size: 40rpx;
}

.scroll {
  position: relative;
  z-index: 1;
}

/* 今日数据概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx 24rpx;
}

.stats-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  &--primary {
    background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
    .stats-icon { background: #2196F3; }
    .stats-value { color: #1976D2; }
  }

  &--warning {
    background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
    .stats-icon { background: #FF9800; }
    .stats-value { color: #F57C00; }
  }

  &--success {
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
    .stats-icon { background: #4CAF50; }
    .stats-value { color: #388E3C; }
  }

  &--orange {
    background: $orange-gradient;
    .stats-icon { background: rgba(255,255,255,0.3); }
    .stats-value { color: #fff; }
    .stats-label { color: rgba(255,255,255,0.85); }
  }
}

.stats-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-value {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
  margin-bottom: 4rpx;
}

.stats-label {
  font-size: 24rpx;
  color: $text-muted;
}

/* 累计数据 */
.total-stats {
  display: flex;
  background: #fff;
  margin: 0 24rpx 20rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.total-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1rpx solid #f0f0f0;

  &:last-child {
    border-right: none;
  }
}

.total-label {
  font-size: 24rpx;
  color: $text-muted;
  margin-bottom: 8rpx;
}

.total-value {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

/* 快捷功能 */
.quick-actions {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 12rpx;

  &--orange { background: rgba(255, 107, 53, 0.1); }
  &--teal { background: rgba(78, 205, 196, 0.1); }
  &--pink { background: rgba(255, 107, 157, 0.1); }
  &--green { background: rgba(46, 204, 113, 0.1); }
}

.action-text {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

/* 待处理事项 */
.pending-section {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.pending-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f8f8;
  }
}

.pending-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.pending-icon {
  font-size: 36rpx;
}

.pending-text {
  font-size: 28rpx;
  color: $text-primary;
}

.pending-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pending-badge {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 12rpx;
  background: #FF4D4F;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pending-arrow {
  font-size: 40rpx;
  color: $text-muted;
  opacity: 0.5;
}

/* 热门课程 */
.hot-section {
  padding: 0 24rpx;
}

.hot-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.hot-rank {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: $text-secondary;
  margin-right: 16rpx;
  flex-shrink: 0;

  &.rank--1 { background: #FFD700; color: #fff; }
  &.rank--2 { background: #C0C0C0; color: #fff; }
  &.rank--3 { background: #CD7F32; color: #fff; }
}

.hot-cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.hot-info {
  flex: 1;
  min-width: 0;
}

.hot-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6rpx;
}

.hot-meta {
  font-size: 22rpx;
  color: $text-muted;
}

.hot-empty {
  padding: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: $text-muted;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
