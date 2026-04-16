<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">订单管理</text>
      <view class="glass-nav__add" @tap="showAddOrder">
        <text>+ 录入</text>
      </view>
    </view>

    <!-- 佣金概览 -->
    <view class="stats-bar">
      <view class="stats-item">
        <text class="stats-label">总佣金</text>
        <text class="stats-value">¥{{ formatPrice(stats.totalCommission) }}</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-label">已结算</text>
        <text class="stats-value success">¥{{ formatPrice(stats.settledCommission) }}</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-label">待结算</text>
        <text class="stats-value warning">¥{{ formatPrice(stats.pendingCommission) }}</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        class="filter-tab"
        :class="{ active: statusFilter === '' }"
        @tap="setFilter('')"
      >全部</view>
      <view
        class="filter-tab"
        :class="{ active: statusFilter === 'pending' }"
        @tap="setFilter('pending')"
      >待确认</view>
      <view
        class="filter-tab"
        :class="{ active: statusFilter === 'confirmed' }"
        @tap="setFilter('confirmed')"
      >已确认</view>
      <view
        class="filter-tab"
        :class="{ active: statusFilter === 'settled' }"
        @tap="setFilter('settled')"
      >已结算</view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y @scrolltolower="loadMore" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 订单列表 -->
      <view class="order-list" v-if="orderList.length > 0">
        <view
          class="order-item"
          v-for="(order, index) in orderList"
          :key="order._id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <view class="order-header">
            <text class="order-no">订单号：{{ order.orderNo || order._id }}</text>
            <view class="order-status" :class="'status--' + order.status" @tap="changeStatus(order)">
              {{ getStatusText(order.status) }}
            </view>
          </view>
          <view class="order-body">
            <text class="order-title">{{ order.courseTitle }}</text>
            <view class="order-info">
              <text class="info-item">来源：{{ order.platform || '未知' }}</text>
              <text class="info-item">推广码：{{ order.promoteCode || '无' }}</text>
            </view>
          </view>
          <view class="order-footer">
            <view class="order-money">
              <text class="money-amount">金额：¥{{ formatPrice(order.orderAmount) }}</text>
              <text class="money-commission">佣金：¥{{ formatPrice(order.commission) }}</text>
            </view>
            <text class="order-time">{{ formatDate(order.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-item" v-for="n in 5" :key="n"></view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>

      <view class="load-more" v-if="orderList.length > 0 && !hasMore">
        <text>— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 手动录入弹窗 -->
    <view class="add-order-popup" v-if="showAddPopup">
      <view class="popup-mask" @tap="showAddPopup = false"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">手动录入订单</text>
          <view class="popup-close" @tap="showAddPopup = false">
            <text>✕</text>
          </view>
        </view>
        <view class="popup-body">
          <view class="popup-item">
            <text class="popup-label">订单号</text>
            <input class="popup-input" v-model="addForm.orderNo" placeholder="第三方订单号" />
          </view>
          <view class="popup-item">
            <text class="popup-label">课程名称</text>
            <input class="popup-input" v-model="addForm.courseTitle" placeholder="课程名称" />
          </view>
          <view class="popup-item">
            <text class="popup-label">订单金额(元)</text>
            <input class="popup-input" type="digit" v-model="addForm.orderAmount" placeholder="99.00" />
          </view>
          <view class="popup-item">
            <text class="popup-label">佣金比例(%)</text>
            <input class="popup-input" type="digit" v-model="addForm.commissionRate" placeholder="30" />
          </view>
          <view class="popup-item">
            <text class="popup-label">来源平台</text>
            <input class="popup-input" v-model="addForm.platform" placeholder="如：得到、小鹅通" />
          </view>
          <view class="popup-item">
            <text class="popup-label">推广码</text>
            <input class="popup-input" v-model="addForm.promoteCode" placeholder="推广码（可选）" />
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @tap="showAddPopup = false">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="submitAddOrder">
            <text>确认录入</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllOrders, addOrder, updateOrderStatus, getAllCommissionStats } from '@/utils/order.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const statsBarHeight = 120
const filterHeight = 100

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + statsBarHeight + filterHeight
  return {
    height: `calc(100vh - ${totalTop}px)`,
  }
})

// ========== 筛选状态 ==========
const statusFilter = ref('')

// ========== 数据 ==========
const orderList = ref([])
const stats = ref({
  totalCommission: 0,
  settledCommission: 0,
  pendingCommission: 0
})
const isLoading = ref(false)
const isRefreshing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// ========== 添加订单弹窗 ==========
const showAddPopup = ref(false)
const addForm = ref({
  orderNo: '',
  courseTitle: '',
  orderAmount: '',
  commissionRate: '30',
  platform: '',
  promoteCode: ''
})

// ========== 格式化金额 ==========
const formatPrice = (fen) => {
  if (!fen) return '0.00'
  return (fen / 100).toFixed(2)
}

// ========== 格式化日期 ==========
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 状态文本 ==========
const getStatusText = (status) => {
  const map = { pending: '待确认', confirmed: '已确认', settled: '已结算' }
  return map[status] || status
}

// ========== 设置筛选 ==========
const setFilter = async (status) => {
  statusFilter.value = status
  await loadData(true)
}

// ========== 加载数据 ==========
const loadData = async (refresh = false) => {
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
    orderList.value = []
  }

  if (!hasMore.value) return
  isLoading.value = true

  const [orderRes, statsRes] = await Promise.all([
    getAllOrders(statusFilter.value, currentPage.value, 20),
    getAllCommissionStats()
  ])

  if (orderRes.ok && orderRes.list) {
    if (refresh) {
      orderList.value = orderRes.list
    } else {
      orderList.value = [...orderList.value, ...orderRes.list]
    }
    hasMore.value = orderRes.list.length >= 20
    currentPage.value++
  }

  if (statsRes.ok && statsRes.data) {
    stats.value = statsRes.data
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

// ========== 修改订单状态 ==========
const changeStatus = (order) => {
  const statuses = ['pending', 'confirmed', 'settled']
  const currentIndex = statuses.indexOf(order.status)
  if (currentIndex === -1) return

  const nextIndex = (currentIndex + 1) % statuses.length
  const nextStatus = statuses[nextIndex]

  uni.showModal({
    title: '确认操作',
    content: `确定将订单状态修改为"${getStatusText(nextStatus)}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        const result = await updateOrderStatus(order._id, nextStatus)
        if (result.ok) {
          order.status = nextStatus
          uni.showToast({ title: '状态已更新', icon: 'success' })
        }
      }
    }
  })
}

// ========== 显示添加弹窗 ==========
const showAddOrder = () => {
  addForm.value = {
    orderNo: 'ORD' + Date.now(),
    courseTitle: '',
    orderAmount: '',
    commissionRate: '30',
    platform: '',
    promoteCode: ''
  }
  showAddPopup.value = true
}

// ========== 提交添加订单 ==========
const submitAddOrder = async () => {
  if (!addForm.value.courseTitle.trim()) {
    uni.showToast({ title: '请输入课程名称', icon: 'none' })
    return
  }
  if (!addForm.value.orderAmount) {
    uni.showToast({ title: '请输入订单金额', icon: 'none' })
    return
  }

  const amount = Math.round(parseFloat(addForm.value.orderAmount) * 100)
  const rate = parseFloat(addForm.value.commissionRate) || 30
  const commission = Math.round(amount * rate / 100)

  const result = await addOrder({
    orderNo: addForm.value.orderNo,
    courseTitle: addForm.value.courseTitle,
    platform: addForm.value.platform,
    promoteCode: addForm.value.promoteCode,
    orderAmount: amount,
    commission: commission,
    commissionRate: rate,
    status: 'pending'
  })

  if (result.ok) {
    showAddPopup.value = false
    uni.showToast({ title: '录入成功', icon: 'success' })
    await loadData(true)
  } else {
    uni.showToast({ title: '录入失败', icon: 'none' })
  }
}

// ========== 返回 ==========
const goBack = () => {
  uni.navigateBack()
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
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
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

.glass-nav__add {
  padding: 10rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 佣金概览 */
.stats-bar {
  position: fixed;
  top: calc(var(--status-bar-height, 0px) + 88rpx);
  left: 0;
  right: 0;
  height: 120rpx;
  background: $orange-gradient;
  z-index: 99;
  display: flex;
  align-items: center;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  margin-bottom: 8rpx;
}

.stats-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  &.success { color: #90EE90; }
  &.warning { color: #FFD700; }
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255,255,255,0.3);
}

/* 筛选标签 */
.filter-tabs {
  position: fixed;
  top: calc(var(--status-bar-height, 0px) + 88rpx + 120rpx);
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  z-index: 98;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 16rpx;
}

.filter-tab {
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: $text-secondary;
  background: #f5f5f5;
  transition: all 0.2s;
  &.active {
    background: $orange-gradient;
    color: #fff;
    font-weight: 600;
  }
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
  &.status--pending { background: rgba(255, 184, 0, 0.1); color: #ffb800; }
  &.status--confirmed { background: rgba(78, 205, 196, 0.1); color: #4ECDC4; }
  &.status--settled { background: rgba(7, 193, 96, 0.1); color: #07C160; }
}

.order-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.order-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.info-item {
  font-size: 22rpx;
  color: $text-muted;
}

.order-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-money {
  display: flex;
  gap: 16rpx;
}

.money-amount {
  font-size: 24rpx;
  color: $text-secondary;
}

.money-commission {
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

.order-time {
  font-size: 22rpx;
  color: $text-muted;
}

/* 骨架屏 */
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
    color: $text-secondary;
  }
}

.load-more {
  text-align: center;
  padding: 40rpx;
  font-size: 24rpx;
  color: $text-muted;
}

.bottom-spacer {
  height: 40rpx;
}

/* 添加订单弹窗 */
.add-order-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: relative;
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  animation: slideUpSheet 0.3s ease-out;
}

@keyframes slideUpSheet {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text {
    font-size: 36rpx;
    color: $text-muted;
  }
}

.popup-body {
  padding: 24rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.popup-item {
  margin-bottom: 24rpx;
}

.popup-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.popup-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.popup-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.popup-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;

  &.cancel {
    background: #f5f5f5;
    color: $text-secondary;
  }

  &.confirm {
    background: $orange-gradient;
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
  }
}
</style>
