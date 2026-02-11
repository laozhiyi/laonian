<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="glass-nav__title">
        <text class="brand-name">我的订单</text>
      </view>
      <view class="glass-nav__placeholder" />
    </view>

    <!-- 标签页 -->
    <view class="tabs" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
      <view
        class="tab"
        :class="{ 'tab--active': currentTab === 'all' }"
        @tap="switchTab('all')"
      >全部</view>
      <view
        class="tab"
        :class="{ 'tab--active': currentTab === 'shipped' }"
        @tap="switchTab('shipped')"
      >已发货</view>
      <view
        class="tab"
        :class="{ 'tab--active': currentTab === 'completed' }"
        @tap="switchTab('completed')"
      >已完成</view>
    </view>

    <!-- 滚动内容 -->
    <scroll-view
      class="scroll"
      :style="scrollStyle"
      scroll-y
      @scrolltolower="loadMore"
    >
      <!-- 骨架屏加载状态 -->
      <view class="skeleton-orders" v-if="ordersLoading && orderList.length === 0">
        <view class="skeleton-order-card" v-for="n in 3" :key="n">
          <view class="skeleton-header">
            <view class="skeleton-line long"></view>
            <view class="skeleton-line short"></view>
          </view>
          <view class="skeleton-goods">
            <view class="skeleton-goods-item" v-for="m in 2" :key="m">
              <view class="skeleton-image"></view>
              <view class="skeleton-text"></view>
            </view>
          </view>
          <view class="skeleton-footer">
            <view class="skeleton-line medium"></view>
          </view>
        </view>
      </view>

      <!-- 订单列表 -->
      <view class="order-list" v-else-if="orderList.length > 0">
        <view class="order-card" v-for="order in orderList" :key="order.id" @tap="goDetail(order.id)">
          <view class="order-card__header">
            <text class="order-card__no">订单号：{{ order.orderNo }}</text>
            <text class="order-card__status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </text>
          </view>

          <!-- 商品列表 -->
          <view class="order-card__goods">
            <view class="goods-item" v-for="(item, index) in (order.items || []).slice(0, 3)" :key="index">
              <image class="goods-item__cover" :src="item.cover" mode="aspectFill" />
              <view class="goods-item__info">
                <view class="goods-item__title">{{ item.title }}</view>
                <view class="goods-item__spec">{{ item.spec || '默认规格' }}</view>
                <view class="goods-item__row">
                  <text class="goods-item__price">¥{{ (item.price || 0).toFixed(2) }}</text>
                  <text class="goods-item__quantity">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
            <view class="goods-more" v-if="(order.items || []).length > 3">
              <text>查看更多商品 ({{ (order.items || []).length - 3 }})</text>
            </view>
          </view>

          <!-- 订单信息 -->
          <view class="order-card__footer">
            <text class="order-card__time">{{ formatTime(order.createdAt) }}</text>
            <view class="order-card__total">
              <text>共 {{ getTotalQuantity(order) }} 件商品，合计：</text>
              <text class="order-card__price">¥{{ (order.totalPrice || 0).toFixed(2) }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="order-card__actions" v-if="order.status === 'shipped'">
            <view class="btn btn--primary" @tap.stop="confirmReceive(order)">确认收货</view>
            <view class="btn btn--outline" @tap.stop="refund(order)">退货</view>
          </view>
          <view class="order-card__actions" v-if="order.status === 'completed'">
            <view class="btn btn--outline" @tap.stop="deleteOrderItem(order)">删除订单</view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text>{{ loading ? '加载中...' : '上拉加载更多' }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else-if="!loading">
        <view class="empty__icon">
          <!-- #ifdef H5 -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C7.55228 18 8 17.5523 8 17C8 16.4477 7.55228 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" stroke="currentColor" stroke-width="2"/>
            <path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" stroke="currentColor" stroke-width="2"/>
            <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H18.4C18.8693 16.009 19.3268 15.8526 19.6925 15.5583C20.0581 15.264 20.3086 14.8504 20.4 14.39L22 6H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- #endif -->
          <!-- #ifdef MP-WEIXIN -->
          <image src="/static/icons/cart.png" mode="aspectFit" />
          <!-- #endif -->
        </view>
        <text class="empty__text">暂无订单</text>
        <text class="empty__tip">快去商城逛逛吧</text>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders, confirmOrder, refundOrder } from '@/utils/order.js'
import { deleteOrder as deleteOrderApi } from '@/utils/order.js'
import { ORDER_STATUS_TEXT } from '@/utils/order.js'
import { getWithCache, removeCache } from '@/utils/cache.js'

// 清除订单缓存
const clearOrdersCache = () => {
  removeCache('orders_list_all')
  removeCache('orders_list_pending')
  removeCache('orders_list_shipped')
  removeCache('orders_list_completed')
  removeCache('orders_list_refunded')
}

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const headerHeight = computed(() => navHeight.value)

// ========== 订单数据 ==========
const orderList = ref([])
const currentTab = ref('all')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)
const ordersLoading = ref(false)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navHeight.value + 88) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navHeight.value + 88 + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
}))

// ========== 获取订单列表 ==========
const getOrdersList = async () => {
  const cacheKey = `orders_list_${currentTab.value}`
  const res = await getOrders({ status: currentTab.value !== 'all' ? currentTab.value : undefined })
  return res
}

const loadOrders = async (refresh = false) => {
  if (refresh) {
    // 清除缓存，强制刷新
    removeCache(`orders_list_${currentTab.value}`)
    page.value = 1
    hasMore.value = true
    orderList.value = []
  }

  if (!hasMore.value && !refresh) return

  ordersLoading.value = true
  try {
    const res = await getWithCache(
      `orders_list_${currentTab.value}`,
      getOrdersList,
      1 * 60 * 1000 // 缓存1分钟
    )

    if (res && res.list) {
      // 过滤掉已删除的订单
      const validOrders = (res.list || []).filter(order => !order.deleted)

      if (refresh) {
        orderList.value = validOrders
      } else {
        orderList.value = [...orderList.value, ...validOrders]
      }

      if (validOrders.length < pageSize.value) {
        hasMore.value = false
      } else {
        page.value++
      }
    } else {
      hasMore.value = false
    }
  } catch (e) {
    console.error('加载订单失败:', e)
    hasMore.value = false
  } finally {
    ordersLoading.value = false
  }
}

// ========== 加载更多 ==========
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadOrders()
  }
}

// ========== 切换标签 ==========
const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  orderList.value = []
  loadOrders(true)
}

// ========== 状态文本 ==========
const getStatusText = (status) => {
  return ORDER_STATUS_TEXT[status] || status
}

const getStatusClass = (status) => {
  const map = {
    paid: 'status--paid',
    shipped: 'status--shipped',
    completed: 'status--completed',
  }
  return map[status] || ''
}

// ========== 计算商品总数 ==========
const getTotalQuantity = (order) => {
  if (order.totalQuantity) return order.totalQuantity
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }
  return 0
}

// ========== 时间格式化 ==========
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 交互方法 ==========
const goBack = () => {
  uni.switchTab({ url: '/pages/me/me' })
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

const confirmReceive = (order) => {
  uni.showModal({
    title: '确认收货',
    content: '请确认已收到商品',
    success: async (res) => {
      if (res.confirm) {
        const result = await confirmOrder(order.id)
        if (result.ok) {
          uni.showToast({ title: '确认收货成功', icon: 'success' })
          clearOrdersCache()
          loadOrders(true)
        } else {
          uni.showToast({ title: result.message || '确认失败', icon: 'none' })
        }
      }
    }
  })
}

const refund = (order) => {
  uni.showModal({
    title: '退货确认',
    content: '确定要退货吗？退货后订单将被取消',
    success: async (res) => {
      if (res.confirm) {
        const result = await refundOrder(order.id)
        if (result.ok) {
          uni.showToast({ title: '退货成功', icon: 'success' })
          clearOrdersCache()
          loadOrders(true)
        } else {
          uni.showToast({ title: result.message || '退货失败', icon: 'none' })
        }
      }
    }
  })
}

const deleteOrderItem = (order) => {
  uni.showModal({
    title: '删除订单',
    content: '确定要删除该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        const result = await deleteOrderApi(order.id)
        if (result.ok) {
          uni.showToast({ title: '删除成功', icon: 'success' })
          clearOrdersCache()
          loadOrders(true)
        } else {
          uni.showToast({ title: result.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadOrders(true)
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$primary-light: #FFB347;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #7A7A7A;
$bg: #FFF9F3;

// 动画定义
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.page {
  min-height: 100vh;
  background: $bg;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 56rpx;
  color: $text;
  padding: 0 8rpx;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.9);
  }
}

.glass-nav__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.glass-nav__placeholder {
  width: 72rpx;
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
  letter-spacing: 2rpx;
}

.header__title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 56rpx;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.header__placeholder {
  width: 56rpx;
}

/* 标签页 */
.tabs {
  position: fixed;
  top: 88rpx;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
  z-index: 99;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.tab {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: $sub;
  padding: 28rpx 0;
  position: relative;
  font-weight: 500;
  transition: all 0.3s ease;

  &:active {
    opacity: 0.7;
  }

  &--active {
    color: $primary;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 12rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 56rpx;
      height: 6rpx;
      background: linear-gradient(90deg, $primary, $primary-light);
      border-radius: 3rpx;
    }
  }
}

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 骨架屏 */
.skeleton-orders {
  padding: 24rpx 28rpx;
}

.skeleton-order-card {
  background: #fff;
  border-radius: 28rpx;
  margin-bottom: 28rpx;
  overflow: hidden;
  padding: 24rpx;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.skeleton-line {
  height: 28rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.long { width: 60%; }
  &.short { width: 30%; }
  &.medium { width: 40%; }
}

.skeleton-goods {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.skeleton-goods-item {
  flex: 1;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 24rpx;
  margin-top: 12rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 订单列表 */
.order-list {
  padding: 24rpx 28rpx;
}

.order-card {
  background: #fff;
  border-radius: 28rpx;
  margin-bottom: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05),
              0 2rpx 14rpx rgba(0, 0, 0, 0.02),
              inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s ease-out;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  }
}

.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
  background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
}

.order-card__no {
  font-size: 26rpx;
  color: $sub;
  letter-spacing: 0.5rpx;
}

.order-card__status {
  font-size: 30rpx;
  font-weight: 600;

  &.status--paid { color: $primary; }
  &.status--shipped { color: #34C759; }
  &.status--completed { color: $sub; }
}

/* 商品列表 */
.order-card__goods {
  padding: 0 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 144, 0, 0.02);
    margin: 0 -24rpx;
    padding-left: 24rpx;
    padding-right: 24rpx;
  }

  &:last-child {
    border-bottom: none;
  }
}

.goods-item__cover {
  width: 152rpx;
  height: 152rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.goods-item__info {
  flex: 1;
  margin-left: 24rpx;
}

.goods-item__title {
  font-size: 28rpx;
  color: $text;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.goods-item__spec {
  font-size: 24rpx;
  color: $sub;
  margin-bottom: 16rpx;
}

.goods-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-item__price {
  font-size: 32rpx;
  color: $primary;
  font-weight: 600;
  text-shadow: 0 2rpx 6rpx rgba(255, 144, 0, 0.15);
}

.goods-item__quantity {
  font-size: 26rpx;
  color: $sub;
}

.goods-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: $sub;
  background: linear-gradient(180deg, transparent, rgba(255, 144, 0, 0.02));
  margin: 0 -24rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
}

/* 订单底部 */
.order-card__footer {
  padding: 24rpx;
  border-top: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #fafafa, #f8f8f8);
}

.order-card__time {
  font-size: 24rpx;
  color: $sub;
}

.order-card__total {
  display: flex;
  align-items: baseline;
  font-size: 26rpx;
  color: $text;
}

.order-card__price {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
  text-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.2);
}

/* 操作按钮 */
.order-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20rpx 24rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
  background: linear-gradient(180deg, #fff, #fafafa);
}

.btn {
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-left: 20rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--outline {
    border: 1rpx solid $sub;
    color: $sub;
    background: #fff;

    &:active {
      background: #f5f5f5;
      border-color: darken($sub, 10%);
    }
  }

  &--primary {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    box-shadow: 0 6rpx 20rpx rgba(255, 144, 0, 0.35);

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 14rpx rgba(255, 144, 0, 0.3);
    }
  }
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 28rpx;
  font-size: 26rpx;
  color: $sub;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0 80rpx;
  animation: slideUp 0.6s ease-out;
}

.empty__icon {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 32rpx;
  color: $sub;
  opacity: 0.3;
  animation: fadeIn 0.5s ease-out;

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty__text {
  font-size: 32rpx;
  color: $text;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.empty__tip {
  font-size: 26rpx;
  color: $sub;
  letter-spacing: 1rpx;
}

/* 底部安全区 */
.bottom-safe {
  height: 60rpx;
}
</style>
