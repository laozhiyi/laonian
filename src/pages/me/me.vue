<template>
  <view class="page">
    <!-- 用户头部 -->
    <view class="user-card">
      <view class="user-card__avatar">
        <text class="user-card__avatar--text">{{ userInfo?.avatar ? '' : '🍊' }}</text>
        <image v-if="userInfo?.avatar" class="user-card__avatar--img" :src="userInfo.avatar" mode="aspectFill" />
      </view>
      <view class="user-card__info">
        <view class="user-card__name">{{ isLoggedIn && userInfo.username ? userInfo.username : '游客' }}</view>
        <view class="user-card__status">{{ isLoggedIn ? '已登录' : '未登录' }}</view>
      </view>
      <view class="user-card__action" v-if="!isLoggedIn" @tap="goLogin">去登录</view>
      <view class="user-card__action user-card__action--logout" v-else @tap="handleLogout">退出</view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" v-for="menu in menuList" :key="menu.key" @tap="onMenuTap(menu)">
        <view class="menu-item__icon">{{ menu.icon }}</view>
        <view class="menu-item__name">{{ menu.name }}</view>
        <text class="menu-item__arrow">›</text>
      </view>
    </view>

    <!-- 管理员功能 -->
    <view class="menu-list" v-if="isAdmin">
      <view class="menu-item" @tap="goAdmin">
        <view class="menu-item__icon">📦</view>
        <view class="menu-item__name">商品管理</view>
        <text class="menu-item__arrow">›</text>
      </view>
    </view>

    <!-- 底部关于 -->
    <view class="about-section">
      <view class="about-item" @tap="onAboutTap">
        <text>关于我们</text>
        <text class="about-item__arrow">›</text>
      </view>
      <view class="about-item" @tap="onContactTap">
        <text>联系客服</text>
        <text class="about-item__arrow">›</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version">v1.0.0</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCurrentUser, logout } from '@/utils/user.js'

// ========== 用户信息（响应式） ==========
const userInfo = computed(() => getCurrentUser())

// ========== 是否已登录 ==========
const isLoggedIn = computed(() => !!userInfo.value)

// ========== 是否是管理员 ==========
const isAdmin = computed(() => userInfo.value?.role === 'admin')

// ========== 菜单列表 ==========
const menuList = ref([
  { key: 'orders', name: '我的订单', icon: '📦' },
  { key: 'address', name: '收货地址', icon: '📍' },
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
      }
    }
  })
}

const onMenuTap = (menu) => {
  if (!isLoggedIn.value) {
    goLogin()
    return
  }
  if (menu.key === 'address') {
    uni.navigateTo({ url: '/pages/address/address' })
  } else {
    toast('订单功能开发中')
  }
}

const goAdmin = () => {
  uni.navigateTo({ url: '/pages/admin/admin' })
}

const onAboutTap = () => {
  uni.showModal({
    title: '关于我们',
    content: '橘上生香\n优质农特产品电商平台',
    showCancel: false
  })
}

const onContactTap = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-xxx-xxxx\n工作时间：9:00-18:00',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$primary-light: #FFB347;
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
  padding: 24rpx;
  box-sizing: border-box;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fff, #fff);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
}

.user-card__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $primary-light);
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-card__avatar--text {
  font-size: 48rpx;
}

.user-card__avatar--img {
  width: 100%;
  height: 100%;
}

.user-card__info {
  flex: 1;
}

.user-card__name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  margin-bottom: 8rpx;
}

.user-card__status {
  font-size: 24rpx;
  color: $sub;
  background: rgba(255, 144, 0, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  display: inline-block;
}

.user-card__action {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(255, 144, 0, 0.3);
}

.user-card__action--logout {
  background: #f5f5f5;
  color: $sub;
  box-shadow: none;
}

/* 菜单列表 */
.menu-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background 0.2s ease;
}

.menu-item:active {
  background: rgba(255, 144, 0, 0.05);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item__icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.menu-item__name {
  flex: 1;
  font-size: 28rpx;
  color: $text;
}

.menu-item__arrow {
  font-size: 32rpx;
  color: $sub;
}

.menu-item--admin {
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.05), rgba(255, 179, 71, 0.05));
}

.menu-item--admin .menu-item__name {
  color: $primary;
  font-weight: 600;
}

/* 关于区域 */
.about-section {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.08);
}

.about-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  font-size: 28rpx;
  color: $text;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background 0.2s ease;
}

.about-item:active {
  background: rgba(255, 144, 0, 0.05);
}

.about-item:last-child {
  border-bottom: none;
}

.about-item__arrow {
  font-size: 32rpx;
  color: $sub;
}

/* 版本信息 */
.version {
  text-align: center;
  margin-top: 48rpx;
  font-size: 22rpx;
  color: $sub;
}
</style>
