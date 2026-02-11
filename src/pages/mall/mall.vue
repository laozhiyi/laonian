<template>
  <view class="page">
    <!-- 动态背景 -->
    <view class="ambient-bg">
      <view class="ambient-blob ambient-blob--1"></view>
      <view class="ambient-blob ambient-blob--2"></view>
    </view>

    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__brand">
        <text class="brand-emoji">🍊</text>
        <text class="brand-name">商城</text>
      </view>
    </view>

    <!-- 搜索栏（在导航栏下方） -->
    <view class="search-bar" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
      <view class="search-box" @tap="showSearchPopup = true">
        <view class="search-icon">
          <text class="icon-text icon-text--search">🔍</text>
        </view>
        <text class="search-placeholder">{{ searchKeyword || '搜索新鲜柑橘...' }}</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y @scroll="onScroll">
      <!-- 装饰性标签 -->
      <view class="hero-banner">
        <view class="hero-content">
          <text class="hero-title">新鲜直达</text>
          <text class="hero-subtitle">从果园到餐桌的美味旅程</text>
        </view>
        <view class="hero-decoration">
          <view class="fruit-orb fruit-orb--orange"></view>
          <view class="fruit-orb fruit-orb--leaf"></view>
        </view>
      </view>

      <!-- 骨架屏加载状态 -->
      <view class="skeleton-waterfall" v-if="productsLoading && productList.length === 0">
        <view class="skeleton-column">
          <view class="skeleton-card" v-for="n in 4" :key="'left-' + n">
            <view class="skeleton-image"></view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text short"></view>
          </view>
        </view>
        <view class="skeleton-column">
          <view class="skeleton-card" v-for="n in 4" :key="'right-' + n">
            <view class="skeleton-image"></view>
            <view class="skeleton-text"></view>
            <view class="skeleton-text short"></view>
          </view>
        </view>
      </view>

      <!-- 商品瀑布流 -->
      <view class="product-waterfall" v-else>
        <view class="waterfall-column waterfall-column--left">
          <view
            class="product-mega-card"
            v-for="(product, index) in leftProducts"
            :key="product.id"
            :style="{ animationDelay: (index * 0.1) + 's' }"
            @tap="goDetail(product)"
          >
            <view class="mega-card__image-wrap">
              <image class="mega-card__image" :src="product.cover" mode="aspectFill" />
            </view>
            <view class="mega-card__body">
              <text class="mega-card__title">{{ product.title }}</text>
              <view class="mega-card__footer">
                <view class="price-group">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ (product.priceNow || 0).toFixed(2) }}</text>
                </view>
                <view class="add-circle" @tap.stop="addToCart(product)">
                  <text class="icon-text icon-text--add">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="waterfall-column waterfall-column--right">
          <view
            class="product-mega-card"
            v-for="(product, index) in rightProducts"
            :key="product.id"
            :style="{ animationDelay: (index * 0.1) + 's' }"
            @tap="goDetail(product)"
          >
            <view class="mega-card__image-wrap">
              <image class="mega-card__image" :src="product.cover" mode="aspectFill" />
            </view>
            <view class="mega-card__body">
              <text class="mega-card__title">{{ product.title }}</text>
              <view class="mega-card__footer">
                <view class="price-group">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ (product.priceNow || 0).toFixed(2) }}</text>
                </view>
                <view class="add-circle" @tap.stop="addToCart(product)">
                  <text class="icon-text icon-text--add">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部加载提示 -->
      <view class="load-more" v-if="(filteredProducts || []).length > 0">
        <text class="load-more__text">— 已经到底啦 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 搜索弹窗 -->
    <view class="search-popup" v-if="showSearchPopup">
      <view class="search-popup__mask" @tap="showSearchPopup = false" />
      <view class="search-popup__content" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
        <view class="search-popup__header">
          <view class="search-popup__input-wrap">
            <view class="search-popup__icon">
              <text class="icon-text icon-text--search">🔍</text>
            </view>
            <input
              class="search-popup__input"
              type="text"
              v-model="searchInput"
              placeholder="搜索新鲜柑橘..."
              focus
              confirm-type="search"
              @confirm="doSearch"
            />
            <view class="search-popup__clear" v-if="searchInput" @tap="searchInput = ''">
              <text class="icon-text icon-text--close">✕</text>
            </view>
          </view>
          <view class="search-popup__cancel" @tap="doSearch">搜索</view>
        </view>

        <scroll-view class="search-popup__body" scroll-y>
          <!-- 搜索历史 -->
          <view class="search-section" v-if="(searchHistory || []).length > 0">
            <view class="search-section__header">
              <text class="search-section__title">搜索历史</text>
              <view class="search-section__clear" @tap="clearHistory">
                <text>清空</text>
              </view>
            </view>
            <view class="search-tags">
              <view
                class="search-tag"
                v-for="keyword in searchHistory"
                :key="keyword"
                @tap="searchByKeyword(keyword)"
              >{{ keyword }}</view>
            </view>
          </view>

          <!-- 无搜索历史提示 -->
          <view class="search-empty" v-if="(searchHistory || []).length === 0">
            <text class="search-empty__text">暂无搜索记录</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 购物车悬浮球 -->
    <view class="cart-float" :class="{ 'cart-float--bump': cartBump }" :style="cartFloatStyle" @tap="toggleCart">
      <view class="cart-float__icon">
        <text class="icon-text icon-text--cart">🛒</text>
      </view>
      <view class="cart-float__badge" v-if="cartCount > 0">{{ cartCount > 99 ? '99+' : cartCount }}</view>
      <view class="cart-float__total" v-if="cartCount > 0">
        <text>¥{{ (totalPrice || 0).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 购物车面板 -->
    <view class="cart-panel" v-if="showCart" @tap.self="showCart = false">
      <view class="cart-panel__mask" @tap="showCart = false" />
      <view class="cart-panel__sheet">
        <view class="cart-panel__handle"></view>
        <view class="cart-panel__header">
          <view class="cart-panel__scroll-btns" v-if="cartListLength > 3">
            <view class="scroll-btn" @tap="scrollToTop">
              <text class="icon-text icon-text--arrow-up">▲</text>
            </view>
            <view class="scroll-btn" @tap="scrollToBottom">
              <text class="icon-text icon-text--arrow-down">▼</text>
            </view>
          </view>
          <text class="cart-panel__title">购物车</text>
          <view class="cart-panel__clear" @tap="clearCart">
            <text class="cart-panel__clear-text">清空</text>
          </view>
        </view>

        <view class="cart-panel__scroll">
          <view class="cart-items" v-if="cartListLength > 0">
            <view class="cart-item" v-for="(item, index) in cartList" :key="item.id">
              <image class="cart-item__cover" :src="item.cover" mode="aspectFill" />
              <view class="cart-item__info">
                <text class="cart-item__title">{{ item.title }}</text>
                <view class="cart-item__bottom">
                  <text class="cart-item__price">¥{{ (item.price || 0).toFixed(2) }}</text>
                  <view class="cart-item__controls">
                    <view class="qty-btn qty-btn--minus" @tap="changeQuantity(index, -1)">
                      <text class="icon-text icon-text--minus">−</text>
                    </view>
                    <text class="qty-num">{{ item.quantity }}</text>
                    <view class="qty-btn qty-btn--plus" @tap="changeQuantity(index, 1)">
                      <text class="icon-text icon-text--add">+</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="cart-empty" v-else>
            <view class="cart-empty__icon">
              <text class="icon-text icon-text--cart">🛒</text>
            </view>
            <text class="cart-empty__text">购物车空空如也</text>
          </view>
        </view>

        <view class="cart-panel__footer" v-if="cartListLength > 0">
          <view class="cart-total">
            <text class="cart-total__label">合计</text>
            <text class="cart-total__value">¥{{ (totalPrice || 0).toFixed(2) }}</text>
          </view>
          <view class="checkout-btn" @tap="goCheckout">
            <text>去结算</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProducts } from '@/utils/product.js'
import { getCart, addToCart as apiAddToCart, saveToLocalCart, getLocalCart, updateCartItem, deleteCartItem, clearCart as clearCartApi } from '@/utils/cart.js'
import { getWithCache } from '@/utils/cache.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const capsuleInfo = ref({ width: 0, height: 0, left: 0, right: 0, bottom: 0 })
const searchBarHeight = 100 // 搜索栏固定高度

// ========== 图片URL转换函数 ==========
const getImageUrl = (cover) => {
  if (!cover) return ''

  // 如果是云存储URL (cloud://开头)
  if (cover.startsWith('cloud://')) {
    return cover
  }

  // 如果是HTTP URL，直接返回
  if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover
  }

  // 其他情况返回空字符串
  return ''
}

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + searchBarHeight
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px - ${safeBottom}px)`,
  }
})

// ========== 购物车悬浮球样式 ==========
const cartFloatStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  return {
    bottom: (safeBottom + 20) + 'px'
  }
})

// ========== 购物车数据 ==========
const cartList = ref([])
const cartCount = ref(0)
const totalPrice = ref(0)
const showCart = ref(false)
const cartBump = ref(false)

// 安全的购物车列表访问器
const safeCartList = computed(() => {
  return cartList.value || []
})

// 安全获取购物车长度
const cartListLength = computed(() => {
  return (cartList.value || []).length
})

// ========== 商品列表数据 ==========
const allProducts = ref([])
const productList = ref([])
const productsLoading = ref(false)

// ========== 购物车加载状态 ==========
const cartLoading = ref(false)

// ========== 搜索功能 ==========
const searchKeyword = ref('')
const showSearchPopup = ref(false)
const searchHistory = ref([])
const searchInput = ref('')

// ========== 筛选后的商品列表 ==========
const filteredProducts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return productList.value
  }
  return productList.value.filter(item =>
    (item.title && item.title.toLowerCase().includes(keyword)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword)))
  )
})

// 更新瀑布流分组使用筛选后的商品
const leftProducts = computed(() => {
  return filteredProducts.value.filter((_, index) => index % 2 === 0)
})

const rightProducts = computed(() => {
  return filteredProducts.value.filter((_, index) => index % 2 === 1)
})

const onSearchTap = () => {
  showSearchPopup.value = true
}

const doSearch = () => {
  const keyword = searchInput.value.trim()
  if (!keyword) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  searchKeyword.value = keyword

  // 添加到搜索历史
  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)

  // 保存到本地
  uni.setStorageSync('search_history', searchHistory.value)
  showSearchPopup.value = false
  searchInput.value = ''
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchInput.value = ''
}

const clearHistory = () => {
  searchHistory.value = []
  uni.removeStorageSync('search_history')
}

const searchByKeyword = (keyword) => {
  searchKeyword.value = keyword
  showSearchPopup.value = false
}

const loadSearchHistory = () => {
  const history = uni.getStorageSync('search_history') || []
  searchHistory.value = history
}

// ========== 加载商品列表 ==========
const loadProducts = async (forceRefresh = false) => {
  if (productsLoading.value) return
  productsLoading.value = true

  try {
    let res
    if (forceRefresh) {
      // 强制刷新，不使用缓存
      res = await getProducts()
      res = res.list || []
    } else {
      // 使用缓存
      res = await getWithCache(
        'products_list',
        async () => {
          const result = await getProducts()
          return result.list || []
        },
        2 * 60 * 1000 // 缓存2分钟
      )
    }

    if (res) {
      // 转换 _id 为 id
      productList.value = res.map(item => ({
        ...item,
        id: item._id || item.id
      }))
      allProducts.value = productList.value
    }
  } catch (e) {
    console.error('加载商品失败:', e)
  } finally {
    productsLoading.value = false
  }
}

// ========== 加载购物车 ==========
const loadCart = async (forceRefresh = false) => {
  if (cartLoading.value) return
  cartLoading.value = true

  try {
    const res = await getCart()
    cartList.value = res.list || []
    cartCount.value = res.totalCount || 0
    totalPrice.value = res.totalPrice || 0
  } catch (e) {
    console.error('加载购物车失败:', e)
  } finally {
    cartLoading.value = false
  }
}

const onScroll = (e) => {
  // 滚动监听，可用于实现吸顶效果
}

// ========== 交互方法 ==========
const goDetail = (product) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` })
}

const addToCart = async (product) => {
  // 直接保存到本地购物车
  await saveToLocalCart(product)
  // 重新加载购物车数据
  const localRes = await getLocalCart()
  cartList.value = localRes.list || []
  cartCount.value = localRes.totalCount || 0
  totalPrice.value = localRes.totalPrice || 0

  // 动画效果
  cartBump.value = true
  setTimeout(() => { cartBump.value = false }, 300)
  uni.showToast({ title: '已添加', icon: 'none' })
}

const toggleCart = () => {
  showCart.value = !showCart.value
}

const scrollToTop = () => {
  const query = uni.createSelectorQuery().in(this)
  query.select('.cart-panel__scroll').boundingClientRect((rect) => {
    if (rect) {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    }
  }).exec()
}

const scrollToBottom = () => {
  uni.pageScrollTo({
    scrollTop: 9999,
    duration: 300
  })
}

const changeQuantity = async (index, delta) => {
  const item = cartList.value[index]
  const newQuantity = item.quantity + delta

  if (newQuantity <= 0) {
    deleteItem(index)
    return
  }

  const res = await updateCartItem(item.id, newQuantity)
  if (res.ok) {
    loadCart()
  } else {
    await updateLocalCartItem(item.id, newQuantity)
    const localRes = await getLocalCart()
    cartList.value = localRes.list || []
    cartCount.value = localRes.totalCount || 0
    totalPrice.value = localRes.totalPrice || 0
  }
}

const deleteItem = (index) => {
  const item = cartList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        const apiRes = await deleteCartItem(item.id)
        if (apiRes.ok) {
          loadCart()
        } else {
          await deleteLocalCartItem(item.id)
          const localRes = await getLocalCart()
          cartList.value = localRes.list || []
          cartCount.value = localRes.totalCount || 0
          totalPrice.value = localRes.totalPrice || 0
        }
      }
    }
  })
}

const clearCart = () => {
  if (cartList.value.length === 0) return
  uni.showModal({
    title: '确认清空',
    content: '确定要清空购物车吗？',
    success: async (res) => {
      if (res.confirm) {
        const apiRes = await clearCartApi()
        if (apiRes && apiRes.ok) {
          loadCart()
        } else {
          clearLocalCart()
          cartList.value = []
          cartCount.value = 0
          totalPrice.value = 0
        }
        showCart.value = false
      }
    }
  })
}

const goCheckout = () => {
  if (cartCount.value === 0) {
    uni.showToast({ title: '请先添加商品到购物车', icon: 'none' })
    return
  }
  const token = uni.getStorageSync('demo_token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/auth/login' })
    }, 1000)
    return
  }
  uni.navigateTo({ url: '/pages/checkout/checkout' })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  // 获取胶囊按钮信息
  try {
    const capsule = uni.getMenuButtonBoundingClientRect()
    if (capsule) {
      capsuleInfo.value = {
        width: capsule.width || 0,
        height: capsule.height || 0,
        left: capsule.left || 0,
        right: capsule.right || 0,
        bottom: capsule.bottom || 0
      }
    }
  } catch (e) {
    // 兼容旧版本
  }
  loadCart()
  loadProducts()
  loadSearchHistory()
})

onShow(() => {
  // 每次显示时强制刷新商品列表和购物车数据
  loadProducts(true)
  loadCart()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$pink: #FF6B9D;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.5);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #FFFAF7;

// 动画定义
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

@keyframes blob-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

@keyframes bump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* 动态背景 */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-emoji {
  font-size: 40rpx;
  animation: float 4s ease-in-out infinite;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
}

/* 搜索栏 */
.search-bar {
  position: fixed;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 99;
  padding: 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.search-box {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  color: $text-muted;
}

.search-placeholder {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-muted;
  letter-spacing: 1rpx;
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100rpx);
  animation: blob-pulse 10s ease-in-out infinite;
}

.ambient-blob--1 {
  width: 500rpx;
  height: 500rpx;
  background: linear-gradient(135deg, $primary 0%, rgba(255, 159, 90, 0.4) 100%);
  top: -150rpx;
  right: -100rpx;
}

.ambient-blob--2 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, $secondary 0%, rgba(78, 205, 196, 0.3) 100%);
  bottom: 200rpx;
  left: -150rpx;
  animation-delay: 3s;
}

/* 搜索栏 */

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 英雄横幅 */
.hero-banner {
  margin: 24rpx;
  padding: 48rpx 40rpx;
  background: $orange-gradient;
  border-radius: 32rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(255, 107, 53, 0.25);
  animation: slideUpFade 0.6s ease-out;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
  text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 2rpx;
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  pointer-events: none;
}

.fruit-orb {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.fruit-orb--orange {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  top: 20rpx;
  right: 40rpx;
  animation-delay: 0s;
}

.fruit-orb--leaf {
  width: 80rpx;
  height: 80rpx;
  background: rgba(78, 205, 196, 0.3);
  bottom: 30rpx;
  right: 100rpx;
  animation-delay: 2s;
}

/* 骨架屏 */
.skeleton-waterfall {
  display: flex;
  padding: 24rpx;
  gap: 20rpx;
}

.skeleton-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 32rpx;
  overflow: hidden;
  padding: 0;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 28rpx;
  margin: 24rpx 24rpx 12rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &.short {
    width: 60%;
    margin-top: 12rpx;
    margin-bottom: 24rpx;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 瀑布流布局 */
.product-waterfall {
  display: flex;
  padding: 24rpx;
  gap: 20rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 超大商品卡片 */
.product-mega-card {
  background: $glass-bg;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUpFade 0.6s ease-out both;

  &:active {
    transform: scale(0.97) translateY(-6rpx);
    box-shadow: 0 16rpx 48rpx rgba(255, 107, 53, 0.15);
  }
}

.mega-card__image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.mega-card__image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  .product-mega-card:active & {
    transform: scale(1.08);
  }
}

.mega-card__tag {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  padding: 8rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.4);
}

.mega-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20rpx;

  .product-mega-card:active & {
    opacity: 1;
  }
}

.quick-add {
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.2);

  svg {
    width: 36rpx;
    height: 36rpx;
    color: $primary;
  }
}

.mega-card__body {
  padding: 24rpx;
}

.mega-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mega-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.mini-tag {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
  border: 1rpx solid rgba(78, 205, 196, 0.25);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: $secondary;
  font-weight: 500;
}

.mega-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: $primary;
}

.price-value {
  font-size: 44rpx;
  font-weight: 700;
  color: $primary;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  letter-spacing: -1rpx;
}

.add-circle {
  width: 56rpx;
  height: 56rpx;
  background: $orange-gradient;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.35);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 32rpx;
    height: 32rpx;
    color: #fff;
  }
}

/* 加载更多 */
.load-more {
  padding: 48rpx 0;
  text-align: center;

  &__text {
    font-size: 24rpx;
    color: $text-muted;
    letter-spacing: 2rpx;
  }
}

.bottom-spacer {
  height: 200rpx;
}

/* 购物车悬浮球 */
.cart-float {
  position: fixed;
  right: 32rpx;
  background: $orange-gradient;
  border-radius: 50rpx;
  padding: 20rpx 32rpx 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 48rpx rgba(255, 107, 53, 0.4);
  z-index: 90;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--bump {
    animation: bump 0.3s ease-out;
  }

  &:active {
    transform: scale(0.95);
  }
}

.cart-float__icon {
  width: 48rpx;
  height: 48rpx;
  color: #fff;

  svg {
    width: 100%;
    height: 100%;
  }
}

.cart-float__badge {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 12rpx;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
}

.cart-float__total {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
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
  backdrop-filter: blur(8rpx);
}

.cart-panel__sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  height: 75vh;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  animation: slideUpSheet 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideUpSheet {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.cart-panel__handle {
  width: 80rpx;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4rpx;
  margin: 20rpx auto 8rpx;
}

.cart-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.cart-panel__scroll-btns {
  display: flex;
  gap: 12rpx;
}

.scroll-btn {
  width: 48rpx;
  height: 48rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28rpx;
    height: 28rpx;
    color: $text-secondary;
  }

  &:active {
    background: rgba(255, 107, 53, 0.1);
    svg { color: $primary; }
  }
}

.cart-panel__title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.cart-panel__clear {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: $text-muted;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  white-space: nowrap;

  &:active {
    color: $primary;
    background: rgba(255, 107, 53, 0.1);
  }
}

.cart-panel__scroll {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cart-items {
  padding: 24rpx 32rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  animation: slideUpFade 0.4s ease-out;

  &:last-child {
    border-bottom: none;
  }
}

.cart-item__cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.cart-item__info {
  flex: 1;
  margin-left: 24rpx;
}

.cart-item__title {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.cart-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-item__price {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
}

.cart-item__controls {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.qty-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 26rpx;
    height: 26rpx;
  }
}

.qty-btn--minus {
  background: #f5f5f5;
  color: $text-secondary;

  &:active {
    background: $primary;
    color: #fff;
  }
}

.qty-btn--plus {
  background: $orange-gradient;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);

  &:active {
    transform: scale(0.9);
  }
}

.qty-num {
  min-width: 48rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  &__icon {
    width: 120rpx;
    height: 120rpx;
    color: $text-muted;
    opacity: 0.3;
    margin-bottom: 24rpx;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    font-size: 28rpx;
    color: $text-muted;
    letter-spacing: 2rpx;
  }
}

.cart-panel__footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(4rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f5f5f5;
  border-radius: 0 0 40rpx 40rpx;
}

.cart-total {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;

  &__label {
    font-size: 28rpx;
    color: $text-secondary;
  }

  &__value {
    font-size: 48rpx;
    font-weight: 700;
    color: $primary;
    font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  }
}

.checkout-btn {
  background: $orange-gradient;
  padding: 28rpx 64rpx;
  border-radius: 44rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.35);

  text {
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2rpx;
  }

  &:active {
    transform: scale(0.96);
  }
}

/* 搜索弹窗 */
.search-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
}

.search-popup__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.search-popup__content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  animation: slideDownFade 0.3s ease-out;
  overflow: hidden;
  z-index: 200;
}

@keyframes slideDownFade {
  from { opacity: 0; transform: translateY(-20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.search-popup__header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.search-popup__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 16rpx 0 24rpx;
}

.search-popup__icon {
  width: 36rpx;
  height: 36rpx;
  color: $text-muted;

  svg {
    width: 100%;
    height: 100%;
  }
}

.search-popup__input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.search-popup__clear {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;

  svg {
    width: 22rpx;
    height: 22rpx;
    color: $text-secondary;
  }
}

.search-popup__cancel {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  padding: 12rpx 0;
  white-space: nowrap;

  &:active {
    color: $primary;
  }
}

.search-popup__body {
  max-height: 60vh;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

.search-section {
  margin-bottom: 32rpx;
}

.search-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-right: 8rpx;
  box-sizing: border-box;
}

.search-section__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.search-section__clear {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: $text-muted;
  padding: 6rpx 12rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  flex-shrink: 0;

  &:active {
    color: $primary;
    background: rgba(255, 107, 53, 0.1);
  }
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.search-tag {
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 107, 53, 0.1);
    color: $primary;
  }
}

.search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;

  &__text {
    font-size: 26rpx;
    color: $text-muted;
  }
}

.clear-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  margin-top: 24rpx;

  svg,
  .icon-text {
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-muted;
    font-size: 32rpx;
  }

  text {
    font-size: 28rpx;
    color: $text-secondary;
  }

  &:active {
    background: rgba(255, 107, 53, 0.1);
    svg, text { color: $primary; }
  }
}

/* 文本图标样式 - 兼容微信小程序 */
.icon-text {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--search {
  font-size: 36rpx;
}

.icon-text--filter {
  font-size: 32rpx;
  font-weight: bold;
}

.icon-text--cart {
  font-size: 44rpx;
}

.icon-text--add {
  font-size: 36rpx;
  font-weight: 500;
}

.icon-text--close {
  font-size: 24rpx;
}

.icon-text--arrow-up {
  font-size: 24rpx;
}

.icon-text--arrow-down {
  font-size: 24rpx;
}

.icon-text--delete {
  font-size: 28rpx;
}

.icon-text--minus {
  font-size: 32rpx;
  font-weight: 500;
}

.icon-text--time {
  font-size: 26rpx;
}

/* 更新svg选择器以支持文本图标 */
.search-icon .icon-text,
.filter-btn .icon-text,
.mega-card__overlay .icon-text,
.add-circle .icon-text,
.cart-float__icon .icon-text,
.scroll-btn .icon-text,
.qty-btn .icon-text,
.cart-empty__icon .icon-text,
.search-popup__icon .icon-text,
.search-popup__clear .icon-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
