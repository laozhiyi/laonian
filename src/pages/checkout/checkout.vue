<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">🎓</text>
        <text class="brand-name">确认订单</text>
      </view>
      <view class="glass-nav__placeholder" />
    </view>

    <!-- 滚动内容 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 余额信息 -->
      <view class="section balance-section">
        <view class="balance-info">
          <text class="balance-icon">💰</text>
          <view class="balance-detail">
            <text class="balance-label">我的余额</text>
            <text class="balance-value">¥{{ userBalance.toFixed(2) }}</text>
          </view>
        </view>
        <view class="balance-tip" v-if="userBalance < totalPrice">
          <text class="balance-tip__text">⚠️ 余额不足，请先充值</text>
        </view>
      </view>

      <!-- 订单商品 -->
      <view class="section goods-section">
        <view class="section-title">订单课程</view>
        <view class="goods-list">
          <view class="goods-item" v-for="item in cartList" :key="item.id">
            <image class="goods-item__cover" :src="item.cover || '/static/covers/7-edu.jpg'" mode="aspectFill" />
            <view class="goods-item__info">
              <view class="goods-item__title">{{ item.title }}</view>
              <view class="goods-item__row">
                <view class="goods-item__price">¥{{ (item.price || 0).toFixed(2) }}</view>
                <view class="goods-item__quantity">x{{ item.quantity }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section info-section">
        <view class="section-title">费用明细</view>
        <view class="info-row" v-for="item in cartList" :key="item.id">
          <text class="info-row__label">{{ item.title }}</text>
          <text class="info-row__value">¥{{ ((item.price || 0) * item.quantity).toFixed(2) }}</text>
        </view>
        <view class="info-row info-row--total">
          <text class="info-row__label">合计</text>
          <text class="info-row__value info-row__value--primary">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 空购物车 -->
      <view class="empty-state" v-if="cartList.length === 0 && !loading">
        <text class="empty-icon">🛒</text>
        <text class="empty-text">购物车为空</text>
        <view class="empty-btn" @tap="goMall">
          <text>去选课</text>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="submit-bar" :style="submitBarStyle" v-if="cartList.length > 0">
      <view class="submit-bar__total">
        <text class="submit-bar__label">合计：</text>
        <text class="submit-bar__price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <view
        class="submit-bar__btn"
        :class="{ 'submit-bar__btn--disabled': userBalance < totalPrice }"
        @tap="submitOrder"
      >
        <text>{{ userBalance < totalPrice ? '余额不足' : '确认购买' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCart, clearCart } from '@/utils/cart.js'
import { purchaseInternalCourse } from '@/utils/course.js'
import { getCurrentUser } from '@/utils/user.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)
const loading = ref(true)

const cartList = ref([])
const totalPrice = ref(0)
const userBalance = ref(0)

const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navHeight.value + 140) + 'px)'
}))

const submitBarStyle = computed(() => ({
  paddingBottom: 'calc(env(safe-area-inset-bottom) + 20rpx)'
}))

const loadData = async () => {
  loading.value = true
  try {
    const cartRes = await getCart()
    cartList.value = cartRes.list || []
    totalPrice.value = cartRes.totalPrice || 0

    const user = getCurrentUser()
    if (user) {
      userBalance.value = user.balance || 0
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

const submitOrder = async () => {
  if (userBalance.value < totalPrice.value) {
    uni.showModal({
      title: '余额不足',
      content: '当前余额不足以完成购买，请先充值',
      confirmText: '去充值',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/balance/balance' })
        }
      }
    })
    return
  }

  if (cartList.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认购买',
    content: `即将购买 ${cartList.value.length} 个课程，合计 ¥${totalPrice.value.toFixed(2)}，将从余额扣款`,
    confirmText: '确认购买',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '购买中...' })

        let successCount = 0
        let failCount = 0
        const total = cartList.value.length

        for (const item of cartList.value) {
          const courseId = item.productId || item.courseId || item.id
          if (!courseId) {
            failCount++
            continue
          }

          const result = await purchaseInternalCourse(courseId)
          if (result.ok) {
            successCount++
          } else {
            failCount++
            console.warn(`课程 ${item.title} 购买失败:`, result.message)
          }
        }

        uni.hideLoading()

        if (successCount === total) {
          // 全部成功
          await clearCart()
          uni.showToast({ title: '购买成功', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/me/me' })
          }, 1500)
        } else if (successCount > 0) {
          // 部分成功
          await clearCart()
          uni.showModal({
            title: '部分购买成功',
            content: `成功 ${successCount} 个，失败 ${failCount} 个。余额已退还。`,
            showCancel: false,
            confirmText: '知道了'
          })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/me/me' })
          }, 1500)
        } else {
          // 全部失败
          uni.showModal({
            title: '购买失败',
            content: '所有课程购买均失败，请检查余额或课程状态',
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      }
    }
  })
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadData()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: auto; min-height: 88rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 64rpx; height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  &:active {
    background: rgba(255, 144, 0, 0.1);
    transform: scale(0.9);
  }
  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text;
    line-height: 1;
  }
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.brand-emoji { font-size: 36rpx; }

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
  letter-spacing: 2rpx;
}

.glass-nav__placeholder { width: 64rpx; }

/* 滚动区域 */
.scroll { width: 100%; }

/* 区块通用 */
.section {
  background: #fff;
  margin: 24rpx;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  animation: slideUpFade 0.5s ease-out;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  padding: 28rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  letter-spacing: 1rpx;
}

/* 余额区块 */
.balance-section {
  padding: 28rpx;
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.balance-icon { font-size: 60rpx; }

.balance-detail {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.balance-label {
  font-size: 26rpx;
  color: $sub;
}

.balance-value {
  font-size: 48rpx;
  font-weight: 800;
  color: $primary;
}

.balance-tip {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: rgba(255, 59, 48, 0.08);
  border-radius: 16rpx;
}

.balance-tip__text {
  font-size: 26rpx;
  color: #ff3b30;
}

/* 订单商品 */
.goods-list { padding: 0 24rpx 24rpx; }

.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.goods-item__cover {
  width: 132rpx;
  height: 132rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
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
}

.goods-item__quantity {
  font-size: 26rpx;
  color: $sub;
}

/* 订单信息 */
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.info-row__label {
  font-size: 28rpx;
  color: $sub;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.info-row__value {
  font-size: 28rpx;
  color: $text;
  font-weight: 500;
  flex-shrink: 0;
}

.info-row--total {
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
  padding: 28rpx;
}

.info-row__value--primary {
  font-size: 40rpx;
  font-weight: 800;
  color: $primary;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.4;
}

.empty-text {
  font-size: 28rpx;
  color: $sub;
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 20rpx 64rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 48rpx;
  text { font-size: 30rpx; font-weight: 600; color: #fff; }
}

/* 底部安全区 */
.bottom-safe { height: 160rpx; }

/* 底部提交栏 */
.submit-bar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 140rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx 0 40rpx;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;
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
  font-weight: 800;
  color: $primary;
}

.submit-bar__btn {
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  padding: 30rpx 56rpx;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 3rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.35);
  transition: all 0.3s;
  &:active { transform: scale(0.96); }

  &--disabled {
    background: #ccc;
    box-shadow: none;
  }
}
</style>
