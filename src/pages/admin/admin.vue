<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">📖</text>
        <text class="brand-name">课程管理</text>
      </view>
      <view class="glass-nav__home" @tap="goHome">
        <text class="home-icon">🏠</text>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-bar" :style="{ top: (statusBarHeight + navHeight) + 'px' }">
      <view
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'internal' }"
        @tap="switchTab('internal')"
      >
        <text>内部课程</text>
      </view>
      <view
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'external' }"
        @tap="switchTab('external')"
      >
        <text>外部课程</text>
      </view>
      <view
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'category' }"
        @tap="switchTab('category')"
      >
        <text>分类管理</text>
      </view>
    </view>

    <view class="content">
      <!-- ========== 内部课程管理 ========== -->
      <template v-if="activeTab === 'internal'">
      <!-- 添加表单 -->
      <view class="card">
        <view class="card__header">
          <view class="card__icon">
            <text class="icon-text">➕</text>
          </view>
          <text class="card__title">课程信息</text>
        </view>

        <view class="form">
          <view class="form__item">
            <text class="form__label">课程标题 *</text>
            <input
              class="form__input"
              v-model="form.title"
              placeholder="请输入课程标题"
              placeholder-class="form__placeholder"
            />
          </view>

          <view class="form__item">
            <text class="form__label">课程图片 *</text>
            <view class="image-upload-btn" @tap="handleChooseImage">
              <image v-if="previewCover" class="image-preview" :src="previewCover" mode="aspectFill" />
              <view v-else class="image-placeholder">
                <view class="image-placeholder__icon">
                  <text class="icon-text icon-text--upload">📷</text>
                </view>
                <text class="image-placeholder__text">点击上传图片</text>
              </view>
            </view>
          </view>

          <view class="form__item">
            <text class="form__label">课程视频</text>
            <view class="video-upload-area" @tap="handleChooseVideo">
              <view v-if="form.videoUrl" class="video-preview-box">
                <video class="video-preview" :src="form.videoUrl" controls />
                <view class="video-replace" @tap.stop="handleChooseVideo">重新选择视频</view>
              </view>
              <view v-else class="video-placeholder">
                <view class="video-placeholder__icon">🎬</view>
                <text class="video-placeholder__text">点击上传视频</text>
                <text class="video-placeholder__tip">支持 mp4, mov 格式</text>
              </view>
            </view>
          </view>

          <view class="form__row">
            <view class="form__col">
              <text class="form__label">现价(¥) *</text>
              <input
                class="form__input"
                v-model="form.priceNow"
                type="digit"
                placeholder="199"
                placeholder-class="form__placeholder"
              />
            </view>
            <view class="form__col">
              <text class="form__label">原价(¥)</text>
              <input
                class="form__input"
                v-model="form.priceOrigin"
                type="digit"
                placeholder="299"
                placeholder-class="form__placeholder"
              />
            </view>
          </view>

          <view class="form__row">
            <view class="form__col">
              <text class="form__label">讲师名称</text>
              <input
                class="form__input"
                v-model="form.instructor"
                placeholder="讲师姓名"
                placeholder-class="form__placeholder"
              />
            </view>
            <view class="form__col">
              <text class="form__label">课程时长</text>
              <input
                class="form__input"
                v-model="form.duration"
                placeholder="如: 20小时"
                placeholder-class="form__placeholder"
              />
            </view>
          </view>

          <view class="form__row">
            <view class="form__col">
              <text class="form__label">难度等级</text>
              <picker mode="selector" :range="levelOptions" range-key="label" @change="onLevelChange">
                <view class="picker-wrap">
                  <text class="picker-text">{{ selectedLevelLabel }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            <view class="form__col">
              <text class="form__label">课程分类</text>
              <picker mode="selector" :range="categoryOptions" range-key="name" @change="onCategoryChange">
                <view class="picker-wrap">
                  <text class="picker-text">{{ selectedCategoryLabel }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
          </view>

          <view class="form__item">
            <text class="form__label">标签（用逗号分隔）</text>
            <input
              class="form__input"
              v-model="form.tags"
              placeholder="如：实战,入门,热门"
              placeholder-class="form__placeholder"
            />
          </view>

          <view class="form__item">
            <text class="form__label">课程描述</text>
            <textarea
              class="form__textarea"
              v-model="form.description"
              placeholder="请输入课程描述"
              placeholder-class="form__textarea-placeholder"
              :maxlength="300"
            />
          </view>

          <view class="form__actions">
            <view v-if="isEditing" class="btn btn--ghost" @tap="cancelEdit">
              <text class="btn-icon">✕</text>
              <text>取消</text>
            </view>
            <view class="btn btn--primary" @tap="handleSubmit">
              <text class="btn-icon">✓</text>
              <text>{{ isEditing ? '更新课程' : '添加课程' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 已添加课程列表 -->
      <view class="card" v-if="courseList.length > 0">
        <view class="card__header">
          <view class="card__icon card__icon--list">
            <text class="icon-text">📚</text>
          </view>
          <text class="card__title">已添加课程 ({{ courseList.length }})</text>
        </view>
        <view class="course-list">
          <view class="course-item" v-for="(item, index) in courseList" :key="item.id">
            <image class="course-item__cover" :src="item.cover" mode="aspectFill" />
            <view class="course-item__info">
              <view class="course-item__title">{{ item.title }}</view>
              <view class="course-item__meta">
                <text class="meta-tag" v-if="item.category">{{ item.category }}</text>
                <text class="meta-tag" v-if="item.level">{{ item.level }}</text>
                <text class="meta-tag" v-if="item.duration">{{ item.duration }}</text>
              </view>
              <view class="course-item__price-row">
                <text class="course-item__price">¥{{ item.priceNow || item.price || 0 }}</text>
                <text class="course-item__students" v-if="item.studentCount">{{ item.studentCount }}人在学</text>
              </view>
            </view>
            <view class="course-item__actions">
              <view class="course-item__btn edit" @tap="handleEdit(index)">
                <text class="icon-text icon-text--small">✏️</text>
                <text>编辑</text>
              </view>
              <view class="course-item__btn delete" @tap="handleDelete(index)">
                <text class="icon-text icon-text--small">🗑️</text>
                <text>删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else>
        <view class="empty__icon">
          <text class="empty-icon">📭</text>
        </view>
        <text class="empty__text">暂无课程</text>
      </view>
      </template>

      <!-- ========== 外部课程管理 ========== -->
      <template v-if="activeTab === 'external'">
        <!-- 添加外部课程表单 -->
        <view class="card">
          <view class="card__header">
            <view class="card__icon">
              <text class="icon-text">🌐</text>
            </view>
            <text class="card__title">{{ isEditingExternal ? '编辑外部课程' : '添加外部课程' }}</text>
          </view>

          <view class="form">
            <view class="form__item">
              <text class="form__label">课程标题 *</text>
              <input
                class="form__input"
                v-model="extForm.title"
                placeholder="请输入课程标题"
                placeholder-class="form__placeholder"
              />
            </view>

            <view class="form__item">
              <text class="form__label">封面图片 *</text>
              <view class="image-upload-btn" @tap="showImageModal">
                <image v-if="previewExtCover" class="image-preview" :src="previewExtCover" mode="aspectFill" />
                <view v-else class="image-placeholder">
                  <view class="image-placeholder__icon">
                    <text class="icon-text icon-text--upload">📷</text>
                  </view>
                  <text class="image-placeholder__text">点击选择图片</text>
                </view>
              </view>
              <!-- 已选图片预览 -->
              <view class="selected-image-tip" v-if="previewExtCover">
                <text class="tip-text">已选择封面图片</text>
                <text class="tip-clear" @tap="clearExtCover">清除</text>
              </view>
            </view>

            <view class="form__item">
              <text class="form__label">跳转链接 *</text>
              <input
                class="form__input"
                v-model="extForm.link"
                placeholder="请输入外部课程链接"
                placeholder-class="form__placeholder"
              />
            </view>

            <view class="form__item">
              <text class="form__label">课程分类</text>
              <picker mode="selector" :range="categoryOptions" range-key="name" @change="onExtCategoryChange">
                <view class="picker-wrap">
                  <text class="picker-text">{{ selectedExtCategoryLabel }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>

            <view class="form__item">
              <text class="form__label">课程介绍</text>
              <textarea
                class="form__textarea"
                v-model="extForm.description"
                placeholder="请输入课程介绍"
                placeholder-class="form__textarea-placeholder"
                :maxlength="500"
              />
            </view>

            <view class="form__actions">
              <view v-if="isEditingExternal" class="btn btn--ghost" @tap="cancelExtEdit">
                <text class="btn-icon">✕</text>
                <text>取消</text>
              </view>
              <view class="btn btn--primary" @tap="handleExtSubmit">
                <text class="btn-icon">✓</text>
                <text>{{ isEditingExternal ? '更新课程' : '添加课程' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 图片选择弹窗 -->
        <view class="image-modal" v-if="showImageSelectModal" @tap="closeImageModal">
          <view class="image-modal__content" @tap.stop>
            <view class="image-modal__header">
              <text class="image-modal__title">选择封面图片</text>
              <text class="image-modal__close" @tap="closeImageModal">✕</text>
            </view>
            <view class="image-modal__tabs">
              <view
                class="tab-btn"
                :class="{ 'tab-btn--active': imageTab === 'system' }"
                @tap="imageTab = 'system'"
              >
                <text>系统图片</text>
              </view>
              <view
                class="tab-btn"
                :class="{ 'tab-btn--active': imageTab === 'url' }"
                @tap="imageTab = 'url'"
              >
                <text>输入URL</text>
              </view>
            </view>
            <!-- 系统图片列表 -->
            <scroll-view class="image-grid" scroll-y v-if="imageTab === 'system'">
              <view class="image-grid__row">
                <view
                  class="image-grid__item"
                  v-for="(img, idx) in systemImages"
                  :key="idx"
                  @tap="selectSystemImage(img)"
                >
                  <image class="grid-image" :src="img" mode="aspectFill" />
                  <view class="grid-image__label">{{ systemImageLabels[idx] }}</view>
                </view>
              </view>
            </scroll-view>
            <!-- URL输入 -->
            <view class="url-input-area" v-if="imageTab === 'url'">
              <input
                class="form__input"
                v-model="customImageUrl"
                placeholder="请输入图片URL"
                placeholder-class="form__placeholder"
              />
              <view class="btn btn--primary btn--small" @tap="confirmCustomUrl">
                <text>确定</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 外部课程列表 -->
        <view class="card" v-if="externalList.length > 0">
          <view class="card__header">
            <view class="card__icon card__icon--list">
              <text class="icon-text">🌐</text>
            </view>
            <text class="card__title">外部课程列表 ({{ externalList.length }})</text>
          </view>
          <view class="course-list">
            <view class="course-item" v-for="(item, index) in externalList" :key="item.id">
              <image class="course-item__cover" :src="item.cover || getExtCategoryCover(item.category)" mode="aspectFill" />
              <view class="course-item__info">
                <view class="course-item__title">{{ item.title }}</view>
                <view class="course-item__meta">
                  <text class="meta-tag meta-tag--external" v-if="item.category">{{ item.category }}</text>
                </view>
                <text class="course-item__link">{{ item.link }}</text>
              </view>
              <view class="course-item__actions">
                <view class="course-item__btn edit" @tap="handleExtEdit(index)">
                  <text class="icon-text icon-text--small">✏️</text>
                  <text>编辑</text>
                </view>
                <view class="course-item__btn delete" @tap="handleExtDelete(index)">
                  <text class="icon-text icon-text--small">🗑️</text>
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty" v-else>
          <view class="empty__icon">
            <text class="empty-icon">🌐</text>
          </view>
          <text class="empty__text">暂无外部课程</text>
        </view>
      </template>

      <!-- ========== 分类管理 ========== -->
      <template v-if="activeTab === 'category'">
        <!-- 添加分类表单 -->
        <view class="card">
          <view class="card__header">
            <view class="card__icon">
              <text class="icon-text">📁</text>
            </view>
            <text class="card__title">{{ isEditingCategory ? '编辑分类' : '添加分类' }}</text>
          </view>

          <view class="form">
            <view class="form__item">
              <text class="form__label">分类名称 *</text>
              <input
                class="form__input"
                v-model="catForm.name"
                placeholder="请输入分类名称"
                placeholder-class="form__placeholder"
              />
            </view>

            <view class="form__item">
              <text class="form__label">分类图标</text>
              <input
                class="form__input"
                v-model="catForm.icon"
                placeholder="如: 🎨"
                placeholder-class="form__placeholder"
              />
            </view>

            <view class="form__item">
              <text class="form__label">主题色</text>
              <view class="color-picker">
                <view
                  class="color-option"
                  v-for="color in colorOptions"
                  :key="color"
                  :style="{ background: color }"
                  :class="{ 'color-option--selected': catForm.color === color }"
                  @tap="catForm.color = color"
                />
              </view>
            </view>

            <view class="form__item">
              <text class="form__label">排序</text>
              <input
                class="form__input"
                v-model.number="catForm.sort"
                type="number"
                placeholder="数字越小越靠前"
                placeholder-class="form__placeholder"
              />
            </view>

            <view class="form__actions">
              <view v-if="isEditingCategory" class="btn btn--ghost" @tap="cancelCatEdit">
                <text class="btn-icon">✕</text>
                <text>取消</text>
              </view>
              <view class="btn btn--primary" @tap="handleCatSubmit">
                <text class="btn-icon">✓</text>
                <text>{{ isEditingCategory ? '更新分类' : '添加分类' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 分类列表 -->
        <view class="card" v-if="categoryList.length > 0">
          <view class="card__header">
            <view class="card__icon card__icon--list">
              <text class="icon-text">📁</text>
            </view>
            <text class="card__title">分类列表 ({{ categoryList.length }})</text>
          </view>
          <view class="category-list">
            <view class="category-item" v-for="(item, index) in categoryList" :key="item.id">
              <view class="category-item__left">
                <text class="category-item__icon">{{ item.icon || '📁' }}</text>
                <view class="category-item__info">
                  <text class="category-item__name">{{ item.name }}</text>
                  <text class="category-item__color" v-if="item.color">颜色: {{ item.color }}</text>
                </view>
              </view>
              <view class="course-item__actions">
                <view class="course-item__btn edit" @tap="handleCatEdit(index)">
                  <text class="icon-text icon-text--small">✏️</text>
                </view>
                <view class="course-item__btn delete" @tap="handleCatDelete(index)">
                  <text class="icon-text icon-text--small">🗑️</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty" v-else>
          <view class="empty__icon">
            <text class="empty-icon">📁</text>
          </view>
          <text class="empty__text">暂无分类</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAdminCourses, deleteCourse, createCourse, updateCourse } from '@/utils/course.js'
import {
  getExternalCategories,
  getExternalCourses,
  createExternalCourse,
  updateExternalCourse,
  deleteExternalCourse,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/utils/external-course.js'

const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 标签页切换 ==========
const activeTab = ref('internal')

const switchTab = (tab) => {
  activeTab.value = tab
}

const form = ref({
  title: '',
  cover: '',
  videoUrl: '',
  priceNow: '',
  priceOrigin: '',
  instructor: '',
  duration: '',
  level: '',
  category: '',
  tags: '',
  description: ''
})

const courseList = ref([])
const isEditing = ref(false)
const editingId = ref('')
const previewCover = ref('')

const levelOptions = [
  { value: '', label: '请选择' },
  { value: '入门', label: '入门' },
  { value: '进阶', label: '进阶' },
  { value: '高级', label: '高级' }
]

const categoryOptions = ref([
  { value: '', name: '请选择' },
  { value: '公民素养', name: '🏛️ 公民素养' },
  { value: '时代前沿', name: '🚀 时代前沿' },
  { value: '时事思政', name: '📰 时事思政' },
  { value: '隔代教育', name: '👨‍👩‍👧 隔代教育' },
  { value: '哲学', name: '🧠 哲学' },
  { value: '文学', name: '📚 文学' },
  { value: '数字素养', name: '💻 数字素养' },
  { value: '摄影', name: '📷 摄影' },
  { value: '表演', name: '🎭 表演' },
  { value: '社会科学', name: '🔬 社会科学' },
  { value: '自然科学', name: '🌍 自然科学' },
  { value: '农学', name: '🌾 农学' },
  { value: '语言', name: '🗣️ 语言' },
  { value: '数学', name: '📐 数学' },
  { value: '学历教育', name: '🎓 学历教育' },
  { value: '论文写作', name: '✍️ 论文写作' },
  { value: '医学', name: '🏥 医学' },
  { value: '家庭照护', name: '🏠 家庭照护' },
  { value: '中医保健', name: '🌿 中医保健' },
  { value: '用药安全', name: '💊 用药安全' },
  { value: '食品营养', name: '🍎 食品营养' },
  { value: '心理健康', name: '💚 心理健康' },
  { value: '运动健康', name: '🏃 运动健康' },
  { value: '慢病管理', name: '🩺 慢病管理' },
  { value: '口腔健康', name: '🦷 口腔健康' },
  { value: '生命教育', name: '🌱 生命教育' },
  { value: '老年痴呆防治', name: '🧩 老年痴呆防治' },
  { value: '舞蹈', name: '💃 舞蹈' },
  { value: '声乐', name: '🎤 声乐' },
  { value: '器乐', name: '🎸 器乐' },
  { value: '书法', name: '🖌️ 书法' },
  { value: '绘画', name: '🎨 绘画' },
  { value: '模特', name: '👗 模特' },
  { value: '戏剧', name: '🎬 戏剧' },
  { value: '手工', name: '🧶 手工' },
  { value: '生活休闲', name: '☕ 生活休闲' },
  { value: '历史地理', name: '🗺️ 历史地理' },
  { value: '文化', name: '🏺 文化' },
  { value: '退休生涯规划', name: '🌅 退休生涯规划' },
  { value: '投资理财', name: '💰 投资理财' },
  { value: '志愿服务', name: '❤️ 志愿服务' },
  { value: '创新创业', name: '💡 创新创业' },
  { value: '农业养殖', name: '🐄 农业养殖' },
  { value: '职业技能', name: '💼 职业技能' },
])

// 默认44个分类
const defaultCategories = [
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
]

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

const getExtCategoryCover = (categoryName) => {
  return categoryCovers[categoryName] || 'https://picsum.photos/400/300'
}

const selectedLevel = ref('')
const selectedCategory = ref('')

const selectedLevelLabel = computed(() => {
  const opt = levelOptions.find(o => o.value === selectedLevel.value)
  return opt ? opt.label : '请选择'
})

const selectedCategoryLabel = computed(() => {
  const opt = categoryOptions.value.find(o => o.value === selectedCategory.value)
  return opt ? opt.name : '请选择'
})

const onLevelChange = (e) => {
  selectedLevel.value = levelOptions[e.detail.value]?.value || ''
  form.value.level = selectedLevel.value
}

const onCategoryChange = (e) => {
  selectedCategory.value = categoryOptions.value[e.detail.value]?.value || ''
  form.value.category = selectedCategory.value
}

const handleChooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      previewCover.value = tempFilePath
      form.value.cover = tempFilePath
    }
  })
}

// 选择视频
const handleChooseVideo = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 600, // 最大10分钟
    camera: 'back',
    success: async (res) => {
      const tempFilePath = res.tempFilePath
      form.value.videoUrl = tempFilePath
      // 显示提示：实际项目中需要上传到云存储
      uni.showToast({ title: '视频已选择，上传功能待配置', icon: 'none', duration: 2500 })
    },
    fail: (err) => {
      console.error('选择视频失败:', err)
      uni.showToast({ title: '请选择视频文件', icon: 'none' })
    }
  })
}

const loadCourses = async () => {
  const courses = await getAdminCourses()
  courseList.value = courses.filter(c => !c.deleted)
}

const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const goBack = () => {
  uni.switchTab({ url: '/pages/me/me' })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const handleSubmit = () => {
  if (isEditing.value) {
    handleUpdate()
  } else {
    handleAdd()
  }
}

const handleAdd = async () => {
  if (!form.value.title || !form.value.title.trim()) {
    toast('请输入课程标题')
    return
  }
  if (!form.value.cover || !form.value.cover.trim()) {
    toast('请上传课程图片')
    return
  }
  const priceNow = parseFloat(form.value.priceNow)
  if (isNaN(priceNow) || priceNow <= 0) {
    toast('请输入合法的现价')
    return
  }

  const course = {
    title: form.value.title.trim(),
    cover: form.value.cover.trim(),
    price: priceNow,
    price_now: priceNow,
    price_now_str: String(priceNow),
    price_origin: parseFloat(form.value.priceOrigin) || priceNow,
    instructor: form.value.instructor.trim(),
    duration: form.value.duration.trim(),
    level: selectedLevel.value,
    category: selectedCategory.value,
    tags: form.value.tags.trim() ? form.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    description: form.value.description.trim()
  }

  const result = await createCourse(course)
  if (!result.ok) {
    toast(result.message || '保存失败')
    return
  }

  await loadCourses()
  form.value = { title: '', cover: '', videoUrl: '', priceNow: '', priceOrigin: '', instructor: '', duration: '', level: '', category: '', tags: '', description: '' }
  selectedLevel.value = ''
  selectedCategory.value = ''
  previewCover.value = ''
  toast('添加成功')
}

const handleEdit = (index) => {
  const course = courseList.value[index]
  editingId.value = course.id
  form.value = {
    title: course.title || '',
    cover: course.cover || '',
    videoUrl: course.videoUrl || course.video_url || '',
    priceNow: String(course.priceNow || course.price || ''),
    priceOrigin: String(course.priceOrigin || course.price || ''),
    instructor: course.instructor || '',
    duration: course.duration || '',
    level: course.level || '',
    category: course.category || '',
    tags: course.tags ? course.tags.join(', ') : '',
    description: course.desc || course.description || ''
  }
  selectedLevel.value = course.level || ''
  selectedCategory.value = course.category || ''
  previewCover.value = course.cover || ''
  isEditing.value = true
}

const handleUpdate = async () => {
  if (!form.value.title || !form.value.title.trim()) {
    toast('请输入课程标题')
    return
  }
  if (!form.value.cover || !form.value.cover.trim()) {
    toast('请上传课程图片')
    return
  }
  const priceNow = parseFloat(form.value.priceNow)
  if (isNaN(priceNow) || priceNow <= 0) {
    toast('请输入合法的现价')
    return
  }

  const course = {
    title: form.value.title.trim(),
    cover: form.value.cover.trim(),
    video_url: form.value.videoUrl?.trim() || null,
    price: priceNow,
    price_now: priceNow,
    price_now_str: String(priceNow),
    price_origin: parseFloat(form.value.priceOrigin) || priceNow,
    instructor: form.value.instructor.trim(),
    duration: form.value.duration.trim(),
    level: selectedLevel.value,
    category: selectedCategory.value,
    tags: form.value.tags ? form.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    description: form.value.description ? form.value.description.trim() : ''
  }

  const result = await updateCourse(editingId.value, course)
  if (!result.ok) {
    toast(result.message || '更新失败')
    return
  }

  cancelEdit()
  await loadCourses()
  toast('更新成功')
}

const cancelEdit = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { title: '', cover: '', videoUrl: '', priceNow: '', priceOrigin: '', instructor: '', duration: '', level: '', category: '', tags: '', description: '' }
  selectedLevel.value = ''
  selectedCategory.value = ''
  previewCover.value = ''
}

const handleDelete = async (index) => {
  const course = courseList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该课程吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteCourse(course.id)
        await loadCourses()
        toast('已删除')
      }
    }
  })
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadCourses()
  loadExternalCategories()
  loadExternalCourses()
  loadCategories()
})

// ========== 外部课程管理 ==========
const extForm = ref({
  title: '',
  cover: '',
  link: '',
  description: '',
  category: ''
})

const externalList = ref([])
const isEditingExternal = ref(false)
const editingExtId = ref('')
const previewExtCover = ref('')

const selectedExtCategory = ref('')
const selectedExtCategoryLabel = computed(() => {
  const opt = categoryOptions.value.find(o => o.value === selectedExtCategory.value)
  return opt ? opt.name : '请选择'
})

const onExtCategoryChange = (e) => {
  selectedExtCategory.value = categoryOptions.value[e.detail.value]?.value || ''
  extForm.value.category = selectedExtCategory.value
}

// 系统内置图片库（本地图片）
const systemImages = [
  '/static/covers/1-healthcare.jpg',
  '/static/covers/2-culture.jpg',
  '/static/covers/3-drama.jpg',
  '/static/covers/4-calligraphy.jpg',
  '/static/covers/5-music.jpg',
  '/static/covers/6-tech.jpg',
  '/static/covers/7-edu.jpg',
  '/static/covers/8-business.jpg',
  '/static/covers/9-learning.jpg',
  '/static/covers/10-chess.jpg',
  '/static/covers/11-elderly.jpg',
  '/static/covers/12-cooking.jpg',
]

const handleChooseExtImage = () => {
  showImageModal()
}

// 图片选择弹窗
const showImageSelectModal = ref(false)
const imageTab = ref('system')
const customImageUrl = ref('')

const systemImageLabels = [
  '公民素养', '传统文化', '时事思政', '哲学', '数字素养', '摄影', '表演', '社会科学', '自然科学', '农学', '语言', '数学'
]

const showImageModal = () => {
  showImageSelectModal.value = true
  imageTab.value = 'system'
  customImageUrl.value = ''
}

const closeImageModal = () => {
  showImageSelectModal.value = false
}

const selectSystemImage = (url) => {
  previewExtCover.value = url
  extForm.value.cover = url
  showImageSelectModal.value = false
  uni.showToast({ title: '图片已选择', icon: 'success' })
}

const confirmCustomUrl = () => {
  if (!customImageUrl.value.trim()) {
    uni.showToast({ title: '请输入图片URL', icon: 'none' })
    return
  }
  previewExtCover.value = customImageUrl.value.trim()
  extForm.value.cover = customImageUrl.value.trim()
  showImageSelectModal.value = false
  uni.showToast({ title: '图片已设置', icon: 'success' })
}

const clearExtCover = () => {
  previewExtCover.value = ''
  extForm.value.cover = ''
}

const loadExternalCourses = async () => {
  try {
    const res = await getExternalCourses()
    if (res?.list) {
      externalList.value = res.list
    }
  } catch (error) {
    console.error('加载外部课程失败:', error)
  }
}

const handleExtSubmit = async () => {
  if (!extForm.value.title || !extForm.value.title.trim()) {
    toast('请输入课程标题')
    return
  }
  if (!extForm.value.link || !extForm.value.link.trim()) {
    toast('请输入跳转链接')
    return
  }

  const data = {
    title: extForm.value.title.trim(),
    cover: extForm.value.cover?.trim() || '',
    link: extForm.value.link.trim(),
    description: extForm.value.description?.trim() || '',
    category: selectedExtCategory.value
  }

  let result
  if (isEditingExternal.value) {
    result = await updateExternalCourse(editingExtId.value, data)
  } else {
    result = await createExternalCourse(data)
  }

  if (!result.ok) {
    toast(result.message || '操作失败')
    return
  }

  cancelExtEdit()
  await loadExternalCourses()
  toast(isEditingExternal.value ? '更新成功' : '添加成功')
}

const handleExtEdit = (index) => {
  const course = externalList.value[index]
  editingExtId.value = course.id
  extForm.value = {
    title: course.title || '',
    cover: course.cover || '',
    link: course.link || '',
    description: course.description || '',
    category: course.category || ''
  }
  selectedExtCategory.value = course.category || ''
  previewExtCover.value = course.cover || ''
  isEditingExternal.value = true
}

const cancelExtEdit = () => {
  isEditingExternal.value = false
  editingExtId.value = ''
  extForm.value = { title: '', cover: '', link: '', description: '', category: '' }
  selectedExtCategory.value = ''
  previewExtCover.value = ''
}

const handleExtDelete = async (index) => {
  const course = externalList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该课程吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteExternalCourse(course.id)
        await loadExternalCourses()
        toast('已删除')
      }
    }
  })
}

// ========== 分类管理 ==========
const catForm = ref({
  name: '',
  icon: '',
  color: '',
  sort: 0
})

const categoryList = ref([])
const isEditingCategory = ref(false)
const editingCatId = ref('')

const colorOptions = [
  '#FF6B35', '#4ECDC4', '#A855F7', '#3B82F6',
  '#10B981', '#F59E0B', '#EF4444', '#EC4899'
]

const loadCategories = async () => {
  try {
    const res = await getExternalCategories()
    if (res?.list && res.list.length > 0) {
      categoryList.value = res.list
      // 更新 picker 选项
      categoryOptions.value = [
        { value: '', name: '请选择' },
        ...res.list.map(c => ({ value: c.name, name: `${c.icon || '📁'} ${c.name}` }))
      ]
    } else {
      // 使用44个默认分类
      categoryList.value = defaultCategories
      categoryOptions.value = [
        { value: '', name: '请选择' },
        { value: '公民素养', name: '🏛️ 公民素养' },
        { value: '时代前沿', name: '🚀 时代前沿' },
        { value: '时事思政', name: '📰 时事思政' },
        { value: '隔代教育', name: '👨‍👩‍👧 隔代教育' },
        { value: '哲学', name: '🧠 哲学' },
        { value: '文学', name: '📚 文学' },
        { value: '数字素养', name: '💻 数字素养' },
        { value: '摄影', name: '📷 摄影' },
        { value: '表演', name: '🎭 表演' },
        { value: '社会科学', name: '🔬 社会科学' },
        { value: '自然科学', name: '🌍 自然科学' },
        { value: '农学', name: '🌾 农学' },
        { value: '语言', name: '🗣️ 语言' },
        { value: '数学', name: '📐 数学' },
        { value: '学历教育', name: '🎓 学历教育' },
        { value: '论文写作', name: '✍️ 论文写作' },
        { value: '医学', name: '🏥 医学' },
        { value: '家庭照护', name: '🏠 家庭照护' },
        { value: '中医保健', name: '🌿 中医保健' },
        { value: '用药安全', name: '💊 用药安全' },
        { value: '食品营养', name: '🍎 食品营养' },
        { value: '心理健康', name: '💚 心理健康' },
        { value: '运动健康', name: '🏃 运动健康' },
        { value: '慢病管理', name: '🩺 慢病管理' },
        { value: '口腔健康', name: '🦷 口腔健康' },
        { value: '生命教育', name: '🌱 生命教育' },
        { value: '老年痴呆防治', name: '🧩 老年痴呆防治' },
        { value: '舞蹈', name: '💃 舞蹈' },
        { value: '声乐', name: '🎤 声乐' },
        { value: '器乐', name: '🎸 器乐' },
        { value: '书法', name: '🖌️ 书法' },
        { value: '绘画', name: '🎨 绘画' },
        { value: '模特', name: '👗 模特' },
        { value: '戏剧', name: '🎬 戏剧' },
        { value: '手工', name: '🧶 手工' },
        { value: '生活休闲', name: '☕ 生活休闲' },
        { value: '历史地理', name: '🗺️ 历史地理' },
        { value: '文化', name: '🏺 文化' },
        { value: '退休生涯规划', name: '🌅 退休生涯规划' },
        { value: '投资理财', name: '💰 投资理财' },
        { value: '志愿服务', name: '❤️ 志愿服务' },
        { value: '创新创业', name: '💡 创新创业' },
        { value: '农业养殖', name: '🐄 农业养殖' },
        { value: '职业技能', name: '💼 职业技能' },
      ]
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    // 使用44个默认分类
    categoryList.value = defaultCategories
    categoryOptions.value = [
      { value: '', name: '请选择' },
      { value: '公民素养', name: '🏛️ 公民素养' },
      { value: '时代前沿', name: '🚀 时代前沿' },
      { value: '时事思政', name: '📰 时事思政' },
      { value: '隔代教育', name: '👨‍👩‍👧 隔代教育' },
      { value: '哲学', name: '🧠 哲学' },
      { value: '文学', name: '📚 文学' },
      { value: '数字素养', name: '💻 数字素养' },
      { value: '摄影', name: '📷 摄影' },
      { value: '表演', name: '🎭 表演' },
      { value: '社会科学', name: '🔬 社会科学' },
      { value: '自然科学', name: '🌍 自然科学' },
      { value: '农学', name: '🌾 农学' },
      { value: '语言', name: '🗣️ 语言' },
      { value: '数学', name: '📐 数学' },
      { value: '学历教育', name: '🎓 学历教育' },
      { value: '论文写作', name: '✍️ 论文写作' },
      { value: '医学', name: '🏥 医学' },
      { value: '家庭照护', name: '🏠 家庭照护' },
      { value: '中医保健', name: '🌿 中医保健' },
      { value: '用药安全', name: '💊 用药安全' },
      { value: '食品营养', name: '🍎 食品营养' },
      { value: '心理健康', name: '💚 心理健康' },
      { value: '运动健康', name: '🏃 运动健康' },
      { value: '慢病管理', name: '🩺 慢病管理' },
      { value: '口腔健康', name: '🦷 口腔健康' },
      { value: '生命教育', name: '🌱 生命教育' },
      { value: '老年痴呆防治', name: '🧩 老年痴呆防治' },
      { value: '舞蹈', name: '💃 舞蹈' },
      { value: '声乐', name: '🎤 声乐' },
      { value: '器乐', name: '🎸 器乐' },
      { value: '书法', name: '🖌️ 书法' },
      { value: '绘画', name: '🎨 绘画' },
      { value: '模特', name: '👗 模特' },
      { value: '戏剧', name: '🎬 戏剧' },
      { value: '手工', name: '🧶 手工' },
      { value: '生活休闲', name: '☕ 生活休闲' },
      { value: '历史地理', name: '🗺️ 历史地理' },
      { value: '文化', name: '🏺 文化' },
      { value: '退休生涯规划', name: '🌅 退休生涯规划' },
      { value: '投资理财', name: '💰 投资理财' },
      { value: '志愿服务', name: '❤️ 志愿服务' },
      { value: '创新创业', name: '💡 创新创业' },
      { value: '农业养殖', name: '🐄 农业养殖' },
      { value: '职业技能', name: '💼 职业技能' },
    ]
  }
}

const loadExternalCategories = async () => {
  await loadCategories()
}

const handleCatSubmit = async () => {
  if (!catForm.value.name || !catForm.value.name.trim()) {
    toast('请输入分类名称')
    return
  }

  const data = {
    name: catForm.value.name.trim(),
    icon: catForm.value.icon?.trim() || '',
    color: catForm.value.color || '',
    sort: catForm.value.sort || 0
  }

  let result
  if (isEditingCategory.value) {
    result = await updateCategory(editingCatId.value, data)
  } else {
    result = await createCategory(data.name, data.icon, data.color, data.sort)
  }

  if (!result.ok) {
    toast(result.message || '操作失败')
    return
  }

  cancelCatEdit()
  await loadCategories()
  toast(isEditingCategory.value ? '更新成功' : '添加成功')
}

const handleCatEdit = (index) => {
  const cat = categoryList.value[index]
  editingCatId.value = cat.id
  catForm.value = {
    name: cat.name || '',
    icon: cat.icon || '',
    color: cat.color || '',
    sort: cat.sort || 0
  }
  isEditingCategory.value = true
}

const cancelCatEdit = () => {
  isEditingCategory.value = false
  editingCatId.value = ''
  catForm.value = { name: '', icon: '', color: '', sort: 0 }
}

const handleCatDelete = async (index) => {
  const cat = categoryList.value[index]
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该分类吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteCategory(cat.id)
        await loadCategories()
        toast('已删除')
      }
    }
  })
}
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;
$border-color: #F0E6DC;
$glass-bg: rgba(255, 255, 255, 0.75);

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
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
  justify-content: space-between;
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

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text;
    line-height: 1;
  }
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.brand-emoji {
  font-size: 36rpx;
  animation: float 3s ease-in-out infinite;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
  letter-spacing: 2rpx;
}

.glass-nav__placeholder {
  width: 64rpx;
}

.glass-nav__home {
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

  .home-icon {
    font-size: 32rpx;
  }
}

.content {
  padding: 24rpx;
  padding-top: calc(24rpx + var(--status-bar-height, 0px) + 88rpx);
}

.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid $border-color;
  animation: slideUpFade 0.5s ease-out;
}

.card__header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.card__icon {
  width: 48rpx; height: 48rpx;
  color: $primary;
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.12), rgba(255, 179, 71, 0.06));
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--list {
    background: linear-gradient(135deg, $primary, $primary-light);
    color: #fff;
  }
}

.card__title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
}

.form__item {
  margin-bottom: 28rpx;
}

.form__label {
  display: block;
  font-size: 28rpx;
  color: $sub;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form__input {
  height: 92rpx;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 18rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: $text;
  border: 2rpx solid transparent;
  box-sizing: border-box;

  &:focus {
    border-color: $primary;
    background: #fff;
  }
}

.form__placeholder {
  color: #bbb;
}

.form__textarea {
  width: 100%;
  height: 200rpx;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 18rpx;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: $text;
  box-sizing: border-box;
  border: 2rpx solid transparent;

  &:focus {
    border-color: $primary;
    background: #fff;
  }
}

.form__textarea-placeholder {
  color: #bbb;
  font-size: 28rpx;
}

.form__row {
  display: flex;
  gap: 20rpx;
}

.form__col {
  flex: 1;
}

.picker-wrap {
  height: 92rpx;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 18rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2rpx solid transparent;
  box-sizing: border-box;

  &:active {
    border-color: $primary;
    background: #fff;
  }
}

.picker-text {
  font-size: 30rpx;
  color: $text;
}

.picker-arrow {
  font-size: 20rpx;
  color: $sub;
}

.form__actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 28rpx rgba(255, 144, 0, 0.4);
  letter-spacing: 2rpx;

  &:active {
    transform: scale(0.97);
  }
}

.btn--ghost {
  background: linear-gradient(135deg, #fafafa, #f8f8f8);
  color: $text-body;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid #eee;
}

.btn-icon {
  font-size: 28rpx;
}

.image-upload-btn {
  width: 180rpx;
  height: 180rpx;
  border: 2rpx dashed $border-color;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf9f7, #f5f3f0);

  &:active {
    border-color: $primary;
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-placeholder__icon {
  margin-bottom: 12rpx;
}

.image-placeholder__text {
  font-size: 22rpx;
  color: $sub;
}

.video-upload-area {
  border: 2rpx dashed $border-color;
  border-radius: 20rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #faf9f7, #f5f3f0);
  min-height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    border-color: $primary;
  }
}

.video-preview-box {
  width: 100%;
  position: relative;
}

.video-preview {
  width: 100%;
  height: 400rpx;
  background: #000;
}

.video-replace {
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: $primary;
  background: rgba(255, 255, 255, 0.9);
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.video-placeholder__icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.video-placeholder__text {
  font-size: 28rpx;
  color: $text;
  margin-bottom: 8rpx;
}

.video-placeholder__tip {
  font-size: 22rpx;
  color: $sub;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #faf9f7, #f8f6f3);
  border-radius: 20rpx;
  transition: all 0.3s;

  &:active {
    transform: scale(0.99);
  }
}

.course-item__cover {
  width: 132rpx;
  height: 132rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.course-item__info {
  flex: 1;
  min-width: 0;
}

.course-item__title {
  font-size: 28rpx;
  color: $text;
  margin-bottom: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.course-item__meta {
  display: flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 4rpx 10rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 6rpx;
  font-size: 20rpx;
  color: $primary;
}

.course-item__price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.course-item__price {
  font-size: 34rpx;
  color: $primary;
  font-weight: 700;
}

.course-item__students {
  font-size: 22rpx;
  color: $sub;
}

.course-item__actions {
  display: flex;
  gap: 12rpx;
}

.course-item__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.edit {
    background: rgba(255, 144, 0, 0.1);
    color: $primary;
  }

  &.delete {
    background: rgba(255, 59, 48, 0.08);
    color: #ff3b30;
  }
}

.empty {
  padding: 120rpx 0;
  text-align: center;

  &__icon {
    margin-bottom: 24rpx;
  }

  &__text {
    font-size: 30rpx;
    color: $sub;
  }
}

.empty-icon {
  font-size: 100rpx;
  opacity: 0.3;
}

.icon-text {
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text--upload {
  font-size: 48rpx;
}

.icon-text--small {
  font-size: 22rpx;
}

/* 标签页切换 */
.tab-bar {
  position: fixed;
  left: 0; right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 24rpx;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
  padding: 0 32rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
  color: $text-body;
  font-weight: 500;
  transition: all 0.3s;
  background: transparent;

  &--active {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

.content {
  padding: 24rpx;
  padding-top: calc(24rpx + var(--status-bar-height, 0px) + 88rpx + 110rpx);
}

/* 外部课程链接显示 */
.course-item__link {
  font-size: 20rpx;
  color: $sub;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-tag--external {
  background: rgba(78, 205, 196, 0.1);
  color: $secondary;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: linear-gradient(135deg, #faf9f7, #f8f6f3);
  border-radius: 20rpx;
}

.category-item__left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.category-item__icon {
  font-size: 48rpx;
}

.category-item__info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.category-item__name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text;
}

.category-item__color {
  font-size: 22rpx;
  color: $sub;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.color-option {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  transition: all 0.2s;

  &--selected {
    border-color: $text;
    transform: scale(1.1);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* 图片选择弹窗 */
.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.image-modal__content {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  box-sizing: border-box;
  animation: slideUpFade 0.3s ease;
}

.image-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.image-modal__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
}

.image-modal__close {
  width: 56rpx;
  height: 56rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $sub;

  &:active {
    background: #eee;
  }
}

.image-modal__tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab-btn {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $text-body;

  &--active {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    font-weight: 600;
  }
}

.image-grid {
  max-height: 500rpx;
}

.image-grid__row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-grid__item {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;

  &:active {
    transform: scale(0.97);
  }
}

.grid-image {
  width: 100%;
  height: 100%;
}

.grid-image__label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8rpx;
  background: rgba(0, 0, 0, 0.6);
  font-size: 20rpx;
  color: #fff;
  text-align: center;
}

.url-input-area {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn--small {
  height: 72rpx;
  font-size: 28rpx;
  border-radius: 36rpx;
}

/* 已选图片提示 */
.selected-image-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: $secondary;
}

.tip-clear {
  font-size: 24rpx;
  color: #ff3b30;
  font-weight: 500;
}
</style>
