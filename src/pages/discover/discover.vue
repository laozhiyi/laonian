<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">🔍</text>
        <text class="brand-name">{{ pageTitle }}</text>
      </view>
      <view class="glass-nav__placeholder" />
    </view>

    <!-- 分类标签栏（吸顶） -->
    <view class="category-tabs" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
      <scroll-view class="tabs-scroll" scroll-x>
        <view
          class="tab-item"
          :class="{ active: selectedCategoryId === '' }"
          @tap="selectCategory('')"
        >全部</view>
        <view
          class="tab-item"
          :class="{ active: selectedCategoryId === cat.id }"
          v-for="cat in categoryList"
          :key="cat.id"
          @tap="selectCategory(cat)"
        >{{ cat.name }}</view>
      </scroll-view>
    </view>

    <!-- 筛选排序栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: sortBy === 'comprehensive' }"
        @tap="selectSort('comprehensive')"
      >综合</view>
      <view
        class="filter-item"
        :class="{ active: sortBy === 'hot' }"
        @tap="selectSort('hot')"
      >最热</view>
      <view
        class="filter-item"
        :class="{ active: sortBy === 'new' }"
        @tap="selectSort('new')"
      >最新</view>
      <view
        class="filter-item price-filter"
        :class="{ active: sortBy === 'price' }"
        @tap="selectSort('price')"
      >
        <text>价格</text>
        <view class="price-arrow" :class="{ up: sortBy === 'price' && priceOrder === 'asc', down: sortBy === 'price' && priceOrder === 'desc' }"></view>
      </view>
    </view>

    <scroll-view
      class="scroll"
      :style="scrollStyle"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 课程列表 -->
      <view class="course-list" v-if="courseList.length > 0">
        <view
          class="course-item"
          v-for="(course, index) in courseList"
          :key="course.id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
          @tap="goCourseDetail(course)"
        >
          <view class="course-item__cover">
            <image class="course-item__image" :src="course.cover" mode="aspectFill" />
            <view class="course-item__platform-tag">{{ course.platform }}</view>
          </view>
          <view class="course-item__info">
            <text class="course-item__title">{{ course.title }}</text>
            <text class="course-item__instructor">{{ course.instructor?.name || '讲师' }} · {{ course.platform }}</text>
            <view class="course-item__tags" v-if="course.tags && course.tags.length > 0">
              <view class="mini-tag" v-for="tag in course.tags.slice(0, 2)" :key="tag">{{ tag }}</view>
            </view>
            <view class="course-item__footer">
              <view class="price-group">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
                <text class="price-original" v-if="course.price && course.price > course.priceNow">
                  ¥{{ ((course.price || 0) / 100).toFixed(2) }}
                </text>
              </view>
              <view class="course-meta">
                <text v-if="course.rating">⭐ {{ course.rating }}</text>
                <text v-if="course.studentCount">{{ course.studentCount }}人在学</text>
              </view>
            </view>
          </view>
          <view class="course-item__action" @tap.stop="goLearn(course)">
            <text>去看看</text>
          </view>
        </view>
      </view>

      <!-- 骨架屏 -->
      <view class="skeleton-list" v-else-if="isLoading">
        <view class="skeleton-item" v-for="n in 5" :key="n">
          <view class="skeleton-cover"></view>
          <view class="skeleton-info">
            <view class="skeleton-title"></view>
            <view class="skeleton-sub"></view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📚</text>
        <text class="empty-text">暂无相关课程</text>
        <text class="empty-hint">试试其他分类吧</text>
      </view>

      <!-- 底部提示 -->
      <view class="load-more" v-if="courseList.length > 0 && !hasMore">
        <text class="load-more__text">— 没有更多了 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourses } from '@/utils/course.js'
import { getCategories } from '@/utils/category.js'
import { getCurrentUserId } from '@/utils/user.js'
import { addBrowseLog, recordClick } from '@/utils/track.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const filterBarHeight = 88

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + filterBarHeight + 100
  return {
    paddingTop: '0',
    height: `calc(100vh - ${totalTop}px - ${safeBottom}px)`,
  }
})

// ========== 页面参数 ==========
const pageTitle = ref('发现')
const selectedCategoryId = ref('')
const selectedCategoryName = ref('')
const sortBy = ref('comprehensive')
const priceOrder = ref('asc')

// ========== 分类数据 ==========
const categoryList = ref([])

// ========== 课程数据 ==========
const courseList = ref([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// ========== 用户ID ==========
const userId = computed(() => getCurrentUserId())

// ========== 加载分类 ==========
const loadCategories = async () => {
  const res = await getCategories()
  if (res.ok && res.list) {
    categoryList.value = res.list
  }
}

// ========== 加载课程 ==========
const loadCourses = async (refresh = false) => {
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
    courseList.value = []
  }

  if (!hasMore.value) return
  isLoading.value = true

  const sort = sortBy.value
  const order = sort === 'price' ? priceOrder.value : 'desc'

  const res = await getCourses({
    categoryId: selectedCategoryId.value,
    sortBy: sort,
    status: 'online',
    page: currentPage.value,
    limit: 20
  })

  if (res.ok && res.list) {
    if (refresh) {
      courseList.value = res.list
    } else {
      courseList.value = [...courseList.value, ...res.list]
    }
    hasMore.value = res.list.length >= 20
    currentPage.value++
  }

  isLoading.value = false
}

// ========== 加载更多 ==========
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadCourses()
  }
}

// ========== 刷新 ==========
const onRefresh = async () => {
  isRefreshing.value = true
  await loadCourses(true)
  isRefreshing.value = false
}

// ========== 选择分类 ==========
const selectCategory = async (cat) => {
  if (cat === '') {
    selectedCategoryId.value = ''
    pageTitle.value = '发现'
  } else {
    selectedCategoryId.value = cat.id || cat._id
    pageTitle.value = cat.name
  }
  await loadCourses(true)
}

// ========== 选择排序 ==========
const selectSort = async (sort) => {
  if (sort === sortBy.value && sort === 'price') {
    // 切换价格顺序
    priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = sort
    if (sort === 'price') {
      priceOrder.value = 'asc'
    }
  }
  await loadCourses(true)
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

const goCourseDetail = async (course) => {
  if (userId.value) {
    addBrowseLog(userId.value, course, 'category').catch(() => {})
  }
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id || course._id}` })
}

const goLearn = async (course) => {
  const courseId = course.id || course._id

  if (userId.value) {
    await recordClick(courseId, userId.value, course.promoteCode)
  }

  let promoteUrl = course.promoteUrl || course.originalUrl
  if (!promoteUrl) {
    uni.showToast({ title: '暂无可用购买链接', icon: 'none' })
    return
  }

  // #ifdef H5
  window.location.href = promoteUrl
  // #endif
  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: promoteUrl,
    success: () => {
      uni.showModal({
        title: '提示',
        content: '链接已复制，请在浏览器中打开购买',
        showCancel: false
      })
    }
  })
  // #endif
}

// ========== 生命周期 ==========
onLoad(async (options) => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0

  // 处理URL参数
  if (options.categoryId) {
    selectedCategoryId.value = options.categoryId
  }
  if (options.categoryName) {
    pageTitle.value = decodeURIComponent(options.categoryName)
  }

  isLoading.value = true
  await Promise.all([loadCategories(), loadCourses(true)])
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.88);
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
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  &:active {
    background: rgba(255, 144, 0, 0.1);
    transform: scale(0.9);
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
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

.brand-emoji {
  font-size: 36rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.glass-nav__placeholder {
  width: 64rpx;
}

/* 分类标签栏 */
.category-tabs {
  position: fixed;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.tabs-scroll {
  white-space: nowrap;
  height: 100rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.tab-item {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: $text-secondary;
  background: transparent;
  border-radius: 32rpx;
  transition: all 0.3s ease;
  white-space: nowrap;

  &.active {
    background: $orange-gradient;
    color: #fff;
    font-weight: 600;
  }

  &:active {
    opacity: 0.8;
  }
}

/* 筛选排序栏 */
.filter-bar {
  position: fixed;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  z-index: 98;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  gap: 40rpx;
}

.filter-item {
  font-size: 28rpx;
  color: $text-secondary;
  display: flex;
  align-items: center;
  gap: 6rpx;
  transition: color 0.3s;

  &.active {
    color: $primary;
    font-weight: 600;
  }
}

.price-arrow {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 8rpx solid currentColor;

  &.up {
    border-top: none;
    border-bottom: 8rpx solid $primary;
  }

  &.down {
    border-top: 8rpx solid $primary;
    border-bottom: none;
  }
}

/* 滚动区域 */
.scroll {
  padding-top: 20rpx;
}

/* 课程列表 */
.course-list {
  padding: 0 24rpx;
}

.course-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out both;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  }
}

.course-item__cover {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.course-item__image {
  width: 100%;
  height: 100%;
}

.course-item__platform-tag {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 10rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10rpx;
  font-size: 18rpx;
  color: #fff;
}

.course-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.course-item__title {
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

.course-item__instructor {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 10rpx;
}

.course-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.mini-tag {
  padding: 4rpx 10rpx;
  background: rgba(78, 205, 196, 0.1);
  border: 1rpx solid rgba(78, 205, 196, 0.2);
  border-radius: 8rpx;
  font-size: 18rpx;
  color: $secondary;
}

.course-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;
}

.price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.price-original {
  font-size: 22rpx;
  color: $text-muted;
  text-decoration: line-through;
  margin-left: 6rpx;
}

.course-meta {
  display: flex;
  gap: 16rpx;
  font-size: 22rpx;
  color: $text-muted;
}

.course-item__action {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  padding: 10rpx 24rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);

  text {
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
  }
}

.course-item {
  position: relative;
  padding-bottom: 60rpx;
}

/* 骨架屏 */
.skeleton-list {
  padding: 20rpx 24rpx;
}

.skeleton-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.skeleton-cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.skeleton-info {
  flex: 1;
}

.skeleton-title {
  height: 32rpx;
  width: 80%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 16rpx;
}

.skeleton-sub {
  height: 24rpx;
  width: 50%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }

  .empty-hint {
    font-size: 26rpx;
    color: $text-muted;
  }
}

.load-more {
  padding: 40rpx 0;
  text-align: center;

  &__text {
    font-size: 24rpx;
    color: $text-muted;
  }
}

.bottom-spacer {
  height: 40rpx;
}
</style>
