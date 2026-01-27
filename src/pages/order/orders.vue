<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">我的订单</text>
      <view class="header__placeholder" />
    </view>

    <!-- 标签页 -->
    <view class="tabs" :style="{ top: (statusBarHeight + 88) + 'px' }">
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
      <!-- 订单列表 -->
      <view class="order-list" v-if="orderList.length > 0">
        <view class="order-card" v-for="order in orderList" :key="order.id" @tap="goDetail(order.id)">
          <view class="order-card__header">
            <text class="order-card__no">订单号：{{ order.orderNo }}</text>
            <text class="order-card__status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </text>
          </view>

          <!-- 商品列表 -->
          <view class="order-card__goods">
            <view class="goods-item" v-for="(item, index) in order.items.slice(0, 3)" :key="index">
              <image class="goods-item__cover" :src="item.cover" mode="aspectFill" />
              <view class="goods-item__info">
                <view class="goods-item__title">{{ item.title }}</view>
                <view class="goods-item__spec">{{ item.spec || '默认规格' }}</view>
                <view class="goods-item__row">
                  <text class="goods-item__price">¥{{ item.price.toFixed(2) }}</text>
                  <text class="goods-item__quantity">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
            <view class="goods-more" v-if="order.items.length > 3">
              <text>查看更多商品 ({{ order.items.length - 3 }})</text>
            </view>
          </view>

          <!-- 订单信息 -->
          <view class="order-card__footer">
            <text class="order-card__time">{{ formatTime(order.createdAt) }}</text>
            <view class="order-card__total">
              <text>共 {{ getTotalQuantity(order) }} 件商品，合计：</text>
              <text class="order-card__price">¥{{ order.totalPrice.toFixed(2) }}</text>
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
        <text class="empty__icon">📦</text>
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

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const headerHeight = ref(88)

// ========== 订单数据 ==========
const orderList = ref([])
const currentTab = ref('all')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + headerHeight.value + 88) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + headerHeight.value + 88 + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
}))

// ========== 获取订单列表 ==========
const loadOrders = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    hasMore.value = true
    orderList.value = []
  }

  if (!hasMore.value) return

  loading.value = true
  const params = {
    page: page.value,
    size: pageSize.value,
  }
  if (currentTab.value !== 'all') {
    params.status = currentTab.value
  }

  const res = await getOrders(params)
  loading.value = false

  if (res.ok) {
    if (res.list.length < pageSize.value) {
      hasMore.value = false
    }
    orderList.value = [...orderList.value, ...res.list]
    page.value++
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
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
}

/* 顶部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 100;
}

.header__back {
  font-size: 48rpx;
  color: #fff;
  padding: 0 8rpx;
}

.header__title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 48rpx;
}

.header__placeholder {
  width: 48rpx;
}

/* 标签页 */
.tabs {
  position: fixed;
  top: 88rpx;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
  z-index: 99;
}

.tab {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: $sub;
  padding: 20rpx 0;
  position: relative;

  &--active {
    color: $primary;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background: $primary;
      border-radius: 3rpx;
    }
  }
}

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 订单列表 */
.order-list {
  padding: 16rpx 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-card__no {
  font-size: 24rpx;
  color: $sub;
}

.order-card__status {
  font-size: 26rpx;
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
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.goods-item__cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.goods-item__info {
  flex: 1;
  margin-left: 20rpx;
}

.goods-item__title {
  font-size: 26rpx;
  color: $text;
  line-height: 1.4;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-item__spec {
  font-size: 22rpx;
  color: $sub;
  margin-bottom: 12rpx;
}

.goods-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-item__price {
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
}

.goods-item__quantity {
  font-size: 24rpx;
  color: $sub;
}

.goods-more {
  text-align: center;
  padding: 16rpx 0;
  font-size: 24rpx;
  color: $sub;
}

/* 订单底部 */
.order-card__footer {
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-card__time {
  font-size: 22rpx;
  color: $sub;
}

.order-card__total {
  display: flex;
  align-items: baseline;
  font-size: 24rpx;
  color: $text;
}

.order-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

/* 操作按钮 */
.order-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16rpx 24rpx 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.btn {
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  margin-left: 16rpx;

  &--outline {
    border: 1rpx solid $sub;
    color: $sub;
  }

  &--primary {
    background: linear-gradient(135deg, $primary, #FFB347);
    color: #fff;
  }
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: $sub;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0 60rpx;
}

.empty__icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty__text {
  font-size: 30rpx;
  color: $text;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty__tip {
  font-size: 24rpx;
  color: $sub;
}

/* 底部安全区 */
.bottom-safe {
  height: 40rpx;
}
</style>
