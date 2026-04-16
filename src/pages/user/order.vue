<template>
  <view class="page">
    <!-- ?????? -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="goBack">
          <text class="back-icon">?</text>
        </view>
        <text class="nav-title">????</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- ?????? -->
    <view class="stats-card">
      <view class="stats-bg"></view>
      <view class="stats-content">
        <view class="stats-item" @tap="switchTab('')">
          <text class="stats-num">{{ stats.all || 0 }}</text>
          <text class="stats-label">??</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item" @tap="switchTab('pending')">
          <text class="stats-num">{{ stats.pending || 0 }}</text>
          <text class="stats-label">???</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item" @tap="switchTab('paid')">
          <text class="stats-num">{{ stats.paid || 0 }}</text>
          <text class="stats-label">???</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item" @tap="switchTab('completed')">
          <text class="stats-num">{{ stats.completed || 0 }}</text>
          <text class="stats-label">???</text>
        </view>
      </view>
    </view>

    <!-- ???? -->
    <scroll-view
      class="order-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- ???? -->
      <view class="order-list" v-if="orders.length > 0">
        <view
          class="order-card"
          v-for="(order, index) in orders"
          :key="order._id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
          @tap="goOrderDetail(order)"
        >
          <!-- ???? -->
          <view class="order-header">
            <view class="order-source">
              <text class="source-icon" v-if="order.source === 'admin'">?</text>
              <text class="source-icon source-icon--self" v-else>?</text>
              <text class="source-text">{{ order.source === 'admin' ? '????' : '????' }}</text>
            </view>
            <view class="order-status" :class="'status--' + order.status">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <!-- ???? -->
          <view class="order-goods" v-if="order.items && order.items.length > 0">
            <view class="goods-item" v-for="(item, idx) in order.items" :key="idx" @tap.stop="goCourseDetail(item.courseId)">
              <image class="goods-cover" :src="item.cover || '/static/default-cover.png'" mode="aspectFill"></image>
              <view class="goods-info">
                <text class="goods-title">{{ item.title || '??' }}</text>
                <text class="goods-desc" v-if="item.desc">{{ item.desc }}</text>
                <view class="goods-bottom">
                  <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
                  <text class="goods-num">x{{ item.num || 1 }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="order-goods" v-else @tap.stop="goCourseDetail(order.courseId)">
            <view class="goods-item">
              <image class="goods-cover" :src="order.cover || '/static/default-cover.png'" mode="aspectFill"></image>
              <view class="goods-info">
                <text class="goods-title">{{ order.courseTitle || '??' }}</text>
                <view class="goods-bottom">
                  <text class="goods-price">¥{{ formatPrice(order.amount || order.orderAmount) }}</text>
                  <text class="goods-num">x1</text>
                </view>
              </view>
            </view>
          </view>

          <!-- ??????????? -->
          <view class="commission-info" v-if="order.commission > 0">
            <text class="commission-label">????</text>
            <text class="commission-value">+¥{{ formatPrice(order.commission) }}</text>
          </view>

          <!-- ???? -->
          <view class="order-footer">
            <view class="order-time">
              <text class="time-text">{{ formatDateTime(order.createdAt) }}</text>
            </view>
            <view class="order-actions">
              <view class="action-btn action-btn--primary" v-if="order.status === 'pending'" @tap.stop="payOrder(order)">
                ????
              </view>
              <view class="action-btn" v-if="order.status === 'completed'" @tap.stop="goCourseDetail(order.courseId)">
                ????
              </view>
              <view class="action-btn action-btn--text" v-if="order.status !== 'pending'" @tap.stop="deleteOrder(order)">
                ????
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- ????? -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-card" v-for="n in 3" :key="n"></view>
      </view>

      <!-- ??? -->
      <view class="empty-state" v-else>
        <view class="empty-illustration">
          <text class="empty-icon">??</text>
        </view>
        <text class="empty-title">????</text>
        <text class="empty-desc">???????????</text>
        <view class="empty-btn" @tap="goDiscover">???</view>
      </view>

      <!-- ???? -->
      <view class="load-more" v-if="orders.length > 0">
        <text class="load-more__text" v-if="hasMore">???...</text>
        <text class="load-more__text" v-else>? ????? ?</text>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders, updateOrderStatus } from '@/utils/order.js'
import { getCurrentUserId } from '@/utils/user.js'

// ????
const statusBarHeight = ref(0)
const navHeight = 88

// ????
const currentTab = ref('')
const orders = ref([])
const stats = ref({ all: 0, pending: 0, paid: 0, completed: 0 })
const isLoading = ref(false)
const isRefreshing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// ????
const statusOptions = [
  { value: '', label: '??' },
  { value: 'pending', label: '???' },
  { value: 'paid', label: '???' },
  { value: 'completed', label: '???' }
]

// ??????
const getStatusText = (status) => {
  const map = {
    pending: '???',
    paid: '???',
    completed: '???',
    cancelled: '???'
  }
  return map[status] || status || '??'
}

// ??????????
const formatPrice = (fen) => {
  if (!fen && fen !== 0) return '0.00'
  return (fen / 100).toFixed(2)
}

// ???????
const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// ????
const switchTab = (status) => {
  if (currentTab.value === status) return
  currentTab.value = status
  loadData(true)
}

// ????
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
    uni.showToast({ title: '????', icon: 'none' })
    return
  }

  const res = await getOrders(userId, currentTab.value, currentPage.value, 20)

  if (res.ok && res.list) {
    // ???????
    const allRes = await getOrders(userId, '', 1, 1000)
    if (allRes.ok && allRes.list) {
      stats.value = {
        all: allRes.list.length,
        pending: allRes.list.filter(o => o.status === 'pending').length,
        paid: allRes.list.filter(o => o.status === 'paid').length,
        completed: allRes.list.filter(o => o.status === 'completed').length
      }
    }

    if (refresh) {
      orders.value = res.list
    } else {
      orders.value = [...orders.value, ...res.list]
    }
    hasMore.value = res.list.length >= 20
    currentPage.value++
  }

  isLoading.value = false
}

// ????
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadData()
  }
}

// ????
const onRefresh = async () => {
  isRefreshing.value = true
  await loadData(true)
  isRefreshing.value = false
}

// ????
const goBack = () => {
  uni.navigateBack()
}

const goOrderDetail = (order) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${order._id}` })
}

const goCourseDetail = (courseId) => {
  if (courseId) {
    uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` })
  }
}

const goDiscover = () => {
  uni.switchTab({ url: '/pages/discover/discover' })
}

// ????
const payOrder = (order) => {
  uni.showModal({
    title: '??',
    content: '????????',
    success: async (res) => {
      if (res.confirm) {
        const result = await updateOrderStatus(order._id, 'paid')
        if (result.ok) {
          uni.showToast({ title: '????', icon: 'success' })
          loadData(true)
        } else {
          uni.showToast({ title: '????', icon: 'none' })
        }
      }
    }
  })
}

// ????
const deleteOrder = (order) => {
  uni.showModal({
    title: '??',
    content: '????????',
    success: (res) => {
      if (res.confirm) {
        // ??????
        const index = orders.value.findIndex(o => o._id === order._id)
        if (index > -1) {
          orders.value.splice(index, 1)
        }
        uni.showToast({ title: '???', icon: 'success' })
      }
    }
  })
}

// ????
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
$card-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

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

/* ??? */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  z-index: 100;
}

.nav-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }

  .back-icon {
    font-size: 40rpx;
    color: $text-primary;
  }
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.nav-right {
  width: 64rpx;
}

/* ???? */
.stats-card {
  position: fixed;
  top: calc(var(--status-bar-height, 0px) + 88rpx);
  left: 0;
  right: 0;
  z-index: 99;
  padding: 0 24rpx;
}

.stats-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: $orange-gradient;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.3);
}

.stats-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 140rpx;
  background: transparent;
  padding: 0 16rpx;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;

  &:active {
    opacity: 0.8;
  }
}

.stats-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6rpx;
}

.stats-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}

.stats-divider {
  width: 1rpx;
  height: 50rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* ?????? */
.order-scroll {
  position: relative;
  z-index: 1;
  padding-top: calc(var(--status-bar-height, 0px) + 88rpx + 160rpx);
  height: 100vh;
  box-sizing: border-box;
}

/* ???? */
.order-list {
  padding: 20rpx 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: $card-shadow;
  animation: slideUpFade 0.4s ease-out both;

  &:active {
    transform: scale(0.99);
    transition: transform 0.1s;
  }
}

/* ???? */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-source {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.source-icon {
  width: 36rpx;
  height: 36rpx;
  background: $primary;
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;

  &--self {
    background: $secondary;
  }
}

.source-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.order-status {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;

  &.status--pending {
    background: rgba(255, 184, 0, 0.12);
    color: #ffb800;
  }

  &.status--paid {
    background: rgba($secondary, 0.12);
    color: $secondary;
  }

  &.status--completed {
    background: rgba(7, 193, 96, 0.12);
    color: #07c160;
  }

  &.status--cancelled {
    background: rgba($text-muted, 0.12);
    color: $text-muted;
  }
}

/* ???? */
.order-goods {
  margin-bottom: 16rpx;
}

.goods-item {
  display: flex;
  gap: 20rpx;
  padding: 16rpx;
  background: #fafafa;
  border-radius: 12rpx;

  &:active {
    background: #f0f0f0;
  }
}

.goods-cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #eee;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120rpx;
}

.goods-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-desc {
  font-size: 22rpx;
  color: $text-muted;
  margin-top: 6rpx;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.goods-price {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary;
}

.goods-num {
  font-size: 24rpx;
  color: $text-muted;
}

/* ?????? */
.commission-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  padding: 16rpx 0;
  border-top: 1rpx dashed #eee;
  margin-top: 8rpx;
}

.commission-label {
  font-size: 22rpx;
  color: $text-muted;
}

.commission-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff6b35;
}

/* ???? */
.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-time {
  .time-text {
    font-size: 22rpx;
    color: $text-muted;
  }
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 28rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  border: 1rpx solid #ddd;
  color: $text-secondary;

  &:active {
    opacity: 0.7;
  }

  &--primary {
    background: $primary;
    color: #fff;
    border: none;
  }

  &--text {
    border: none;
    color: $text-muted;
  }
}

/* ??? */
.skeleton-list {
  padding: 20rpx 24rpx;
}

.skeleton-card {
  height: 280rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
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
}

.empty-illustration {
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #f0f0f0, #e8e8e8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-muted;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 20rpx 60rpx;
  background: $primary;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 40rpx;

  &:active {
    opacity: 0.8;
  }
}

/* ???? */
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
