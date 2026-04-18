<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-brand">
          <view class="brand-icon">
            <text class="icon-text">📚</text>
          </view>
          <text class="brand-name">选课中心</text>
        </view>
        <view class="nav-search" @tap="showSearchPopup = true">
          <view class="search-icon">
            <text class="icon-text icon-text--search">🔍</text>
          </view>
          <text class="search-text">搜索课程名称、讲师...</text>
        </view>
      </view>
    </view>

    <!-- 分类标签和内容区域 -->
    <view class="content-wrapper" :style="{ paddingTop: (statusBarHeight + navHeight) + 'px' }">
      <!-- 分类标签 -->
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
        v-for="cat in displayCategories"
        :key="cat.id"
        @tap="selectCategory(cat.name)"
      >
        <text>{{ cat.icon }} {{ cat.name }}</text>
      </view>
      <view
        class="category-tab"
        :class="{ 'category-tab--active': selectedCategory === '其他' }"
        @tap="selectCategory('其他')"
      >
        <text>📂 其他</text>
      </view>
      <!-- 全部课程按钮 -->
      <view class="category-tab category-tab--all" @tap="goAllCourses">
        <text>📋 全部课程</text>
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

      <!-- 精选课程 -->
      <view class="featured-section" v-if="featuredCourses.length > 0">
        <view class="featured-header">
          <view class="featured-title-wrap">
            <text class="featured-title">精选课程</text>
            <text class="featured-subtitle">优质内容推荐</text>
          </view>
        </view>
        <view class="featured-grid">
          <view
            class="featured-card"
            v-for="course in featuredCourses"
            :key="course._isExternal ? 'feat-ext-' + course.id : 'feat-' + course.id"
            @tap="goDetail(course)"
          >
            <view class="featured-card__cover">
              <image class="featured-card__img" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
              <view class="featured-card__badge">
                <text>{{ course._isExternal ? '外部' : '精选' }}</text>
              </view>
              <view class="featured-card__purchased-tag" v-if="isCoursePurchased(course.id)">
                <text>已购</text>
              </view>
              <view class="favorite-btn favorite-btn--featured" @tap.stop="toggleFavorite(course, course._isExternal)">
                <text>{{ isFavorited(course.id, course._isExternal) ? '❤️' : '🤍' }}</text>
              </view>
            </view>
            <view class="featured-card__info">
              <text class="featured-card__title">{{ course.title }}</text>
              <text class="featured-card__category">{{ course.category }}</text>
              <view class="featured-card__footer">
                <text class="featured-card__price" v-if="course.price > 0">¥{{ Number(course.price).toFixed(0) }}</text>
                <text class="featured-card__price featured-card__price--free" v-else>免费</text>
                <view class="featured-card__action" @tap.stop="handleBuy(course)">
                  <text>{{ isCoursePurchased(course.id) ? '查看' : '详情' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门课程 -->
      <view class="hot-section" v-if="hotCourses.length > 0">
        <view class="hot-header">
          <view class="hot-title-wrap">
            <text class="hot-title">热门课程</text>
            <text class="hot-subtitle">学员都在学</text>
          </view>
        </view>
        <view class="hot-grid">
          <view
            class="hot-item"
            v-for="course in hotCourses"
            :key="course._isExternal ? 'hot-ext-' + course.id : 'hot-' + course.id"
            @tap="goDetail(course)"
          >
            <view class="hot-item__cover">
              <image class="hot-item__img" :src="course.cover || getCategoryCover(course.category)" mode="aspectFill" />
              <view class="hot-item__purchased-tag" v-if="isCoursePurchased(course.id)">
                <text>已购</text>
              </view>
              <view class="favorite-btn favorite-btn--hot" @tap.stop="toggleFavorite(course, false)">
                <text>{{ isFavorited(course.id, false) ? '❤️' : '🤍' }}</text>
              </view>
            </view>
            <view class="hot-item__info">
              <text class="hot-item__title">{{ course.title }}</text>
              <text class="hot-item__category">{{ course.category }}</text>
              <view class="hot-item__footer">
                <text class="hot-item__price" v-if="course.price > 0">¥{{ Number(course.price).toFixed(0) }}</text>
                <text class="hot-item__price hot-item__price--free" v-else>免费</text>
                <view class="hot-item__btn" @tap.stop="handleBuy(course)">
                  <text>{{ isCoursePurchased(course.id) ? '查看' : (course.price > 0 ? '立即购买' : '查看') }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 骨架屏加载 -->
      <view class="skeleton-list" v-if="coursesLoading && featuredCourses.length === 0 && hotCourses.length === 0">
        <view class="skeleton-card" v-for="n in 8" :key="n">
          <view class="skeleton-cover"></view>
          <view class="skeleton-body">
            <view class="skeleton-title"></view>
            <view class="skeleton-sub"></view>
            <view class="skeleton-footer"></view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!coursesLoading && featuredCourses.length === 0 && hotCourses.length === 0">
        <view class="empty-icon">
          <text>📭</text>
        </view>
        <text class="empty-title">暂无相关课程</text>
        <text class="empty-desc" v-if="searchKeyword">未找到"{{ searchKeyword }}"相关课程</text>
        <text class="empty-desc" v-else-if="selectedCategory">该分类暂无课程</text>
        <text class="empty-desc" v-else>换个分类或关键词试试吧</text>
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
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
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

// 精选课程和热门课程（从后端加载）
const featuredCoursesData = ref([])
const hotCoursesData = ref([])
const featuredExternalCourses = ref([])
const hotExternalCourses = ref([])

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

// 显示的分类（只显示前6个）
const displayCategories = computed(() => {
  return categories.value.filter(cat => mainCategoryNames.includes(cat.name))
})

const selectedCategory = ref('')

// ========== 检查分类是否有对应课程 ==========
const hasExternalInCategory = computed(() => {
  if (selectedCategory.value === '') return true
  return externalCourses.value.some(c => c.category === selectedCategory.value)
})

const hasInternalInCategory = computed(() => {
  if (selectedCategory.value === '') return true
  return courseList.value.some(c => c.category === selectedCategory.value)
})

// ========== 筛选后的课程列表 ==========
const filteredCourses = computed(() => {
  if (selectedCategory.value === '') return courseList.value
  // "其他"分类：显示不在6个主要分类中的课程
  if (selectedCategory.value === '其他') {
    return courseList.value.filter(c => !mainCategoryNames.includes(c.category))
  }
  return courseList.value.filter(item => item.category === selectedCategory.value)
})

const filteredExternalCourses = computed(() => {
  if (selectedCategory.value === '') return externalCourses.value
  // "其他"分类：显示不在6个主要分类中的课程
  if (selectedCategory.value === '其他') {
    return externalCourses.value.filter(c => !mainCategoryNames.includes(c.category))
  }
  return externalCourses.value.filter(item => item.category === selectedCategory.value)
})

// ========== 精选课程 ==========
const featuredCourses = computed(() => {
  // 合并内部和外部精选课程
  const internalList = featuredCoursesData.value.map(c => ({ ...c, _isExternal: false }))
  const externalList = featuredExternalCourses.value.map(c => ({ ...c, _isExternal: true }))
  let list = [...internalList, ...externalList]

  // 如果没有筛选条件且是"全部"状态，返回全部课程（不限制数量）
  if (!selectedCategory.value && !searchKeyword.value) {
    return list
  }

  // 筛选模式下，使用全部课程
  const allCourses = [
    ...courseList.value.map(c => ({ ...c, _isExternal: false })),
    ...externalCourses.value.map(c => ({ ...c, _isExternal: true }))
  ]

  if (selectedCategory.value) {
    if (selectedCategory.value === '其他') {
      list = allCourses.filter(c => !mainCategoryNames.includes(c.category))
    } else {
      list = allCourses.filter(c => c.category === selectedCategory.value)
    }
  } else if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = allCourses.filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
  }

  return list
})

// ========== 热门课程 ==========
const hotCourses = computed(() => {
  // 合并内部和外部热门课程
  const internalList = hotCoursesData.value.map(c => ({ ...c, _isExternal: false }))
  const externalList = hotExternalCourses.value.map(c => ({ ...c, _isExternal: true }))
  let list = [...internalList, ...externalList]

  // 如果没有筛选条件且是"全部"状态，返回全部课程（不限制数量）
  if (!selectedCategory.value && !searchKeyword.value) {
    return list
  }

  // 筛选模式下，使用全部课程
  if (selectedCategory.value) {
    if (selectedCategory.value === '其他') {
      list = [
        ...courseList.value.filter(c => !mainCategoryNames.includes(c.category)).map(c => ({ ...c, _isExternal: false })),
        ...externalCourses.value.filter(c => !mainCategoryNames.includes(c.category)).map(c => ({ ...c, _isExternal: true }))
      ]
    } else {
      list = [
        ...courseList.value.filter(c => c.category === selectedCategory.value).map(c => ({ ...c, _isExternal: false })),
        ...externalCourses.value.filter(c => c.category === selectedCategory.value).map(c => ({ ...c, _isExternal: true }))
      ]
    }
  } else if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = [
      ...courseList.value
        .filter(item =>
          (item.title && item.title.toLowerCase().includes(kw)) ||
          (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
          (item.category && item.category.toLowerCase().includes(kw))
        )
        .map(c => ({ ...c, _isExternal: false })),
      ...externalCourses.value
        .filter(item => item.title && item.title.toLowerCase().includes(kw))
        .map(c => ({ ...c, _isExternal: true }))
    ]
  }

  return list
})

// ========== 选择分类 ==========
const selectCategory = (category) => {
  selectedCategory.value = category
  searchKeyword.value = '' // 选择分类时清空搜索
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
const searchKeyword = ref('')
const searchResultList = ref([])

const hotSearchKeywords = ['数字素养', '书法', '声乐', '心理健康', '医学']

const performSearch = (keyword) => {
  const kw = keyword.toLowerCase()

  const internalResults = courseList.value
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.instructor && item.instructor.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
    .map(item => ({ ...item, _isExternal: false }))

  const externalResults = externalCourses.value
    .filter(item =>
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    )
    .map(item => ({ ...item, _isExternal: true }))

  searchResultList.value = [...externalResults, ...internalResults]
}

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
  selectedCategory.value = '' // 搜索时清空分类

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
  selectedCategory.value = '' // 搜索时清空分类

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
  selectedCategory.value = '' // 搜索时清空分类
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

// ========== 加载分类 ==========
// 使用硬编码分类数据，与 list.vue 保持一致

// ========== 加载课程列表 ==========
const loadCourses = async (forceRefresh = false) => {
  if (coursesLoading.value) return
  coursesLoading.value = true

  try {
    const res = await getCourses()
    const list = res?.list || []
    courseList.value = list.map(item => ({
      ...item,
      id: item._id || item.id
    }))
    
    // 检查已购买状态
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
    const { checkInternalCoursePurchased } = await import('@/utils/course.js')
    const purchased = new Set()
    for (const course of courseList.value) {
      try {
        const res = await checkInternalCoursePurchased(course.id)
        if (res.ok && res.purchased) {
          purchased.add(course.id)
        }
      } catch (e) {
        console.error('检查购买状态失败:', e)
      }
    }
    purchasedCourseIds.value = purchased
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
const goDetail = (course) => {
  if (course._isExternal) {
    uni.navigateTo({ url: `/pages/external-course/detail?id=${course.id}` })
    return
  }
  uni.navigateTo({ url: `/pages/product/detail?id=${course.id}` })
}

// 处理购买/查看按钮点击
const handleBuy = (course) => {
  // 免费课程直接跳转
  if (course.price <= 0) {
    goDetail(course)
    return
  }
  // 付费课程跳转到详情页
  goDetail(course)
}

// 跳转到全部课程页面
const goAllCourses = () => {
  uni.navigateTo({ url: '/pages/course/all' })
}

const onScrollToLower = () => {}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourses()
  loadExternalCourses()
  loadFeaturedCourses()
  loadHotCourses()
  loadExternalFeaturedCourses()
  loadExternalHotCourses()
  loadSearchHistory()
})

onShow(() => {
  loadCourses(true)
  loadExternalCourses()
  loadFeaturedCourses()
  loadHotCourses()
  loadExternalFeaturedCourses()
  loadExternalHotCourses()
  loadFavorites()
})

// 加载精选课程
const loadFeaturedCourses = async () => {
  try {
    const res = await request.get('/api/courses/featured/list')
    if (res?.list) {
      featuredCoursesData.value = res.list
    }
  } catch (e) {
    console.error('加载精选课程失败:', e)
  }
}

// 加载热门课程
const loadHotCourses = async () => {
  try {
    const res = await request.get('/api/courses/hot/list')
    if (res?.list) {
      hotCoursesData.value = res.list
    }
  } catch (e) {
    console.error('加载热门课程失败:', e)
  }
}

// 加载外部精选课程
const loadExternalFeaturedCourses = async () => {
  try {
    const res = await request.get('/api/external-courses/featured/list')
    if (res?.list) {
      featuredExternalCourses.value = res.list
    }
  } catch (e) {
    console.error('加载外部精选课程失败:', e)
  }
}

// 加载外部热门课程
const loadExternalHotCourses = async () => {
  try {
    const res = await request.get('/api/external-courses/hot/list')
    if (res?.list) {
      hotExternalCourses.value = res.list
    }
  } catch (e) {
    console.error('加载外部热门课程失败:', e)
  }
}
</script>

<style lang="scss" scoped>
// ========== 设计规范 - 专业课程平台风格 ==========
$primary: #2563EB;
$primary-light: #3B82F6;
$primary-dark: #1D4ED8;
$secondary: #10B981;
$accent: #F59E0B;
$orange-gradient: linear-gradient(135deg, $primary 0%, $primary-light 50%, #60A5FA 100%);
$gold-gradient: linear-gradient(135deg, $accent 0%, #FBBF24 100%);
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

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.brand-icon {
  width: 56rpx;
  height: 56rpx;
  background: $primary;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-text {
    font-size: 28rpx;
  }
}

.brand-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.nav-search {
  flex: 1;
  height: 72rpx;
  background: #F1F5F9;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;
}

.search-icon {
  color: $text-muted;
}

.search-text {
  font-size: 26rpx;
  color: $text-muted;
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

/* ========== 分类标签 ========== */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 28rpx;
  padding-top: 35rpx;
  animation: slideUpFade 0.4s ease-out;
}

.category-tab {
  padding: 12rpx 24rpx;
  background: #fff;
  border: 1rpx solid #E2E8F0;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #334155;
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

  &--all {
    background: linear-gradient(135deg, $secondary, #36CFC9);
    color: #fff;
    border-color: transparent;
    font-weight: 600;

    &:active {
      opacity: 0.85;
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

/* ========== 精选课程区块 ========== */
.featured-section {
  padding: 24rpx 24rpx 0;
}

.featured-header {
  margin-bottom: 20rpx;
}

.featured-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.featured-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.featured-subtitle {
  font-size: 24rpx;
  color: $text-muted;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.featured-card {
  background: $bg-card;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.featured-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
}

.featured-card__img {
  width: 100%;
  height: 100%;
}

.featured-card__badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 14rpx;
  background: $accent;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.featured-card__purchased-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 14rpx;
  background: #10B981;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.favorite-btn {
  position: absolute;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
  font-size: 32rpx;
  z-index: 10;

  &--featured {
    bottom: 16rpx;
    right: 16rpx;
  }

  &--hot {
    bottom: 80rpx;
    right: 16rpx;
  }

  &:active {
    transform: scale(0.9);
  }
}

.featured-card__info {
  padding: 20rpx;
}

.featured-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.featured-card__category {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 12rpx;
}

.featured-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.featured-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.featured-card__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.featured-card__action {
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
}

.featured-card__action--view {
  background: $secondary;

  &:active {
    background: darken($secondary, 10%);
  }
}

/* ========== 热门课程区块 ========== */
.hot-section {
  padding: 32rpx 24rpx 0;
}

.hot-header {
  margin-bottom: 20rpx;
}

.hot-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.hot-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.hot-subtitle {
  font-size: 24rpx;
  color: $text-muted;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.hot-item {
  background: $bg-card;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.hot-item__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
}

.hot-item__img {
  width: 100%;
  height: 100%;
}

.hot-item__purchased-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 14rpx;
  background: #10B981;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #fff;
}

.hot-item__info {
  padding: 20rpx;
}

.hot-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.hot-item__category {
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 12rpx;
}

.hot-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hot-item__price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.hot-item__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.hot-item__btn {
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
}

.hot-item__btn--view {
  background: $secondary;

  &:active {
    background: darken($secondary, 10%);
  }
}

/* ========== 骨架屏 ========== */
.skeleton-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 24rpx;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  overflow: hidden;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-title {
  height: 28rpx;
  width: 85%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-sub {
  height: 22rpx;
  width: 50%;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  height: 32rpx;
  width: 40%;
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
.icon-text--add { font-size: 32rpx; font-weight: 500; }
.icon-text--close { font-size: 20rpx; }
.icon-text--minus { font-size: 28rpx; font-weight: 500; }
</style>
