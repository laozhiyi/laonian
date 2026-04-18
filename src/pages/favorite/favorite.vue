<template>
  <view class="page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-blob bg-blob--1"></view>
      <view class="bg-blob bg-blob--2"></view>
    </view>

    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar__back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-bar__title">我的收藏</text>
      <view class="nav-bar__placeholder"></view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && favorites.length === 0">
        <text class="empty-icon">❤️</text>
        <text class="empty-text">暂无收藏</text>
        <text class="empty-sub">快去收藏喜欢的课程吧</text>
        <view class="empty-btn" @tap="goMall">
          <text>去逛逛</text>
        </view>
      </view>

      <!-- 收藏列表 -->
      <view class="favorite-list" v-else>
        <view
          class="favorite-item"
          v-for="item in favorites"
          :key="item.id"
        >
          <view class="favorite-item__cover-wrap" @tap="goCourseDetail(item)">
            <image class="favorite-item__cover" :src="item.course?.cover || '/static/covers/default.jpg'" mode="aspectFill" />
            <view class="favorite-item__type-tag" :class="{ 'favorite-item__type-tag--external': item.isExternal }">
              <text>{{ item.isExternal ? '外部' : '内部' }}</text>
            </view>
          </view>
          <view class="favorite-item__info" @tap="goCourseDetail(item)">
            <text class="favorite-item__title">{{ item.course?.title || '课程已下架' }}</text>
            <text class="favorite-item__category" v-if="item.course?.category">{{ item.course.category }}</text>
            <text class="favorite-item__time">{{ formatTime(item.created_at) }}</text>
          </view>
          <view class="favorite-item__action" @tap.stop="handleRemove(item)">
            <text class="action-icon">❤️</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore && favorites.length > 0">
          <text>加载中...</text>
        </view>

        <!-- 没有更多 -->
        <view class="no-more" v-if="!hasMore && favorites.length > 0">
          <text>— 没有更多了 —</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentUser } from '@/utils/user.js'
import { getFavorites, removeFavorite } from '@/utils/favorite.js'
import { getCourses } from '@/utils/course.js'
import { getExternalCourses } from '@/utils/external-course.js'

// 状态栏高度
const statusBarHeight = ref(0)
const loading = ref(false)
const favorites = ref([])
const hasMore = ref(false)

// 课程缓存
const courseCache = ref({})

// 获取用户信息
const getUserId = () => {
  const user = getCurrentUser()
  return user?.id || null
}

// 加载收藏列表
const loadFavorites = async () => {
  const userId = getUserId()
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  loading.value = true
  
  // 先加载课程缓存
  await loadCourseCache()
  
  const res = await getFavorites(userId)
  loading.value = false

  if (res.ok) {
    // 处理收藏列表，填充课程信息
    favorites.value = res.list.map(item => {
      const isExternal = item.is_external === 1 || item.is_external === true
      const courseId = item.course_id
      
      let courseInfo = null
      if (isExternal) {
        courseInfo = courseCache.value.external[courseId] || null
      } else {
        courseInfo = courseCache.value.internal[courseId] || null
      }
      
      return {
        ...item,
        course: courseInfo,
        isExternal: isExternal
      }
    })
    hasMore.value = false
  } else {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 加载课程缓存
const loadCourseCache = async () => {
  try {
    // 加载内部课程
    const internalRes = await getCourses()
    const internalMap = {}
    if (internalRes?.list) {
      internalRes.list.forEach(course => {
        const id = course._id || course.id
        internalMap[id] = {
          ...course,
          id: id,
          title: course.title,
          cover: course.cover,
          category: course.category
        }
      })
    }
    
    // 加载外部课程
    const externalRes = await getExternalCourses()
    const externalMap = {}
    if (externalRes?.list) {
      externalRes.list.forEach(course => {
        externalMap[course.id] = {
          ...course,
          title: course.title,
          cover: course.cover,
          category: course.category
        }
      })
    }
    
    courseCache.value = {
      internal: internalMap,
      external: externalMap
    }
  } catch (e) {
    console.error('加载课程缓存失败:', e)
  }
}

// 加载更多
const loadMore = () => {
  // 目前一次性加载所有，暂时不做分页
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 跳转课程详情
const goCourseDetail = (item) => {
  if (!item.course) {
    uni.showToast({ title: '课程已下架', icon: 'none' })
    return
  }
  
  if (item.isExternal) {
    // 外部课程
    uni.navigateTo({ url: `/pages/external-course/detail?id=${item.course_id}` })
  } else {
    // 内部课程
    uni.navigateTo({ url: `/pages/product/detail?id=${item.course_id}` })
  }
}

// 移除收藏
const handleRemove = async (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏吗？',
    success: async (res) => {
      if (res.confirm) {
        const result = await removeFavorite(item.id)
        if (result.ok) {
          uni.showToast({ title: '已取消收藏', icon: 'success' })
          // 从列表中移除
          const index = favorites.value.findIndex(f => f.id === item.id)
          if (index > -1) {
            favorites.value.splice(index, 1)
          }
        } else {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 去商城
const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadFavorites()
})
</script>

<style lang="scss" scoped>
$primary: #2563EB;
$primary-light: #3B82F6;
$primary-dark: #1D4ED8;
$secondary: #10B981;
$accent: #F59E0B;
$text-primary: #1E293B;
$text-secondary: #64748B;
$text-muted: #94A3B8;
$bg-light: #F8FAFC;
$card-bg: #FFFFFF;

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100rpx);
}

.bg-blob--1 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  top: -200rpx;
  right: -100rpx;
  opacity: 0.8;
}

.bg-blob--2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #EC4899 0%, $primary-light 100%);
  top: -150rpx;
  left: -150rpx;
  opacity: 0.5;
}

/* 导航栏 */
.nav-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: transparent;
}

.nav-bar__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-bar__placeholder {
  width: 64rpx;
}

/* 内容区域 */
.content {
  position: relative;
  z-index: 1;
  height: calc(100vh - 88rpx - env(safe-area-inset-bottom));
  padding: 20rpx 24rpx;
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
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 36rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.empty-sub {
  font-size: 28rpx;
  color: $text-muted;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 20rpx 60rpx;
  background: $primary;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);

  text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 600;
  }
}

/* 收藏列表 */
.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.favorite-item {
  display: flex;
  align-items: center;
  background: $card-bg;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.favorite-item__cover-wrap {
  position: relative;
  flex-shrink: 0;
}

.favorite-item__cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  object-fit: cover;
  background: #f0f0f0;
}

.favorite-item__type-tag {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 10rpx;
  background: $primary;
  border-radius: 8rpx;
  font-size: 18rpx;
  font-weight: 600;
  color: #fff;
}

.favorite-item__type-tag--external {
  background: $secondary;
}

.favorite-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20rpx;
  overflow: hidden;
}

.favorite-item__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-item__category {
  font-size: 24rpx;
  color: $primary;
  margin-bottom: 8rpx;
}

.favorite-item__time {
  font-size: 22rpx;
  color: $text-muted;
}

.favorite-item__action {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon {
  font-size: 40rpx;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: $text-muted;
}

.no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: $text-muted;
}
</style>
