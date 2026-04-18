<template>
  <view class="page">
    <!-- 顶部背景 -->
    <view class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="profile-header__bg">
        <view class="profile-header__blob profile-header__blob--1"></view>
        <view class="profile-header__blob profile-header__blob--2"></view>
      </view>
      <view class="profile-header__content">
        <view class="user-info">
          <view class="avatar-wrapper">
            <view class="avatar">
              <text class="avatar-placeholder" v-if="!userInfo?.avatar">👤</text>
              <image class="avatar-img" v-else :src="userInfo.avatar" mode="aspectFill" />
            </view>
          </view>
          <view class="user-details">
            <text class="user-name">{{ isLoggedIn && userInfo.username ? userInfo.username : '游客' }}</text>
            <view class="user-badge" v-if="isAdmin">
              <text class="badge-icon">⭐</text>
              <text class="badge-text">管理员</text>
            </view>
            <view class="user-badge user-badge--member" v-else-if="isLoggedIn">
              <text class="badge-icon">👑</text>
              <text class="badge-text">会员</text>
            </view>
            <text class="user-tip" v-if="isLoggedIn">尊享更多权益</text>
            <text class="user-tip" v-else>登录后享受更多服务</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员卡片 -->
    <view class="member-card" v-if="isLoggedIn">
      <view class="member-card__left">
        <view class="member-card__icon">
          <text>💰</text>
        </view>
        <view class="member-card__info">
          <text class="member-card__title">账户余额</text>
          <text class="member-card__value">¥{{ userInfo.balance || 0 }}</text>
        </view>
      </view>
      <view class="member-card__btn" @tap="goBalance">
        <text>充值</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-card">
        <view class="menu-card__header">
          <text class="menu-card__title">我的服务</text>
        </view>
        <view class="service-grid">
          <view class="service-item" @tap="onMenuTap(menu)" v-for="menu in menuList" :key="menu.key">
            <view class="service-item__icon" :class="'service-icon--' + menu.key">
              <text class="icon-text">{{ menu.icon }}</text>
            </view>
            <text class="service-item__label">{{ menu.name }}</text>
          </view>
        </view>
      </view>

      <!-- 管理员入口 -->
      <view class="menu-card" v-if="isAdmin">
        <view class="admin-entry" @tap="goAdmin">
          <view class="admin-entry__left">
            <view class="admin-entry__icon">
              <text class="icon-text">⚙️</text>
            </view>
            <view class="admin-entry__info">
              <text class="admin-entry__title">课程管理后台</text>
              <text class="admin-entry__desc">管理课程、分类与内容</text>
            </view>
          </view>
          <text class="more-arrow">›</text>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="menu-card">
        <view class="menu-list">
          <view class="menu-list__item" @tap="onAboutTap">
            <view class="menu-list__left">
              <view class="menu-list__icon menu-icon--about">
                <text class="icon-text">ℹ️</text>
              </view>
              <text class="menu-list__text">关于我们</text>
            </view>
            <text class="more-arrow">›</text>
          </view>
          <view class="menu-list__item" @tap="onContactTap">
            <view class="menu-list__left">
              <view class="menu-list__icon menu-icon--contact">
                <text class="icon-text">📞</text>
              </view>
              <text class="menu-list__text">联系客服</text>
            </view>
            <text class="more-arrow">›</text>
          </view>
          <view class="menu-list__item" @tap="onHelpTap">
            <view class="menu-list__left">
              <view class="menu-list__icon menu-icon--help">
                <text class="icon-text">💬</text>
              </view>
              <text class="menu-list__text">帮助与反馈</text>
            </view>
            <text class="more-arrow">›</text>
          </view>
          <view class="menu-list__item" @tap="onSettingsTap">
            <view class="menu-list__left">
              <view class="menu-list__icon menu-icon--settings">
                <text class="icon-text">⚙️</text>
              </view>
              <text class="menu-list__text">设置</text>
            </view>
            <text class="more-arrow">›</text>
          </view>
          <!-- 退出登录 -->
          <view class="menu-list__item menu-list__item--logout" @tap="handleLogout" v-if="isLoggedIn">
            <view class="menu-list__left">
              <view class="menu-list__icon menu-icon--logout">
                <text class="icon-text">🚪</text>
              </view>
              <text class="menu-list__text menu-list__text--danger">退出登录</text>
            </view>
            <text class="more-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="bottom-safe" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUser, logout } from '@/utils/user.js'
import { onShow } from '@dcloudio/uni-app'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)

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
  { key: 'courses', name: '我的课程', icon: '📚' },
  { key: 'favorite', name: '我的收藏', icon: '❤️' },
  { key: 'balance', name: '余额充值', icon: '💰' },
  { key: 'profile', name: '个人信息', icon: '👤' },
])

// ========== 交互方法 ==========
const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        toast('已退出登录')
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
    uni.navigateTo({ url: '/pages/external-course/list' })
  } else if (menu.key === 'favorite') {
    uni.navigateTo({ url: '/pages/favorite/favorite' })
  } else if (menu.key === 'balance') {
    uni.navigateTo({ url: '/pages/balance/balance' })
  } else if (menu.key === 'profile') {
    showProfileModal()
  } else {
    toast('功能开发中')
  }
}

const goBalance = () => {
  if (!isLoggedIn.value) {
    goLogin()
    return
  }
  uni.navigateTo({ url: '/pages/balance/balance' })
}

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
    content: '颐享学堂\n\n专注老年教育服务\n\n为老年人提供丰富的在线学习资源，涵盖健康养生、文化艺术、数字技能等多领域课程。\n\n让每一位老年人都能享受学习的乐趣，活出精彩人生。',
    showCancel: false
  })
}

const onContactTap = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-188-8888\n工作时间：8:30-20:30\n\n服务邮箱：service@yixiangxuetang.com\n商务合作：bd@yixiangxuetang.com',
    showCancel: false
  })
}

const onHelpTap = () => {
  uni.showModal({
    title: '帮助与反馈',
    content: '如有疑问，请联系客服。\n\n我们会尽快为您处理。',
    showCancel: false
  })
}

const onSettingsTap = () => {
  uni.showModal({
    title: '设置',
    content: '版本：v1.0.0\n\n当前为最新版本',
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
$primary: #2563EB;
$primary-light: #3B82F6;
$primary-dark: #1D4ED8;
$secondary: #10B981;
$accent: #F59E0B;
$text-primary: #1E293B;
$text-secondary: #64748B;
$text-muted: #94A3B8;
$bg-light: #F8FAFC;
$bg-card: #FFFFFF;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* ========== 用户信息头部 ========== */
.profile-header {
  position: relative;
  z-index: 1;
  padding: 20rpx 32rpx 48rpx;
}

.profile-header__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  border-radius: 0 0 48rpx 48rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 50%, #60A5FA 100%);
}

.profile-header__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.3;
}

.profile-header__blob--1 {
  width: 300rpx;
  height: 300rpx;
  background: #fff;
  top: -150rpx;
  right: -80rpx;
}

.profile-header__blob--2 {
  width: 200rpx;
  height: 200rpx;
  background: #fff;
  bottom: -100rpx;
  left: -50rpx;
}

.profile-header__content {
  position: relative;
  z-index: 2;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding-top: 20rpx;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.avatar-placeholder {
  font-size: 64rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 18rpx;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  border-radius: 20rpx;
  width: fit-content;
}

.user-badge--member {
  background: rgba(255, 255, 255, 0.25);
}

.badge-icon {
  font-size: 20rpx;
}

.badge-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
}

.user-tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* ========== 会员卡片 ========== */
.member-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -24rpx 24rpx 24rpx;
  padding: 28rpx 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
  animation: slideUpFade 0.4s ease-out;
}

.member-card__left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.member-card__icon {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, $accent, #FBBF24);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 36rpx;
  }
}

.member-card__info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.member-card__title {
  font-size: 26rpx;
  color: $text-muted;
}

.member-card__value {
  font-size: 40rpx;
  font-weight: 700;
  color: $accent;
}

.member-card__btn {
  padding: 16rpx 36rpx;
  background: linear-gradient(135deg, $accent, #FBBF24);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.3);

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }
}

/* ========== 功能菜单区域 ========== */
.menu-section {
  position: relative;
  z-index: 1;
  padding: 24rpx 24rpx 0;
}

.menu-card {
  background: $bg-card;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out;
}

.menu-card__header {
  margin-bottom: 28rpx;
}

.menu-card__title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

/* ========== 服务网格 ========== */
.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 8rpx;

  &:active {
    opacity: 0.8;
  }
}

.service-item__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
}

.service-icon--courses {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.service-icon--favorite {
  background: linear-gradient(135deg, #EC4899, #F472B6);
}

.service-icon--balance {
  background: linear-gradient(135deg, $accent, #FBBF24);
}

.service-icon--profile {
  background: linear-gradient(135deg, $secondary, #34D399);
}

.service-item__label {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
}

/* ========== 管理员入口 ========== */
.admin-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-entry__left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.admin-entry__icon {
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(37, 99, 235, 0.25);

  .icon-text {
    font-size: 42rpx;
  }
}

.admin-entry__info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.admin-entry__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.admin-entry__desc {
  font-size: 24rpx;
  color: $text-muted;
}

.more-arrow {
  font-size: 36rpx;
  color: $text-muted;
  font-weight: 300;
}

/* ========== 菜单列表 ========== */
.menu-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #F1F5F9;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FAFAFA;
    margin: 0 -30rpx;
    padding-left: 30rpx;
    padding-right: 30rpx;
    border-radius: 12rpx;
  }
}

.menu-list__left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-list__icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon--about {
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
}

.menu-icon--contact {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
}

.menu-icon--help {
  background: linear-gradient(135deg, $secondary, #34D399);
}

.menu-icon--settings {
  background: linear-gradient(135deg, #64748B, #94A3B8);
}

.menu-icon--logout {
  background: linear-gradient(135deg, #EF4444, #F87171);
}

.menu-list__text {
  font-size: 30rpx;
  color: $text-primary;
}

.menu-list__text--danger {
  color: #EF4444;
}

.menu-list__item--logout {
  margin-top: 16rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid #F1F5F9;
}

/* ========== 图标文本 ========== */
.icon-text {
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 底部安全区 ========== */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}
</style>

