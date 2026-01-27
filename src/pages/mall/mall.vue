<template>
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search">
        <text class="search__icon">🔍</text>
        <input
          class="search__input"
          v-model="searchKeyword"
          placeholder="搜索商品"
          placeholder-class="search__placeholder"
          @input="onSearchInput"
          @confirm="onSearch"
          confirm-type="search"
        />
        <text v-if="searchKeyword" class="search__clear" @tap="clearSearch">✕</text>
      </view>
    </view>

    <!-- 搜索结果提示 -->
    <view class="search-tip" v-if="isSearching">
      <text v-if="searchResultCount > 0">找到 {{ searchResultCount }} 个商品</text>
      <text v-else>未找到相关商品</text>
    </view>

    <!-- 商品列表 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <view class="product-grid">
        <view
          class="product-card"
          v-for="product in productList"
          :key="product.id"
          @tap="goDetail(product)"
        >
          <image class="product-card__cover" :src="product.cover" mode="aspectFill" />
          <view class="product-card__info">
            <view class="product-card__title">{{ product.title }}</view>
            <view class="product-card__bottom">
              <view class="product-card__price">¥{{ product.priceNow.toFixed(1) }}</view>
              <view class="product-card__add" @tap.stop="addToCart(product)">+</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 无商品提示 -->
      <view class="empty-tip" v-if="productList.length === 0">
        <text>暂无商品</text>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>

    <!-- 底部购物车栏 -->
    <view class="cart-bar" v-if="cartCount > 0" :style="cartBarStyle">
      <view class="cart-bar__left" @tap="toggleCart">
        <view class="cart-bar__icon-wrap">
          <text class="cart-bar__icon">🛒</text>
          <view class="cart-bar__badge" v-if="cartCount > 0">{{ cartCount > 99 ? '99+' : cartCount }}</view>
        </view>
        <view class="cart-bar__total">
          <text class="cart-bar__total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>
      <view class="cart-bar__btn" @tap="goCheckout">
        <text>去结算</text>
      </view>
    </view>

    <!-- 购物车面板 -->
    <view class="cart-panel" v-if="showCart" @tap.self="showCart = false">
      <view class="cart-panel__mask" @tap="showCart = false" />
      <view class="cart-panel__content">
        <!-- 头部 -->
        <view class="cart-panel__header">
          <text class="cart-panel__title">购物车</text>
          <text class="cart-panel__clear" @tap="clearCart">清空</text>
        </view>

        <!-- 商品列表 -->
        <scroll-view class="cart-panel__scroll" scroll-y>
          <view class="cart-list">
            <view class="cart-item" v-for="(item, index) in cartList" :key="item.id">
              <image class="cart-item__cover" :src="item.cover" mode="aspectFill" />
              <view class="cart-item__info">
                <text class="cart-item__title">{{ item.title }}</text>
                <view class="cart-item__row">
                  <text class="cart-item__price">¥{{ item.price.toFixed(2) }}</text>
                  <view class="cart-item__actions">
                    <view class="cart-item__btn" @tap="changeQuantity(index, -1)">-</view>
                    <text class="cart-item__num">{{ item.quantity }}</text>
                    <view class="cart-item__btn cart-item__btn--add" @tap="changeQuantity(index, 1)">+</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- 空状态 -->
          <view class="cart-panel__empty" v-if="cartList.length === 0">
            <text>购物车空空如也</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts, getAdminProducts } from '@/utils/product.js'
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  deleteCartItem as apiDeleteCartItem,
  clearCart as apiClearCart,
  getLocalCart,
  saveToLocalCart,
  updateLocalCartItem,
  deleteLocalCartItem,
  clearLocalCart,
  getLocalCart as getLocalCartFunc
} from '@/utils/cart.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const headerHeight = ref(100)

// ========== 购物车数据 ==========
const cartList = ref([])
const cartCount = ref(0)
const totalPrice = ref(0)
const showCart = ref(false)

// ========== 商品列表数据 ==========
const allProducts = ref([])
const productList = ref([])
const searchKeyword = ref('')
const isSearching = ref(false)
const searchResultCount = ref(0)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    paddingTop: headerHeight.value + 'px',
    height: `calc(100vh - ${headerHeight.value}px - ${safeBottom}px)`,
  }
})

// ========== 购物车栏样式 ==========
const cartBarStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    paddingBottom: (safeBottom + 20) + 'px'
  }
})

// ========== 加载商品列表 ==========
const loadProducts = async () => {
  const res = await getProducts()
  const adminProducts = getAdminProducts()
  allProducts.value = [...adminProducts, ...(res.list || [])]
  productList.value = [...allProducts.value]
}

// ========== 加载购物车 ==========
const loadCart = async () => {
  const res = await getCart()
  cartList.value = res.list || []
  cartCount.value = res.totalCount || 0
  totalPrice.value = res.totalPrice || 0
}

// ========== 搜索功能 ==========
const onSearchInput = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    clearSearch()
    return
  }
  isSearching.value = true
  productList.value = allProducts.value.filter(item =>
    item.title.toLowerCase().includes(keyword) ||
    item.tags?.some(tag => tag.toLowerCase().includes(keyword))
  )
  searchResultCount.value = productList.value.length
}

const onSearch = () => {
  if (isSearching.value && searchResultCount.value === 0) {
    uni.showToast({ title: '未找到相关商品', icon: 'none' })
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  productList.value = [...allProducts.value]
}

// ========== 交互方法 ==========
const goDetail = (product) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` })
}

const addToCart = async (product) => {
  const res = await apiAddToCart(product.id)
  if (!res.ok) {
    saveToLocalCart(product)
    const localRes = getLocalCartFunc()
    cartList.value = localRes.list
    cartCount.value = localRes.totalCount
  } else {
    await loadCart()
  }
  uni.showToast({ title: '已添加', icon: 'none' })
}

const toggleCart = () => {
  showCart.value = !showCart.value
}

const changeQuantity = async (index, delta) => {
  const item = cartList.value[index]
  const newQuantity = item.quantity + delta

  if (newQuantity <= 0) {
    deleteItem(index)
    return
  }

  const res = await apiUpdateCartItem(item.id, newQuantity)
  if (!res.ok) {
    updateLocalCartItem(item.id, newQuantity)
    const localRes = getLocalCartFunc()
    cartList.value = localRes.list
    cartCount.value = localRes.totalCount
    totalPrice.value = localRes.totalPrice
  } else {
    await loadCart()
  }
}

const deleteItem = (index) => {
  const item = cartList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        const apiRes = await apiDeleteCartItem(item.id)
        if (!apiRes.ok) {
          deleteLocalCartItem(item.id)
        }
        await loadCart()
      }
    }
  })
}

const clearCart = async () => {
  if (cartList.value.length === 0) return
  uni.showModal({
    title: '确认清空',
    content: '确定要清空购物车吗？',
    success: async (res) => {
      if (res.confirm) {
        const apiRes = await apiClearCart()
        if (!apiRes.ok) {
          clearLocalCart()
        }
        await loadCart()
        showCart.value = false
      }
    }
  })
}

const goCheckout = () => {
  // 检查登录
  const token = uni.getStorageSync('demo_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 1000)
    return
  }
  // 跳转到结账页面
  uni.navigateTo({ url: '/pages/checkout/checkout' })
}

// ========== 生命周期 ==========
onMounted(async () => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  await loadCart()
  await loadProducts()
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
  display: flex;
  flex-direction: column;
}

/* 顶部搜索栏 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  z-index: 100;
}

.search {
  width: 100%;
  height: 68rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search__icon {
  font-size: 28rpx;
  opacity: 0.6;
}

.search__input {
  flex: 1;
  height: 100%;
  margin-left: 12rpx;
  font-size: 26rpx;
  color: $text;
}

.search__placeholder {
  color: $sub;
}

.search__clear {
  font-size: 24rpx;
  color: $sub;
  padding: 8rpx;
  margin-left: 8rpx;
}

/* 搜索结果提示 */
.search-tip {
  padding: 16rpx 24rpx;
  background: #fff;
  font-size: 24rpx;
  color: $sub;
  border-bottom: 1rpx solid #f5f5f5;
}

/* 滚动区域 */
.scroll {
  flex: 1;
  width: 100%;
}

/* 商品网格 */
.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  gap: 20rpx;
}

/* 商品卡片 */
.product-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.product-card__cover {
  width: 100%;
  height: 280rpx;
}

.product-card__info {
  padding: 16rpx;
}

.product-card__title {
  font-size: 26rpx;
  color: $text;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.product-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.product-card__add {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  line-height: 1;
  transform: translateY(-2rpx);
}

/* 空状态 */
.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: $sub;
}

/* 底部安全区 */
.bottom-safe {
  height: 140rpx;
}

/* 底部购物车栏 */
.cart-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 50px;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-left: 36rpx;
  padding-right: 36rpx;
  padding-bottom: calc(env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-top: 1rpx solid #f0f0f0;
}

.cart-bar__left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cart-bar__icon-wrap {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
}

.cart-bar__icon {
  font-size: 36rpx;
}

.cart-bar__badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #ff3b30, #ff6b6b);
  color: #fff;
  font-size: 18rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(255, 59, 48, 0.4);
}

.cart-bar__total-price {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
}

.cart-bar__total-price::before {
  content: '合计 ¥';
  font-size: 24rpx;
  color: $sub;
  font-weight: 500;
}

.cart-bar__btn {
  background: linear-gradient(135deg, $primary, #FFB347);
  padding: 20rpx 60rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
}

/* 购物车面板 */
.cart-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
}

.cart-panel__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.cart-panel__content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  height: 75vh;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  flex-shrink: 0;
}

.cart-panel__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
}

.cart-panel__clear {
  font-size: 24rpx;
  color: $sub;
}

.cart-panel__scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cart-list {
  padding: 16rpx 32rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item__cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.cart-item__info {
  flex: 1;
  margin-left: 20rpx;
}

.cart-item__title {
  font-size: 26rpx;
  color: $text;
  line-height: 1.4;
  margin-bottom: 10rpx;
}

.cart-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-item__price {
  font-size: 28rpx;
  color: $primary;
  font-weight: 700;
}

.cart-item__actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cart-item__btn {
  width: 44rpx;
  height: 44rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $sub;
}

.cart-item__btn:active {
  background: $primary;
  color: #fff;
}

.cart-item__btn--add {
  background: linear-gradient(135deg, $primary, #FFB347);
  color: #fff;
}

.cart-item__num {
  min-width: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: $text;
  font-weight: 600;
}

.cart-panel__empty {
  padding: 100rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: $sub;
}
</style>
