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
        <text class="brand-emoji">📚</text>
        <text class="brand-name">在线课程</text>
      </view>
    </view>

    <!-- 搜索栏（在导航栏下方） -->
    <view class="search-bar" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
      <view class="search-box" @tap="showSearchPopup = true">
        <view class="search-icon">
          <text class="icon-text icon-text--search">🔍</text>
        </view>
        <text class="search-placeholder">{{ searchKeyword || '搜索课程名称、讲师...' }}</text>
      </view>
    </view>

    <!-- 分类标签栏 -->
    <view class="category-bar" :style="{ top: (statusBarHeight + navHeight + searchBarHeight) + 'px' }">
      <scroll-view class="category-scroll" scroll-x enhanced show-scrollbar="false">
        <view class="category-tabs">
          <view
            class="category-tab"
            :class="{ 'category-tab--active': selectedCategory === '' }"
            @tap="selectCategory('')"
          >
            <text class="category-tab__text">全部</text>
          </view>
          <view
            class="category-tab"
            :class="{ 'category-tab--active': selectedCategory === cat.name }"
            :style="selectedCategory === cat.name ? { background: cat.color + '20', borderColor: cat.color } : {}"
            v-for="cat in categories"
            :key="cat.id"
            @tap="selectCategory(cat.name)"
          >
            <text class="category-tab__text" :style="selectedCategory === cat.name ? { color: cat.color } : {}">{{ cat.icon }} {{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y @scroll="onScroll">
      <!-- 骨架屏加载状态 -->
      <view class="skeleton-list" v-if="coursesLoading && courseList.length === 0">
        <view class="skeleton-card" v-for="n in 6" :key="n">
          <view class="skeleton-cover"></view>
          <view class="skeleton-body">
            <view class="skeleton-title"></view>
            <view class="skeleton-sub"></view>
            <view class="skeleton-footer"></view>
          </view>
        </view>
      </view>

      <!-- 搜索结果覆盖层（显示在课程列表上方） -->
      <view class="search-result-overlay" v-if="searchKeyword && !showSearchPopup">
        <view class="search-result-header">
          <view class="search-result-info">
            <text class="search-result-keyword">"{{ searchKeyword }}"</text>
            <text class="search-result-count">找到 {{ searchResultList.length }} 个相关课程</text>
          </view>
          <view class="search-result-back" @tap="clearSearch">
            <text>返回</text>
          </view>
        </view>

        <view class="search-result-list" v-if="searchResultList.length > 0">
          <view
            class="search-result-item"
            :class="{ 'search-result-item--external': course._isExternal }"
            v-for="course in searchResultList"
            :key="course._isExternal ? 'ext-' + course.id : course.id"
            @tap="goDetail(course)"
          >
            <image class="result-item__cover" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
            <view class="result-item__info">
              <view class="result-item__title-row">
                <text class="result-item__title">{{ course.title }}</text>
                <view class="result-item__badge" v-if="course._isExternal">
                  <text>外部课程</text>
                </view>
              </view>
              <view class="result-item__meta" v-if="course.instructor">
                <text class="result-item__instructor">讲师：{{ course.instructor }}</text>
              </view>
              <view class="result-item__meta" v-if="course.category">
                <text class="result-item__category">{{ course.category }}</text>
              </view>
              <view class="result-item__footer">
                <text class="result-item__price" v-if="course.priceNow || course.price">¥{{ (course.priceNow || course.price).toFixed(0) }}</text>
                <text class="result-item__price result-item__price--free" v-else>免费</text>
                <view class="result-item__btn">
                  <text>{{ course._isExternal ? '查看详情' : '立即购买' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 无搜索结果 -->
        <view class="search-empty-state" v-else>
          <text class="search-empty-icon">📭</text>
          <text class="search-empty-text">未找到"{{ searchKeyword }}"相关课程</text>
          <text class="search-empty-sub">试试其他关键词吧</text>
          <view class="search-empty-btn" @tap="clearSearch">
            <text>清除搜索</text>
          </view>
        </view>
      </view>

      <!-- 外部课程推荐区 -->
      <view class="external-section" v-if="externalCourses.length > 0 && !searchKeyword">
        <view class="section-header">
          <text class="section-title">精品课程</text>
          <text class="section-subtitle">外部优质课程</text>
        </view>
        <scroll-view class="external-scroll" scroll-x enhanced show-scrollbar="false">
          <view
            class="external-card"
            v-for="course in filteredExternalCourses"
            :key="'ext-' + course.id"
            @tap="goDetail({ ...course, _isExternal: true })"
          >
            <image class="external-card__cover" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
            <view class="external-card__mask">
              <view class="external-card__category" v-if="course.category">
                <text>{{ course.category }}</text>
              </view>
              <text class="external-card__title">{{ course.title }}</text>
              <view class="external-card__btn">
                <text>查看详情</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 课程列表（搜索时不显示） -->
      <view class="course-list" v-if="!searchKeyword && courseList.length > 0">
        <view
          class="course-card"
          v-for="(course, index) in filteredCourses"
          :key="course.id"
          :style="{ animationDelay: (index * 0.08) + 's' }"
          @tap="goDetail(course)"
        >
          <!-- 封面图 -->
          <view class="course-card__cover">
            <image class="course-card__img" :src="course.cover" mode="aspectFill" />
            <view class="course-card__level" v-if="course.level">{{ course.level }}</view>
            <view class="course-card__duration" v-if="course.duration">{{ course.duration }}</view>
          </view>

          <!-- 课程信息 -->
          <view class="course-card__body">
            <text class="course-card__title">{{ course.title }}</text>

            <!-- 讲师信息 -->
            <view class="course-card__instructor" v-if="course.instructor">
              <text class="instructor-avatar">{{ course.instructor.charAt(0) }}</text>
              <text class="instructor-name">{{ course.instructor }}</text>
            </view>

            <!-- 评分和人数 -->
            <view class="course-card__meta">
              <view class="meta-item meta-item--rating">
                <text class="star-icon">⭐</text>
                <text class="rating-value">{{ course.rating || '0.0' }}</text>
              </view>
              <view class="meta-item meta-item--student">
                <text class="student-icon">👥</text>
                <text class="student-count">{{ formatCount(course.studentCount || 0) }}人在学</text>
              </view>
            </view>

            <!-- 底部价格和按钮 -->
            <view class="course-card__footer">
              <view class="price-wrap">
                <text class="price-symbol" v-if="course.priceNow || course.price">¥</text>
                <text class="price-current" :class="{ 'price-current--free': !course.priceNow && !course.price }">
                  {{ (course.priceNow || course.price) ? (course.priceNow || course.price).toFixed(0) : '免费' }}
                </text>
                <text class="price-original" v-if="course.price > course.priceNow">¥{{ (course.price || 0).toFixed(0) }}</text>
              </view>
              <view class="add-btn" @tap.stop="addToCart(course)">
                <text class="icon-text">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!coursesLoading && filteredCourses.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无相关课程</text>
        <view class="empty-btn" @tap="clearFilter">
          <text>清除筛选</text>
        </view>
      </view>

      <!-- 底部加载提示 -->
      <view class="load-more" v-if="filteredCourses.length > 0">
        <text class="load-more__text">— 已经到底啦 —</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 搜索弹窗 -->
    <view class="search-popup" v-if="showSearchPopup">
      <view class="search-popup__mask" @tap="closeSearchPopup" />
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
              placeholder="搜索课程名称、讲师..."
              focus
              confirm-type="search"
              @input="onSearchInput"
              @confirm="doSearch"
            />
            <view class="search-popup__clear" v-if="searchInput" @tap="clearSearchInput">
              <text class="icon-text icon-text--close">✕</text>
            </view>
          </view>
          <view class="search-popup__cancel" @tap="closeSearchPopup">取消</view>
        </view>

        <scroll-view class="search-popup__body" scroll-y>
          <!-- 搜索结果建议（实时） -->
          <view class="search-suggestions" v-if="searchInput && searchSuggestions.length > 0">
            <view class="search-suggestions__title">搜索建议</view>
            <view
              class="search-suggestion-item"
              :class="{ 'search-suggestion-item--external': item._isExternal }"
              v-for="item in searchSuggestions"
              :key="item._isExternal ? 'ext-' + item.id : item.id"
              @tap="searchBySuggestion(item)"
            >
              <text class="suggestion-icon">{{ item._isExternal ? '🌐' : '🔍' }}</text>
              <text class="suggestion-text">{{ item.title }}</text>
              <text class="suggestion-badge" v-if="item._isExternal">外部</text>
              <text class="suggestion-category" v-else>{{ item.category }}</text>
            </view>
          </view>

          <!-- 搜索历史 -->
          <view class="search-section" v-if="!searchInput && (searchHistory || []).length > 0">
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

          <!-- 热门搜索 -->
          <view class="search-section" v-if="!searchInput">
            <view class="search-section__header">
              <text class="search-section__title">热门搜索</text>
            </view>
            <view class="search-tags">
              <view
                class="search-tag search-tag--hot"
                v-for="(keyword, index) in hotSearchKeywords"
                :key="index"
                @tap="searchByKeyword(keyword)"
              >
                <text class="hot-icon">🔥</text>{{ keyword }}
              </view>
            </view>
          </view>

          <!-- 无搜索历史提示 -->
          <view class="search-empty" v-if="!searchInput && (searchHistory || []).length === 0">
            <text class="search-empty__text">试试搜索课程名称或讲师</text>
          </view>

          <!-- 无搜索结果提示 -->
          <view class="search-empty" v-if="searchInput && searchSuggestions.length === 0">
            <text class="search-empty__icon">🔍</text>
            <text class="search-empty__text">未找到相关课程</text>
            <text class="search-empty__sub">换个关键词试试吧</text>
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
import { getCourses, getCategories } from '@/utils/course.js'
import { getExternalCourses, getExternalCategories } from '@/utils/external-course.js'
import { getCart, saveToLocalCart, getLocalCart, updateCartItem, deleteCartItem, clearCart as clearCartApi } from '@/utils/cart.js'
import { getWithCache } from '@/utils/cache.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)
const capsuleInfo = ref({ width: 0, height: 0, left: 0, right: 0, bottom: 0 })
const searchBarHeight = 100
const categoryBarHeight = 90

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value + searchBarHeight + categoryBarHeight
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

const cartListLength = computed(() => {
  return (cartList.value || []).length
})

// ========== 外部课程数据 ==========
const externalCourses = ref([])
const externalLoading = ref(false)

// ========== 加载外部课程 ==========
const loadExternalCourses = async () => {
  externalLoading.value = true
  try {
    const res = await getExternalCourses()
    if (res?.list) {
      externalCourses.value = res.list
    }
  } catch (error) {
    console.error('加载外部课程失败:', error)
  } finally {
    externalLoading.value = false
  }
}

// ========== 加载外部课程分类 ==========
const defaultCategories = [
  { id: 1, name: '老年健康', icon: '🏥', color: '#4ECDC4' },
  { id: 2, name: '传统文化', icon: '🏛️', color: '#A855F7' },
  { id: 3, name: '戏曲文艺', icon: '🎭', color: '#FF6B9D' },
  { id: 4, name: '书法绘画', icon: '🖌️', color: '#F59E0B' },
  { id: 5, name: '声乐舞蹈', icon: '🎵', color: '#10B981' },
  { id: 6, name: '智能技术', icon: '💻', color: '#3B82F6' },
  { id: 7, name: '综合课程', icon: '📚', color: '#FF6B35' },
]

// 分类默认封面图（本地图片）
const categoryCovers = {
  '老年健康': '/static/covers/1-healthcare.jpg',
  '传统文化': '/static/covers/2-culture.jpg',
  '戏曲文艺': '/static/covers/3-drama.jpg',
  '书法绘画': '/static/covers/4-calligraphy.jpg',
  '声乐舞蹈': '/static/covers/5-music.jpg',
  '智能技术': '/static/covers/6-tech.jpg',
  '综合课程': '/static/covers/7-edu.jpg',
}

const getCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || 'https://picsum.photos/400/300'
}

const loadExternalCategories = async () => {
  try {
    const res = await getExternalCategories()
    if (res?.list && res.list.length > 0) {
      categories.value = res.list
    } else {
      // 使用7个默认分类
      categories.value = defaultCategories
    }
  } catch (error) {
    console.error('加载外部课程分类失败:', error)
    // 使用7个默认分类
    categories.value = defaultCategories
  }
}

// ========== 点击外部课程卡片 ==========
const goToExternalCourse = (course) => {
  uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
}

// ========== 打开外部链接 ==========
const openExternalLink = (url) => {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  plus.runtime.openURL(url)
  // #endif
}

// ========== 课程列表数据 ==========
const allCourses = ref([])
const courseList = ref([])
const coursesLoading = ref(false)

// ========== 分类数据 ==========
const categories = ref([])
const selectedCategory = ref('')

// ========== 搜索功能 ==========
const searchKeyword = ref('')
const showSearchPopup = ref(false)
const searchHistory = ref([])
const searchInput = ref('')
const searchSuggestions = ref([])
const searchResultList = ref([])

// 热门搜索关键词
const hotSearchKeywords = ['老年健康', '书法', '声乐', '传统文化', '智能技术']

// ========== 筛选后的课程列表 ==========
const filteredCourses = computed(() => {
  let list = courseList.value

  // 分类筛选
  if (selectedCategory.value) {
    list = list.filter(item => item.category === selectedCategory.value)
  }

  // 关键词搜索
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter(item =>
      (item.title && item.title.toLowerCase().includes(keyword)) ||
      (item.instructor && item.instructor.toLowerCase().includes(keyword)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword)))
    )
  }

  return list
})

// ========== 筛选后的外部课程列表 ==========
const filteredExternalCourses = computed(() => {
  if (!selectedCategory.value) {
    return externalCourses.value
  }
  return externalCourses.value.filter(item => item.category === selectedCategory.value)
})

// ========== 格式化人数 ==========
const formatCount = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num > 0 ? num : '0'
}

// ========== 选择分类 ==========
const selectCategory = (category) => {
  selectedCategory.value = category
}

// ========== 清除筛选 ==========
const clearFilter = () => {
  selectedCategory.value = ''
  searchKeyword.value = ''
}

// ========== 搜索功能 ==========
const doSearch = () => {
  const keyword = searchInput.value.trim()
  if (!keyword) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  searchKeyword.value = keyword

  // 保存历史记录
  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  // 执行搜索
  performSearch(keyword)

  showSearchPopup.value = false
  searchInput.value = ''
  searchSuggestions.value = []
}

const performSearch = (keyword) => {
  const kw = keyword.toLowerCase()

  // 搜索内部课程
  const internalResults = allCourses.value
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(kw)))
    )
    .map(item => ({ ...item, _isExternal: false }))

  // 搜索外部课程
  const externalResults = (externalCourses.value || [])
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw)) ||
      (item.description && item.description.toLowerCase().includes(kw))
    )
    .map(item => ({ ...item, _isExternal: true }))

  // 合并结果，外部课程优先显示
  searchResultList.value = [...externalResults, ...internalResults]
}

// 搜索输入时显示实时建议
const onSearchInput = () => {
  const kw = searchInput.value.trim().toLowerCase()
  if (!kw) {
    searchSuggestions.value = []
    return
  }

  // 搜索建议 - 内部课程
  const internalSuggestions = allCourses.value
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      title: item.title,
      category: item.category || item.instructor || '',
      cover: item.cover,
      _isExternal: false
    }))

  // 搜索建议 - 外部课程
  const externalSuggestions = (externalCourses.value || [])
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
    .slice(0, 3)
    .map(item => ({
      id: item.id,
      title: item.title,
      category: item.category || '外部课程',
      cover: item.cover,
      _isExternal: true
    }))

  // 合并建议，外部课程优先
  searchSuggestions.value = [...externalSuggestions, ...internalSuggestions].slice(0, 8)
}

// 点击搜索建议
const searchBySuggestion = (item) => {
  searchKeyword.value = item.title
  searchInput.value = ''
  searchSuggestions.value = []

  // 保存历史
  const history = searchHistory.value.filter(k => k !== item.title)
  history.unshift(item.title)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  // 执行搜索
  performSearch(item.title)

  showSearchPopup.value = false
}

const clearSearchInput = () => {
  searchInput.value = ''
  searchSuggestions.value = []
}

const closeSearchPopup = () => {
  showSearchPopup.value = false
  searchInput.value = ''
  searchSuggestions.value = []
}

const clearHistory = () => {
  searchHistory.value = []
  uni.removeStorageSync('search_history')
}

const searchByKeyword = (keyword) => {
  searchKeyword.value = keyword
  searchInput.value = ''
  searchSuggestions.value = []
  showSearchPopup.value = false

  // 保存历史
  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  // 执行搜索
  performSearch(keyword)
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchResultList.value = []
  searchInput.value = ''
  selectedCategory.value = ''
}

const loadSearchHistory = () => {
  const history = uni.getStorageSync('search_history') || []
  searchHistory.value = history
}

// ========== 加载分类 ==========
const loadCategories = async () => {
  try {
    const res = await getCategories()
    if (res?.list) {
      categories.value = res.list
    }
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

// ========== 加载课程列表 ==========
const loadCourses = async (forceRefresh = false) => {
  if (coursesLoading.value) return
  coursesLoading.value = true

  try {
    let res
    if (forceRefresh) {
      res = await getCourses()
      res = res.list || []
    } else {
      res = await getWithCache(
        'courses_list',
        async () => {
          const result = await getCourses()
          return result.list || []
        },
        2 * 60 * 1000
      )
    }

    if (res) {
      courseList.value = res.map(item => ({
        ...item,
        id: item._id || item.id
      }))
      allCourses.value = courseList.value
    }
  } catch (e) {
    console.error('加载课程失败:', e)
  } finally {
    coursesLoading.value = false
  }
}

// ========== 加载购物车 ==========
const loadCart = async () => {
  try {
    const res = await getCart()
    cartList.value = res.list || []
    cartCount.value = res.totalCount || 0
    totalPrice.value = res.totalPrice || 0
  } catch (e) {
    console.error('加载购物车失败:', e)
  }
}

const onScroll = (e) => {}

// ========== 交互方法 ==========
const goDetail = (course) => {
  // 检查是否是外部课程
  if (course._isExternal) {
    goToExternalCourse(course)
    return
  }
  uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
}

const addToCart = async (course) => {
  await saveToLocalCart(course)
  const localRes = await getLocalCart()
  cartList.value = localRes.list || []
  cartCount.value = localRes.totalCount || 0
  totalPrice.value = localRes.totalPrice || 0

  cartBump.value = true
  setTimeout(() => { cartBump.value = false }, 300)
  uni.showToast({ title: '已添加', icon: 'none' })
}

const toggleCart = () => {
  showCart.value = !showCart.value
}

const scrollToTop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

const scrollToBottom = () => {
  uni.pageScrollTo({ scrollTop: 9999, duration: 300 })
}

const changeQuantity = async (index, delta) => {
  const item = cartList.value[index]
  const newQuantity = item.quantity + delta

  if (newQuantity <= 0) {
    deleteItem(index)
    return
  }

  await updateCartItem(item.id, newQuantity)
  loadCart()
}

const deleteItem = (index) => {
  const item = cartList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该课程吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteCartItem(item.id)
        loadCart()
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
        await clearCartApi()
        cartList.value = []
        cartCount.value = 0
        totalPrice.value = 0
        showCart.value = false
      }
    }
  })
}

const goCheckout = () => {
  if (cartCount.value === 0) {
    uni.showToast({ title: '请先添加课程到购物车', icon: 'none' })
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
  } catch (e) {}
  loadCategories()
  loadExternalCategories()
  loadCourses()
  loadExternalCourses()
  loadCart()
  loadSearchHistory()
})

onShow(() => {
  loadCourses(true)
  loadExternalCourses()
  loadCart()
})
</script>

<style lang="scss" scoped>
// ========== 设计规范 ==========
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$pink: #FF6B9D;
$purple: #A855F7;
$blue: #3B82F6;
$green: #10B981;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.5);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #FFFAF7;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
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
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100rpx);
  animation: blob-pulse 10s ease-in-out infinite;
}

.ambient-blob--1 {
  width: 500rpx; height: 500rpx;
  background: linear-gradient(135deg, $primary 0%, rgba(255, 159, 90, 0.4) 100%);
  top: -150rpx; right: -100rpx;
}

.ambient-blob--2 {
  width: 400rpx; height: 400rpx;
  background: linear-gradient(135deg, $secondary 0%, rgba(78, 205, 196, 0.3) 100%);
  bottom: 200rpx; left: -150rpx;
  animation-delay: 3s;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: auto; min-height: 88rpx;
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
  left: 0; right: 0;
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
  width: 36rpx; height: 36rpx;
  color: $text-muted;
}

.search-placeholder {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-muted;
  letter-spacing: 1rpx;
}

/* 分类标签栏 */
.category-bar {
  position: fixed;
  left: 0; right: 0;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 98;
}

.category-scroll {
  height: 90rpx;
  white-space: nowrap;
}

.category-tabs {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &--active {
    background: rgba(255, 107, 53, 0.1);
    border-color: $primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

.category-tab__text {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-secondary;
  letter-spacing: 1rpx;

  .category-tab--active & {
    color: $primary;
    font-weight: 600;
  }
}

/* 滚动区域 */
.scroll {
  position: relative;
  z-index: 1;
}

/* 外部课程推荐区 */
.external-section {
  padding: 24rpx;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-subtitle {
  font-size: 24rpx;
  color: $text-muted;
}

.external-scroll {
  white-space: nowrap;
}

.external-card {
  display: inline-block;
  width: 320rpx;
  height: 200rpx;
  border-radius: 20rpx;
  overflow: hidden;
  margin-right: 20rpx;
  position: relative;
  flex-shrink: 0;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }
}

.external-card__cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $primary, $secondary);
}

.external-card__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20rpx;
}

.external-card__category {
  display: inline-block;
  padding: 4rpx 12rpx;
  background: rgba(255, 107, 53, 0.9);
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
  width: fit-content;
  margin-bottom: 8rpx;
}

.external-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.external-card__btn {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: $primary;
  font-weight: 600;
  width: fit-content;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

/* 课程卡片 */
.course-card {
  background: $glass-bg;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUpFade 0.6s ease-out both;
  display: flex;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 12rpx 40rpx rgba(255, 107, 53, 0.12);
  }
}

.course-card__cover {
  position: relative;
  width: 240rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.course-card__img {
  width: 100%;
  height: 100%;
}

.course-card__level {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 12rpx;
  background: rgba(255, 107, 53, 0.9);
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.course-card__duration {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  padding: 4rpx 10rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6rpx;
  font-size: 18rpx;
  color: #fff;
}

.course-card__body {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.course-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.course-card__instructor {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.instructor-avatar {
  width: 40rpx;
  height: 40rpx;
  background: $orange-gradient;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.instructor-name {
  font-size: 22rpx;
  color: $text-secondary;
}

.course-card__meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 8rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-item--rating {
  .star-icon {
    font-size: 22rpx;
  }
  .rating-value {
    font-size: 24rpx;
    font-weight: 600;
    color: #f59e0b;
  }
}

.meta-item--student {
  .student-icon {
    font-size: 22rpx;
  }
  .student-count {
    font-size: 22rpx;
    color: $text-muted;
  }
}

.course-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: $primary;
}

.price-current {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
}

.price-current--free {
  color: $secondary;
  font-size: 32rpx;
}

.price-original {
  font-size: 22rpx;
  color: $text-muted;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.add-btn {
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

  .icon-text {
    font-size: 32rpx;
    font-weight: 500;
    color: #fff;
  }
}

/* 骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
}

.skeleton-cover {
  width: 240rpx;
  height: 200rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-title {
  height: 32rpx;
  width: 80%;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-sub {
  height: 24rpx;
  width: 50%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  height: 36rpx;
  width: 40%;
  margin-top: auto;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: $text-muted;
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 20rpx 48rpx;
  background: $orange-gradient;
  border-radius: 30rpx;

  text {
    font-size: 26rpx;
    font-weight: 600;
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

/* ========== 购物车相关样式（保留原有） ========== */
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
  width: 48rpx; height: 48rpx;
  color: #fff;
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
}

.cart-float__total {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.cart-panel {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 200;
}

.cart-panel__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8rpx);
}

.cart-panel__sheet {
  position: fixed;
  left: 0; right: 0; bottom: 0;
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
  width: 80rpx; height: 8rpx;
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
  width: 48rpx; height: 48rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.cart-panel__scroll {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.cart-items {
  padding: 24rpx 32rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f8f8f8;

  &:last-child {
    border-bottom: none;
  }
}

.cart-item__cover {
  width: 140rpx; height: 140rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
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
}

.cart-item__controls {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.qty-btn {
  width: 52rpx; height: 52rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
    width: 120rpx; height: 120rpx;
    color: $text-muted;
    opacity: 0.3;
    margin-bottom: 24rpx;
  }

  &__text {
    font-size: 28rpx;
    color: $text-muted;
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
  }
}

.checkout-btn {
  background: $orange-gradient;
  padding: 28rpx 64rpx;
  border-radius: 44rpx;

  text {
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }
}

/* ========== 搜索弹窗 ========== */
.search-popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 300;
}

.search-popup__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.search-popup__content {
  position: fixed;
  left: 0; right: 0;
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
  width: 36rpx; height: 36rpx;
  color: $text-muted;
}

.search-popup__input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.search-popup__clear {
  width: 36rpx; height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;
}

.search-popup__cancel {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  padding: 12rpx 0;
  white-space: nowrap;
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
}

.search-section__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.search-section__clear {
  font-size: 24rpx;
  color: $text-muted;
  padding: 6rpx 12rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
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
}

.search-tag--hot {
  background: rgba(255, 107, 53, 0.08);
  color: $primary;
}

/* 搜索建议 */
.search-suggestions {
  padding: 0;
}

.search-suggestions__title {
  font-size: 24rpx;
  color: $text-muted;
  padding: 8rpx 0 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 8rpx;
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;

  &:active {
    background: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.suggestion-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  opacity: 0.5;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-category {
  font-size: 22rpx;
  color: $text-muted;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 16rpx;
}

.suggestion-badge {
  font-size: 18rpx;
  color: #fff;
  background: linear-gradient(135deg, $secondary, #36CFC9);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 16rpx;
  font-weight: 600;
}

.search-suggestion-item--external {
  background: rgba(78, 205, 196, 0.05);
  border-left: 4rpx solid $secondary;
}

/* 搜索结果覆盖层 */
.search-result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-light;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.search-result-scroll {
  flex: 1;
  overflow-y: auto;
}

.search-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.search-result-keyword {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.search-result-count {
  font-size: 24rpx;
  color: $text-muted;
}

.search-result-back {
  font-size: 28rpx;
  color: $primary;
  padding: 12rpx 24rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 24rpx;
  font-weight: 600;
}

.search-result-list {
  padding: 24rpx;
}

.search-result-item {
  display: flex;
  background: $glass-bg;
  backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.6);

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.result-item__cover {
  width: 200rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.result-item__info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.result-item__meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;
}

.result-item__instructor,
.result-item__category {
  font-size: 22rpx;
  color: $text-muted;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.result-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.result-item__price {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.result-item__price--free {
  color: $secondary;
  font-size: 30rpx;
}

.result-item__title-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.result-item__badge {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  background: linear-gradient(135deg, $secondary, #36CFC9);
  border-radius: 8rpx;
  font-size: 18rpx;
  font-weight: 600;
  color: #fff;
}

.result-item__btn {
  padding: 10rpx 24rpx;
  background: $orange-gradient;
  border-radius: 20rpx;

  text {
    font-size: 22rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 外部课程样式 */
.search-result-item--external {
  border-left: 6rpx solid $secondary;

  .result-item__btn {
    background: linear-gradient(135deg, $secondary, #36CFC9);
  }
}

/* 搜索结果空状态 */
.search-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.search-empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.4;
}

.search-empty-text {
  font-size: 28rpx;
  color: $text-muted;
  margin-bottom: 32rpx;
}

.search-empty-sub {
  font-size: 24rpx;
  color: $text-muted;
  margin-top: -16rpx;
  margin-bottom: 32rpx;
}

.search-empty-btn {
  padding: 20rpx 48rpx;
  background: $orange-gradient;
  border-radius: 30rpx;

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}

.search-empty__icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  opacity: 0.4;
}

.search-empty__sub {
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
}

.hot-icon {
  margin-right: 8rpx;
}

/* 文本图标 */
.icon-text {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--search { font-size: 36rpx; }
.icon-text--cart { font-size: 44rpx; }
.icon-text--add { font-size: 36rpx; font-weight: 500; }
.icon-text--close { font-size: 24rpx; }
.icon-text--arrow-up, .icon-text--arrow-down { font-size: 24rpx; }
.icon-text--minus { font-size: 32rpx; font-weight: 500; }
</style>
