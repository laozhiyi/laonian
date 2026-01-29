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
          <text class="price-value">{{ product.priceNow.toFixed(2) }}</text>
          <text v-if="product.priceOrigin" class="price-origin">¥{{ product.priceOrigin.toFixed(2) }}</text>
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
        <text class="icon-text icon-text--cart">🛒</text>
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
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;

// 动画定义
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(40rpx); }
  to { transform: translateY(0); }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.page {
  min-height: 100vh;
  background: $bg;
  position: relative;
}

/* 商品图片 */
.cover-wrap {
  position: relative;
  height: 680rpx;
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
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12),
              0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 1);
  }

  &::before {
    content: '';
    position: absolute;
    inset: -6rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
  }
}

/* 滚动区域 */
.scroll {
  height: calc(100vh - 680rpx);
}

.info-wrap {
  background: #fff;
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -64rpx;
  position: relative;
  padding: 48rpx 32rpx 200rpx;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08),
              0 -2rpx 16rpx rgba(0, 0, 0, 0.03);
  animation: slideUp 0.5s ease-out;
}

/* 价格 */
.price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.price-symbol {
  font-size: 36rpx;
  color: $primary;
  font-weight: 600;
  text-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.2);
}

.price-value {
  font-size: 72rpx;
  color: $primary;
  font-weight: 800;
  letter-spacing: -2rpx;
  text-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
  background: linear-gradient(135deg, $primary, $primary-light);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-origin {
  font-size: 28rpx;
  color: $sub;
  text-decoration: line-through;
  margin-left: 12rpx;
  font-weight: 400;
}

/* 库存 */
.stock-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.03));
  border-radius: 16rpx;
  width: fit-content;
}

.stock-label {
  font-size: 26rpx;
  color: $sub;
}

.stock-value {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 600;
}

/* 标题 */
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text;
  line-height: 1.5;
  margin-bottom: 24rpx;
  letter-spacing: 0.5rpx;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 36rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.1), rgba(255, 179, 71, 0.08));
  color: $primary;
  font-size: 24rpx;
  font-weight: 500;
  letter-spacing: 0.5rpx;
  border: 1rpx solid rgba(255, 144, 0, 0.2);
}

/* 描述 */
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
  letter-spacing: 1rpx;
}

/* 底部操作栏 */
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
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1),
              0 -2rpx 16rpx rgba(0, 0, 0, 0.03);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 28rpx;
    right: 28rpx;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 144, 0, 0.2), transparent);
  }
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
  box-shadow: 0 8rpx 28rpx rgba(255, 144, 0, 0.4),
              0 4rpx 14rpx rgba(255, 179, 71, 0.25);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -4rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 144, 0, 0.3);
    animation: pulse-ring 2s ease-out infinite;
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 46rpx;
    height: 46rpx;
    color: #fff;
  }
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
  box-shadow: 0 8rpx 32rpx rgba(255, 144, 0, 0.4),
              0 4rpx 16rpx rgba(255, 107, 53, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 20rpx rgba(255, 144, 0, 0.3);
  }
}
</style>
