<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="glass-nav__title">
        <text class="brand-name">订单详情</text>
      </view>
      <view class="glass-nav__placeholder" />
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 订单状态 -->
      <view class="section status-section">
        <view class="status-card" :class="getStatusClass(orderInfo.status)">
          <view class="status-card__icon">
            <!-- #ifdef H5 -->
            <svg v-if="orderInfo.status === 'pending'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else-if="orderInfo.status === 'shipped'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 12C13.5 12 15 10.5 15 9C15 7.5 13.5 6 12 6C10.5 6 9 7.5 9 9C9 10.5 10.5 12 12 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="orderInfo.status === 'completed'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="orderInfo.status === 'refunded'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <!-- #endif -->
            <!-- #ifdef MP-WEIXIN -->
            <text v-if="orderInfo.status === 'pending'" class="status-symbol">&#x23F0;</text>
            <text v-else-if="orderInfo.status === 'shipped'" class="status-symbol">&#x1F69B;</text>
            <text v-else-if="orderInfo.status === 'completed'" class="status-symbol">&#x2714;</text>
            <text v-else-if="orderInfo.status === 'refunded'" class="status-symbol">&#x274C;</text>
            <text v-else class="status-symbol">&#x2714;</text>
            <!-- #endif -->
            <!-- #ifdef APP-PLUS -->
            <text v-if="orderInfo.status === 'pending'" class="status-symbol">&#x23F0;</text>
            <text v-else-if="orderInfo.status === 'shipped'" class="status-symbol">&#x1F69B;</text>
            <text v-else-if="orderInfo.status === 'completed'" class="status-symbol">&#x2714;</text>
            <text v-else-if="orderInfo.status === 'refunded'" class="status-symbol">&#x274C;</text>
            <text v-else class="status-symbol">&#x2714;</text>
            <!-- #endif -->
          </view>
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
        <view class="goods-list" v-if="orderInfo.items && orderInfo.items.length > 0">
          <view class="goods-item" v-for="(item, index) in orderInfo.items" :key="index">
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
        </view>
        <view class="goods-empty" v-else-if="hasLoaded">
          <text class="goods-empty__text">暂无商品信息</text>
        </view>
        <view class="goods-empty" v-else>
          <text class="goods-empty__text">加载中...</text>
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
      <view class="section price-section" :class="{ 'price-section--last': !showActionBar }">
        <view class="section-title">价格明细</view>
        <view class="price-row">
          <text class="price-row__label">商品金额</text>
          <text class="price-row__value">¥{{ (orderInfo.totalPrice || 0).toFixed(2) }}</text>
        </view>
        <view class="price-row">
          <text class="price-row__label">运费</text>
          <text class="price-row__value price-row__value--free">免运费</text>
        </view>
        <view class="price-row price-row--total">
          <text class="price-row__label">实付金额</text>
          <text class="price-row__value price-row__value--primary">¥{{ (orderInfo.totalPrice || 0).toFixed(2) }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view
            class="action-btn action-btn--primary"
            v-if="orderInfo.status === 'pending'"
            @tap="confirmReceive"
          >确认收货</view>
          <view
            class="action-btn action-btn--outline"
            v-if="orderInfo.status === 'pending' || orderInfo.status === 'shipped'"
            @tap="refund"
          >退货</view>
          <!-- 退货后显示删除按钮 -->
          <view
            class="action-btn action-btn--danger"
            v-if="orderInfo.status === 'refunded'"
            @tap="handleDeleteOrder"
          >删除订单</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, confirmOrder, refundOrder, deleteOrder as utilsDeleteOrder } from '@/utils/order.js'
import { ORDER_STATUS_TEXT } from '@/utils/order.js'

// 包装删除订单函数，避免命名冲突
const deleteOrderFromUtils = utilsDeleteOrder

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const headerHeight = computed(() => navHeight.value)

// ========== 订单ID ==========
const orderId = ref('')

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

// ========== 加载状态 ==========
const hasLoaded = ref(false)

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
  return orderInfo.value.status === 'shipped' || orderInfo.value.status === 'refunded'
})

// ========== 加载订单详情 ==========
const loadOrderDetail = async () => {
  if (!orderId.value) {
    console.log('订单ID不存在')
    uni.showToast({ title: '订单不存在', icon: 'none' })
    hasLoaded.value = true
    return
  }

  console.log('开始加载订单详情, id:', orderId.value)
  uni.showLoading({ title: '加载中...' })

  try {
    const res = await getOrderDetail(orderId.value)
    uni.hideLoading()
    hasLoaded.value = true

    console.log('订单详情返回:', res)

    if (res.ok && res.data) {
      // 处理 uniCloud 返回数组格式的情况
      let orderData = res.data
      if (Array.isArray(res.data) && res.data.length > 0) {
        orderData = res.data[0]
      }

      orderInfo.value = {
        ...orderData,
        items: orderData.items || []
      }
      console.log('订单数据已设置:', orderInfo.value)
    } else {
      uni.showToast({ title: res.message || '获取订单详情失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    hasLoaded.value = true
    console.error('加载订单详情出错:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// ========== onLoad 获取参数 ==========
onLoad((options) => {
  orderId.value = options?.id || ''
  if (orderId.value) {
    loadOrderDetail()
  } else {
    uni.showToast({ title: '订单不存在', icon: 'none' })
    hasLoaded.value = true
  }
})

// ========== 状态文本 ==========
const getStatusText = (status) => {
  return ORDER_STATUS_TEXT[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'status--paid',
    shipped: 'status--shipped',
    completed: 'status--completed',
    refunded: 'status--refunded',
  }
  return map[status] || ''
}

const getStatusDesc = (status) => {
  const map = {
    pending: '等待商家发货',
    shipped: '商家已发货，等待收货',
    completed: '订单已完成',
    refunded: '已退货退款',
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
    uni.navigateTo({ url: '/pages/order/orders' })
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
    content: '确定要退货吗？退货后库存将恢复',
    success: async (res) => {
      if (res.confirm) {
        const refundRes = await refundOrder(orderInfo.value.id)
        if (refundRes.ok) {
          uni.showToast({ title: '退货成功', icon: 'success' })
          loadOrderDetail()
        } else {
          uni.showToast({ title: refundRes.message || '退货失败', icon: 'none' })
        }
      }
    }
  })
}

// 删除订单
const handleDeleteOrder = () => {
  uni.showModal({
    title: '删除订单',
    content: '确定要删除该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        const result = await deleteOrderFromUtils(orderInfo.value.id)
        if (result.ok) {
          uni.showToast({ title: '订单已删除', icon: 'success' })
          setTimeout(() => {
            // 使用 reLaunch 跳转到订单列表，强制刷新数据
            uni.reLaunch({ url: '/pages/order/orders' })
          }, 1500)
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

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 区块通用 */
.section {
  background: #fff;
  margin: 24rpx;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05),
              0 2rpx 14rpx rgba(0, 0, 0, 0.02),
              inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
  animation: slideUp 0.5s ease-out;
}

.price-section--last {
  margin-bottom: 0;
  border-radius: 28rpx 28rpx 0 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  padding: 28rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  letter-spacing: 1rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 18rpx;
    left: 28rpx;
    width: 48rpx;
    height: 4rpx;
    background: linear-gradient(90deg, $primary, $primary-light);
    border-radius: 2rpx;
  }
}

/* 订单状态 */
.status-card {
  display: flex;
  align-items: center;
  padding: 52rpx 32rpx;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -30%;
    width: 240rpx;
    height: 240rpx;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  &.status--paid {
    background: linear-gradient(135deg, $primary 0%, #FFB347 50%, #FFCC80 100%);
    color: #fff;
  }
  &.status--shipped {
    background: linear-gradient(135deg, #34C759 0%, #5AC8FA 100%);
    color: #fff;
  }
  &.status--completed {
    background: linear-gradient(135deg, $sub 0%, #8E8E93 100%);
    color: #fff;
  }
  &.status--refunded {
    background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
    color: #fff;
  }
}

.status-card__icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

  svg {
    width: 44rpx;
    height: 44rpx;
  }

  image {
    width: 44rpx;
    height: 44rpx;
  }
}

.status-card__title {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
}

.status-card__desc {
  font-size: 28rpx;
  opacity: 0.9;
}

/* 收货地址 */
.address-card {
  padding: 28rpx;
}

.address-card__top {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.address-card__name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text;
  margin-right: 20rpx;
}

.address-card__phone {
  font-size: 30rpx;
  color: $sub;
  margin-right: 20rpx;
}

.address-card__tag {
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.3);
}

.address-card__detail {
  font-size: 28rpx;
  color: $text-body;
  line-height: 1.6;
}

/* 商品列表 */
.goods-list {
  padding: 0 24rpx 24rpx;
}

.goods-empty {
  padding: 48rpx 24rpx;
  text-align: center;

  &__text {
    font-size: 26rpx;
    color: $sub;
  }
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
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
  width: 132rpx;
  height: 132rpx;
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
  margin-bottom: 12rpx;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 订单信息 */
.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(255, 144, 0, 0.02);
  }
}

.info-row__label {
  font-size: 28rpx;
  color: $sub;
  flex-shrink: 0;
  width: 160rpx;
}

.info-row__value {
  font-size: 28rpx;
  color: $text;
  text-align: right;
  flex: 1;
  font-weight: 500;
  word-break: break-all;

  &.status--paid { color: $primary; font-weight: 600; }
  &.status--shipped { color: #34C759; font-weight: 600; }
  &.status--completed { color: $sub; }
  &.status--refunded { color: #ff3b30; font-weight: 600; }
}

/* 价格信息 */
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.price-row__label {
  font-size: 28rpx;
  color: $sub;
}

.price-row__value {
  font-size: 28rpx;
  color: $text;
  font-weight: 500;

  &--free {
    color: $primary;
    font-weight: 600;
  }

  &--primary {
    font-size: 36rpx;
    font-weight: 700;
    color: $primary;
    text-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.2);
  }
}

.price-row--total {
  padding: 28rpx;
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  border-top: 1rpx solid #f5f5f5;
  margin-top: 20rpx;
}

.action-btn {
  padding: 24rpx 48rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--primary {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(255, 144, 0, 0.35);

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 20rpx rgba(255, 144, 0, 0.3);
    }
  }

  &--outline {
    background: #fff;
    color: $text;
    border: 2rpx solid #e8e8e8;

    &:active {
      background: #f5f5f5;
      border-color: #ddd;
    }
  }

  &--danger {
    background: #fff;
    color: #ff3b30;
    border: 2rpx solid #ff3b30;

    &:active {
      background: rgba(255, 59, 48, 0.1);
      border-color: #ff3b30;
    }
  }
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160rpx;
  background: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0 24rpx;
  padding-left: 40rpx;
  padding-top: 24rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1),
              0 -2rpx 16rpx rgba(0, 0, 0, 0.04);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 24rpx;
    right: 24rpx;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 144, 0, 0.2), transparent);
  }
}

.action-bar__btn {
  padding: 24rpx 48rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
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
      transform: scale(0.95);
    }
  }

  &--primary {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    box-shadow: 0 6rpx 24rpx rgba(255, 144, 0, 0.4);

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
    }
  }
}

/* 小程序状态符号样式 */
.status-symbol {
  font-size: 44rpx;
  line-height: 1;
  font-family: 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif;
}

/* 底部安全区 */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}
</style>
