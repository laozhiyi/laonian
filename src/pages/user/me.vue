<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__brand">
        <text class="brand-emoji">👤</text>
        <text class="brand-name">我的</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 用户信息卡片 -->
      <view class="user-card" @tap="goLogin">
        <view class="user-info">
          <view class="user-avatar">
            <image v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" />
            <text v-else class="avatar-default">👤</text>
          </view>
          <view class="user-detail">
            <text class="user-nickname">{{ isLoggedIn ? (userInfo.nickname || '用户') : '点击登录/注册' }}</text>
            <text class="user-hint" v-if="!isLoggedIn">登录后享受更多服务</text>
            <text class="user-hint" v-else-if="userInfo.role === 'admin'">🌟 管理员账号 · 专属推广码：{{ userInfo.promoteCode || '暂无' }}</text>
            <text class="user-hint" v-else>推广码：{{ userInfo.promoteCode || '暂无' }}</text>
          </view>
        </view>
        <text class="user-arrow">›</text>
      </view>

      <!-- 登录/注册快捷入口（未登录时显示） -->
      <view class="auth-section" v-if="!isLoggedIn">
        <button class="auth-btn auth-btn--primary" @tap="goLogin">微信一键登录</button>
        <text class="auth-hint">登录即表示同意《用户协议》和《隐私政策》</text>
      </view>

      <!-- 学习数据概览 -->
      <view class="stats-overview">
        <view class="stat-item" @tap="goPage('/pages/user/learn-record')">
          <text class="stat-value">{{ stats.browseCount || 0 }}</text>
          <text class="stat-label">浏览记录</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goPage('/pages/user/favorites')">
          <text class="stat-value">{{ stats.favoriteCount || 0 }}</text>
          <text class="stat-label">我的收藏</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goPage('/pages/user/order')">
          <text class="stat-value">{{ stats.orderCount || 0 }}</text>
          <text class="stat-label">我的订单</text>
        </view>
      </view>

      <!-- 佣金概览（登录后显示） -->
      <view class="commission-card" v-if="isLoggedIn">
        <view class="commission-header">
          <text class="commission-title">💰 我的佣金</text>
          <text class="commission-tip">通过分享课程获得收益</text>
        </view>
        <view class="commission-stats">
          <view class="comm-item">
            <text class="comm-value">¥{{ formatPrice(userInfo.totalCommission || 0) }}</text>
            <text class="comm-label">累计佣金</text>
          </view>
          <view class="comm-divider"></view>
          <view class="comm-item">
            <text class="comm-value highlight">¥{{ formatPrice(userInfo.withdrawableCommission || 0) }}</text>
            <text class="comm-label">可提现</text>
          </view>
        </view>
      </view>

      <!-- 兴趣标签 -->
      <view class="interest-section" v-if="isLoggedIn && userInfo.interestTags?.length > 0">
        <view class="section-header">
          <text class="section-title">🎯 我的兴趣</text>
          <text class="section-hint">基于你的浏览行为智能推荐</text>
        </view>
        <view class="interest-tags">
          <view class="interest-tag" v-for="tag in userInfo.interestTags" :key="tag">
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 常用推荐 -->
      <view class="menu-section">
        <view class="section-header">
          <text class="section-title">📚 常用服务</text>
        </view>
        <view class="menu-card">
          <view class="menu-item" @tap="goHome">
            <view class="menu-icon menu-icon--orange">🏠</view>
            <view class="menu-info">
              <text class="menu-title">首页推荐</text>
              <text class="menu-desc">发现更多值得学的课程</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @tap="goDiscover">
            <view class="menu-icon menu-icon--teal">🔍</view>
            <view class="menu-info">
              <text class="menu-title">分类浏览</text>
              <text class="menu-desc">按分类探索课程</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @tap="goPage('/pages/user/learn-record')">
            <view class="menu-icon menu-icon--purple">📖</view>
            <view class="menu-info">
              <text class="menu-title">学习记录</text>
              <text class="menu-desc">查看你的浏览历史</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @tap="goPage('/pages/user/favorites')">
            <view class="menu-icon menu-icon--pink">⭐</view>
            <view class="menu-info">
              <text class="menu-title">我的收藏</text>
              <text class="menu-desc">收藏感兴趣的课程</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 最近浏览（Mock演示） -->
      <view class="recent-section" v-if="recentBrowse.length > 0">
        <view class="section-header">
          <text class="section-title">🕐 最近浏览</text>
          <view class="section-more" @tap="goPage('/pages/user/learn-record')">
            <text>查看全部</text>
            <text>›</text>
          </view>
        </view>
        <view class="recent-scroll">
          <view
            class="recent-card"
            v-for="item in recentBrowse"
            :key="item._id"
            @tap="goCourseDetail(item.courseId)"
          >
            <image class="recent-cover" :src="item.courseCover || 'https://img.yzcdn.cn/vant/cat.jpeg'" mode="aspectFill" />
            <text class="recent-title">{{ item.courseTitle }}</text>
          </view>
        </view>
      </view>

      <!-- 最近收藏 -->
      <view class="favorites-section" v-if="recentFavorites.length > 0">
        <view class="section-header">
          <text class="section-title">⭐ 最近收藏</text>
          <view class="section-more" @tap="goPage('/pages/user/favorites')">
            <text>查看全部</text>
            <text>›</text>
          </view>
        </view>
        <view class="favorites-scroll">
          <view
            class="favorite-card"
            v-for="fav in recentFavorites"
            :key="fav._id"
            @tap="goCourseDetail(fav.courseId)"
          >
            <image class="favorite-cover" :src="fav.courseCover || 'https://img.yzcdn.cn/vant/cat.jpeg'" mode="aspectFill" />
            <text class="favorite-title">{{ fav.courseTitle }}</text>
          </view>
        </view>
      </view>

      <!-- 设置与帮助 -->
      <view class="menu-section">
        <view class="section-header">
          <text class="section-title">⚙️ 设置与帮助</text>
        </view>
        <view class="menu-card">
          <view class="menu-item" @tap="goPage('/pages/user/settings')">
            <view class="menu-icon menu-icon--gray">🔤</view>
            <view class="menu-info">
              <text class="menu-title">设置</text>
              <text class="menu-desc">字体大小、清除缓存</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @tap="showAbout">
            <view class="menu-icon menu-icon--gray">ℹ️</view>
            <view class="menu-info">
              <text class="menu-title">关于我们</text>
              <text class="menu-desc">了解什么值得学</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @tap="showHelp">
            <view class="menu-icon menu-icon--gray">❓</view>
            <view class="menu-info">
              <text class="menu-title">帮助与反馈</text>
              <text class="menu-desc">遇到问题？联系我们</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 管理员入口 -->
      <view class="menu-section" v-if="isLoggedIn && isAdmin">
        <view class="section-header">
          <text class="section-title">🛠️ 管理功能</text>
        </view>
        <view class="menu-card">
          <view class="menu-item" @tap="goPage('/pages/admin/admin')">
            <view class="menu-icon menu-icon--red">⚡</view>
            <view class="menu-info">
              <text class="menu-title">管理后台</text>
              <text class="menu-desc">课程管理、订单佣金、数据统计</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section" v-if="isLoggedIn" @tap="handleLogout">
        <text>退出登录</text>
      </view>

      <!-- 快速体验入口（未登录时提示） -->
      <view class="demo-tips" v-if="!isLoggedIn">
        <text class="demo-tips__title">💡 演示模式</text>
        <text class="demo-tips__text">点击上方"微信一键登录"即可快速体验完整功能</text>
        <view class="demo-tips__actions">
          <view class="demo-btn" @tap="quickDemo">
            <text>快速体验（模拟登录）</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getCurrentUser,
  isLoggedIn as checkIsLoggedIn,
  isAdmin as checkIsAdmin,
  logout,
  getUserStats,
  getCurrentUserId,
  wechatLogin,
  updateUserInfo
} from '@/utils/user.js'
import { getFavorites } from '@/utils/favorite.js'
import { getBrowseHistory } from '@/utils/track.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px)`,
  }
})

// ========== 用户状态 ==========
const isLoggedIn = computed(() => checkIsLoggedIn())
const isAdmin = computed(() => checkIsAdmin())
const userInfo = computed(() => getCurrentUser() || {})

// ========== 统计数据 ==========
const stats = ref({ browseCount: 0, favoriteCount: 0, orderCount: 0 })

// ========== 最近浏览 ==========
const recentBrowse = ref([])

// ========== 最近收藏 ==========
const recentFavorites = ref([])

// ========== 加载数据 ==========
const loadData = async () => {
  const userId = getCurrentUserId()

  if (userId) {
    const [statsRes, favRes, browseRes] = await Promise.all([
      getUserStats(userId),
      getFavorites(userId),
      getBrowseHistory(userId, 1, 4)
    ])

    if (statsRes.ok && statsRes.data) {
      stats.value = statsRes.data
    }

    if (favRes.ok && favRes.list) {
      recentFavorites.value = favRes.list.slice(0, 4)
    }

    if (browseRes.ok && browseRes.list) {
      recentBrowse.value = browseRes.list
    }
  } else {
    // 未登录时也加载展示数据
    const [favRes, browseRes] = await Promise.all([
      getFavorites(null),
      getBrowseHistory(null, 1, 4)
    ])
    if (favRes.ok) recentFavorites.value = favRes.list.slice(0, 4)
    if (browseRes.ok) recentBrowse.value = browseRes.list
  }
}

// ========== 格式化金额 ==========
const formatPrice = (fen) => {
  if (!fen) return '0.00'
  return (fen / 100).toFixed(2)
}

// ========== 页面跳转 ==========
const goPage = (url) => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { goLogin() }, 1000)
    return
  }
  uni.navigateTo({ url })
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const goDiscover = () => {
  uni.switchTab({ url: '/pages/discover/discover' })
}

const goCourseDetail = (courseId) => {
  if (courseId) {
    uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` })
  }
}

// ========== 快速体验（模拟登录） ==========
const quickDemo = async () => {
  uni.showLoading({ title: '模拟登录中...' })
  try {
    const result = await wechatLogin({ nickname: '演示用户', avatarUrl: '' })
    if (result.ok) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      await loadData()
    }
  } catch (e) {
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
  uni.hideLoading()
}

// ========== 退出登录 ==========
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await logout()
        stats.value = { browseCount: 0, favoriteCount: 0, orderCount: 0 }
        recentFavorites.value = []
        recentBrowse.value = []
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}

// ========== 显示关于 ==========
const showAbout = () => {
  uni.showModal({
    title: '关于什么值得学',
    content: `📚 什么值得学 - 终身学习推荐平台

🎯 我们的使命：帮助中老年人发现值得学习的优质课程

💡 我们不制作课程，只做优质课程的推荐官和搬运工

📖 功能特点：
• 智能推荐 - 基于你的兴趣推荐课程
• 分类浏览 - 按兴趣分类探索课程
• 收藏管理 - 保存感兴趣的课程
• 学习记录 - 记录浏览足迹

💰 盈利模式：
通过推荐用户购买第三方课程，获取分销佣金

📱 版本：v1.0.0`,
    showCancel: false
  })
}

// ========== 显示帮助 ==========
const showHelp = () => {
  uni.showModal({
    title: '帮助与反馈',
    content: `❓ 常见问题

Q: 如何购买课程？
A: 点击课程详情页的"去看看"按钮，会跳转到第三方平台购买。

Q: 佣金如何提现？
A: 在"我的订单"页面查看佣金，累计到一定金额后可申请提现。

Q: 如何分享课程？
A: 在课程详情页点击右上角分享按钮即可。

📞 联系我们
客服电话：400-188-8888
工作时间：8:30-20:30
商务合作：bd@smzlearn.com`,
    showCancel: false
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$purple: #9B59B6;
$pink: #E91E63;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
}

/* 毛玻璃导航 */
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
  justify-content: center;
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-emoji {
  font-size: 40rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 用户信息卡片 */
.user-card {
  margin: 20rpx 24rpx;
  background: $orange-gradient;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.3);
  animation: slideUpFade 0.4s ease-out;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }

  .avatar-default {
    font-size: 50rpx;
  }
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.user-hint {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}

.user-arrow {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 快捷登录 */
.auth-section {
  margin: 0 24rpx 20rpx;
  text-align: center;
}

.auth-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  border: none;

  &--primary {
    background: #07C160;
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.auth-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 20rpx;
  color: $text-muted;
}

/* 统计数据 */
.stats-overview {
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 0;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out 0.1s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  &:active {
    opacity: 0.7;
  }
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $text-muted;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #f0f0f0;
}

/* 佣金卡片 */
.commission-card {
  margin: 0 24rpx 20rpx;
  background: linear-gradient(135deg, #FF9F5A 0%, $primary 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.25);
  animation: slideUpFade 0.4s ease-out 0.15s both;
}

.commission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.commission-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
}

.commission-tip {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.commission-stats {
  display: flex;
  align-items: center;
}

.comm-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.comm-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;

  &.highlight {
    color: #FFD700;
  }
}

.comm-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}

.comm-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* 兴趣标签 */
.interest-section {
  margin: 0 24rpx 20rpx;
  animation: slideUpFade 0.4s ease-out 0.2s both;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-hint {
  font-size: 22rpx;
  color: $text-muted;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: $primary;
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.interest-tag {
  padding: 10rpx 24rpx;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 159, 90, 0.05));
  border: 1rpx solid rgba(255, 107, 53, 0.2);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 500;
}

/* 菜单区块 */
.menu-section {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.menu-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out both;
}

.menu-item {
  display: flex;
  align-items: center;
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

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  flex-shrink: 0;

  &--orange { background: rgba(255, 107, 53, 0.1); }
  &--teal { background: rgba(78, 205, 196, 0.1); }
  &--purple { background: rgba(155, 89, 182, 0.1); }
  &--pink { background: rgba(233, 30, 99, 0.1); }
  &--gray { background: rgba(0, 0, 0, 0.05); }
  &--red { background: rgba(255, 71, 87, 0.1); }
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 22rpx;
  color: $text-muted;
}

.menu-arrow {
  font-size: 40rpx;
  color: $text-muted;
  opacity: 0.5;
}

/* 最近浏览 */
.recent-section {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  animation: slideUpFade 0.4s ease-out both;
}

.recent-scroll {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
  -webkit-overflow-scrolling: touch;
}

.recent-card {
  width: 200rpx;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.recent-cover {
  width: 100%;
  height: 160rpx;
}

.recent-title {
  display: block;
  padding: 12rpx;
  font-size: 24rpx;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 最近收藏 */
.favorites-section {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  animation: slideUpFade 0.4s ease-out both;
}

.favorites-scroll {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
  -webkit-overflow-scrolling: touch;
}

.favorite-card {
  width: 200rpx;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.favorite-cover {
  width: 100%;
  height: 160rpx;
}

.favorite-title {
  display: block;
  padding: 12rpx;
  font-size: 24rpx;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 退出登录 */
.logout-section {
  margin: 40rpx 24rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;

  text {
    font-size: 30rpx;
    color: #ff4d4f;
  }

  &:active {
    background: #fff5f5;
  }
}

/* 演示提示 */
.demo-tips {
  margin: 20rpx 24rpx;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(155, 89, 182, 0.05));
  border: 1rpx dashed rgba(78, 205, 196, 0.4);
  border-radius: 20rpx;
  padding: 28rpx;
  animation: slideUpFade 0.4s ease-out both;

  &__title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: $secondary;
    margin-bottom: 12rpx;
  }

  &__text {
    display: block;
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }

  &__actions {
    display: flex;
    justify-content: center;
  }
}

.demo-btn {
  padding: 16rpx 40rpx;
  background: $secondary;
  border-radius: 30rpx;

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.bottom-spacer {
  height: 40rpx;
}
</style>
