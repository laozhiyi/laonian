<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="header__title">确认订单</text>
      <view class="header__placeholder" />
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 收货地址 -->
      <view class="section address-section">
        <view class="section-title">收货地址</view>
        <view
          class="address-card"
          :class="{ 'address-card--empty': !selectedAddress }"
          @tap="chooseAddress"
        >
          <template v-if="selectedAddress">
            <view class="address-card__top">
              <view class="address-card__name">{{ selectedAddress.name }}</view>
              <view class="address-card__phone">{{ selectedAddress.phone }}</view>
              <view class="address-card__tag" v-if="selectedAddress.isDefault">默认</view>
            </view>
            <view class="address-card__detail">
              {{ selectedAddress.detail }}
            </view>
            <view class="address-card__arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </view>
          </template>
          <template v-else>
            <view class="address-card__empty">
              <view class="address-card__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </view>
              <text class="address-card__empty-text">请添加收货地址</text>
              <view class="address-card__empty-arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </view>
            </view>
          </template>
        </view>
      </view>

      <!-- 订单商品 -->
      <view class="section goods-section">
        <view class="section-title">订单商品</view>
        <view class="goods-list">
          <view class="goods-item" v-for="item in cartList" :key="item.id">
            <image class="goods-item__cover" :src="item.cover" mode="aspectFill" />
            <view class="goods-item__info">
              <view class="goods-item__title">{{ item.title }}</view>
              <view class="goods-item__row">
                <view class="goods-item__price">¥{{ item.price.toFixed(2) }}</view>
                <view class="goods-item__quantity">x{{ item.quantity }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="section remark-section">
        <view class="section-title">订单备注</view>
        <textarea
          class="remark-input"
          v-model="remark"
          placeholder="选填，请输入备注信息"
          placeholder-class="remark-placeholder"
          :maxlength="200"
        />
      </view>

      <!-- 订单信息 -->
      <view class="section info-section">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="info-row__label">商品金额</text>
          <text class="info-row__value">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label">运费</text>
          <text class="info-row__value info-row__value--free">免运费</text>
        </view>
        <view class="info-row info-row--total">
          <text class="info-row__label">合计</text>
          <text class="info-row__value info-row__value--primary">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="submit-bar" :style="submitBarStyle">
      <view class="submit-bar__total">
        <text class="submit-bar__label">合计：</text>
        <text class="submit-bar__price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <view class="submit-bar__btn" @tap="submitOrder">
        <text>提交订单</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCart, clearCart, getLocalCart, clearLocalCart, getLocalCart as getLocalCartFunc } from '@/utils/cart.js'
import { createOrder } from '@/utils/order.js'
import { getDefaultAddress, getLocalAddresses } from '@/utils/address.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const headerHeight = ref(88)

// ========== 购物车数据 ==========
const cartList = ref([])
const totalPrice = ref(0)

// ========== 收货地址 ==========
const selectedAddress = ref(null)

// ========== 订单备注 ==========
const remark = ref('')

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: headerHeight.value + 'px',
  height: 'calc(100vh - ' + (headerHeight.value + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
}))

// ========== 提交栏样式 ==========
const submitBarStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    paddingBottom: (safeBottom + 20) + 'px'
  }
})

// ========== 加载数据 ==========
const loadData = async () => {
  // 加载购物车
  const cartRes = await getCart()
  cartList.value = cartRes.list || []
  totalPrice.value = cartRes.totalPrice || 0

  // 如果本地购物车有数据，也加载
  if (cartList.value.length === 0) {
    const localCart = getLocalCartFunc()
    cartList.value = localCart.list || []
    totalPrice.value = localCart.totalPrice || 0
  }

  // 加载默认地址
  loadAddress()
}

const loadAddress = async () => {
  // 先检查是否有选中的地址
  const selected = uni.getStorageSync('selected_address')
  if (selected) {
    try {
      const addr = JSON.parse(selected)
      // 确保使用的是后端返回的真实 MongoDB ObjectId
      if (addr._id) {
        addr.id = addr._id
      }
      selectedAddress.value = addr
      uni.removeStorageSync('selected_address')
      return
    } catch {}
  }

  // 从服务器获取默认地址
  const addrRes = await getDefaultAddress()
  if (addrRes.ok && addrRes.data) {
    selectedAddress.value = addrRes.data
  } else {
    // 从本地存储获取（兜底）
    const list = getLocalAddresses()
    if (list.length > 0) {
      selectedAddress.value = list.find(a => a.isDefault) || list[0]
    }
  }
}

// ========== 交互方法 ==========
const goBack = () => {
  uni.navigateBack()
}

const chooseAddress = () => {
  uni.navigateTo({ url: '/pages/address/address' })
}

const submitOrder = async () => {
  // 验证地址
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  // 验证购物车
  if (cartList.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认支付',
    content: `共 ${cartList.value.length} 件商品，合计 ¥${totalPrice.value.toFixed(2)}`,
    confirmText: '立即支付',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '支付中...' })

        try {
          const orderRes = await createOrder({
            cartItemIds: cartList.value.map(item => item.id),
            addressId: selectedAddress.value.id,
            remark: remark.value.trim(),
          })

          if (orderRes.ok) {
            // 清空购物车（无论成功与否都清理本地）
            try {
              await clearCart()
            } catch (e) {
              console.log('服务器清空购物车失败，清理本地')
            }
            clearLocalCart()

            uni.hideLoading()
            uni.showToast({ title: '支付成功', icon: 'success' })

            // 延迟跳转到订单列表
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/order/orders' })
            }, 1500)
          }
        } catch (err) {
          uni.hideLoading()
          let msg = '支付失败，请重试'
          if (err && err.message) {
            msg = err.message
          }
          uni.showModal({
            title: '支付失败',
            content: msg,
            showCancel: false
          })
        }
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadData()
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$primary-light: #FFB347;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;

// 动画定义
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

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
  background: linear-gradient(135deg, $primary 0%, #FFB347 50%, #FFCC80 100%);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 100;
  box-shadow: 0 4rpx 24rpx rgba(255, 144, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  }
}

.header__back {
  width: 60rpx;
  height: 60rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.9);
  }

  svg {
    width: 32rpx;
    height: 32rpx;
  }
}

.header__title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 60rpx;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.header__placeholder {
  width: 60rpx;
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
  animation: slideUpFade 0.5s ease-out;
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

/* 收货地址 */
.address-card {
  padding: 28rpx;
  position: relative;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 144, 0, 0.02);
  }
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
}

.address-card__tag {
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  margin-left: 20rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.3);
}

.address-card__detail {
  font-size: 28rpx;
  color: $text-body;
  line-height: 1.6;
}

.address-card__arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
  color: $sub;
  opacity: 0.6;
  transition: all 0.2s;

  svg {
    width: 100%;
    height: 100%;
  }
}

.address-card--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx 24rpx;
}

.address-card__empty {
  display: flex;
  align-items: center;
  color: $sub;

  &-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 16rpx;
    opacity: 0.6;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &-text {
    font-size: 30rpx;
    letter-spacing: 1rpx;
  }

  &-arrow {
    width: 36rpx;
    height: 36rpx;
    margin-left: 16rpx;
    opacity: 0.6;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

/* 订单商品 */
.goods-list {
  padding: 0 24rpx 24rpx;
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
  margin-bottom: 14rpx;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 订单备注 */
.remark-section {
  padding-bottom: 24rpx;
}

.remark-input {
  width: 100%;
  height: 140rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $text;
  line-height: 1.6;
  background: transparent;
}

.remark-placeholder {
  color: #bbb;
  font-size: 26rpx;
}

/* 订单信息 */
.info-row {
  display: flex;
  align-items: center;
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
}

.info-row__value {
  font-size: 28rpx;
  color: $text;
  font-weight: 500;
}

.info-row__value--free {
  color: $primary;
  font-weight: 600;
}

.info-row__value--primary {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
  text-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.2);
}

.info-row--total {
  padding: 28rpx;
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
}

/* 底部提交栏 */
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 140rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  padding-left: 40rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1),
              0 -2rpx 16rpx rgba(0, 0, 0, 0.04);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 32rpx;
    right: 32rpx;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 144, 0, 0.2), transparent);
  }
}

.submit-bar__total {
  display: flex;
  align-items: baseline;
}

.submit-bar__label {
  font-size: 30rpx;
  color: $sub;
  margin-right: 8rpx;
}

.submit-bar__price {
  font-size: 48rpx;
  font-weight: 700;
  color: $primary;
  text-shadow: 0 2rpx 10rpx rgba(255, 144, 0, 0.2);
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
}

.submit-bar__btn {
  background: linear-gradient(135deg, $primary 0%, #FF6B35 100%);
  padding: 30rpx 76rpx;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 3rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 144, 0, 0.4),
              0 4rpx 16rpx rgba(255, 107, 53, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 20rpx rgba(255, 144, 0, 0.3);
  }
}

/* 底部安全区 */
.bottom-safe {
  height: 160rpx;
}
</style>
