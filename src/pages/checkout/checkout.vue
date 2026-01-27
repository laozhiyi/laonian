<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
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
              {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
            </view>
            <text class="address-card__arrow">›</text>
          </template>
          <template v-else>
            <view class="address-card__empty">
              <text class="address-card__empty-icon">📍</text>
              <text class="address-card__empty-text">请添加收货地址</text>
              <text class="address-card__empty-arrow">›</text>
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

const loadAddress = () => {
  // 先检查是否有选中的地址
  const selected = uni.getStorageSync('selected_address')
  if (selected) {
    try {
      selectedAddress.value = JSON.parse(selected)
      uni.removeStorageSync('selected_address')
      return
    } catch {}
  }

  // 获取默认地址
  const addrRes = getDefaultAddress()
  if (addrRes.ok && addrRes.data) {
    selectedAddress.value = addrRes.data
  } else {
    // 从本地存储获取
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
    title: '确认提交',
    content: `共 ${cartList.value.length} 件商品，合计 ¥${totalPrice.value.toFixed(2)}`,
    confirmText: '提交',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '提交中...' })

        try {
          const orderRes = await createOrder({
            cartItemIds: cartList.value.map(item => item.id),
            addressId: selectedAddress.value.id,
            remark: remark.value.trim(),
          })

          uni.hideLoading()

          if (orderRes.ok) {
            // 清空购物车
            const clearRes = await clearCart()
            if (!clearRes.ok) {
              clearLocalCart()
            }
            uni.showToast({ title: '订单提交成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        } catch (err) {
          uni.hideLoading()
          let msg = '订单提交失败，请重试'
          if (err && err.message) {
            msg = err.message
          }
          uni.showModal({
            title: '提交失败',
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

/* 收货地址 */
.address-card {
  padding: 24rpx;
  position: relative;
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
}

.address-card__tag {
  font-size: 20rpx;
  color: #fff;
  background: $primary;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-left: 16rpx;
}

.address-card__detail {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.5;
}

.address-card__arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: $sub;
}

.address-card--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 24rpx;
}

.address-card__empty {
  display: flex;
  align-items: center;
  color: $sub;
}

.address-card__empty-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.address-card__empty-text {
  font-size: 28rpx;
}

.address-card__empty-arrow {
  font-size: 32rpx;
  margin-left: 12rpx;
}

/* 订单商品 */
.goods-list {
  padding: 0 24rpx 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.goods-item:last-child {
  border-bottom: none;
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

/* 订单备注 */
.remark-section {
  padding-bottom: 24rpx;
}

.remark-input {
  width: 100%;
  height: 120rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  color: $text;
  line-height: 1.5;
}

.remark-placeholder {
  color: #bbb;
}

/* 订单信息 */
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row__label {
  font-size: 26rpx;
  color: $sub;
}

.info-row__value {
  font-size: 26rpx;
  color: $text;
}

.info-row__value--free {
  color: $primary;
}

.info-row__value--primary {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.info-row--total {
  padding: 24rpx;
  background: #fafafa;
}

/* 底部提交栏 */
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-left: 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.submit-bar__total {
  display: flex;
  align-items: baseline;
}

.submit-bar__label {
  font-size: 26rpx;
  color: $sub;
}

.submit-bar__price {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
}

.submit-bar__btn {
  background: linear-gradient(135deg, $primary, #FFB347);
  padding: 24rpx 60rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

/* 底部安全区 */
.bottom-safe {
  height: 140rpx;
}
</style>
