<template>
  <view class="page">
    <!-- 毛玻璃导航 + 搜索框 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="search-input-wrap">
        <view class="search-icon">
          <text>🔍</text>
        </view>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索课程、讲师..."
          confirm-type="search"
          @confirm="doSearch"
          focus
        />
        <view class="search-clear" v-if="searchKeyword" @tap="clearSearch">
          <text>✕</text>
        </view>
      </view>
      <view class="search-cancel" @tap="goBack">
        <text>取消</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 搜索结果 -->
      <view v-if="hasSearched">
        <view class="result-header" v-if="searchResults.length > 0">
          <text class="result-count">找到 {{ searchResults.length }} 个相关课程</text>
        </view>

        <view class="result-list" v-if="searchResults.length > 0">
          <view
            class="result-item"
            v-for="(course, index) in searchResults"
            :key="course.id"
            :style="{ animationDelay: (index * 0.05) + 's' }"
            @tap="goCourseDetail(course)"
          >
            <image class="result-cover" :src="course.cover" mode="aspectFill" />
            <view class="result-info">
              <text class="result-title">{{ course.title }}</text>
              <text class="result-instructor">{{ course.instructor?.name }} · {{ course.platform }}</text>
              <view class="result-footer">
                <text class="result-price">¥{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
                <text class="result-rating" v-if="course.rating">⭐ {{ course.rating }}</text>
              </view>
            </view>
            <view class="result-action" @tap.stop="goLearn(course)">
              <text>去看看</text>
            </view>
          </view>
        </view>

        <!-- 无结果 -->
        <view class="empty-state" v-else>
          <text class="empty-icon">🔍</text>
          <text class="empty-text">未找到相关课程</text>
          <text class="empty-hint">试试其他关键词吧</text>
        </view>
      </view>

      <!-- 未搜索状态 -->
      <view v-else>
        <!-- 搜索历史 -->
        <view class="history-section" v-if="searchHistory.length > 0">
          <view class="section-header">
            <text class="section-title">搜索历史</text>
            <view class="section-action" @tap="clearHistory">
              <text>清空</text>
            </view>
          </view>
          <view class="history-tags">
            <view
              class="history-tag"
              v-for="keyword in searchHistory"
              :key="keyword"
              @tap="searchByKeyword(keyword)"
            >
              {{ keyword }}
            </view>
          </view>
        </view>

        <!-- 热门搜索 -->
        <view class="hot-section">
          <view class="section-header">
            <text class="section-title">🔥 热门搜索</text>
          </view>
          <view class="hot-tags">
            <view
              class="hot-tag"
              v-for="keyword in hotKeywords"
              :key="keyword"
              @tap="searchByKeyword(keyword)"
            >
              {{ keyword }}
            </view>
          </view>
        </view>

        <!-- 快捷推荐 -->
        <view class="recommend-section">
          <view class="section-header">
            <text class="section-title">📚 大家都在学</text>
          </view>
          <view class="recommend-list">
            <view
              class="recommend-item"
              v-for="course in recommendCourses"
              :key="course.id"
              @tap="goCourseDetail(course)"
            >
              <image class="recommend-cover" :src="course.cover" mode="aspectFill" />
              <text class="recommend-title">{{ course.title }}</text>
              <text class="recommend-price">¥{{ ((course.priceNow || 0) / 100).toFixed(2) }}</text>
            </view>
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
import { searchCourses } from '@/utils/course.js'
import { getHotCourses } from '@/utils/course.js'
import { getCurrentUserId } from '@/utils/user.js'
import { getHotKeywords } from '@/utils/track.js'
import { addBrowseLog, recordClick } from '@/utils/track.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    paddingTop: (statusBarHeight.value + navHeight.value + 20) + 'px',
    height: `calc(100vh - ${statusBarHeight.value + navHeight}px - ${safeBottom}px)`,
  }
})

// ========== 搜索状态 ==========
const searchKeyword = ref('')
const searchHistory = ref([])
const hotKeywords = ref([])
const hasSearched = ref(false)
const isSearching = ref(false)

// ========== 搜索结果 ==========
const searchResults = ref([])

// ========== 推荐课程 ==========
const recommendCourses = ref([])

// ========== 用户ID ==========
const userId = computed(() => getCurrentUserId())

// ========== 初始化 ==========
const init = async () => {
  // 加载搜索历史
  const history = uni.getStorageSync('search_history') || []
  searchHistory.value = history

  // 加载热门关键词
  hotKeywords.value = getHotKeywords()

  // 加载推荐课程
  const res = await getHotCourses(6)
  if (res.ok && res.list) {
    recommendCourses.value = res.list
  }
}

// ========== 执行搜索 ==========
const doSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }

  isSearching.value = true
  hasSearched.value = true

  const res = await searchCourses(keyword)
  if (res.ok && res.list) {
    searchResults.value = res.list
  } else {
    searchResults.value = []
  }

  // 添加到历史
  const history = searchHistory.value.filter(h => h !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  isSearching.value = false
}

// ========== 通过关键词搜索 ==========
const searchByKeyword = (keyword) => {
  searchKeyword.value = keyword
  doSearch()
}

// ========== 清空搜索 ==========
const clearSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  searchResults.value = []
}

// ========== 清空历史 ==========
const clearHistory = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync('search_history')
      }
    }
  })
}

// ========== 页面跳转 ==========
const goBack = () => {
  uni.navigateBack()
}

const goCourseDetail = async (course) => {
  if (userId.value) {
    addBrowseLog(userId.value, course, 'search').catch(() => {})
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
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  init()
})

onShow(() => {
  // 每次显示刷新历史
  const history = uni.getStorageSync('search_history') || []
  searchHistory.value = history
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
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
  padding: 0 24rpx;
  padding-top: calc(var(--status-bar-height, 0px) + 16rpx);
  box-sizing: border-box;
  height: auto;
  min-height: calc(var(--status-bar-height, 0px) + 88rpx);
}

.search-input-wrap {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 32rpx;
  color: $text-muted;
}

.search-input {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.search-clear {
  width: 40rpx;
  height: 40rpx;
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 22rpx;
    color: #fff;
  }
}

.search-cancel {
  padding: 16rpx;
  margin-left: 12rpx;

  text {
    font-size: 28rpx;
    color: $text-secondary;
  }

  &:active {
    color: $primary;
  }
}

/* 滚动区域 */
.scroll {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

/* 结果头部 */
.result-header {
  padding: 20rpx 0;

  .result-count {
    font-size: 26rpx;
    color: $text-muted;
  }
}

/* 结果列表 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  position: relative;
  animation: slideUpFade 0.4s ease-out both;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }
}

.result-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.result-instructor {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: auto;
}

.result-footer {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.result-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.result-rating {
  font-size: 22rpx;
  color: $text-muted;
}

.result-action {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  padding: 10rpx 24rpx;
  background: $orange-gradient;
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 历史记录 */
.history-section {
  padding: 20rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.section-action {
  font-size: 26rpx;
  color: $text-muted;

  &:active {
    color: $primary;
  }
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 28rpx;
  background: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;

  &:active {
    background: rgba(255, 107, 53, 0.1);
    color: $primary;
  }
}

/* 热门搜索 */
.hot-section {
  padding: 20rpx 0;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hot-tag {
  padding: 12rpx 28rpx;
  background: rgba(255, 107, 53, 0.08);
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $primary;

  &:active {
    background: rgba(255, 107, 53, 0.15);
  }
}

/* 推荐 */
.recommend-section {
  padding: 20rpx 0;
}

.recommend-list {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding-bottom: 20rpx;
  -webkit-overflow-scrolling: touch;
}

.recommend-item {
  width: 240rpx;
  flex-shrink: 0;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }
}

.recommend-cover {
  width: 100%;
  height: 240rpx;
}

.recommend-title {
  display: block;
  padding: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-price {
  display: block;
  padding: 0 16rpx 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: $primary;
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

.bottom-spacer {
  height: 40rpx;
}
</style>
