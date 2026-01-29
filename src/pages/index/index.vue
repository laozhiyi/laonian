<template>
  <view class="page">
    <!-- 动态光效背景 -->
    <view class="ambient-glow">
      <view class="glow-orb glow-orb--1"></view>
      <view class="glow-orb glow-orb--2"></view>
      <view class="glow-orb glow-orb--3"></view>
    </view>

    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__brand">
        <text class="brand-emoji">🍊</text>
        <text class="brand-name">橘上生香</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 英雄卡片 -->
      <view class="hero-card">
        <view class="hero-card__bg">
          <view class="hero-orb hero-orb--1"></view>
          <view class="hero-orb hero-orb--2"></view>
          <view class="hero-orb hero-orb--3"></view>
          <view class="hero-shine"></view>
        </view>
        <view class="hero-card__content">
          <view class="hero-badge">
            <view class="hero-badge__dot"></view>
            <text>新鲜直达</text>
          </view>
          <text class="hero-title">自然之味</text>
          <text class="hero-subtitle">从果园到餐桌，只为给你最好的</text>
          <view class="hero-cta" @tap="goMall">
            <text>探索好物</text>
            <text class="hero-cta__arrow">→</text>
          </view>
        </view>
        <view class="hero-visual">
          <view class="fruit-illustration">
            <view class="fruit-circle fruit-circle--main"></view>
            <view class="fruit-circle fruit-circle--sub"></view>
            <view class="fruit-leaf"></view>
          </view>
        </view>
      </view>

      <!-- 特性卡片 - 非对称布局 -->
      <view class="features-section">
        <view class="feature-card feature-card--large" @tap="goOrders">
          <view class="feature-card__bg"></view>
          <view class="feature-card__icon">
            <text class="icon-text icon-text--order">📋</text>
          </view>
          <text class="feature-card__title">我的订单</text>
        </view>

        <view class="feature-card feature-card--small" @tap="goAddress">
          <view class="feature-card__icon feature-card__icon--green">
            <text class="icon-text icon-text--address">📍</text>
          </view>
          <text class="feature-card__title">收货地址</text>
        </view>

        <view class="feature-card feature-card--small feature-card--teal" @tap="goMall">
          <view class="feature-card__icon feature-card__icon--teal">
            <text class="icon-text icon-text--mall">🛍️</text>
          </view>
          <text class="feature-card__title">去购物</text>
        </view>
      </view>

      <!-- 品牌故事 - 杂志式布局 -->
      <view class="story-section">
        <view class="story-card">
          <view class="story-card__badge">品牌故事</view>
          <text class="story-card__title">橘上生香</text>
          <text class="story-card__desc">
            源于对自然的热爱与对农产品的执着，我们与全国500+优质果农建立直供合作关系，从源头把控品质，让每一位消费者都能享受到新鲜、美味、健康的农产品。
          </text>
          <view class="story-stats">
            <view class="story-stat">
              <text class="story-stat__value">500+</text>
              <text class="story-stat__label">合作果农</text>
            </view>
            <view class="story-stat">
              <text class="story-stat__value">10万+</text>
              <text class="story-stat__label">用户好评</text>
            </view>
            <view class="story-stat">
              <text class="story-stat__value">30+</text>
              <text class="story-stat__label">产品种类</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 品质承诺 -->
      <view class="promise-section">
        <view class="promise-card">
          <view class="promise-header">
            <text class="promise-title">品质承诺</text>
          </view>
          <view class="promise-grid">
            <view class="promise-item">
              <view class="promise-icon">
                <text class="icon-text icon-text--small">✓</text>
              </view>
              <text class="promise-text">7天无理由退货</text>
            </view>
            <view class="promise-item">
              <view class="promise-icon">
                <text class="icon-text icon-text--small">📞</text>
              </view>
              <text class="promise-text">24小时客服</text>
            </view>
            <view class="promise-item">
              <view class="promise-icon">
                <text class="icon-text icon-text--small">📦</text>
              </view>
              <text class="promise-text">48小时发货</text>
            </view>
            <view class="promise-item">
              <view class="promise-icon">
                <text class="icon-text icon-text--small">🛡️</text>
              </view>
              <text class="promise-text">破损必赔</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 管理员入口 -->
      <view class="admin-section" v-if="isAdmin" @tap="goAdmin">
        <view class="admin-card">
          <view class="admin-icon">
            <text class="icon-text icon-text--admin">⚙️</text>
          </view>
          <view class="admin-content">
            <text class="admin-title">商品管理</text>
            <text class="admin-desc">管理商品库存和上下架</text>
          </view>
          <view class="admin-arrow">
            <text class="icon-text icon-text--arrow-sm">></text>
          </view>
        </view>
      </view>

      <!-- 关于与客服 -->
      <view class="info-section">
        <view class="info-card" @tap="onAboutTap">
          <view class="info-icon">
            <text class="icon-text icon-text--info">ℹ</text>
          </view>
          <text class="info-text">关于我们</text>
          <view class="info-arrow">
            <text class="icon-text icon-text--arrow-sm">></text>
          </view>
        </view>
        <view class="info-card" @tap="onContactTap">
          <view class="info-icon">
            <text class="icon-text icon-text--contact">✉</text>
          </view>
          <text class="info-text">联系客服</text>
          <view class="info-arrow">
            <text class="icon-text icon-text--arrow-sm">></text>
          </view>
        </view>
      </view>

      <!-- 底部品牌 -->
      <view class="brand-footer">
        <text class="brand-footer__text">橘上生香 · Orange Fragrance</text>
        <text class="brand-footer__version">v1.0.0</text>
      </view>

      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUser } from '@/utils/user.js'
import { getCart } from '@/utils/cart.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navHeight.value) + 'px)',
}))

// ========== 用户信息 ==========
const userInfo = computed(() => getCurrentUser())
const isAdmin = computed(() => userInfo.value?.role === 'admin')

// ========== 购物车数量 ==========
const cartCount = ref(0)
const loadCartCount = async () => {
  const res = await getCart()
  cartCount.value = res.totalCount || 0
}

// ========== 页面跳转 ==========
const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

const goOrders = () => {
  uni.navigateTo({ url: '/pages/order/orders' })
}

const goAddress = () => {
  uni.navigateTo({ url: '/pages/address/address' })
}

const goAdmin = () => {
  uni.navigateTo({ url: '/pages/admin/admin' })
}

const onAboutTap = () => {
  uni.showModal({
    title: '关于我们',
    content: '橘上生香\n\n优质农特产品电商平台\n\n我们致力于将优质柑橘产品带给每一位用户，每一份产品都承载着果农的辛勤与希望。',
    showCancel: false
  })
}

const onContactTap = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-188-8888\n工作时间：8:30-20:30\n\n商务合作：bd@jushangshengxiang.com',
    showCancel: false
  })
}

// ========== 生命周期 ==========
onMounted(async () => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  await loadCartCount()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$teal: #20B2AA;
$green: #2ECC71;
$pink: #FF6B9D;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.75);
$glass-border: rgba(255, 255, 255, 0.5);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #FFFAF7;

// 动画定义
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15rpx) rotate(3deg); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 30rpx 10rpx rgba(255, 107, 53, 0.15); }
}

@keyframes blob-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
  overflow: hidden;
}

/* 动态光效背景 */
.ambient-glow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  animation: blob-pulse 8s ease-in-out infinite;
}

.glow-orb--1 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $primary, rgba(255, 159, 90, 0.5));
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
}

.glow-orb--2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, $secondary, rgba(78, 205, 196, 0.4));
  bottom: 300rpx;
  left: -150rpx;
  animation-delay: 2s;
}

.glow-orb--3 {
  width: 250rpx;
  height: 250rpx;
  background: linear-gradient(135deg, $pink, rgba(255, 107, 157, 0.3));
  bottom: -50rpx;
  right: 100rpx;
  animation-delay: 4s;
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
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-emoji {
  font-size: 40rpx;
  animation: float 4s ease-in-out infinite;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.glass-nav__actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  svg {
    width: 36rpx;
    height: 36rpx;
    color: $text-secondary;
  }

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 1);
  }
}

.nav-btn--cart {
  position: relative;
}

.cart-dot {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 英雄卡片 */
.hero-card {
  margin: 0 24rpx 24rpx 24rpx;
  background: $orange-gradient;
  border-radius: 40rpx;
  padding: 48rpx 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(255, 107, 53, 0.35);
  animation: slideUpFade 0.6s ease-out;
}

.hero-card__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.hero-orb--1 {
  width: 220rpx;
  height: 220rpx;
  top: -100rpx;
  right: -60rpx;
  animation: float 8s ease-in-out infinite;
}

.hero-orb--2 {
  width: 140rpx;
  height: 140rpx;
  bottom: -60rpx;
  left: 40rpx;
  animation: float 10s ease-in-out infinite 1s;
}

.hero-orb--3 {
  width: 90rpx;
  height: 90rpx;
  top: 45%;
  left: 35%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 6s ease-in-out infinite 2s;
}

.hero-shine {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  animation: pulse-glow 4s ease-in-out infinite;
}

.hero-card__content {
  position: relative;
  z-index: 2;
  max-width: 52%;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 28rpx;
  background: rgba(255, 255, 255, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 32rpx;
  backdrop-filter: blur(12rpx);
  margin-bottom: 24rpx;

  &__dot {
    width: 12rpx;
    height: 12rpx;
    background: #4ECDC4;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  text {
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 3rpx;
  }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.hero-title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 6rpx;
  margin-bottom: 20rpx;
  text-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 60rpx;
    height: 6rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
  }
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.8;
  letter-spacing: 2rpx;
  margin-bottom: 32rpx;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 44rpx;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: $primary;
    letter-spacing: 3rpx;
  }

  &__arrow {
    font-size: 28rpx;
    font-weight: 300;
    color: $primary;
    line-height: 1;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
  }
}

.hero-visual {
  position: absolute;
  top: 50%;
  right: 16rpx;
  width: 42%;
  height: 80%;
  transform: translateY(-50%);
  pointer-events: none;
}

.fruit-illustration {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.fruit-circle {
  position: absolute;
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

.fruit-circle--main {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.18);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 0s;
}

.fruit-circle--sub {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.12);
  top: 20rpx;
  right: 10rpx;
  animation-delay: 1s;
}

.fruit-leaf {
  position: absolute;
  width: 70rpx;
  height: 70rpx;
  background: $secondary;
  border-radius: 50% 0 50% 50%;
  top: -10rpx;
  left: 55%;
  transform: rotate(-45deg);
  animation: float 3s ease-in-out infinite 2s;
}

/* 特性卡片区域 */
.features-section {
  padding: 0 24rpx;
  display: flex;
  gap: 20rpx;
  animation: slideUpFade 0.6s ease-out 0.1s both;
}

.feature-card {
  background: $glass-bg;
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border: 1rpx solid $glass-border;
  border-radius: 32rpx;
  padding: 28rpx 24rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    transform: scale(0.96) translateY(-4rpx);
    box-shadow: 0 16rpx 40rpx rgba(255, 107, 53, 0.15);

    &::before {
      opacity: 1;
    }
  }
}

.feature-card--large {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card--small {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card--teal {
  &::before {
    background: linear-gradient(135deg, rgba(32, 178, 170, 0.08) 0%, transparent 50%);
  }

  &:active {
    box-shadow: 0 16rpx 40rpx rgba(32, 178, 170, 0.15);
  }
}

.feature-card__icon {
  width: 80rpx;
  height: 80rpx;
  background: $orange-gradient;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(255, 107, 53, 0.3);

  svg,
  .icon-text {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #fff;
  }
}

.feature-card__icon--green {
  background: linear-gradient(135deg, $green, #27ae60);
  box-shadow: 0 6rpx 24rpx rgba(46, 204, 113, 0.3);
}

.feature-card__icon--teal {
  background: linear-gradient(135deg, $teal, #48c9b0);
  box-shadow: 0 6rpx 24rpx rgba(32, 178, 170, 0.3);
}

.feature-card__title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: 1rpx;
  white-space: nowrap;
}

/* 品牌故事区域 */
.story-section {
  padding: 32rpx 24rpx;
  animation: slideUpFade 0.6s ease-out 0.15s both;
}

.story-card {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFF5EB 50%, #FFFAF0 100%);
  border-radius: 32rpx;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.08);
  border: 1rpx solid rgba(255, 144, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -60%;
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255, 144, 0, 0.04) 0%, transparent 60%);
    pointer-events: none;
  }
}

.story-card__badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
  margin-bottom: 20rpx;
}

.story-card__title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
}

.story-card__desc {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 2;
  letter-spacing: 1rpx;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;
}

.story-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba(255, 144, 0, 0.1);
  position: relative;
  z-index: 1;
}

.story-stat {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__value {
    font-size: 44rpx;
    font-weight: 700;
    color: $primary;
    font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
    margin-bottom: 8rpx;
  }

  &__label {
    font-size: 24rpx;
    color: $text-muted;
    letter-spacing: 2rpx;
  }
}

/* 品质承诺区域 */
.promise-section {
  padding: 0 24rpx;
  animation: slideUpFade 0.6s ease-out 0.2s both;
}

.promise-card {
  background: $glass-bg;
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border: 1rpx solid $glass-border;
  border-radius: 32rpx;
  padding: 32rpx;
}

.promise-header {
  margin-bottom: 28rpx;
}

.promise-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 48rpx;
    height: 4rpx;
    background: $orange-gradient;
    border-radius: 2rpx;
  }
}

.promise-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.promise-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(255, 107, 53, 0.03);
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 107, 53, 0.08);
    transform: scale(0.98);
  }
}

.promise-icon {
  width: 48rpx;
  height: 48rpx;
  background: $orange-gradient;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.25);

  svg,
  .icon-text {
    width: 26rpx;
    height: 26rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #fff;
  }
}

.promise-text {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-primary;
  letter-spacing: 1rpx;
}

/* 管理员区域 */
.admin-section {
  padding: 32rpx 24rpx;
  animation: slideUpFade 0.6s ease-out 0.25s both;
}

.admin-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.06) 0%, rgba(255, 159, 90, 0.03) 100%);
  border: 1rpx solid rgba(255, 107, 53, 0.12);
  border-radius: 28rpx;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 159, 90, 0.05) 100%);
  }
}

.admin-icon {
  width: 80rpx;
  height: 80rpx;
  background: $orange-gradient;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 24rpx rgba(255, 107, 53, 0.3);

  svg,
  .icon-text {
    width: 38rpx;
    height: 38rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38rpx;
    color: #fff;
  }
}

.admin-content {
  flex: 1;
}

.admin-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.admin-desc {
  font-size: 24rpx;
  color: $text-muted;
}

.admin-arrow {
  width: 36rpx;
  height: 36rpx;
  color: $text-muted;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;

  svg,
  .icon-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 信息区域 */
.info-section {
  padding: 0 24rpx;
  animation: slideUpFade 0.6s ease-out 0.3s both;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  background: $glass-bg;
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(0.98);
  }
}

.info-icon {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 159, 90, 0.05));
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  svg,
  .icon-text {
    width: 28rpx;
    height: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: $primary;
  }
}

.info-text {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.info-arrow {
  width: 28rpx;
  height: 28rpx;
  color: $text-muted;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;

  svg,
  .icon-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 品牌底部 */
.brand-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 0 40rpx;
  animation: slideUpFade 0.6s ease-out 0.35s both;
}

.brand-footer__text {
  font-size: 24rpx;
  color: $text-muted;
  letter-spacing: 3rpx;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.brand-footer__version {
  font-size: 22rpx;
  color: rgba(153, 153, 153, 0.6);
  letter-spacing: 1rpx;
}

/* 底部安全区 */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}

/* 文本图标样式 - 兼容微信小程序 */
.icon-text {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--arrow {
  font-size: 36rpx;
  font-weight: 300;
}

.icon-text--arrow-sm {
  font-size: 28rpx;
  opacity: 0.5;
}

.icon-text--order {
  font-size: 40rpx;
}

.icon-text--address {
  font-size: 40rpx;
}

.icon-text--mall {
  font-size: 40rpx;
}

.icon-text--admin {
  font-size: 40rpx;
}

.icon-text--small {
  font-size: 24rpx;
}

.icon-text--info {
  font-size: 28rpx;
  font-weight: 600;
}

.icon-text--contact {
  font-size: 28rpx;
}

/* 更新svg选择器以支持文本图标 */
.feature-card__icon text,
.promise-icon text,
.admin-icon text,
.info-icon text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
