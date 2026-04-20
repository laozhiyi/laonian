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

    <!-- 分类和课程内容区域 -->
    <scroll-view class="scroll-area" scroll-y @scrolltolower="onScrollToLower">
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
          <view
            class="category-icon-item"
            @tap="goAllCourses"
          >
            <view class="category-icon-item__circle category-icon-item__circle--all-course">
              <text class="category-icon-item__icon">📋</text>
            </view>
            <text class="category-icon-item__name">全部课程</text>
          </view>
        </view>
      </view>

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

// 精选课程和热门课程（从后端加载）
const featuredCoursesData = ref([])
const hotCoursesData = ref([])
const featuredExternalCourses = ref([])
const hotExternalCourses = ref([])

// ========== 分类数据 ==========
const categories = ref([
  { id: 1, name: '书法绘画', icon: '🖌️', color: '#FF6B35' },
  { id: 2, name: '音乐类', icon: '🎵', color: '#4ECDC4' },
  { id: 3, name: '文史语言', icon: '📖', color: '#A855F7' },
  { id: 4, name: '科普综合', icon: '🔬', color: '#3B82F6' },
  { id: 5, name: '体育舞蹈', icon: '💃', color: '#10B981' },
  { id: 6, name: '民俗文化', icon: '🏺', color: '#F59E0B' },
  { id: 7, name: '养生健康', icon: '🌿', color: '#EF4444' },
  { id: 8, name: '公民素养', icon: '🏛️', color: '#4A90D9' },
  { id: 9, name: '时代前沿', icon: '🚀', color: '#7B68EE' },
  { id: 10, name: '时事思政', icon: '📰', color: '#DC143C' },
  { id: 11, name: '隔代教育', icon: '👨‍👩‍👧', color: '#FF69B4' },
  { id: 12, name: '哲学', icon: '🧠', color: '#4169E1' },
  { id: 13, name: '文学', icon: '📚', color: '#8B4513' },
  { id: 14, name: '数字素养', icon: '💻', color: '#2E8B57' },
  { id: 15, name: '摄影', icon: '📷', color: '#FF6347' },
  { id: 16, name: '表演', icon: '🎭', color: '#9370DB' },
  { id: 17, name: '社会科学', icon: '🔬', color: '#20B2AA' },
  { id: 18, name: '自然科学', icon: '🌍', color: '#3CB371' },
  { id: 19, name: '农学', icon: '🌾', color: '#DAA520' },
  { id: 20, name: '语言', icon: '🗣️', color: '#FF8C00' },
  { id: 21, name: '数学', icon: '📐', color: '#4682B4' },
  { id: 22, name: '学历教育', icon: '🎓', color: '#8B0000' },
  { id: 23, name: '论文写作', icon: '✍️', color: '#556B2F' },
  { id: 24, name: '医学', icon: '🏥', color: '#B22222' },
  { id: 25, name: '家庭照护', icon: '🏠', color: '#FF7F50' },
  { id: 26, name: '中医保健', icon: '🌿', color: '#228B22' },
  { id: 27, name: '用药安全', icon: '💊', color: '#CD5C5C' },
  { id: 28, name: '食品营养', icon: '🍎', color: '#32CD32' },
  { id: 29, name: '心理健康', icon: '💚', color: '#6B8E23' },
  { id: 30, name: '运动健康', icon: '🏃', color: '#FF4500' },
  { id: 31, name: '慢病管理', icon: '🩺', color: '#8FBC8F' },
  { id: 32, name: '口腔健康', icon: '🦷', color: '#87CEEB' },
  { id: 33, name: '生命教育', icon: '🌱', color: '#98FB98' },
  { id: 34, name: '老年痴呆防治', icon: '🧩', color: '#D8BFD8' },
  { id: 35, name: '舞蹈', icon: '💃', color: '#FF1493' },
  { id: 36, name: '声乐', icon: '🎤', color: '#FFD700' },
  { id: 37, name: '器乐', icon: '🎸', color: '#C0C0C0' },
  { id: 38, name: '书法', icon: '🖌️', color: '#8B4513' },
  { id: 39, name: '绘画', icon: '🎨', color: '#FF69B4' },
  { id: 40, name: '模特', icon: '👗', color: '#DDA0DD' },
  { id: 41, name: '戏剧', icon: '🎬', color: '#FFA07A' },
  { id: 42, name: '手工', icon: '🧶', color: '#F0E68C' },
  { id: 43, name: '生活休闲', icon: '☕', color: '#DEB887' },
  { id: 44, name: '历史地理', icon: '🗺️', color: '#778899' },
  { id: 45, name: '文化', icon: '🏺', color: '#D2691E' },
  { id: 46, name: '退休生涯规划', icon: '🌅', color: '#FF8C00' },
  { id: 47, name: '投资理财', icon: '💰', color: '#FFD700' },
  { id: 48, name: '志愿服务', icon: '❤️', color: '#FF6B6B' },
  { id: 49, name: '创新创业', icon: '💡', color: '#9ACD32' },
  { id: 50, name: '农业养殖', icon: '🐄', color: '#8FBC8F' },
  { id: 51, name: '职业技能', icon: '💼', color: '#6495ED' },
])

// 7个主要分类
const mainCategoryNames = ['书法绘画', '音乐类', '文史语言', '科普综合', '体育舞蹈', '民俗文化', '养生健康']

// 显示的分类（只显示前6个）
const displayCategories = computed(() => {
  return categories.value.filter(cat => mainCategoryNames.includes(cat.name))
})

// 调整颜色亮度
const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

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
// ========== 新中式水墨风格设计规范 ==========
// 色彩系统 - 融合传统水墨与现代简约
$primary: #4A6FA5;           // 藏蓝色 - 书法绘画
$primary-light: #6B8BB8;    // 浅藏蓝
$secondary: #7BA05B;         // 松石绿 - 音乐类
$accent: #D4915C;            // 赭石色 - 文史语言
$accent-warm: #C4785C;       // 暖赭色
$text-primary: #2C3E50;      // 墨色
$text-secondary: #5D6D7E;    // 淡墨色
$text-muted: #95A5A6;        // 浅墨色
$bg-light: #FAF8F5;          // 宣纸白
$bg-card: #FFFFFF;          // 卡片白
$ink-red: #C94043;          // 梅花红
$ink-brown: #8B7355;         // 棕褐色
$vivid-red: #E53E3E;         // 鲜艳的红色

// 水墨渐变色
$ink-gradient: linear-gradient(180deg, #E8E4DD 0%, #FAF8F5 100%);
$mist-gradient: linear-gradient(180deg, rgba(139, 115, 85, 0.05) 0%, rgba(139, 115, 85, 0.02) 100%);

@mixin ink-border {
  border: 1px solid rgba(139, 115, 85, 0.15);
  box-shadow: 0 4rpx 20rpx rgba(139, 115, 85, 0.08);
}

@mixin plum-blossom-decoration {
  position: relative;
  &::before {
    content: '❀';
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    font-size: 24rpx;
    color: $ink-red;
    opacity: 0.6;
  }
}

@mixin ink-brush-stroke {
  border-left: 4rpx solid $primary;
}

@mixin mountain-decoration {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 60%;
    height: 60rpx;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path fill="%234A6FA5" opacity="0.08" d="M0,60 L0,40 Q50,20 100,35 Q150,50 200,25 L200,60 Z"/></svg>') no-repeat right bottom;
    background-size: contain;
    pointer-events: none;
  }
}

@mixin mist-animation {
  animation: mist-float 6s ease-in-out infinite;
}

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

@keyframes mist-float {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 0.5; transform: translateX(10rpx); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

.page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-light;
  z-index: -1;
}

/* ========== 导航栏 - 水墨风格 ========== */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: $bg-card;
  z-index: 100;
  @include ink-border;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid rgba(139, 115, 85, 0.1);
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
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include ink-border;
  @include plum-blossom-decoration;

  .icon-text {
    font-size: 28rpx;
  }
}

.brand-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.nav-search {
  flex: 1;
  height: 72rpx;
  background: $mist-gradient;
  border: 1px solid rgba(139, 115, 85, 0.1);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;
  
  &:active {
    border-color: $primary;
  }
}

.search-icon {
  color: $text-muted;
}

.search-text {
  font-size: 26rpx;
  color: $text-muted;
  letter-spacing: 1rpx;
}

/* ========== 滚动区域 ========== */
.scroll-area {
  position: fixed;
  top: calc(var(--status-bar-height, 0) + 88rpx);
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}

/* ========== 分类图标网格 - 圆形图标风格 ========== */
.category-grid-wrapper {
  background: $bg-card;
  @include ink-border;
  border-left: none;
  border-right: none;
  border-top: none;
  margin: 24rpx;
  border-radius: 16rpx;
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

    // 全部 - 藏蓝色
    &--all-category {
      background: linear-gradient(135deg, #4A90D9 0%, #6B8BB8 100%);
      border-color: rgba(74, 144, 217, 0.4);
    }

    // 其他 - 灰棕色
    &--other {
      background: linear-gradient(135deg, #8B7355 0%, #A08060 100%);
      border-color: rgba(139, 115, 85, 0.4);
    }

    // 全部课程 - 松石绿
    &--all-course {
      background: linear-gradient(135deg, #7BA05B 0%, #8FB86B 100%);
      border-color: rgba(123, 160, 91, 0.4);
    }
  }

  &__icon {
    font-size: 44rpx;
    filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.15));
  }

  &__name {
    font-size: 22rpx;
    color: $text-primary;
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
      color: $primary;
      font-weight: 600;
    }
  }

  &:active {
    .category-icon-item__circle {
      transform: scale(0.95);
    }
  }
}

/* ========== 内容区域 ========== */
.content-wrapper {
  padding: 24rpx;
}

/* ========== 筛选状态提示 - 水墨风格 ========== */
.filter-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: $bg-card;
  border: 1px solid rgba(139, 115, 85, 0.15);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  animation: slideUpFade 0.3s ease-out;
  @include ink-border;
  @include ink-brush-stroke;

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
    letter-spacing: 1rpx;
  }

  &__clear {
    padding: 10rpx 20rpx;
    background: $bg-card;
    border: 1px solid $primary;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: $primary;
    font-weight: 500;

    &:active {
      background: $mist-gradient;
    }
  }
}

/* ========== 精选课程区块 - 水墨卡片 ========== */
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
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  border-radius: 16rpx;
  overflow: hidden;
  @include ink-border;
  @include mountain-decoration;
  position: relative;

  // 水墨顶部装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rpx;
    background: linear-gradient(90deg, $primary, $secondary, $accent);
    opacity: 0.6;
    z-index: 1;
  }

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
  background: $bg-card;
  border: 1px solid rgba(139, 115, 85, 0.2);
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: $primary;
  @include ink-border;
}

.featured-card__info {
  padding: 20rpx;
}

.featured-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $vivid-red;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
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
  color: $accent-warm;
}

.featured-card__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.featured-card__action {
  padding: 10rpx 24rpx;
  background: $bg-card;
  border: 1px solid $primary;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;

  text {
    color: $primary;
  }

  &:active {
    background: $mist-gradient;
  }
}

.featured-card__action--view {
  border-color: $secondary;
  color: $secondary;

  text {
    color: $secondary;
  }
}

/* ========== 热门课程区块 - 水墨风格 ========== */
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
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  border-radius: 16rpx;
  overflow: hidden;
  @include ink-border;
  position: relative;

  // 梅花装饰
  &::before {
    content: '✿';
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    font-size: 20rpx;
    color: $ink-red;
    opacity: 0.4;
    z-index: 2;
  }

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

.hot-item__info {
  padding: 20rpx;
}

.hot-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $vivid-red;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
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
  color: $accent-warm;
}

.hot-item__price--free {
  color: $secondary;
  font-size: 26rpx;
}

.hot-item__btn {
  padding: 10rpx 24rpx;
  background: $bg-card;
  border: 1px solid $primary;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;

  text {
    color: $primary;
  }

  &:active {
    background: $mist-gradient;
  }
}

.hot-item__btn--view {
  border-color: $secondary;
  color: $secondary;

  text {
    color: $secondary;
  }
}

/* ========== 骨架屏 - 水墨风格 ========== */
.skeleton-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 24rpx;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  overflow: hidden;
  @include ink-border;
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

/* ========== 空状态 - 水墨风格 ========== */
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
  letter-spacing: 2rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-muted;
}

.empty-action {
  margin-top: 32rpx;
  padding: 16rpx 40rpx;
  background: $bg-card;
  border: 1px solid $primary;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
  letter-spacing: 2rpx;

  &:active {
    background: $mist-gradient;
  }
}

.bottom-spacer {
  height: 200rpx;
}

/* ========== 搜索弹窗 - 水墨风格 ========== */
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
  background: rgba(139, 115, 85, 0.3);
}

.search-popup__content {
  position: fixed;
  left: 0;
  right: 0;
  background: $bg-card;
  animation: slideDownFade 0.3s ease-out;
  overflow: hidden;
  z-index: 200;
}

.search-popup__header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  @include ink-border;
  border-top: none;
  border-left: none;
  border-right: none;
}

.search-popup__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 80rpx;
  background: $mist-gradient;
  border: 1px solid rgba(139, 115, 85, 0.1);
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
  background: $bg-card;
  border: 1px solid rgba(139, 115, 85, 0.1);
  border-radius: 50%;
}

.search-popup__cancel {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  padding: 12rpx 0;
  white-space: nowrap;
  letter-spacing: 1rpx;
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
  letter-spacing: 2rpx;
}

.search-section__clear {
  font-size: 24rpx;
  color: $text-muted;
  padding: 6rpx 12rpx;
  background: $mist-gradient;
  border: 1px solid rgba(139, 115, 85, 0.1);
  border-radius: 16rpx;
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.search-tag {
  padding: 12rpx 28rpx;
  background: $mist-gradient;
  border: 1px solid rgba(139, 115, 85, 0.1);
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
  letter-spacing: 1rpx;

  &:active {
    border-color: $primary;
    color: $primary;
  }
}

.search-tag--hot {
  background: rgba(74, 111, 165, 0.05);
  color: $primary;
  border-color: rgba(74, 111, 165, 0.15);
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
  border-bottom: 1px solid rgba(139, 115, 85, 0.1);
  margin-bottom: 8rpx;
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid rgba(139, 115, 85, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: $mist-gradient;
    margin: 0 -24rpx;
    padding-left: 24rpx;
    padding-right: 24rpx;
    border-radius: 12rpx;
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
  color: $vivid-red;
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

/* ========== 购买确认弹窗 ========== */
.buy-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.buy-modal__content {
  width: 600rpx;
  background: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.buy-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid rgba(139, 115, 85, 0.1);
}

.buy-modal__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  font-family: 'STKaiti', 'KaiTi', serif;
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
  color: $text-muted;

  &:active {
    background: rgba(139, 115, 85, 0.15);
  }
}

.buy-modal__body {
  padding: 32rpx;
}

.buy-modal__course {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: $mist-gradient;
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
  color: $vivid-red;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.buy-modal__category {
  font-size: 22rpx;
  color: $text-muted;
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
  color: $text-secondary;
}

.buy-modal__price {
  font-size: 44rpx;
  font-weight: 700;
  color: $accent;
  letter-spacing: 1rpx;
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
  color: $primary;
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
  transition: all 0.3s;

  &--cancel {
    background: $mist-gradient;
    border: 1px solid rgba(139, 115, 85, 0.15);
    color: $text-secondary;

    &:active {
      background: rgba(139, 115, 85, 0.1);
      transform: scale(0.98);
    }
  }

  &--confirm {
    background: linear-gradient(135deg, $accent 0%, $accent-warm 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(212, 145, 92, 0.35);

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 12rpx rgba(212, 145, 92, 0.25);
    }
  }
}
</style>
