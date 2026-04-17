<template>
  <view class="page">
    <!-- 课程不存在 -->
    <view class="empty-page" v-if="productNotFound">
      <view class="empty-icon">📭</view>
      <text class="empty-text">课程不存在</text>
      <view class="btn-back" @tap="goMall">返回商城</view>
    </view>

    <!-- 课程封面图 -->
    <view class="cover-wrap" v-else>
      <image class="cover" :src="product?.cover" mode="aspectFill" />
      <view class="back-btn" @tap="goBack">‹</view>
      <!-- 难度标签 -->
      <view class="level-badge" v-if="product.level">{{ product.level }}</view>
    </view>

    <!-- 课程信息 -->
    <scroll-view class="scroll" scroll-y v-if="product && !productNotFound">
      <view class="info-wrap">
        <!-- 价格 -->
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ (product.priceNow || product.price || 0).toFixed(0) }}</text>
          <text class="price-original" v-if="product.price > product.priceNow">¥{{ (product.price || 0).toFixed(0) }}</text>
        </view>

        <!-- 标题 -->
        <view class="title">{{ product.title || '课程标题' }}</view>

        <!-- 课程元信息 -->
        <view class="meta-row">
          <view class="meta-item" v-if="product.instructor">
            <text class="meta-icon">👨‍🏫</text>
            <text class="meta-text">{{ product.instructor }}</text>
          </view>
          <view class="meta-item" v-if="product.rating">
            <text class="meta-icon">⭐</text>
            <text class="meta-text">{{ product.rating }}</text>
          </view>
          <view class="meta-item" v-if="product.studentCount">
            <text class="meta-icon">👥</text>
            <text class="meta-text">{{ formatCount(product.studentCount) }}人在学</text>
          </view>
          <view class="meta-item" v-if="product.duration">
            <text class="meta-icon">⏱️</text>
            <text class="meta-text">{{ product.duration }}</text>
          </view>
        </view>

        <!-- 分类标签 -->
        <view class="tags" v-if="product.tags && product.tags.length > 0">
          <text class="tag" v-for="tag in product.tags" :key="tag">#{{ tag }}</text>
        </view>

        <!-- 课程描述 -->
        <view class="desc-section">
          <view class="desc-title">课程介绍</view>
          <view class="desc-content">{{ product.desc || product.description || '暂无介绍' }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="!productNotFound">
      <view class="cart-icon" @tap="goMall">
        <text class="icon-text icon-text--cart">🛒</text>
      </view>
      <view class="btn-primary" @tap="addToCart">立即学习</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCourseDetail } from '@/utils/course.js'
import { addToCart as apiAddToCart, saveToLocalCart } from '@/utils/cart.js'
import { onLoad, onShow } from '@dcloudio/uni-app'

const productId = ref('')
const product = ref(null)
const productNotFound = ref(false)
const productLoading = ref(false)

const formatCount = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num > 0 ? num : '0'
}

const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/mall/mall' })
  }
}

const goMall = () => {
  uni.switchTab({ url: '/pages/mall/mall' })
}

const addToCart = async () => {
  if (!product.value || productNotFound.value) {
    toast('课程不存在')
    return
  }
  const pid = product.value._id || product.value.id
  if (!pid) {
    toast('课程信息不完整')
    return
  }
  const res = await apiAddToCart({ id: pid, ...product.value })
  if (!res.ok) {
    saveToLocalCart({ id: pid, ...product.value })
  }
  toast('已加入学习计划')
}

const loadProduct = async () => {
  if (!productId.value || productLoading.value) return

  productLoading.value = true
  productNotFound.value = false

  try {
    const res = await getCourseDetail(productId.value)
    if (res.ok && res.data) {
      product.value = {
        ...res.data,
        id: res.data._id || res.data.id
      }
      productNotFound.value = false
    } else {
      productNotFound.value = true
    }
  } catch (e) {
    console.error('加载课程失败:', e)
    productNotFound.value = true
  } finally {
    productLoading.value = false
  }
}

onLoad((options) => {
  productId.value = options?.id || ''
  if (productId.value) {
    loadProduct()
  } else {
    productNotFound.value = true
  }
})

onShow(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;

@keyframes slideUp {
  from { transform: translateY(40rpx); }
  to { transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg;
  position: relative;
}

.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: $sub;
  margin-bottom: 48rpx;
}

.btn-back {
  padding: 24rpx 64rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.cover-wrap {
  position: relative;
  height: 600rpx;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.back-btn {
  position: absolute;
  left: 32rpx;
  top: calc(var(--status-bar-height) + 28rpx);
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: $text;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  z-index: 10;

  &:active {
    transform: scale(0.9);
  }
}

.level-badge {
  position: absolute;
  right: 32rpx;
  bottom: 32rpx;
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.scroll {
  height: calc(100vh - 480rpx);
}

.info-wrap {
  background: #fff;
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -40rpx;
  position: relative;
  padding: 48rpx 32rpx 180rpx;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
  animation: slideUp 0.5s ease-out;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.price-symbol {
  font-size: 36rpx;
  color: $primary;
  font-weight: 600;
}

.price-value {
  font-size: 72rpx;
  color: $primary;
  font-weight: 800;
  letter-spacing: -2rpx;
}

.price-original {
  font-size: 28rpx;
  color: $sub;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: #fafafa;
  border-radius: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  font-size: 26rpx;
}

.meta-text {
  font-size: 26rpx;
  color: $text-body;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 53, 0.1);
  color: $primary;
  font-size: 24rpx;
  font-weight: 500;
}

.desc-section {
  padding-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.desc-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  margin-bottom: 20rpx;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 48rpx;
    height: 4rpx;
    background: linear-gradient(90deg, $primary, $primary-light);
    border-radius: 2rpx;
  }
}

.desc-content {
  font-size: 28rpx;
  color: $text-body;
  line-height: 2;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 140rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.cart-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  &:active {
    transform: scale(0.9);
  }
}

.icon-text--cart {
  font-size: 44rpx;
}

.btn-primary {
  flex: 1;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, $primary 0%, #FF6B35 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 3rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);

  &:active {
    transform: scale(0.98);
  }
}
</style>
