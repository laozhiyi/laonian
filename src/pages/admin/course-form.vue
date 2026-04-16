<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">{{ isEditing ? '编辑课程' : '添加课程' }}</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        <view class="form-card">
          <view class="form-item">
            <text class="form-label">课程标题 *</text>
            <input class="form-input" v-model="form.title" placeholder="请输入课程标题" />
          </view>
          <view class="form-item">
            <text class="form-label">课程副标题</text>
            <input class="form-input" v-model="form.subtitle" placeholder="简短描述课程亮点" />
          </view>
          <view class="form-item">
            <text class="form-label">封面图片 *</text>
            <view class="cover-upload" @tap="chooseImage">
              <image v-if="form.cover" :src="form.cover" mode="aspectFill" />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">点击上传封面</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">分类 *</text>
            <picker :value="categoryIndex" :range="categoryOptions" range-key="name" @change="onCategoryChange">
              <view class="form-picker">
                <text>{{ selectedCategory?.name || '请选择分类' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">适合人群</text>
            <input class="form-input" v-model="form.suitableFor" placeholder="如：50岁以上中老年人" />
          </view>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="form-section">
        <view class="section-title">价格信息</view>
        <view class="form-card">
          <view class="form-row">
            <view class="form-item">
              <text class="form-label">原价(元) *</text>
              <input class="form-input" type="digit" v-model="form.priceYuan" placeholder="99.00" />
            </view>
            <view class="form-item">
              <text class="form-label">现价(元) *</text>
              <input class="form-input" type="digit" v-model="form.priceNowYuan" placeholder="29.90" />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">佣金比例(%)</text>
            <input class="form-input" type="digit" v-model="form.commissionRate" placeholder="30" />
          </view>
        </view>
      </view>

      <!-- 来源平台 -->
      <view class="form-section">
        <view class="section-title">来源平台</view>
        <view class="form-card">
          <view class="form-item">
            <text class="form-label">平台名称 *</text>
            <picker :value="platformIndex" :range="platformOptions" @change="onPlatformChange">
              <view class="form-picker">
                <text>{{ form.platform || '请选择平台' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">原始购买链接 *</text>
            <input class="form-input" v-model="form.originalUrl" placeholder="https://..." />
          </view>
          <view class="form-item">
            <text class="form-label">学习人数</text>
            <input class="form-input" type="number" v-model="form.studentCount" placeholder="0" />
          </view>
          <view class="form-item">
            <text class="form-label">评分</text>
            <input class="form-input" type="digit" v-model="form.rating" placeholder="5.0" />
          </view>
        </view>
      </view>

      <!-- 讲师信息 -->
      <view class="form-section">
        <view class="section-title">讲师信息</view>
        <view class="form-card">
          <view class="form-item">
            <text class="form-label">讲师名称</text>
            <input class="form-input" v-model="form.instructorName" placeholder="讲师姓名" />
          </view>
          <view class="form-item">
            <text class="form-label">讲师简介</text>
            <textarea class="form-textarea" v-model="form.instructorBio" placeholder="简单介绍讲师背景" />
          </view>
        </view>
      </view>

      <!-- 课程描述 -->
      <view class="form-section">
        <view class="section-title">课程详情</view>
        <view class="form-card">
          <view class="form-item">
            <text class="form-label">课程描述</text>
            <textarea class="form-textarea tall" v-model="form.description" placeholder="详细介绍课程内容、亮点、适合人群等" />
          </view>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="form-section">
        <view class="section-title">其他设置</view>
        <view class="form-card">
          <view class="form-item row">
            <text class="form-label">精选推荐</text>
            <switch :checked="form.isFeatured" @change="form.isFeatured = $event.detail.value" color="#FF6B35" />
          </view>
          <view class="form-item row">
            <text class="form-label">热门课程</text>
            <switch :checked="form.isHot" @change="form.isHot = $event.detail.value" color="#FF6B35" />
          </view>
          <view class="form-item row">
            <text class="form-label">上架状态</text>
            <switch :checked="form.status === 'online'" @change="form.status = $event.detail.value ? 'online' : 'offline'" color="#FF6B35" />
          </view>
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="submit-section">
        <view class="submit-btn" @tap="handleSubmit">
          <text>{{ isEditing ? '保存修改' : '添加课程' }}</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCategories } from '@/utils/category.js'
import { getCourseDetail, addCourse, updateCourse } from '@/utils/course.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px)`,
  }
})

// ========== 编辑状态 ==========
const isEditing = computed(() => !!courseId.value)
const courseId = ref('')

// ========== 表单数据 ==========
const form = ref({
  title: '',
  subtitle: '',
  cover: '',
  categoryId: '',
  platform: '',
  originalUrl: '',
  priceYuan: '',
  priceNowYuan: '',
  commissionRate: '30',
  studentCount: 0,
  rating: 5.0,
  instructorName: '',
  instructorBio: '',
  description: '',
  suitableFor: '',
  isFeatured: false,
  isHot: false,
  status: 'offline'
})

// ========== 分类数据 ==========
const categoryList = ref([])
const categoryOptions = computed(() => categoryList.value.map(c => ({ name: c.name, id: c._id || c.id })))
const categoryIndex = ref(0)
const selectedCategory = computed(() => categoryList.value[categoryIndex.value] || null)

const onCategoryChange = (e) => {
  categoryIndex.value = e.detail.value
  form.value.categoryId = selectedCategory.value?._id || selectedCategory.value?.id || ''
}

// ========== 平台选项 ==========
const platformOptions = ['得到', '小鹅通', '荔枝微课', '腾讯课堂', '喜马拉雅', '混沌大学', '网易云课堂', '其他']
const platformIndex = ref(-1)

const onPlatformChange = (e) => {
  platformIndex.value = e.detail.value
  form.value.platform = platformOptions[e.detail.value]
}

// ========== 上传封面 ==========
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })

      try {
        const uploadRes = await uniCloud.uploadFile({
          filePath: tempFilePath,
          cloudPath: 'courses/' + Date.now() + '.png'
        })

        if (uploadRes.fileID) {
          form.value.cover = uploadRes.fileID
        }
      } catch (e) {
        // 开发环境使用本地路径
        form.value.cover = tempFilePath
      }

      uni.hideLoading()
    }
  })
}

// ========== 加载分类 ==========
const loadCategories = async () => {
  const res = await getCategories()
  if (res.ok && res.list) {
    categoryList.value = res.list
  }
}

// ========== 加载课程详情 ==========
const loadCourseDetail = async () => {
  const res = await getCourseDetail(courseId.value)
  if (res.ok && res.data) {
    const course = res.data
    form.value = {
      title: course.title || '',
      subtitle: course.subtitle || '',
      cover: course.cover || '',
      categoryId: course.categoryId || '',
      platform: course.platform || '',
      originalUrl: course.originalUrl || '',
      priceYuan: course.price ? (course.price / 100).toFixed(2) : '',
      priceNowYuan: course.priceNow ? (course.priceNow / 100).toFixed(2) : '',
      commissionRate: course.commissionRate ? String(course.commissionRate) : '30',
      studentCount: course.studentCount || 0,
      rating: course.rating || 5.0,
      instructorName: course.instructor?.name || '',
      instructorBio: course.instructor?.bio || '',
      description: course.description || '',
      suitableFor: course.suitableFor || '',
      isFeatured: course.isFeatured || false,
      isHot: course.isHot || false,
      status: course.status || 'offline'
    }

    // 设置分类索引
    const catIdx = categoryList.value.findIndex(c => (c._id || c.id) === course.categoryId)
    if (catIdx >= 0) categoryIndex.value = catIdx

    // 设置平台索引
    const platIdx = platformOptions.indexOf(course.platform)
    if (platIdx >= 0) platformIndex.value = platIdx
  }
}

// ========== 提交表单 ==========
const handleSubmit = async () => {
  // 验证必填项
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入课程标题', icon: 'none' })
    return
  }
  if (!form.value.cover) {
    uni.showToast({ title: '请上传封面图片', icon: 'none' })
    return
  }
  if (!form.value.priceNowYuan) {
    uni.showToast({ title: '请输入现价', icon: 'none' })
    return
  }
  if (!form.value.platform) {
    uni.showToast({ title: '请选择平台', icon: 'none' })
    return
  }
  if (!form.value.originalUrl) {
    uni.showToast({ title: '请输入购买链接', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })

  const courseData = {
    title: form.value.title.trim(),
    subtitle: form.value.subtitle.trim(),
    cover: form.value.cover,
    categoryId: selectedCategory.value?._id || selectedCategory.value?.id || '',
    categoryName: selectedCategory.value?.name || '',
    platform: form.value.platform,
    originalUrl: form.value.originalUrl.trim(),
    promoteCode: 'smz_' + Date.now().toString(36),
    commissionRate: parseFloat(form.value.commissionRate) || 30,
    price: Math.round(parseFloat(form.value.priceYuan || 0) * 100),
    priceNow: Math.round(parseFloat(form.value.priceNowYuan) * 100),
    studentCount: parseInt(form.value.studentCount) || 0,
    rating: parseFloat(form.value.rating) || 5.0,
    instructor: {
      name: form.value.instructorName.trim(),
      bio: form.value.instructorBio.trim()
    },
    description: form.value.description.trim(),
    suitableFor: form.value.suitableFor.trim(),
    isFeatured: form.value.isFeatured,
    isHot: form.value.isHot,
    status: form.value.status
  }

  // 构建推广链接
  courseData.promoteUrl = courseData.originalUrl + (courseData.originalUrl.includes('?') ? '&' : '?') +
    'from=smz_learning&promo=' + courseData.promoteCode

  try {
    let result
    if (isEditing.value) {
      result = await updateCourse(courseId.value, courseData)
    } else {
      result = await addCourse(courseData)
    }

    uni.hideLoading()

    if (result.ok) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    } else {
      uni.showToast({ title: result.message || '保存失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// ========== 返回 ==========
const goBack = () => {
  uni.navigateBack()
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
})

onLoad(async (options) => {
  if (options.id) {
    courseId.value = options.id
  }

  await loadCategories()

  if (isEditing.value) {
    await loadCourseDetail()
  }
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

.page {
  min-height: 100vh;
  background: $bg-light;
}

.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.glass-nav__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
  }
}

.glass-nav__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.glass-nav__placeholder {
  width: 64rpx;
}

.scroll {
  position: relative;
  z-index: 1;
}

.form-section {
  padding: 20rpx 24rpx 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.form-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.form-item {
  padding: 24rpx;

  &.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;

  .form-item.row & {
    margin-bottom: 0;
  }
}

.form-input {
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;

  &.tall {
    height: 240rpx;
  }
}

.form-picker {
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: $text-primary;
}

.picker-arrow {
  font-size: 40rpx;
  color: $text-muted;
}

/* 封面上传 */
.cover-upload {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  image {
    width: 100%;
    height: 100%;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.upload-icon {
  font-size: 48rpx;
}

.upload-text {
  font-size: 22rpx;
  color: $text-muted;
}

/* 表单行 */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 提交按钮 */
.submit-section {
  padding: 32rpx 24rpx;
}

.submit-btn {
  height: 96rpx;
  background: $orange-gradient;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);

  text {
    font-size: 32rpx;
    font-weight: 700;
    color: #fff;
  }

  &:active {
    transform: scale(0.98);
  }
}

.bottom-spacer {
  height: 40rpx;
}
</style>
