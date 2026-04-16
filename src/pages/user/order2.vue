<template>
    <view class="page">
      <!-- ???? -->
      <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
        <view class="glass-nav__back" @tap="goBack">
          <text class="back-arrow">?</text>
        </view>
        <text class="glass-nav__title">????</text>
        <view class="glass-nav__placeholder" />
      </view>
  
      <!-- ???? -->
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-value">{{ formatPrice(stats.totalCommission) }}</text>
          <text class="stats-label">????</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">{{ formatPrice(stats.withdrawableCommission) }}</text>
          <text class="stats-label">???</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">{{ stats.totalOrders }}</text>
          <text class="stats-label">???</text>
        </view>
      </view>
  
      <scroll-view class="scroll" :style="scrollStyle" scroll-y @scrolltolower="loadMore" refresher-enabled :refresher-triggered="isRefreshing"     @refresherrefresh="onRefresh">
        <!-- ???? -->
        <view class="order-list" v-if="orders.length > 0">
          <view
            class="order-item"
            v-for="(order, index) in orders"
            :key="order._id"
            :style="{ animationDelay: (index * 0.05) + 's' }"
            @tap="goCourseDetail(order.courseId)"
          >
            <view class="order-header">
              <text class="order-no">??? {{ order.orderNo || order._id }}</text>
              <view class="order-status" :class="'status--' + order.status">
                {{ getStatusText(order.status) }}
              </view>
            </view>
            <view class="order-body">
              <text class="order-title">{{ order.courseTitle }}</text>
              <view class="order-info">
                <text class="order-amount">?{{ formatPrice(order.orderAmount) }}</text>
                <text class="order-commission">?? ?{{ formatPrice(order.commission) }}</text>
              </view>
            </view>
            <view class="order-footer">
              <text class="order-time">{{ formatDate(order.createdAt) }}</text>
              <text class="order-arrow">?</text>
            </view>
          </view>
        </view>
  
        <!-- ??? -->
        <view class="skeleton-list" v-else-if="isLoading">
          <view class="skeleton-item" v-for="n in 3" :key="n"></view>
        </view>
  
        <!-- ???? -->
        <view class="empty-state" v-else>
          <text class="empty-icon">??</text>
          <text class="empty-text">????</text>
          <text class="empty-hint">???????</text>
        </view>
  
        <view class="load-more" v-if="orders.length > 0 && !hasMore">
          <text class="load-more__text">? ????? ?</text>
        </view>
  
        <view class="bottom-spacer" />
      </scroll-view>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { getOrders, getCommissionStats } from '@/utils/order.js'
  import { getCurrentUserId } from '@/utils/user.js'
  
  // ========== ????? ==========
  const statusBarHeight = ref(0)
  const navHeight = ref(88)
  
  // ========== ?????? ==========
  const scrollStyle = computed(() => {
    const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
    const totalTop = statusBarHeight.value + navHeight.value + 140
    return {
      paddingTop: '0',
      height: `calc(100vh - ${totalTop}px)`,
    }
  })
  
  // ========== ???
  // ? ==========
  const orders = ref([])
  const stats = ref({
    totalOrders: 0,
    totalCommission: 0,
    withdrawableCommission: 0
  })
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const currentPage = ref(1)
  const hasMore = ref(true)
  
  // ========== ????? ==========
  const formatPrice = (fen) => {
    if (!fen) return '0.00'
    return (fen / 100).toFixed(2)
  }
  
  // ========== ????? ==========
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  // ========== ???? ==========
  const getStatusText = (status) => {
    const map = {
      pending: '???',
      confirmed: '???',
      settled: '???'
    }
    return map[status] || status
  }
  
  // ========== ???? ==========
  const loadData = async (refresh = false) => {
    if (refresh) {
      currentPage.value = 1
      hasMore.value = true
      orders.value = []
    }
  
    if (!hasMore.value) return
    isLoading.value = true
  
    const userId = getCurrentUserId()
    if (!userId) {
      isLoading.value = false
      return
    }
  
    const [orderRes, statsRes] = await Promise.all([
      getOrders(userId, '', currentPage.value, 20),
      getCommissionStats(userId)
    ])
  
    if (orderRes.ok && orderRes.list) {
      if (refresh) {
        orders.value = orderRes.list
      } else {
        orders.value = [...orders.value, ...orderRes.list]
      }
      hasMore.value = orderRes.list.length >= 20
      currentPage.value++
    }
  
    if (statsRes.ok && statsRes.data) {
      stats.value = statsRes.data
    }
  
    isLoading.value = false
  }
  
  // ========== ???? ==========
  const loadMore = () => {
    if (hasMore.value && !isLoading.value) {
      loadData()
    }
  }
  
  // ========== ???? ==========
  const onRefresh = async () => {
    isRefreshing.value = true
    await loadData(true)
    isRefreshing.value = false
  }
  
  // ========== ???? ==========
  const goBack = () => {
    uni.navigateBack()
  }
  
  const goCourseDetail = (courseId) => {
    if (courseId) {
      uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` })
    }
  }
  
  // ========== ???? ==========
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
  
  /* ?????? */
  .stats-card {
    position: fixed;
    top: calc(var(--status-bar-height, 0px) + 88rpx);
    left: 0;
    right: 0;
    height: 140rpx;
    background: $orange-gradient;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: space-around;
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.3);
  }
  
  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .stats-value {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8rpx;
  }
  
  .stats-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.85);
  }
  
  .stats-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
  }
  
  .scroll {
    position: relative;
    z-index: 1;
  }
  
  .order-list {
    padding: 20rpx 24rpx;
  }
  
  .order-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    animation: slideUpFade 0.4s ease-out both;
    transition: all 0.2s;
  
    &:active {
      transform: scale(0.98);
    }
  }
  
  .order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  
  .order-no {
    font-size: 22rpx;
    color: $text-muted;
  }
  
  .order-status {
    padding: 6rpx 16rpx;
    border-radius: 12rpx;
    font-size: 22rpx;
    font-weight: 600;
  
    &.status--pending {
      background: rgba(255, 184, 0, 0.1);
      color: #ffb800;
    }
  
    &.status--confirmed {
      background: rgba(78, 205, 196, 0.1);
      color: $secondary;
    }
  
    &.status--settled {
      background: rgba(7, 193, 96, 0.1);
      color: #07c160;
    }
  }
  
  .order-body {
    margin-bottom: 16rpx;
  }
  
  .order-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;
    line-height: 1.4;
  }
  
  .order-info {
    display: flex;
    gap: 24rpx;
  }
  
  .order-amount,
  .order-commission {
    font-size: 24rpx;
    color: $text-secondary;
  }
  
  .order-commission {
    color: $primary;
    font-weight: 600;
  }
  
  .order-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;
  }
  
  .order-time {
    font-size: 22rpx;
    color: $text-muted;
  }
  
  .order-arrow {
    font-size: 40rpx;
    color: $text-muted;
    opacity: 0.5;
  }
  
  /* ??? */
  .skeleton-list {
    padding: 20rpx 24rpx;
  }
  
  .skeleton-item {
    height: 160rpx;
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 16rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  /* ??? */
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
  