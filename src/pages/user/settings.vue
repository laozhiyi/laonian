<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">设置</text>
      <view class="glass-nav__placeholder" />
    </view>

    <view class="content">
      <!-- 显示设置 -->
      <view class="settings-section">
        <view class="section-title">显示设置</view>
        <view class="settings-card">
          <view class="settings-item">
            <view class="settings-item__left">
              <text class="settings-icon">🔤</text>
              <view class="settings-info">
                <text class="settings-title">字体大小</text>
                <text class="settings-desc">调整页面字体大小</text>
              </view>
            </view>
            <view class="settings-item__right" @tap="showFontPicker">
              <text class="settings-value">{{ fontSizeLabel }}</text>
              <text class="settings-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 缓存管理 -->
      <view class="settings-section">
        <view class="section-title">存储设置</view>
        <view class="settings-card">
          <view class="settings-item">
            <view class="settings-item__left">
              <text class="settings-icon">🗑️</text>
              <view class="settings-info">
                <text class="settings-title">清除缓存</text>
                <text class="settings-desc">当前缓存大小</text>
              </view>
            </view>
            <view class="settings-item__right" @tap="clearCache">
              <text class="settings-value">{{ cacheSize }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="settings-section">
        <view class="section-title">关于</view>
        <view class="settings-card">
          <view class="settings-item" @tap="showAbout">
            <view class="settings-item__left">
              <text class="settings-icon">ℹ️</text>
              <view class="settings-info">
                <text class="settings-title">关于什么值得学</text>
                <text class="settings-desc">了解更多</text>
              </view>
            </view>
            <text class="settings-arrow">›</text>
          </view>
          <view class="settings-item">
            <view class="settings-item__left">
              <text class="settings-icon">📋</text>
              <view class="settings-info">
                <text class="settings-title">用户协议</text>
              </view>
            </view>
            <text class="settings-arrow">›</text>
          </view>
          <view class="settings-item">
            <view class="settings-item__left">
              <text class="settings-icon">🔒</text>
              <view class="settings-info">
                <text class="settings-title">隐私政策</text>
              </view>
            </view>
            <text class="settings-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 版本信息 -->
      <view class="version-info">
        <text>什么值得学 v1.0.0</text>
        <text>终身学习，值得投资</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentUser, updateUserInfo, getCurrentUserId } from '@/utils/user.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 字体大小 ==========
const fontSizeMode = ref('normal')

const fontSizeLabel = computed(() => {
  const map = {
    normal: '标准',
    large: '大',
    extra: '超大'
  }
  return map[fontSizeMode.value] || '标准'
})

// ========== 缓存大小 ==========
const cacheSize = ref('0 MB')

// ========== 加载设置 ==========
const loadSettings = () => {
  const user = getCurrentUser()
  if (user && user.fontSize) {
    fontSizeMode.value = user.fontSize
  }

  // 获取缓存大小
  try {
    const info = uni.getStorageInfoSync()
    if (info) {
      const sizeKB = info.currentSize
      if (sizeKB > 1024) {
        cacheSize.value = (sizeKB / 1024).toFixed(1) + ' MB'
      } else {
        cacheSize.value = sizeKB + ' KB'
      }
    }
  } catch (e) {
    cacheSize.value = '未知'
  }
}

// ========== 显示字体选择器 ==========
const showFontPicker = () => {
  uni.showActionSheet({
    itemList: ['标准', '大', '超大'],
    success: (res) => {
      const modes = ['normal', 'large', 'extra']
      const mode = modes[res.tapIndex]
      fontSizeMode.value = mode

      // 保存到用户设置
      const userId = getCurrentUserId()
      if (userId) {
        updateUserInfo(userId, { fontSize: mode })
      }

      uni.showToast({ title: '字体已调整', icon: 'success' })
    }
  })
}

// ========== 清除缓存 ==========
const clearCache = () => {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        cacheSize.value = '0 KB'
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

// ========== 显示关于 ==========
const showAbout = () => {
  uni.showModal({
    title: '关于什么值得学',
    content: `什么值得学 - 终身学习推荐平台

帮助中老年人发现值得学习的优质课程，通过智能推荐帮助找到感兴趣的学习资源。

我们不制作课程，只做优质课程的搬运工和推荐官。

主要功能：
• 课程推荐 - 基于你的兴趣推荐
• 搜索发现 - 找到想要的课程
• 学习记录 - 记录你的浏览足迹
• 收藏管理 - 保存感兴趣的内容

版本：v1.0.0`,
    showCancel: false
  })
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadSettings()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
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
}

.glass-nav__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }

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

.content {
  padding-top: calc(var(--status-bar-height, 0px) + 88rpx + 20rpx);
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.settings-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
  margin-left: 8rpx;
}

.settings-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f8f8;
  }
}

.settings-item__left {
  display: flex;
  align-items: center;
  flex: 1;
}

.settings-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.settings-info {
  display: flex;
  flex-direction: column;
}

.settings-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.settings-desc {
  font-size: 24rpx;
  color: $text-muted;
}

.settings-item__right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.settings-value {
  font-size: 28rpx;
  color: $text-muted;
}

.settings-arrow {
  font-size: 40rpx;
  color: $text-muted;
  opacity: 0.5;
}

.version-info {
  text-align: center;
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: $text-muted;
  }
}
</style>
