<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">📚</text>
        <text class="brand-name">我的课程</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y :style="contentStyle">
      <!-- 课程分类标签 -->
      <view class="category-tabs">
        <view
          class="category-tab"
          :class="{ 'category-tab--active': selectedCategory === '' }"
          @tap="selectCategory('')"
        >
          <text>全部</text>
        </view>
        <view
          class="category-tab"
          :class="{ 'category-tab--active': selectedCategory === cat.name }"
          v-for="cat in categories"
          :key="cat.id"
          @tap="selectCategory(cat.name)"
        >
          <text>{{ cat.icon }} {{ cat.name }}</text>
        </view>
      </view>

      <!-- 课程列表 -->
      <view class="course-list" v-if="courseList.length > 0">
        <view class="course-card" v-for="course in filteredCourses" :key="course.id" @tap="goDetail(course)">
          <image class="course-card__cover" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
          <view class="course-card__content">
            <view class="course-card__title">{{ course.title }}</view>
            <view class="course-card__meta">
              <text class="meta-tag" v-if="course.category">{{ course.category }}</text>
              <text class="meta-tag meta-tag--link" v-if="course.link">外部课程</text>
            </view>
            <view class="course-card__desc" v-if="course.description">{{ course.description }}</view>
          </view>
          <view class="course-card__arrow">›</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else>
        <view class="empty__icon">
          <text class="empty-icon">📚</text>
        </view>
        <text class="empty__text">暂无课程</text>
        <text class="empty__sub">管理员上架课程后即可查看</text>
      </view>
    </scroll-view>

    <!-- 快捷功能入口 -->
    <view class="quick-actions">
      <view class="quick-action" @tap="goMall">
        <view class="quick-action__icon">
          <text class="icon-text">🛍️</text>
        </view>
        <text class="quick-action__text">去商城</text>
      </view>
      <view class="quick-action" @tap="goOrders">
        <view class="quick-action__icon quick-action__icon--green">
          <text class="icon-text">📋</text>
        </view>
        <text class="quick-action__text">我的订单</text>
      </view>
      <view class="quick-action" @tap="goCart">
        <view class="quick-action__icon quick-action__icon--teal">
          <text class="icon-text">🛒</text>
        </view>
        <text class="quick-action__text">购物车</text>
      </view>
      <view class="quick-action" @tap="goMe">
        <view class="quick-action__icon quick-action__icon--purple">
          <text class="icon-text">👤</text>
        </view>
        <text class="quick-action__text">个人中心</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="bottom-safe" />

    <!-- 购物车悬浮按钮 -->
    <view class="cart-float" :class="{ 'cart-float--bump': cartBump }" @tap="goCart">
      <view class="cart-float__icon">
        <text class="icon-text">🛒</text>
      </view>
      <view class="cart-float__badge" v-if="cartCount > 0">{{ cartCount > 99 ? '99+' : cartCount }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getExternalCourses } from '@/utils/external-course.js'
import { getCart } from '@/utils/cart.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)
const cartCount = ref(0)
const cartBump = ref(false)

const contentStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navHeight.value) + 'px)',
}))

const courseList = ref([])
const selectedCategory = ref('')

// 分类默认封面图
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

const categories = ref([
  { id: 1, name: '公民素养', icon: '🏛️', color: '#4A90D9' },
  { id: 2, name: '时代前沿', icon: '🚀', color: '#7B68EE' },
  { id: 3, name: '时事思政', icon: '📰', color: '#DC143C' },
  { id: 4, name: '隔代教育', icon: '👨‍👩‍👧', color: '#FF69B4' },
  { id: 5, name: '哲学', icon: '🧠', color: '#4169E1' },
  { id: 6, name: '文学', icon: '📚', color: '#8B4513' },
  { id: 7, name: '数字素养', icon: '💻', color: '#2E8B57' },
  { id: 8, name: '摄影', icon: '📷', color: '#FF6347' },
  { id: 9, name: '表演', icon: '🎭', color: '#9370DB' },
  { id: 10, name: '社会科学', icon: '🔬', color: '#20B2AA' },
  { id: 11, name: '自然科学', icon: '🌍', color: '#3CB371' },
  { id: 12, name: '农学', icon: '🌾', color: '#DAA520' },
  { id: 13, name: '语言', icon: '🗣️', color: '#FF8C00' },
  { id: 14, name: '数学', icon: '📐', color: '#4682B4' },
  { id: 15, name: '学历教育', icon: '🎓', color: '#8B0000' },
  { id: 16, name: '论文写作', icon: '✍️', color: '#556B2F' },
  { id: 17, name: '医学', icon: '🏥', color: '#B22222' },
  { id: 18, name: '家庭照护', icon: '🏠', color: '#FF7F50' },
  { id: 19, name: '中医保健', icon: '🌿', color: '#228B22' },
  { id: 20, name: '用药安全', icon: '💊', color: '#CD5C5C' },
  { id: 21, name: '食品营养', icon: '🍎', color: '#32CD32' },
  { id: 22, name: '心理健康', icon: '💚', color: '#6B8E23' },
  { id: 23, name: '运动健康', icon: '🏃', color: '#FF4500' },
  { id: 24, name: '慢病管理', icon: '🩺', color: '#8FBC8F' },
  { id: 25, name: '口腔健康', icon: '🦷', color: '#87CEEB' },
  { id: 26, name: '生命教育', icon: '🌱', color: '#98FB98' },
  { id: 27, name: '老年痴呆防治', icon: '🧩', color: '#D8BFD8' },
  { id: 28, name: '舞蹈', icon: '💃', color: '#FF1493' },
  { id: 29, name: '声乐', icon: '🎤', color: '#FFD700' },
  { id: 30, name: '器乐', icon: '🎸', color: '#C0C0C0' },
  { id: 31, name: '书法', icon: '🖌️', color: '#8B4513' },
  { id: 32, name: '绘画', icon: '🎨', color: '#FF69B4' },
  { id: 33, name: '模特', icon: '👗', color: '#DDA0DD' },
  { id: 34, name: '戏剧', icon: '🎬', color: '#FFA07A' },
  { id: 35, name: '手工', icon: '🧶', color: '#F0E68C' },
  { id: 36, name: '生活休闲', icon: '☕', color: '#DEB887' },
  { id: 37, name: '历史地理', icon: '🗺️', color: '#778899' },
  { id: 38, name: '文化', icon: '🏺', color: '#D2691E' },
  { id: 39, name: '退休生涯规划', icon: '🌅', color: '#FF8C00' },
  { id: 40, name: '投资理财', icon: '💰', color: '#FFD700' },
  { id: 41, name: '志愿服务', icon: '❤️', color: '#FF6B6B' },
  { id: 42, name: '创新创业', icon: '💡', color: '#9ACD32' },
  { id: 43, name: '农业养殖', icon: '🐄', color: '#8FBC8F' },
  { id: 44, name: '职业技能', icon: '💼', color: '#6495ED' },
])

const filteredCourses = computed(() => {
  if (!selectedCategory.value) return courseList.value
  return courseList.value.filter(c => c.category === selectedCategory.value)
})

const getCategoryCover = (category) => {
  return categoryCovers[category] || '/static/covers/7-edu.jpg'
}

const selectCategory = (name) => {
  selectedCategory.value = name
}

const goBack = () => {
  uni.navigateBack()
}

const goDetail = (course) => {
  if (course.link) {
    uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
  } else {
    uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
  }
}

// 跳转到商城
const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

// 跳转到订单页
const goOrders = () => {
  uni.navigateTo({ url: '/pages/order/orders' })
}

// 跳转到购物车
const goCart = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

// 跳转到个人中心
const goMe = () => {
  uni.switchTab({ url: '/pages/me/me' })
}

// 加载购物车数量
const loadCartCount = async () => {
  try {
    const res = await getCart()
    cartCount.value = res.totalCount || 0
  } catch (e) {
    console.error('加载购物车失败:', e)
  }
}

const loadCourses = async () => {
  try {
    const res = await getExternalCourses()
    if (res?.list) {
      courseList.value = res.list
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  }
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourses()
  loadCartCount()
})

onShow(() => {
  loadCartCount()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;
$border-color: #F0E6DC;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

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
}

.back-arrow {
  font-size: 48rpx;
  font-weight: 300;
  color: $text;
  line-height: 1;
}

.glass-nav__brand {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12rpx;
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

.content {
  padding: 24rpx;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
  animation: slideUpFade 0.4s ease-out;
}

.category-tab {
  padding: 12rpx 24rpx;
  background: #fff;
  border: 1rpx solid $border-color;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: $text-body;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  &--active {
    background: linear-gradient(135deg, $primary, $primary-light);
    color: #fff;
    border-color: transparent;
    font-weight: 600;
  }
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid $border-color;
  transition: all 0.3s;
  animation: slideUpFade 0.4s ease-out;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
  }
}

.course-card__cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.course-card__content {
  flex: 1;
  min-width: 0;
}

.course-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-card__meta {
  display: flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 4rpx 12rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 6rpx;
  font-size: 22rpx;
  color: $primary;

  &--link {
    background: rgba(78, 205, 196, 0.1);
    color: $secondary;
  }
}

.course-card__desc {
  font-size: 24rpx;
  color: $sub;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.course-card__arrow {
  font-size: 40rpx;
  color: $sub;
  margin-left: 16rpx;
}

/* 空状态 */
.empty {
  padding: 120rpx 0;
  text-align: center;
  animation: slideUpFade 0.4s ease-out;
}

.empty__icon {
  margin-bottom: 24rpx;
}

.empty-icon {
  font-size: 100rpx;
  opacity: 0.3;
}

.empty__text {
  font-size: 32rpx;
  color: $text;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.empty__sub {
  font-size: 26rpx;
  color: $sub;
}

/* 快捷功能入口 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid $border-color;
  margin-top: 20rpx;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  &__icon {
    width: 72rpx;
    height: 72rpx;
    background: $orange-gradient;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.25);
    margin-bottom: 4rpx;

    .icon-text {
      font-size: 36rpx;
    }
  }

  &__icon--green {
    background: linear-gradient(135deg, #2ECC71, #27ae60);
    box-shadow: 0 4rpx 16rpx rgba(46, 204, 113, 0.25);
  }

  &__icon--teal {
    background: linear-gradient(135deg, $secondary, #36CFC9);
    box-shadow: 0 4rpx 16rpx rgba(78, 205, 196, 0.25);
  }

  &__icon--purple {
    background: linear-gradient(135deg, #A855F7, #9333EA);
    box-shadow: 0 4rpx 16rpx rgba(168, 85, 247, 0.25);
  }

  &__text {
    font-size: 22rpx;
    color: $text-body;
  }

  &:active {
    .quick-action__icon {
      transform: scale(0.9);
    }
  }
}

/* 底部安全区 */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}

/* 购物车悬浮按钮 */
.cart-float {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  width: 96rpx;
  height: 96rpx;
  background: $orange-gradient;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);
  z-index: 90;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--bump {
    animation: bump 0.3s ease-out;
  }

  &:active {
    transform: scale(0.9);
  }

  .icon-text {
    font-size: 44rpx;
  }
}

.cart-float__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-float__badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes bump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
