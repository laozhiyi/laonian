<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">新人攻略</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 介绍区 -->
      <view class="intro-section">
        <view class="intro-card">
          <text class="intro-icon">📚</text>
          <text class="intro-title">欢迎使用「什么值得学」</text>
          <text class="intro-desc">帮助中老年朋友找到值得学习的优质课程</text>
        </view>
      </view>

      <!-- 步骤说明 -->
      <view class="steps-section">
        <view class="section-title">使用步骤</view>
        <view class="step-card">
          <view class="step-num">1</view>
          <view class="step-body">
            <text class="step-title">浏览课程</text>
            <text class="step-desc">在首页或发现页浏览推荐的优质课程</text>
          </view>
        </view>
        <view class="step-card">
          <view class="step-num">2</view>
          <view class="step-body">
            <text class="step-title">收藏感兴趣的内容</text>
            <text class="step-desc">点击收藏按钮保存喜欢的课程，方便下次查看</text>
          </view>
        </view>
        <view class="step-card">
          <view class="step-num">3</view>
          <view class="step-body">
            <text class="step-title">点击「去看看」购买</text>
            <text class="step-desc">课程详情页点击按钮，跳转到第三方平台完成购买</text>
          </view>
        </view>
        <view class="step-card">
          <view class="step-num">4</view>
          <view class="step-body">
            <text class="step-title">开始学习</text>
            <text class="step-desc">在第三方平台登录账号，即可开始学习课程</text>
          </view>
        </view>
      </view>

      <!-- 注意事项 -->
      <view class="tips-section">
        <view class="section-title">温馨提示</view>
        <view class="tip-card">
          <view class="tip-icon">⚠️</view>
          <view class="tip-body">
            <text class="tip-title">购课在第三方平台完成</text>
            <text class="tip-desc">本平台不承载支付功能，购课需跳转到课程所属平台完成</text>
          </view>
        </view>
        <view class="tip-card">
          <view class="tip-icon">💰</view>
          <view class="tip-body">
            <text class="tip-title">课程价格由平台方制定</text>
            <text class="tip-desc">具体价格和优惠以第三方平台为准，本平台仅做推荐</text>
          </view>
        </view>
        <view class="tip-card">
          <view class="tip-icon">📱</view>
          <view class="tip-body">
            <text class="tip-title">推荐使用微信内置浏览器</text>
            <text class="tip-desc">打开课程链接时，推荐在微信中直接打开，操作更简单</text>
          </view>
        </view>
      </view>

      <!-- 快捷入口 -->
      <view class="shortcut-section">
        <view class="section-title">快速入口</view>
        <view class="shortcut-grid">
          <view class="shortcut-item" @tap="goDiscover">
            <view class="shortcut-icon">🔍</view>
            <text class="shortcut-text">发现课程</text>
          </view>
          <view class="shortcut-item" @tap="goFavorites">
            <view class="shortcut-icon">⭐</view>
            <text class="shortcut-text">我的收藏</text>
          </view>
          <view class="shortcut-item" @tap="goOrders">
            <view class="shortcut-icon">📋</view>
            <text class="shortcut-text">我的订单</text>
          </view>
          <view class="shortcut-item" @tap="goSettings">
            <view class="shortcut-icon">⚙️</view>
            <text class="shortcut-text">设置</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUserId } from '@/utils/user.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)

const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px - ${safeBottom}px)`,
  }
})

const goBack = () => {
  uni.navigateBack()
}

const goDiscover = () => {
  uni.switchTab({ url: '/pages/discover/discover' })
}

const goFavorites = () => {
  const userId = getCurrentUserId()
  if (!userId) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: '/pages/user/favorites' })
}

const goOrders = () => {
  const userId = getCurrentUserId()
  if (!userId) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: '/pages/user/order' })
}

const goSettings = () => {
  const userId = getCurrentUserId()
  if (!userId) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: '/pages/user/settings' })
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

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
  box-sizing: border-box;
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

.glass-nav__placeholder {
  width: 64rpx;
}

.scroll {
  position: relative;
  z-index: 1;
}

/* 介绍区 */
.intro-section {
  padding: 24rpx;
}

.intro-card {
  background: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .intro-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .intro-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12rpx;
  }

  .intro-desc {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

/* 步骤区 */
.steps-section {
  padding: 0 24rpx 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.step-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.step-num {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.step-body {
  flex: 1;
}

.step-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.step-desc {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
}

/* 温馨提示 */
.tips-section {
  padding: 0 24rpx 20rpx;
}

.tip-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.tip-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.tip-body {
  flex: 1;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.tip-desc {
  display: block;
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
}

/* 快捷入口 */
.shortcut-section {
  padding: 0 24rpx 20rpx;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
    background: #f8f8f8;
  }
}

.shortcut-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.shortcut-text {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

.bottom-spacer {
  height: 60rpx;
}
</style>
