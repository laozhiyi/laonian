<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">数据统计</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 核心指标卡片 -->
      <view class="stats-cards">
        <view class="stats-card">
          <text class="stats-card__value">{{ stats.totalCourses || 0 }}</text>
          <text class="stats-card__label">课程总数</text>
        </view>
        <view class="stats-card">
          <text class="stats-card__value">{{ stats.onlineCourses || 0 }}</text>
          <text class="stats-card__label">上架课程</text>
        </view>
        <view class="stats-card">
          <text class="stats-card__value">{{ stats.totalViews || 0 }}</text>
          <text class="stats-card__label">总浏览量</text>
        </view>
        <view class="stats-card">
          <text class="stats-card__value">{{ stats.totalClicks || 0 }}</text>
          <text class="stats-card__label">总点击量</text>
        </view>
      </view>

      <!-- 转化漏斗 -->
      <view class="section">
        <view class="section-title">转化漏斗</view>
        <view class="funnel">
          <view class="funnel-item">
            <view class="funnel-bar" style="width: 100%; background: #4ECDC4;">
              <text class="funnel-text">浏览 {{ stats.totalViews || 0 }}</text>
            </view>
          </view>
          <view class="funnel-item">
            <view class="funnel-bar" :style="{ width: funnelWidth(stats.totalViews, stats.totalClicks) + '%', background: '#FF9F5A' }">
              <text class="funnel-text">点击 {{ stats.totalClicks || 0 }}</text>
            </view>
          </view>
          <view class="funnel-item">
            <view class="funnel-bar" :style="{ width: funnelWidth(stats.totalClicks, stats.totalOrders) + '%', background: '#FF6B35' }">
              <text class="funnel-text">成交 {{ stats.totalOrders || 0 }}</text>
            </view>
          </view>
        </view>
        <view class="funnel-rate">
          <text>整体转化率：{{ calcRate(stats.totalViews, stats.totalOrders) }}%</text>
        </view>
      </view>

      <!-- 课程排名TOP10 -->
      <view class="section">
        <view class="section-title">课程热榜 TOP10</view>
        <view class="rank-card">
          <view class="rank-item header">
            <text class="rank-num">排名</text>
            <text class="rank-name">课程名称</text>
            <text class="rank-data">浏览/点击</text>
          </view>
          <view class="rank-item" v-for="(course, index) in topCourses" :key="course.id">
            <text class="rank-num" :class="'rank--' + (index + 1)">{{ index + 1 }}</text>
            <text class="rank-name">{{ course.title }}</text>
            <text class="rank-data">{{ course.viewCount || 0 }} / {{ course.clickCount || 0 }}</text>
          </view>
          <view class="rank-empty" v-if="topCourses.length === 0 && !isLoading">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 分类分布 -->
      <view class="section">
        <view class="section-title">分类课程分布</view>
        <view class="category-chart">
          <view class="category-bar" v-for="cat in categoryStats" :key="cat.name">
            <view class="bar-header">
              <text class="bar-name">{{ cat.name }}</text>
              <text class="bar-count">{{ cat.count }}门</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill" :style="{ width: barWidth(cat.count) + '%' }"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 佣金统计 -->
      <view class="section">
        <view class="section-title">佣金统计</view>
        <view class="commission-stats">
          <view class="comm-item">
            <text class="comm-value">¥{{ formatPrice(stats.totalCommission || 0) }}</text>
            <text class="comm-label">累计佣金</text>
          </view>
          <view class="comm-item">
            <text class="comm-value">¥{{ formatPrice(stats.settledCommission || 0) }}</text>
            <text class="comm-label">已结算</text>
          </view>
          <view class="comm-item">
            <text class="comm-value">¥{{ formatPrice(stats.pendingCommission || 0) }}</text>
            <text class="comm-label">待结算</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCourses } from '@/utils/course.js'
import { getAllCommissionStats } from '@/utils/order.js'

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
const stats = ref({
  totalCourses: 0,
  onlineCourses: 0,
  totalViews: 0,
  totalClicks: 0,
  totalOrders: 0,
  totalCommission: 0,
  settledCommission: 0,
  pendingCommission: 0
})

const topCourses = ref([])
const categoryStats = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)

// ========== 格式化金额 ==========
const formatPrice = (fen) => {
  if (!fen) return '0.00'
  return (fen / 100).toFixed(2)
}

// ========== 计算漏斗宽度 ==========
const funnelWidth = (from, to) => {
  if (!from || from === 0) return 0
  const rate = (to / from) * 100
  return Math.max(rate, 10)
}

// ========== 计算转化率 ==========
const calcRate = (views, orders) => {
  if (!views || views === 0) return '0.00'
  return ((orders / views) * 100).toFixed(2)
}

// ========== 计算分类条宽度 ==========
const maxCount = computed(() => {
  if (categoryStats.value.length === 0) return 1
  return Math.max(...categoryStats.value.map(c => c.count))
})

const barWidth = (count) => {
  if (!count) return 0
  return (count / maxCount.value) * 100
}

// ========== 加载数据 ==========
const loadData = async () => {
  isLoading.value = true

  const [courseRes, courseAllRes, commissionRes] = await Promise.all([
    getCourses({ status: 'online', limit: 10, sortBy: 'hot' }),
    getCourses({ limit: 100 }),
    getAllCommissionStats()
  ])

  if (courseRes.ok && courseRes.list) {
    topCourses.value = courseRes.list.slice(0, 10)
  }

  if (courseAllRes.ok && courseAllRes.list) {
    const all = courseAllRes.list
    stats.value.totalCourses = all.length
    stats.value.onlineCourses = all.filter(c => c.status === 'online').length
    stats.value.totalViews = all.reduce((sum, c) => sum + (c.viewCount || 0), 0)
    stats.value.totalClicks = all.reduce((sum, c) => sum + (c.clickCount || 0), 0)

    // 分类统计
    const catMap = {}
    all.forEach(c => {
      const name = c.categoryName || '未分类'
      if (!catMap[name]) catMap[name] = 0
      catMap[name]++
    })
    categoryStats.value = Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  if (commissionRes.ok && commissionRes.data) {
    stats.value.totalCommission = commissionRes.data.totalCommission || 0
    stats.value.settledCommission = commissionRes.data.settledCommission || 0
    stats.value.pendingCommission = commissionRes.data.pendingCommission || 0
    stats.value.totalOrders = commissionRes.data.totalOrders || 0
  }

  isLoading.value = false
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await loadData()
  isRefreshing.value = false
}

// ========== 返回 ==========
const goBack = () => {
  uni.navigateBack()
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadData()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
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
  &:active { opacity: 0.7; }
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

/* 核心指标卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx 24rpx;
}

.stats-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  &__value {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: $primary;
    margin-bottom: 8rpx;
  }

  &__label {
    font-size: 24rpx;
    color: $text-muted;
  }
}

/* 区块 */
.section {
  padding: 0 24rpx 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

/* 漏斗 */
.funnel {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.funnel-item {
  margin-bottom: 16rpx;
}

.funnel-bar {
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  min-width: 60px;
  transition: width 0.5s ease;
}

.funnel-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
}

.funnel-rate {
  text-align: center;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

/* 排名 */
.rank-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &.header {
    background: #f8f8f8;
    .rank-num, .rank-name, .rank-data {
      font-size: 24rpx;
      font-weight: 600;
      color: $text-secondary;
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.rank-num {
  width: 60rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-muted;
  flex-shrink: 0;

  &.rank--1 { color: #FFD700; }
  &.rank--2 { color: #C0C0C0; }
  &.rank--3 { color: #CD7F32; }
}

.rank-name {
  flex: 1;
  font-size: 26rpx;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 16rpx;
}

.rank-data {
  width: 120rpx;
  font-size: 24rpx;
  color: $text-muted;
  text-align: right;
  flex-shrink: 0;
}

.rank-empty {
  padding: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: $text-muted;
}

/* 分类分布 */
.category-chart {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.category-bar {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.bar-name {
  font-size: 26rpx;
  color: $text-primary;
}

.bar-count {
  font-size: 24rpx;
  color: $text-muted;
}

.bar-track {
  height: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: $orange-gradient;
  border-radius: 10rpx;
  transition: width 0.5s ease;
}

/* 佣金统计 */
.commission-stats {
  display: flex;
  background: $orange-gradient;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
}

.comm-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1rpx solid rgba(255,255,255,0.3);

  &:last-child {
    border-right: none;
  }
}

.comm-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.comm-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.bottom-spacer {
  height: 40rpx;
}
</style>
