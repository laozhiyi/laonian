<template>
  <view class="page">
    <!-- 商品图片 -->
    <view class="cover-wrap">
      <image class="cover" :src="product.cover" mode="aspectFill" />
      <view class="back-btn" @tap="goBack">‹</view>
    </view>

    <!-- 商品信息 -->
    <scroll-view class="scroll" scroll-y>
      <view class="info-wrap">
        <!-- 价格 -->
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ product.priceNow.toFixed(1) }}</text>
          <text v-if="product.priceOrigin" class="price-origin">¥{{ product.priceOrigin.toFixed(1) }}</text>
        </view>

        <!-- 库存 -->
        <view class="stock-row" v-if="product.stock !== undefined">
          <text class="stock-label">库存:</text>
          <text class="stock-value">{{ product.stock }}</text>
        </view>

        <!-- 标题 -->
        <view class="title">{{ product.title }}</view>

        <!-- 标签 -->
        <view class="tags">
          <text class="tag" v-for="tag in product.tags" :key="tag">#{{ tag }}</text>
        </view>

        <!-- 商品描述 -->
        <view class="desc-section">
          <view class="desc-title">商品详情</view>
          <view class="desc-content">{{ product.description || '暂无描述' }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="cart-icon" @tap="goMall">
        <text>🛒</text>
      </view>
      <view class="btn-primary" @tap="addToCart">加入购物车</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductDetail, defaultProducts, getAdminProducts } from '@/utils/product.js'
import { addToCart as apiAddToCart, saveToLocalCart, getLocalCart } from '@/utils/cart.js'

// ========== 商品数据 ==========
const productId = ref('')
const product = ref({
  id: '',
  title: '商品标题',
  priceNow: 0,
  priceOrigin: 0,
  cover: 'https://ai-public.mastergo.com/ai/img_res/d75a41382e8c11369027b0b72c12194c.jpg',
  tags: [],
  description: '',
})

// ========== 交互方法 ==========
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
  // 先尝试调用API
  const res = await apiAddToCart(product.value.id)
  if (!res.ok) {
    // API失败时使用本地存储
    saveToLocalCart(product.value)
  }
  toast('已加入购物车')
}

// ========== 加载商品 ==========
const loadProduct = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  productId.value = currentPage.options?.id || ''

  // 优先查找管理员添加的商品
  const adminProducts = getAdminProducts()
  const adminFound = adminProducts.find(p => p.id === productId.value)
  if (adminFound) {
    product.value = { ...adminFound }
    return
  }

  // 从API获取或默认商品
  const res = await getProductDetail(productId.value)
  if (res.ok) {
    product.value = res.data
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  loadProduct()
})
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
}

/* 商品图片 */
.cover-wrap {
  position: relative;
  height: 600rpx;
}

.cover {
  width: 100%;
  height: 100%;
}

.back-btn {
  position: absolute;
  left: 24rpx;
  top: calc(var(--status-bar-height) + 24rpx);
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: $text;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

/* 滚动区域 */
.scroll {
  height: calc(100vh - 600rpx);
}

.info-wrap {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  margin-top: -32rpx;
  position: relative;
  padding: 32rpx 24rpx 180rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.04);
}

/* 价格 */
.price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
}

.price-value {
  font-size: 52rpx;
  color: $primary;
  font-weight: 800;
}

.price-origin {
  font-size: 24rpx;
  color: $sub;
  text-decoration: line-through;
}

/* 库存 */
.stock-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.stock-label {
  font-size: 24rpx;
  color: $sub;
}

.stock-value {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

/* 标题 */
.title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  line-height: 1.4;
  margin-bottom: 20rpx;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.1), rgba(255, 179, 71, 0.1));
  color: $primary;
  font-size: 22rpx;
}

/* 描述 */
.desc-section {
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.desc-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text;
  margin-bottom: 16rpx;
}

.desc-content {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.8;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.cart-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
}

.btn-primary {
  flex: 1;
  height: 84rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 24rpx rgba(255, 144, 0, 0.3);
}
</style>
