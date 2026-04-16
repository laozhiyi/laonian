<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">课程管理</text>
      <view class="glass-nav__add" @tap="goAddCourse">
        <text>+ 添加</text>
      </view>
    </view>

    <!-- 搜索筛选 -->
    <view class="filter-bar">
      <view class="filter-tabs">
        <view
          class="filter-tab"
          :class="{ active: statusFilter === '' }"
          @tap="setStatusFilter('')"
        >全部</view>
        <view
          class="filter-tab"
          :class="{ active: statusFilter === 'online' }"
          @tap="setStatusFilter('online')"
        >上架</view>
        <view
          class="filter-tab"
          :class="{ active: statusFilter === 'offline' }"
          @tap="setStatusFilter('offline')"
        >下架</view>
      </view>
      <view class="search-wrap">
        <input class="search-input" v-model="keyword" placeholder="搜索课程..." @confirm="doSearch" />
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y @scrolltolower="loadMore" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 课程列表 -->
      <view class="course-list" v-if="courseList.length > 0">
        <view
          class="course-item"
          v-for="(course, index) in courseList"
          :key="course.id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <image class="course-cover" :src="course.cover" mode="aspectFill" />
          <view class="course-info">
            <text class="course-title">{{ course.title }}</text>
            <text class="course-meta">{{ course.categoryName }} · {{ course.platform }}</text>
            <view class="course-tags">
              <view class="status-tag" :class="'status--' + course.status">
                {{ course.status === 'online' ? '上架' : '下架' }}
              </view>
              <text class="view-count">访问 {{ course.viewCount || 0 }}</text>
              <text class="click-count">点击 {{ course.clickCount || 0 }}</text>
            </view>
            <view class="course-price">
              <text class="price-now">¥{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
              <text class="price-original" v-if="course.price && course.price > course.priceNow">
                ¥{{ ((course.price || 0) / 100).toFixed(2) }}
              </text>
            </view>
          </view>
          <view class="course-actions">
            <view class="action-btn edit" @tap="goEditCourse(course)">
              <text>编辑</text>
            </view>
            <view class="action-btn toggle" @tap="toggleStatus(course)">
              <text>{{ course.status === 'online' ? '下架' : '上架' }}</text>
            </view>
            <view class="action-btn delete" @tap="deleteCourse(course)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-item" v-for="n in 5" :key="n"></view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📚</text>
        <text class="empty-text">暂无课程</text>
        <view class="empty-btn" @tap="goAddCourse">
          <text>添加课程</text>
        </view>
      </view>

      <view class="load-more" v-if="courseList.length > 0 && !hasMore">
        <text>— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourses, toggleCourseStatus, deleteCourse as apiDeleteCourse } from '@/utils/course.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const filterBarHeight = 100

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + filterBarHeight
  return {
    height: `calc(100vh - ${totalTop}px)`,
  }
})

// ========== 筛选状态 ==========
const statusFilter = ref('')
const keyword = ref('')

// ========== 数据 ==========
const courseList = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// ========== 设置状态筛选 ==========
const setStatusFilter = async (status) => {
  statusFilter.value = status
  await loadData(true)
}

// ========== 搜索 ==========
const doSearch = async () => {
  await loadData(true)
}

// ========== 加载数据 ==========
const loadData = async (refresh = false) => {
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
    courseList.value = []
  }

  if (!hasMore.value) return
  isLoading.value = true

  const res = await getCourses({
    status: statusFilter.value || undefined,
    page: currentPage.value,
    limit: 20
  })

  if (res.ok && res.list) {
    let list = res.list

    // 关键词筛选
    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase()
      list = list.filter(c =>
        (c.title && c.title.toLowerCase().includes(kw)) ||
        (c.platform && c.platform.toLowerCase().includes(kw))
      )
    }

    if (refresh) {
      courseList.value = list
    } else {
      courseList.value = [...courseList.value, ...list]
    }
    hasMore.value = res.list.length >= 20
    currentPage.value++
  }

  isLoading.value = false
}

// ========== 加载更多 ==========
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadData()
  }
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await loadData(true)
  isRefreshing.value = false
}

// ========== 切换状态 ==========
const toggleStatus = async (course) => {
  const newStatus = course.status === 'online' ? 'offline' : 'online'
  uni.showModal({
    title: '确认',
    content: `确定要${newStatus === 'online' ? '上架' : '下架'}该课程吗？`,
    success: async (res) => {
      if (res.confirm) {
        const result = await toggleCourseStatus(course.id || course._id, newStatus)
        if (result.ok) {
          course.status = newStatus
          uni.showToast({ title: '操作成功', icon: 'success' })
        }
      }
    }
  })
}

// ========== 删除课程 ==========
const deleteCourse = async (course) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该课程吗？此操作不可恢复！',
    success: async (res) => {
      if (res.confirm) {
        const result = await apiDeleteCourse(course.id || course._id)
        if (result.ok) {
          courseList.value = courseList.value.filter(c => (c.id || c._id) !== (course.id || course._id))
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      }
    }
  })
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

const goAddCourse = () => {
  uni.navigateTo({ url: '/pages/admin/course-form' })
}

const goEditCourse = (course) => {
  uni.navigateTo({ url: `/pages/admin/course-form?id=${course.id || course._id}` })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  isLoading.value = true
  loadData(true)
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$secondary: #4ECDC4;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

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

.glass-nav__add {
  padding: 10rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 筛选栏 */
.filter-bar {
  position: fixed;
  top: calc(var(--status-bar-height, 0px) + 88rpx);
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  z-index: 99;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 20rpx;
}

.filter-tabs {
  display: flex;
  gap: 8rpx;
}

.filter-tab {
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: $text-secondary;
  background: #f5f5f5;
  transition: all 0.2s;

  &.active {
    background: $orange-gradient;
    color: #fff;
    font-weight: 600;
  }
}

.search-wrap {
  flex: 1;
}

.search-input {
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}

.scroll {
  position: relative;
  z-index: 1;
}

/* 课程列表 */
.course-list {
  padding: 20rpx 24rpx;
}

.course-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out both;
}

.course-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.course-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.course-meta {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 10rpx;
}

.course-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.status-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;

  &.status--online {
    background: rgba(7, 193, 96, 0.1);
    color: #07C160;
  }

  &.status--offline {
    background: rgba(255, 77, 79, 0.1);
    color: #FF4D4F;
  }
}

.view-count,
.click-count {
  font-size: 20rpx;
  color: $text-muted;
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-top: auto;
}

.price-now {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.price-original {
  font-size: 22rpx;
  color: $text-muted;
  text-decoration: line-through;
}

.course-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-left: 16rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  text-align: center;

  &.edit {
    background: rgba(255, 107, 53, 0.1);
    color: $primary;
  }

  &.toggle {
    background: rgba(78, 205, 196, 0.1);
    color: $secondary;
  }

  &.delete {
    background: rgba(255, 77, 79, 0.1);
    color: #FF4D4F;
  }
}

/* 骨架屏 */
.skeleton-list {
  padding: 20rpx 24rpx;
}

.skeleton-item {
  height: 200rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 30rpx;
    color: $text-secondary;
    margin-bottom: 32rpx;
  }

  .empty-btn {
    padding: 20rpx 48rpx;
    background: $orange-gradient;
    border-radius: 32rpx;

    text {
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }
  }
}

.load-more {
  text-align: center;
  padding: 40rpx;
  font-size: 24rpx;
  color: $text-muted;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
