<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">🎓</text>
        <text class="brand-name">课程介绍</text>
      </view>
      <view class="glass-nav__home" @tap="goHome">
        <text class="home-icon">🏠</text>
      </view>
    </view>

    <!-- 课程封面 -->
    <view class="course-cover">
      <image class="cover-image" :src="course.cover || getDetailCategoryCover(course.category)" mode="aspectFill" />
      <view class="cover-overlay">
        <view class="category-tag" v-if="course.category">
          <text>{{ course.category }}</text>
        </view>
      </view>
    </view>

    <!-- 课程信息 -->
    <view class="course-content">
      <view class="course-header">
        <text class="course-title">{{ course.title }}</text>
      </view>

      <!-- 课程介绍 -->
      <view class="section" v-if="course.description">
        <view class="section__title">
          <text class="section-icon">📖</text>
          <text>课程介绍</text>
        </view>
        <view class="section__body">
          <text class="description-text">{{ course.description }}</text>
        </view>
      </view>

      <!-- 跳转按钮 -->
      <view class="action-area">
        <view class="action-btn" @tap="goToLearn">
          <text class="action-icon">🚀</text>
          <text class="action-text">开始学习</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-if="!loading && !course.id">
      <text class="error-icon">😢</text>
      <text class="error-text">课程不存在</text>
      <view class="error-btn" @tap="goBack">
        <text>返回</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getExternalCourseDetail } from '@/utils/external-course.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)
const loading = ref(true)
const course = ref({})

// 分类默认封面图（本地图片）
const categoryCovers = {
  '公民素养': '/static/covers/2-culture.jpg',
  '时代前沿': '/static/covers/6-tech.jpg',
  '时事思政': '/static/covers/8-business.jpg',
  '隔代教育': '/static/covers/7-edu.jpg',
  '哲学': '/static/covers/2-culture.jpg',
  '文学': '/static/covers/2-culture.jpg',
  '数字素养': '/static/covers/6-tech.jpg',
  '摄影': '/static/covers/1-healthcare.jpg',
  '表演': '/static/covers/3-drama.jpg',
  '社会科学': '/static/covers/9-learning.jpg',
  '自然科学': '/static/covers/11-elderly.jpg',
  '农学': '/static/covers/12-cooking.jpg',
  '语言': '/static/covers/9-learning.jpg',
  '数学': '/static/covers/9-learning.jpg',
  '学历教育': '/static/covers/7-edu.jpg',
  '论文写作': '/static/covers/9-learning.jpg',
  '医学': '/static/covers/1-healthcare.jpg',
  '家庭照护': '/static/covers/1-healthcare.jpg',
  '中医保健': '/static/covers/1-healthcare.jpg',
  '用药安全': '/static/covers/1-healthcare.jpg',
  '食品营养': '/static/covers/12-cooking.jpg',
  '心理健康': '/static/covers/1-healthcare.jpg',
  '运动健康': '/static/covers/1-healthcare.jpg',
  '慢病管理': '/static/covers/1-healthcare.jpg',
  '口腔健康': '/static/covers/1-healthcare.jpg',
  '生命教育': '/static/covers/1-healthcare.jpg',
  '老年痴呆防治': '/static/covers/1-healthcare.jpg',
  '舞蹈': '/static/covers/5-music.jpg',
  '声乐': '/static/covers/5-music.jpg',
  '器乐': '/static/covers/5-music.jpg',
  '书法': '/static/covers/4-calligraphy.jpg',
  '绘画': '/static/covers/4-calligraphy.jpg',
  '模特': '/static/covers/5-music.jpg',
  '戏剧': '/static/covers/3-drama.jpg',
  '手工': '/static/covers/12-cooking.jpg',
  '生活休闲': '/static/covers/10-chess.jpg',
  '历史地理': '/static/covers/2-culture.jpg',
  '文化': '/static/covers/2-culture.jpg',
  '退休生涯规划': '/static/covers/7-edu.jpg',
  '投资理财': '/static/covers/8-business.jpg',
  '志愿服务': '/static/covers/7-edu.jpg',
  '创新创业': '/static/covers/8-business.jpg',
  '农业养殖': '/static/covers/12-cooking.jpg',
  '职业技能': '/static/covers/6-tech.jpg',
}

const getDetailCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || '/static/covers/7-edu.jpg'
}

// 获取课程ID
const getCourseId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  return options.id || ''
}

// 加载课程详情
const loadCourse = async () => {
  const id = getCourseId()
  if (!id) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await getExternalCourseDetail(parseInt(id))
    if (res.ok && res.data) {
      course.value = res.data
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

// 跳转到学习页面
const goToLearn = () => {
  if (!course.value.link) {
    uni.showToast({ title: '暂无学习链接', icon: 'none' })
    return
  }

  // #ifdef H5
  window.open(course.value.link, '_blank')
  // #endif
  // #ifndef H5
  plus.runtime.openURL(course.value.link)
  // #endif
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourse()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;
$border-color: #F0E6DC;
$glass-bg: rgba(255, 255, 255, 0.75);

.page {
  min-height: 100vh;
  background: $bg;
}

.glass-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: auto; min-height: 88rpx;
  background: rgba(255, 255, 255, 0.85);
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
  width: 64rpx; height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);

  &:active {
    background: rgba(255, 144, 0, 0.1);
    transform: scale(0.9);
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text;
    line-height: 1;
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
  color: $text;
  letter-spacing: 2rpx;
}

.glass-nav__placeholder {
  width: 64rpx;
}

.glass-nav__home {
  width: 64rpx; height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);

  &:active {
    background: rgba(255, 144, 0, 0.1);
    transform: scale(0.9);
  }

  .home-icon {
    font-size: 32rpx;
  }
}

.course-cover {
  width: 100%;
  height: 500rpx;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  padding-top: calc(24rpx + var(--status-bar-height, 0px) + 88rpx);
}

.category-tag {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

.course-content {
  padding: 32rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.course-header {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
}

.course-title {
  font-size: 40rpx;
  font-weight: 700;
  color: $text;
  line-height: 1.4;
}

.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
}

.section__title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
}

.section-icon {
  font-size: 36rpx;
}

.section__body {
  padding: 0 8rpx;
}

.description-text {
  font-size: 28rpx;
  color: $text-body;
  line-height: 1.8;
}

.action-area {
  margin-top: 40rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 100rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);

  &:active {
    transform: scale(0.98);
  }
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  font-size: 28rpx;
  color: $sub;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.error-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.error-text {
  font-size: 28rpx;
  color: $sub;
  margin-bottom: 32rpx;
}

.error-btn {
  padding: 20rpx 48rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 30rpx;

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
  }
}
</style>
