<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <view class="nav-brand">
          <view class="brand-icon">
            <text class="icon-text">📚</text>
          </view>
          <text class="brand-name">全部课程</text>
        </view>
        <view class="nav-search" @tap="showSearchPopup = true">
          <view class="search-icon">
            <text class="icon-text icon-text--search">🔍</text>
          </view>
          <text class="search-text">搜索课程...</text>
        </view>
      </view>
    </view>

    <!-- 分类图标网格和内容区域 -->
    <view class="content-wrapper" :style="{ paddingTop: (statusBarHeight + navHeight) + 'px' }">
      <!-- 分类图标网格 -->
      <view class="category-grid-wrapper">
        <view class="category-grid">
          <view
            class="category-icon-item"
            :class="{ 'category-icon-item--active': selectedCategory === '' }"
            @tap="selectCategory('')"
          >
            <view class="category-icon-item__circle category-icon-item__circle--all-category">
              <text class="category-icon-item__icon">🌐</text>
            </view>
            <text class="category-icon-item__name">全部</text>
          </view>
          <view
            class="category-icon-item"
            :class="{ 'category-icon-item--active': selectedCategory === cat.name }"
            v-for="cat in displayCategories"
            :key="cat.id"
            @tap="selectCategory(cat.name)"
          >
            <view class="category-icon-item__circle" :style="{ background: 'linear-gradient(135deg, ' + cat.color + ' 0%, ' + adjustColor(cat.color, 20) + ' 100%)', borderColor: cat.color + '60' }">
              <text class="category-icon-item__icon">{{ cat.icon }}</text>
            </view>
            <text class="category-icon-item__name">{{ cat.name }}</text>
          </view>
          <view
            class="category-icon-item"
            :class="{ 'category-icon-item--active': selectedCategory === '其他' }"
            @tap="selectCategory('其他')"
          >
            <view class="category-icon-item__circle category-icon-item__circle--other">
              <text class="category-icon-item__icon">📂</text>
            </view>
            <text class="category-icon-item__name">其他</text>
          </view>
        </view>
      </view>

      <scroll-view class="scroll" scroll-y @scrolltolower="onScrollToLower">
        <!-- 筛选状态提示 -->
        <view class="filter-status" v-if="searchKeyword || selectedCategory">
          <view class="filter-status__info">
            <text class="filter-status__icon" v-if="searchKeyword">🔍</text>
            <text class="filter-status__icon" v-else>📂</text>
            <text class="filter-status__text" v-if="searchKeyword">搜索: {{ searchKeyword }}</text>
            <text class="filter-status__text" v-else>分类: {{ selectedCategory }}</text>
          </view>
          <view class="filter-status__clear" @tap="clearFilter">
            <text>清除筛选</text>
          </view>
        </view>

        <!-- 课程列表 -->
        <view class="course-list" v-if="filteredCourses.length > 0">
          <view
            class="course-card"
            v-for="course in filteredCourses"
            :key="course._isExternal ? 'ext-' + course.id : course.id"
          >
            <view class="course-card__cover-wrap" @tap="goDetail(course)">
              <image class="course-card__cover" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
              <view class="course-card__badge" v-if="course._isExternal">外部</view>
              <view class="course-card__purchased-tag" v-if="isCoursePurchased(course.id)">
                <text>已购</text>
              </view>
            </view>
            <view class="course-card__content">
              <view class="course-card__title" @tap="goDetail(course)">{{ course.title }}</view>
              <view class="course-card__meta">
                <text class="meta-tag" v-if="course.category">{{ course.category }}</text>
                <text class="meta-tag meta-tag--external" v-if="course._isExternal">外部课程</text>
              </view>
              <view class="course-card__footer">
                <view class="course-card__price" v-if="course.price > 0">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ Number(course.price).toFixed(0) }}</text>
                </view>
                <view class="course-card__price course-card__price--free" v-else>免费</view>
                <view class="course-card__action" :class="{ 'course-card__action--view': isCoursePurchased(course.id) }" @tap="handleBuy(course)">
                  <text>{{ isCoursePurchased(course.id) ? '查看' : (course.price > 0 ? '购买' : '查看') }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 骨架屏加载 -->
        <view class="skeleton-list" v-if="coursesLoading && filteredCourses.length === 0">
          <view class="skeleton-card" v-for="n in 6" :key="n">
            <view class="skeleton-cover"></view>
            <view class="skeleton-body">
              <view class="skeleton-title"></view>
              <view class="skeleton-sub"></view>
              <view class="skeleton-footer"></view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!coursesLoading && filteredCourses.length === 0">
          <view class="empty-icon">
            <text>📭</text>
          </view>
          <text class="empty-title">暂无相关课程</text>
          <text class="empty-desc" v-if="searchKeyword">未找到"{{ searchKeyword }}"相关课程</text>
          <text class="empty-desc" v-else-if="selectedCategory">该分类暂无课程</text>
          <text class="empty-desc" v-else>暂无课程</text>
          <view class="empty-action" v-if="searchKeyword || selectedCategory" @tap="clearFilter">
            <text>清除筛选</text>
          </view>
        </view>

        <view class="bottom-spacer" />
      </scroll-view>
    </view>

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
          <!-- 搜索结果建议 -->
          <view class="search-suggestions" v-if="searchInput && searchSuggestions.length > 0">
            <view class="search-suggestions__title">搜索建议</view>
            <view
              class="search-suggestion-item"
              v-for="item in searchSuggestions"
              :key="item._isExternal ? 'ext-' + item.id : item.id"
              @tap="searchBySuggestion(item)"
            >
              <text class="suggestion-icon">{{ item._isExternal ? '🌐' : '🔍' }}</text>
              <text class="suggestion-text">{{ item.title }}</text>
              <text class="suggestion-badge" v-if="item._isExternal">外部</text>
            </view>
          </view>

          <!-- 搜索历史 -->
          <view class="search-section" v-if="!searchInput && searchHistory.length > 0">
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
        </scroll-view>
      </view>
    </view>

    <!-- 购买确认弹窗 -->
    <view class="buy-modal" v-if="showBuyModal" @tap="closeBuyConfirm">
      <view class="buy-modal__content" @tap.stop>
        <view class="buy-modal__header">
          <text class="buy-modal__title">确认购买</text>
          <text class="buy-modal__close" @tap="closeBuyConfirm">✕</text>
        </view>
        <view class="buy-modal__body" v-if="buyConfirmCourse">
          <view class="buy-modal__course">
            <image class="buy-modal__cover" :src="buyConfirmCourse.cover || getCategoryCover(buyConfirmCourse.category)" mode="aspectFill" />
            <view class="buy-modal__info">
              <text class="buy-modal__name">{{ buyConfirmCourse.title }}</text>
              <text class="buy-modal__category">{{ buyConfirmCourse.category }}</text>
            </view>
          </view>
          <view class="buy-modal__price-row">
            <text class="buy-modal__price-label">支付金额</text>
            <text class="buy-modal__price">¥{{ Number(buyConfirmCourse.price).toFixed(2) }}</text>
          </view>
          <view class="buy-modal__notice">
            <text class="buy-modal__notice-icon">💡</text>
            <text class="buy-modal__notice-text">购买后即可学习全部课程内容</text>
          </view>
        </view>
        <view class="buy-modal__actions">
          <view class="buy-modal__btn buy-modal__btn--cancel" @tap="closeBuyConfirm">
            <text>取消</text>
          </view>
          <view class="buy-modal__btn buy-modal__btn--confirm" @tap="confirmBuy">
            <text>确认购买</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCourses } from '@/utils/course.js'
import { getExternalCourses } from '@/utils/external-course.js'
import { getFavorites, addFavorite, removeFavoriteByCourse } from '@/utils/favorite.js'
import { getCurrentUser } from '@/utils/user.js'
import request from '@/utils/request.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 已购买的课程ID集合 ==========
const purchasedCourseIds = ref(new Set())

// ========== 购买确认弹窗 ==========
const showBuyModal = ref(false)
const buyConfirmCourse = ref(null)

// ========== 外部课程数据 ==========
const externalCourses = ref([])

// ========== 加载外部课程 ==========
const loadExternalCourses = async () => {
  try {
    const res = await getExternalCourses()
    if (res?.list) {
      externalCourses.value = res.list
    }
  } catch (error) {
    console.error('加载外部课程失败:', error)
  }
}

// ========== 分类默认封面图 ==========
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

const getCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || 'https://picsum.photos/400/300'
}

// ========== 课程列表数据 ==========
const courseList = ref([])
const coursesLoading = ref(false)

// ========== 分类数据 ==========
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

// 6个主要分类
const mainCategoryNames = ['公民素养', '时代前沿', '时事思政', '隔代教育', '哲学', '文学']

// 调整颜色亮度
const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

// 显示的分类（只显示前6个）
const displayCategories = computed(() => {
  return categories.value.filter(cat => mainCategoryNames.includes(cat.name))
})

const selectedCategory = ref('')
const searchKeyword = ref('')

// ========== 筛选后的课程列表 ==========
const filteredCourses = computed(() => {
  let allCourses = []

  // 合并内部课程和外部课程
  const internalCourses = courseList.value.map(c => ({ ...c, _isExternal: false }))
  const externalCoursesList = externalCourses.value.map(c => ({ ...c, _isExternal: true }))
  allCourses = [...internalCourses, ...externalCoursesList]

  // 分类筛选
  if (selectedCategory.value && selectedCategory.value !== '') {
    if (selectedCategory.value === '其他') {
      allCourses = allCourses.filter(c => !mainCategoryNames.includes(c.category))
    } else {
      allCourses = allCourses.filter(c => c.category === selectedCategory.value)
    }
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    allCourses = allCourses.filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
  }

  return allCourses
})

// ========== 选择分类 ==========
const selectCategory = (category) => {
  selectedCategory.value = category
  searchKeyword.value = ''
}

// ========== 清除筛选 ==========
const clearFilter = () => {
  selectedCategory.value = ''
  searchKeyword.value = ''
}

// ========== 搜索功能 ==========
const searchInput = ref('')
const searchSuggestions = ref([])
const searchHistory = ref([])
const showSearchPopup = ref(false)

const hotSearchKeywords = ['数字素养', '书法', '声乐', '心理健康', '医学']

const onSearchInput = () => {
  const kw = searchInput.value.trim().toLowerCase()
  if (!kw) {
    searchSuggestions.value = []
    return
  }

  const internalSuggestions = courseList.value
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw))
    )
    .slice(0, 5)
    .map(item => ({ ...item, _isExternal: false }))

  const externalSuggestions = externalCourses.value
    .filter(item => (item.title && item.title.toLowerCase().includes(kw)))
    .slice(0, 3)
    .map(item => ({ ...item, _isExternal: true }))

  searchSuggestions.value = [...externalSuggestions, ...internalSuggestions].slice(0, 8)
}

const doSearch = () => {
  const keyword = searchInput.value.trim()
  if (!keyword) return

  searchKeyword.value = keyword
  selectedCategory.value = ''

  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  showSearchPopup.value = false
  searchInput.value = ''
  searchSuggestions.value = []
}

const searchBySuggestion = (item) => {
  searchKeyword.value = item.title
  selectedCategory.value = ''

  const history = searchHistory.value.filter(k => k !== item.title)
  history.unshift(item.title)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)

  showSearchPopup.value = false
  searchInput.value = ''
  searchSuggestions.value = []
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
  selectedCategory.value = ''
  searchInput.value = ''
  showSearchPopup.value = false

  const history = searchHistory.value.filter(k => k !== keyword)
  history.unshift(keyword)
  searchHistory.value = history.slice(0, 10)
  uni.setStorageSync('search_history', searchHistory.value)
}

const loadSearchHistory = () => {
  const history = uni.getStorageSync('search_history') || []
  searchHistory.value = history
}

// ========== 加载课程列表 ==========
const loadCourses = async () => {
  if (coursesLoading.value) return
  coursesLoading.value = true

  try {
    const res = await getCourses()
    const list = res?.list || []
    courseList.value = list.map(item => ({
      ...item,
      id: item._id || item.id
    }))

    await checkPurchasedCourses()
  } catch (e) {
    console.error('加载课程失败:', e)
  } finally {
    coursesLoading.value = false
  }
}

// ========== 检查已购买的课程 ==========
const checkPurchasedCourses = async () => {
  const userId = getCurrentUser()?.id
  if (!userId) return

  try {
    const res = await request.get('/api/course-orders/purchased-ids')
    if (res.ok && res.purchased_ids) {
      purchasedCourseIds.value = new Set(res.purchased_ids)
    }
  } catch (e) {
    console.error('检查已购买课程失败:', e)
  }
}

// ========== 判断课程是否已购买 ==========
const isCoursePurchased = (courseId) => {
  return purchasedCourseIds.value.has(courseId)
}

// ========== 收藏功能 ==========
const favoriteMap = ref({})

const loadFavorites = async () => {
  const user = getCurrentUser()
  if (!user?.id) return

  const res = await getFavorites(user.id)
  if (res.ok) {
    const map = {}
    res.list.forEach(item => {
      map[`${item.course_id}_${item.is_external}`] = item.id
    })
    favoriteMap.value = map
  }
}

const isFavorited = (courseId, isExternal = false) => {
  return !!favoriteMap.value[`${courseId}_${isExternal}`]
}

const toggleFavorite = async (course, isExternal = false) => {
  const user = getCurrentUser()
  if (!user?.id) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const key = `${course.id}_${isExternal}`
  if (favoriteMap.value[key]) {
    const res = await removeFavoriteByCourse(user.id, course.id, isExternal)
    if (res.ok) {
      delete favoriteMap.value[key]
      favoriteMap.value = { ...favoriteMap.value }
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    }
  } else {
    const res = await addFavorite(user.id, course.id, isExternal)
    if (res.ok) {
      favoriteMap.value[key] = res.id
      favoriteMap.value = { ...favoriteMap.value }
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  }
}

// ========== 交互方法 ==========
// 处理购买/查看按钮点击
const handleBuy = (course) => {
  // 免费课程直接跳转
  if (course.price <= 0) {
    goDetail(course)
    return
  }

  // 已购买课程直接跳转
  if (isCoursePurchased(course.id)) {
    goDetail(course)
    return
  }

  // 未购买课程，显示购买确认弹窗
  showBuyConfirm(course)
}

// 显示购买确认弹窗
const showBuyConfirm = (course) => {
  buyConfirmCourse.value = course
  showBuyModal.value = true
}

// 关闭购买确认弹窗
const closeBuyConfirm = () => {
  showBuyModal.value = false
  buyConfirmCourse.value = null
}

// 确认购买（调用后端API）
const confirmBuy = async () => {
  const course = buyConfirmCourse.value
  if (!course) return

  const userId = getCurrentUser()?.id
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/auth/login' }), 1000)
    return
  }

  try {
    uni.showLoading({ title: '购买中...' })

    // 调用后端API
    let res
    if (course._isExternal) {
      res = await request.post('/api/course-orders/simulate', { course_id: course.id })
    } else {
      res = await request.post('/api/course-orders/simulate-internal', { course_id: course.id })
    }

    uni.hideLoading()

    if (res.ok) {
      // 添加到已购买列表
      purchasedCourseIds.value.add(course.id)
      uni.showToast({ title: '购买成功', icon: 'success' })
      // 关闭弹窗并跳转详情
      closeBuyConfirm()
      goDetail(course)
    } else {
      uni.showToast({ title: res.detail || '购买失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    console.error('购买失败:', e)
    uni.showToast({ title: '购买失败', icon: 'none' })
  }
}

// 进入课程详情（检查购买状态）
const goDetail = (course) => {
  // 免费课程直接跳转
  if (course.price <= 0) {
    if (course._isExternal) {
      uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
    } else {
      uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
    }
    return
  }

  // 已购买课程直接跳转
  if (isCoursePurchased(course.id)) {
    if (course._isExternal) {
      uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
    } else {
      uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
    }
    return
  }

  // 未购买课程，显示购买确认
  showBuyConfirm(course)
}

// ========== 交互方法 ==========
const goBack = () => {
  uni.navigateBack()
}

const onScrollToLower = () => {}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourses()
  loadExternalCourses()
  loadSearchHistory()
  loadFavorites()
  checkPurchasedCourses()
})
</script>

<style lang="scss" scoped>
$primary: #2563EB;
$primary-light: #3B82F6;
$primary-dark: #1D4ED8;
$secondary: #10B981;
$accent: #F59E0B;
$text-primary: #0F172A;
$text-secondary: #334155;
$text-muted: #94A3B8;
$bg-light: #F8FAFC;
$bg-card: #FFFFFF;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes slideDownFade {
  from { opacity: 0; transform: translateY(-20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* ========== 导航栏 ========== */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  z-index: 100;
  border-bottom: 1rpx solid #E2E8F0;
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);

  &:active {
    background: rgba(37, 99, 235, 0.1);
    transform: scale(0.9);
  }
}

.back-arrow {
  font-size: 48rpx;
  font-weight: 300;
  color: $text-primary;
  line-height: 1;
}

.nav-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.nav-search {
  flex: 1;
  height: 72rpx;
  background: linear-gradient(135deg, rgba(74, 111, 165, 0.05), rgba(74, 111, 165, 0.02));
  border: 1px solid rgba(74, 111, 165, 0.1);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;

  &:active {
    border-color: #4A6FA5;
  }
}

/* ========== 内容区域 ========== */
.content-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 98;
  overflow-y: auto;
  background: $bg-light;
}

/* ========== 分类图标网格 - 圆形图标风格 ========== */
.category-grid-wrapper {
  background: #FFFFFF;
  border: 1px solid rgba(139, 115, 85, 0.15);
  border-left: none;
  border-right: none;
  border-top: none;
  margin: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 115, 85, 0.08);
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 8rpx 0;
}

.category-icon-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;

  &__circle {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    border-width: 3rpx;
    border-style: solid;

    &--all-category {
      background: linear-gradient(135deg, #4A90D9 0%, #6B8BB8 100%);
      border-color: rgba(74, 144, 217, 0.4);
    }

    &--other {
      background: linear-gradient(135deg, #8B7355 0%, #A08060 100%);
      border-color: rgba(139, 115, 85, 0.4);
    }
  }

  &__icon {
    font-size: 44rpx;
    filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.15));
  }

  &__name {
    font-size: 22rpx;
    color: #5D6D7E;
    text-align: center;
    max-width: 120rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--active {
    .category-icon-item__circle {
      transform: scale(1.1);
      box-shadow: 0 6rpx 20rpx rgba(74, 111, 165, 0.25);
    }

    .category-icon-item__name {
      color: #4A6FA5;
      font-weight: 600;
    }
  }

  &:active {
    .category-icon-item__circle {
      transform: scale(0.95);
    }
  }
}

/* ========== 滚动区域 ========== */
.scroll {
  padding: 24rpx;
}

/* ========== 筛选状态提示 ========== */
.filter-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.05));
  border: 1rpx solid rgba(37, 99, 235, 0.15);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  animation: slideUpFade 0.3s ease-out;

  &__info {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__icon {
    font-size: 28rpx;
  }

  &__text {
    font-size: 26rpx;
    color: $primary;
    font-weight: 500;
  }

  &__clear {
    padding: 10rpx 20rpx;
    background: $primary;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;

    &:active {
      opacity: 0.8;
    }
  }
}

/* ========== 课程列表 ========== */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: $bg-card;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  animation: slideUpFade 0.4s ease-out;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

.course-card__cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.course-card__cover-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.course-card__badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 10rpx;
  background: $secondary;
  border-radius: 8rpx;
  font-size: 18rpx;
  color: #fff;
  font-weight: 600;
}

.course-card__purchased-tag {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  padding: 4rpx 10rpx;
  background: rgba(245, 158, 11, 0.9);
  border-radius: 8rpx;
  font-size: 18rpx;
  color: #fff;
  font-weight: 600;
}

.course-card__content {
  flex: 1;
  min-width: 0;
}

.course-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
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
  background: rgba(37, 99, 235, 0.1);
  border-radius: 6rpx;
  font-size: 22rpx;
  color: $primary;

  &--external {
    background: rgba(16, 185, 129, 0.1);
    color: $secondary;
  }

  &--purchased {
    background: rgba(245, 158, 11, 0.1);
    color: $accent;
  }
}

.course-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.course-card__price {
  display: flex;
  align-items: baseline;

  .price-symbol {
    font-size: 24rpx;
    color: $primary;
    font-weight: 600;
    margin-right: 2rpx;
  }

  .price-value {
    font-size: 32rpx;
    color: $primary;
    font-weight: 700;
  }

  &--free {
    font-size: 32rpx;
    color: $secondary;
    font-weight: 700;
  }
}

.course-card__action {
  padding: 10rpx 24rpx;
  background: $primary;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;

  text {
    color: #fff;
  }

  &:active {
    background: $primary-dark;
  }

  &--view {
    background: $secondary;

    &:active {
      background: darken($secondary, 10%);
    }
  }
}

.course-card__arrow {
  font-size: 40rpx;
  color: $text-muted;
  margin-left: 16rpx;
}

/* ========== 骨架屏 ========== */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-card {
  display: flex;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
}

.skeleton-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  justify-content: center;
}

.skeleton-title {
  height: 30rpx;
  width: 70%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-sub {
  height: 22rpx;
  width: 40%;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  height: 32rpx;
  width: 30%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* ========== 空状态 ========== */
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

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-muted;
}

.empty-action {
  margin-top: 32rpx;
  padding: 16rpx 40rpx;
  background: $primary;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;

  &:active {
    opacity: 0.8;
  }
}

.bottom-spacer {
  height: 200rpx;
}

/* ========== 搜索弹窗 ========== */
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
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.search-popup__content {
  position: fixed;
  left: 0;
  right: 0;
  background: #fff;
  animation: slideDownFade 0.3s ease-out;
  overflow: hidden;
  z-index: 200;
}

.search-popup__header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #F1F5F9;
}

.search-popup__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 80rpx;
  background: #F1F5F9;
  border-radius: 40rpx;
  padding: 0 16rpx 0 24rpx;
  gap: 12rpx;
}

.search-popup__icon {
  color: $text-muted;
}

.search-popup__input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.search-popup__clear {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E2E8F0;
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
  background: #F1F5F9;
  border-radius: 16rpx;
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.search-tag {
  padding: 12rpx 28rpx;
  background: #F1F5F9;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
}

.search-tag--hot {
  background: rgba(37, 99, 235, 0.08);
  color: $primary;
}

.hot-icon {
  margin-right: 8rpx;
}

.search-suggestions {
  padding: 0;
}

.search-suggestions__title {
  font-size: 24rpx;
  color: $text-muted;
  padding: 8rpx 0 16rpx;
  border-bottom: 1rpx solid #F1F5F9;
  margin-bottom: 8rpx;
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F8FAFC;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FAFAFA;
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

.suggestion-badge {
  font-size: 18rpx;
  color: #fff;
  background: $secondary;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 16rpx;
  font-weight: 600;
}

/* ========== 图标文本 ========== */
.icon-text {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--search { font-size: 32rpx; }
.icon-text--close { font-size: 20rpx; }

/* ========== 购买确认弹窗 ========== */
.buy-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buy-modal__content {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.buy-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(139, 115, 85, 0.1);
}

.buy-modal__title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2C3E50;
}

.buy-modal__close {
  width: 56rpx;
  height: 56rpx;
  background: rgba(139, 115, 85, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #95A5A6;
}

.buy-modal__body {
  padding: 32rpx;
}

.buy-modal__course {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(74, 111, 165, 0.05), rgba(74, 111, 165, 0.02));
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.buy-modal__cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.buy-modal__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.buy-modal__name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3E50;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.buy-modal__category {
  font-size: 22rpx;
  color: #95A5A6;
}

.buy-modal__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-top: 1px dashed rgba(139, 115, 85, 0.1);
  border-bottom: 1px dashed rgba(139, 115, 85, 0.1);
  margin-bottom: 24rpx;
}

.buy-modal__price-label {
  font-size: 28rpx;
  color: #5D6D7E;
}

.buy-modal__price {
  font-size: 44rpx;
  font-weight: 700;
  color: #D4915C;
}

.buy-modal__notice {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: rgba(74, 111, 165, 0.08);
  border-radius: 12rpx;
}

.buy-modal__notice-icon {
  font-size: 28rpx;
}

.buy-modal__notice-text {
  font-size: 24rpx;
  color: #4A6FA5;
}

.buy-modal__actions {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx 32rpx;
}

.buy-modal__btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;

  &--cancel {
    background: linear-gradient(135deg, rgba(74, 111, 165, 0.05), rgba(74, 111, 165, 0.02));
    border: 1px solid rgba(139, 115, 85, 0.15);
    color: #5D6D7E;
  }

  &--confirm {
    background: linear-gradient(135deg, #D4915C 0%, #C4785C 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(212, 145, 92, 0.35);
  }
}
</style>
