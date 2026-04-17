<template>
  <view class="page">
    <!-- 背景装饰层 -->
    <view class="bg-decoration">
      <view class="bg-blob bg-blob--1"></view>
      <view class="bg-blob bg-blob--2"></view>
      <view class="bg-blob bg-blob--3"></view>
    </view>

    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__brand">
        <text class="brand-emoji">🍊</text>
        <text class="brand-name">个人中心</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 用户信息大卡片 - 叠层设计 -->
      <view class="hero-card">
        <view class="hero-card__inner">
          <!-- 背景装饰 -->
          <view class="hero-card__orb hero-card__orb--1"></view>
          <view class="hero-card__orb hero-card__orb--2"></view>

          <!-- 用户信息 - 横向显示 -->
          <view class="hero-card__user">
            <view class="avatar-wrapper">
              <view class="avatar-ring">
                <view class="avatar">
                  <view class="avatar__icon" v-if="!userInfo?.avatar">
                    <text class="icon-text">👤</text>
                  </view>
                  <image v-else class="avatar__img" :src="userInfo.avatar" mode="aspectFill" />
                </view>
              </view>
              <!-- 装饰性光晕 -->
              <view class="avatar-glow"></view>
            </view>
            <view class="user-info">
              <view class="user-info__name">{{ isLoggedIn && userInfo.username ? userInfo.username : '游客' }}</view>
              <view class="user-info__decor">
                <text class="decor-dot"></text>
                <text class="decor-text">欢迎回来</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能网格 - 大卡片毛玻璃 -->
      <view class="feature-grid">
        <view class="feature-card" v-for="menu in menuList" :key="menu.key" @tap="onMenuTap(menu)">
          <view class="feature-card__icon-wrap">
            <text v-if="menu.key === 'courses'" class="icon-text icon-text--order">📚</text>
            <text v-else-if="menu.key === 'profile'" class="icon-text icon-text--address">👤</text>
          </view>
          <text class="feature-card__label">{{ menu.name }}</text>
        </view>
      </view>

      <!-- 管理员专区 - 特殊样式 -->
      <view class="admin-section" v-if="isAdmin">
        <view class="section-label">管理专区</view>
        <view class="admin-card" @tap="goAdmin">
          <view class="admin-card__icon">
            <text class="icon-text icon-text--admin">⚙️</text>
          </view>
          <view class="admin-card__content">
            <text class="admin-card__title">课程管理</text>
            <text class="admin-card__desc">管理课程和分类</text>
          </view>
        </view>
      </view>

      <!-- 关于与客服 - 极简风格 -->
      <view class="info-section">
        <view class="info-card" @tap="onAboutTap">
          <view class="info-card__icon">
            <text class="icon-text icon-text--info">ℹ</text>
          </view>
          <view class="info-card__body">
            <text class="info-card__text">关于我们</text>
          </view>
        </view>
        <view class="info-card" @tap="onContactTap">
          <view class="info-card__icon">
            <text class="icon-text icon-text--contact">✉</text>
          </view>
          <view class="info-card__body">
            <text class="info-card__text">联系客服</text>
          </view>
        </view>
      </view>

      <!-- 登录/退出按钮 -->
      <view class="auth-action">
        <view class="auth-btn" :class="{ 'auth-btn--logout': isLoggedIn }" @tap="handleAuth">
          <text class="icon-text icon-text--logout">🚪</text>
          <text>{{ isLoggedIn ? '退出登录' : '去登录' }}</text>
        </view>
      </view>

      <!-- 底部品牌 -->
      <view class="brand-footer">
        <text class="brand-footer__text">橘上·智学学堂 · Orange Wisdom</text>
        <text class="brand-footer__version">v1.0.0</text>
      </view>

      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUser, logout } from '@/utils/user.js'
import { onShow } from '@dcloudio/uni-app'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const navbarHeight = computed(() => navHeight.value)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navbarHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navbarHeight.value) + 'px - env(safe-area-inset-bottom))',
}))

// ========== 用户信息（响应式） ==========
const userInfo = ref(null)

// ========== 是否已登录 ==========
const isLoggedIn = computed(() => !!userInfo.value)

// ========== 是否是管理员 ==========
const isAdmin = computed(() => userInfo.value?.role === 'admin')

// ========== 刷新用户信息 ==========
const refreshUserInfo = () => {
  userInfo.value = getCurrentUser()
}

// ========== onShow 时刷新用户信息 ==========
onShow(() => {
  refreshUserInfo()
})

// ========== 菜单列表 ==========
const menuList = ref([
  { key: 'courses', name: '我的课程' },
  { key: 'profile', name: '个人信息' },
])

// ========== 交互方法 ==========
const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const handleAuth = () => {
  if (isLoggedIn.value) {
    handleLogout()
  } else {
    goLogin()
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        toast('已退出登录')
        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/auth/login' })
        }, 500)
      }
    }
  })
}

const onMenuTap = (menu) => {
  if (!isLoggedIn.value) {
    goLogin()
    return
  }
  if (menu.key === 'courses') {
    // 跳转到外部课程页面
    uni.navigateTo({ url: '/pages/external-course/list' })
  } else if (menu.key === 'profile') {
    // 跳转到个人信息页面（目前没有单独的页面，显示用户信息弹窗）
    showProfileModal()
  } else {
    toast('功能开发中')
  }
}

// 显示个人信息弹窗
const showProfileModal = () => {
  if (!userInfo.value) return
  const info = userInfo.value
  uni.showModal({
    title: '个人信息',
    content: `用户名：${info.username || '未设置'}\n角色：${info.role === 'admin' ? '管理员' : '普通用户'}\n注册时间：${info.created_at ? new Date(info.created_at).toLocaleDateString() : '未知'}`,
    showCancel: false
  })
}

const goAdmin = () => {
  uni.navigateTo({ url: '/pages/admin/admin' })
}

const onAboutTap = () => {
  uni.showModal({
    title: '关于我们',
    content: '橘上·智学学堂\n\n专注老年教育服务\n\n为老年人提供丰富的在线学习资源，涵盖健康养生、文化艺术、数字技能等多领域课程。\n\n让每一位老年人都能享受学习的乐趣，活出精彩人生。',
    showCancel: false
  })
}

const onContactTap = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-188-8888\n工作时间：8:30-20:30\n\n服务邮箱：service@jushangzhixue.com\n商务合作：bd@jushangzhixue.com',
    showCancel: false
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  refreshUserInfo()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
$primary: #FF6B35;
$primary-light: #FF9F5A;
$primary-dark: #E55A25;
$secondary: #4ECDC4;
$pink: #FF6B9D;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.7);
$glass-border: rgba(255, 255, 255, 0.5);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #FFFAF7;

// 动画定义
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10rpx) rotate(2deg); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 30rpx 10rpx rgba(255, 107, 53, 0.15); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes blob-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.4; }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.5;
  animation: blob-pulse 8s ease-in-out infinite;
}

.bg-blob--1 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $primary, $secondary);
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
}

.bg-blob--2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, $pink, $primary-light);
  bottom: 200rpx;
  left: -150rpx;
  animation-delay: 2s;
}

.bg-blob--3 {
  width: 250rpx;
  height: 250rpx;
  background: linear-gradient(135deg, $secondary, $primary);
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
  z-index: 999;
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

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 英雄卡片 - 叠层设计 */
.hero-card {
  margin: 24rpx 24rpx 0 24rpx;
  position: relative;
  animation: slideUpFade 0.6s ease-out;
}

.hero-card__inner {
  background: $orange-gradient;
  border-radius: 40rpx;
  padding: 32rpx 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(255, 107, 53, 0.35),
              0 10rpx 30rpx rgba(255, 107, 53, 0.2),
              inset 0 1rpx 0 rgba(255, 255, 255, 0.3);
}

.hero-card__orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
}

.hero-card__orb--1 {
  width: 160rpx;
  height: 160rpx;
  top: -60rpx;
  right: -40rpx;
  animation: float 8s ease-in-out infinite;
}

.hero-card__orb--2 {
  width: 100rpx;
  height: 100rpx;
  bottom: -30rpx;
  left: 20rpx;
  animation: float 10s ease-in-out infinite 1s;
}

/* 用户信息 - 横向布局 */
.hero-card__user {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  z-index: 2;
  gap: 24rpx;
}

.avatar-wrapper {
  position: relative;
}

.avatar-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12),
              inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3);
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  &__icon {
    width: 52rpx;
    height: 52rpx;
    color: $primary;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  text-align: left;
}

.user-info__name {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 8rpx;
}

.user-info__decor {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.decor-dot {
  width: 8rpx;
  height: 8rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.5);
}

.decor-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1rpx;
}

/* 头像光晕 */
.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  animation: pulse-glow 3s ease-in-out infinite;
}

/* 功能网格 */
.feature-grid {
  padding: 0 24rpx;
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  animation: slideUpFade 0.6s ease-out 0.1s both;
}

.feature-card {
  background: $glass-bg;
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border: 1rpx solid $glass-border;
  border-radius: 32rpx;
  padding: 40rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 16rpx 40rpx rgba(255, 107, 53, 0.15);

    &::before {
      opacity: 1;
    }
  }
}

.feature-card__icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: $orange-gradient;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
  flex-shrink: 0;

  svg {
    width: 40rpx;
    height: 40rpx;
    color: #fff;
    stroke: #fff;
  }
}

.feature-card__label {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: 1rpx;
  text-align: center;
}

/* 管理员专区 */
.admin-section {
  padding: 32rpx 24rpx 0;
  animation: slideUpFade 0.6s ease-out 0.15s both;
}

.section-label {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-muted;
  letter-spacing: 2rpx;
  margin-bottom: 20rpx;
  padding-left: 8rpx;
}

.admin-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 157, 90, 0.04) 100%);
  border: 1rpx solid rgba(255, 107, 53, 0.15);
  border-radius: 28rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(255, 157, 90, 0.08) 100%);
  }
}

.admin-card__icon {
  width: 72rpx;
  height: 72rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);

  svg {
    width: 34rpx;
    height: 34rpx;
    color: #fff;
    stroke: #fff;
  }
}

.admin-card__content {
  flex: 1;
}

.admin-card__title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.admin-card__desc {
  font-size: 24rpx;
  color: $text-muted;
}

/* 信息卡片 */
.info-section {
  padding: 32rpx 24rpx 0;
  animation: slideUpFade 0.6s ease-out 0.2s both;
}

.info-card {
  background: $glass-bg;
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.85);
    transform: scale(0.98);
  }
}

.info-card__icon {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 157, 90, 0.05));
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28rpx;
    height: 28rpx;
    color: $primary;
  }
}

.info-card__body {
  flex: 1;
}

.info-card__text {
  font-size: 30rpx;
  font-weight: 500;
  color: $text-primary;
  letter-spacing: 1rpx;
}

/* 登录/退出按钮 */
.auth-action {
  padding: 40rpx 24rpx;
  animation: slideUpFade 0.6s ease-out 0.25s both;
}

.auth-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  background: $orange-gradient;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .icon-text {
    font-size: 36rpx;
    line-height: 1;
    color: #fff;
  }

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2rpx;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
  }
}

.auth-btn--logout {
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .icon-text {
    color: $text-secondary;
  }

  text {
    color: $text-secondary;
  }
}

/* 品牌底部 */
.brand-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 32rpx;
  animation: slideUpFade 0.6s ease-out 0.3s both;
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

.icon-text--arrow-sm {
  font-size: 28rpx;
  opacity: 0.5;
}

.icon-text--order {
  font-size: 44rpx;
}

.icon-text--address {
  font-size: 44rpx;
}

.icon-text--admin {
  font-size: 40rpx;
}

.icon-text--info {
  font-size: 28rpx;
  font-weight: 600;
}

.icon-text--contact {
  font-size: 28rpx;
}

.icon-text--logout {
  font-size: 32rpx;
}

/* 更新svg选择器以支持文本图标 */
.feature-card__icon-wrap text,
.info-card__icon text,
.admin-card__icon text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
