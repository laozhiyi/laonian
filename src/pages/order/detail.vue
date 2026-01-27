<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">订单详情</text>
      <view class="header__placeholder" />
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 订单状态 -->
      <view class="section status-section">
        <view class="status-card" :class="getStatusClass(orderInfo.status)">
          <text class="status-card__icon">{{ getStatusIcon(orderInfo.status) }}</text>
          <view class="status-card__info">
            <text class="status-card__title">{{ getStatusText(orderInfo.status) }}</text>
            <text class="status-card__desc">{{ getStatusDesc(orderInfo.status) }}</text>
          </view>
        </view>
      </view>

      <!-- 收货地址 -->
      <view class="section address-section" v-if="orderInfo.address">
        <view class="section-title">收货地址</view>
        <view class="address-card">
          <view class="address-card__top">
            <text class="address-card__name">{{ orderInfo.address.name }}</text>
            <text class="address-card__phone">{{ formatPhone(orderInfo.address.phone) }}</text>
            <text class="address-card__tag" v-if="orderInfo.address.isDefault">默认</text>
          </view>
          <view class="address-card__detail">
            {{ orderInfo.address.detail }}
          </view>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="section goods-section">
        <view class="section-title">商品信息</view>
        <view class="goods-list">
          <view class="goods-item" v-for="(item, index) in orderInfo.items" :key="index">
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
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section order-section">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="info-row__label">订单编号</text>
          <text class="info-row__value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label">下单时间</text>
          <text class="info-row__value">{{ formatTime(orderInfo.createdAt) }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label">订单状态</text>
          <text class="info-row__value" :class="getStatusClass(orderInfo.status)">{{ getStatusText(orderInfo.status) }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.paidAt">
          <text class="info-row__label">支付时间</text>
          <text class="info-row__value">{{ formatTime(orderInfo.paidAt) }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.shippedAt">
          <text class="info-row__label">发货时间</text>
          <text class="info-row__value">{{ formatTime(orderInfo.shippedAt) }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.completedAt">
          <text class="info-row__label">完成时间</text>
          <text class="info-row__value">{{ formatTime(orderInfo.completedAt) }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.remark">
          <text class="info-row__label">订单备注</text>
          <text class="info-row__value">{{ orderInfo.remark }}</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="section price-section">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="price-row__label">商品金额</text>
          <text class="price-row__value">¥{{ orderInfo.totalPrice.toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="price-row__label">运费</text>
          <text class="price-row__value price-row__value--free">免运费</text>
        </view>
        <view class="price-row price-row--total">
          <text class="price-row__label">实付金额</text>
          <text class="price-row__value price-row__value--primary">¥{{ orderInfo.totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-safe" v-if="showActionBar" />
      <view class="action-bar" v-if="showActionBar" :style="actionBarStyle">
        <view
          class="action-bar__btn action-bar__btn--primary"
          v-if="orderInfo.status === 'shipped'"
          @tap="confirmReceive"
        >确认收货</view>
        <view
          class="action-bar__btn action-bar__btn--outline"
          v-if="orderInfo.status === 'shipped'"
          @tap="refund"
        >退货</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrderDetail, confirmOrder, refundOrder } from '@/utils/order.js'
import { ORDER_STATUS_TEXT } from '@/utils/order.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const headerHeight = ref(88)

// ========== 订单数据 ==========
const orderInfo = ref({
  id: '',
  orderNo: '',
  status: '',
  totalPrice: 0,
  totalQuantity: 0,
  items: [],
  address: null,
  remark: '',
  createdAt: '',
  paidAt: '',
  shippedAt: '',
  completedAt: '',
})

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + headerHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + headerHeight.value + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
}))

// ========== 底部操作栏样式 ==========
const actionBarStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    paddingBottom: (safeBottom + 20) + 'px'
  }
})

// ========== 是否显示操作栏 ==========
const showActionBar = computed(() => {
  return orderInfo.value.status === 'shipped'
})

// ========== 加载订单详情 ==========
const loadOrderDetail = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id

  if (!id) {
    uni.showToast({ title: '订单不存在', icon: 'none' })
    return
  }

  uni.showLoading({ title: '加载中...' })
  const res = await getOrderDetail(id)
  uni.hideLoading()

  if (res.ok && res.data) {
    orderInfo.value = res.data
  } else {
    uni.showToast({ title: res.message || '获取订单详情失败', icon: 'none' })
  }
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

const getStatusIcon = (status) => {
  const map = {
    paid: '📦',
    shipped: '📦',
    completed: '🎉',
  }
  return map[status] || '📋'
}

const getStatusDesc = (status) => {
  const map = {
    paid: '商家已发货，等待收货',
    shipped: '商家已发货，等待收货',
    completed: '订单已完成',
  }
  return map[status] || ''
}

// ========== 时间格式化 ==========
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 手机号脱敏 ==========
const formatPhone = (phone) => {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// ========== 交互方法 ==========
const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length >= 2) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/order/orders' })
  }
}

const confirmReceive = () => {
  uni.showModal({
    title: '确认收货',
    content: '请确认已收到商品',
    success: async (res) => {
      if (res.confirm) {
        const result = await confirmOrder(orderInfo.value.id)
        if (result.ok) {
          uni.showToast({ title: '确认收货成功', icon: 'success' })
          loadOrderDetail()
        } else {
          uni.showToast({ title: result.message || '确认失败', icon: 'none' })
        }
      }
    }
  })
}

const refund = () => {
  uni.showModal({
    title: '退货确认',
    content: '确定要退货吗？退货后订单将被取消',
    success: async (res) => {
      if (res.confirm) {
        const result = await refundOrder(orderInfo.value.id)
        if (result.ok) {
          uni.showToast({ title: '退货成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: result.message || '退货失败', icon: 'none' })
        }
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadOrderDetail()
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

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 区块通用 */
.section {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
  padding: 24rpx 24rpx 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

/* 订单状态 */
.status-card {
  display: flex;
  align-items: center;
  padding: 40rpx 24rpx;

  &.status--paid {
    background: linear-gradient(135deg, $primary, #FFB347);
    color: #fff;
  }
  &.status--shipped {
    background: linear-gradient(135deg, #34C759, #5AC8FA);
    color: #fff;
  }
  &.status--completed {
    background: linear-gradient(135deg, $sub, #8E8E93);
    color: #fff;
  }
}

.status-card__icon {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.status-card__title {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.status-card__desc {
  font-size: 24rpx;
  opacity: 0.9;
}

/* 收货地址 */
.address-card {
  padding: 24rpx;
}

.address-card__top {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.address-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text;
  margin-right: 16rpx;
}

.address-card__phone {
  font-size: 28rpx;
  color: $sub;
  margin-right: 16rpx;
}

.address-card__tag {
  font-size: 20rpx;
  color: #fff;
  background: $primary;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.address-card__detail {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.5;
}

/* 商品列表 */
.goods-list {
  padding: 0 24rpx 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.goods-item__cover {
  width: 120rpx;
  height: 120rpx;
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

/* 订单信息 */
.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.info-row__label {
  font-size: 26rpx;
  color: $sub;
  flex-shrink: 0;
  width: 160rpx;
}

.info-row__value {
  font-size: 26rpx;
  color: $text;
  text-align: right;
  flex: 1;

  &.status--paid { color: $primary; }
  &.status--shipped { color: #34C759; }
  &.status--completed { color: $sub; }
}

/* 价格信息 */
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.price-row__label {
  font-size: 26rpx;
  color: $sub;
}

.price-row__value {
  font-size: 26rpx;
  color: $text;

  &--free {
    color: $primary;
  }

  &--primary {
    font-size: 32rpx;
    font-weight: 700;
    color: $primary;
  }
}

.price-row--total {
  padding: 24rpx;
  background: #fafafa;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24rpx;
  padding-left: 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.action-bar__btn {
  padding: 20rpx 40rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
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

/* 底部安全区 */
.bottom-safe {
  height: 140rpx;
}
</style>
