<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">分类管理</text>
      <view class="glass-nav__add" @tap="showAddCategory">
        <text>+ 添加</text>
      </view>
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 分类列表 -->
      <view class="category-list" v-if="categoryList.length > 0">
        <view
          class="category-item"
          v-for="(cat, index) in categoryList"
          :key="cat._id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <view class="category-icon">
            <text>{{ cat.icon || '📖' }}</text>
          </view>
          <view class="category-info">
            <text class="category-name">{{ cat.name }}</text>
            <text class="category-count">排序：{{ cat.sortOrder || 0 }}</text>
          </view>
          <view class="category-actions">
            <view class="action-btn" @tap="editCategory(cat)">
              <text>编辑</text>
            </view>
            <view class="action-btn delete" @tap="deleteCategory(cat)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">🏷️</text>
        <text class="empty-text">暂无分类</text>
        <view class="empty-btn" @tap="showAddCategory">
          <text>添加分类</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 添加/编辑弹窗 -->
    <view class="add-popup" v-if="showPopup">
      <view class="popup-mask" @tap="showPopup = false"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ editingCategory ? '编辑分类' : '添加分类' }}</text>
          <view class="popup-close" @tap="showPopup = false">
            <text>✕</text>
          </view>
        </view>
        <view class="popup-body">
          <view class="popup-item">
            <text class="popup-label">分类图标</text>
            <view class="icon-picker">
              <view
                class="icon-option"
                :class="{ active: form.icon === icon }"
                v-for="icon in iconOptions"
                :key="icon"
                @tap="form.icon = icon"
              >
                <text>{{ icon }}</text>
              </view>
            </view>
          </view>
          <view class="popup-item">
            <text class="popup-label">分类名称 *</text>
            <input class="popup-input" v-model="form.name" placeholder="如：养生健康" />
          </view>
          <view class="popup-item">
            <text class="popup-label">排序权重</text>
            <input class="popup-input" type="number" v-model="form.sortOrder" placeholder="数字越小越靠前" />
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @tap="showPopup = false">
            <text>取消</text>
          </view>
          <view class="popup-btn confirm" @tap="submitForm">
            <text>确认</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories, addCategory, updateCategory, deleteCategory as apiDeleteCategory } from '@/utils/category.js'

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

// ========== 分类列表 ==========
const categoryList = ref([])
const isLoading = ref(false)

// ========== 弹窗状态 ==========
const showPopup = ref(false)
const editingCategory = ref(null)
const form = ref({
  icon: '📖',
  name: '',
  sortOrder: 0
})

// ========== 图标选项 ==========
const iconOptions = [
  '📚', '🏃', '🎨', '📱', '🛡️', '🍳', '📸', '💼', '📚', '🎵',
  '🎮', '🌱', '🍜', '🎯', '💡', '🎤', '🎪', '📝', '🧩', '🌟'
]

// ========== 加载分类 ==========
const loadCategories = async () => {
  isLoading.value = true
  const res = await getCategories()
  if (res.ok && res.list) {
    categoryList.value = res.list
  }
  isLoading.value = false
}

// ========== 显示添加弹窗 ==========
const showAddCategory = () => {
  editingCategory.value = null
  form.value = { icon: '📖', name: '', sortOrder: 0 }
  showPopup.value = true
}

// ========== 编辑分类 ==========
const editCategory = (cat) => {
  editingCategory.value = cat
  form.value = {
    icon: cat.icon || '📖',
    name: cat.name || '',
    sortOrder: cat.sortOrder || 0
  }
  showPopup.value = true
}

// ========== 删除分类 ==========
const deleteCategory = async (cat) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除分类"${cat.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        const result = await apiDeleteCategory(cat._id)
        if (result.ok) {
          categoryList.value = categoryList.value.filter(c => c._id !== cat._id)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      }
    }
  })
}

// ========== 提交表单 ==========
const submitForm = async () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }

  const data = {
    name: form.value.name.trim(),
    icon: form.value.icon,
    sortOrder: parseInt(form.value.sortOrder) || 0
  }

  let result
  if (editingCategory.value) {
    result = await updateCategory(editingCategory.value._id, data)
  } else {
    result = await addCategory(data)
  }

  if (result.ok) {
    showPopup.value = false
    uni.showToast({ title: '保存成功', icon: 'success' })
    await loadCategories()
  } else {
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
  loadCategories()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

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
  &:active { opacity: 0.7; }
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

.glass-nav__add {
  padding: 10rpx 20rpx;
  background: $orange-gradient;
  border-radius: 20rpx;
  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}

.scroll {
  position: relative;
  z-index: 1;
}

.category-list {
  padding: 20rpx 24rpx;
}

.category-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideUpFade 0.4s ease-out both;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.category-count {
  font-size: 22rpx;
  color: $text-muted;
}

.category-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: $primary;
  &.delete {
    background: rgba(255, 77, 79, 0.1);
    color: #FF4D4F;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    opacity: 0.5;
  }
  .empty-text {
    font-size: 30rpx;
    color: $text-secondary;
    margin-bottom: 32rpx;
  }
  .empty-btn {
    padding: 20rpx 48rpx;
    background: $orange-gradient;
    border-radius: 32rpx;
    text {
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }
  }
}

.bottom-spacer {
  height: 40rpx;
}

/* 弹窗 */
.add-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  animation: slideUpSheet 0.3s ease-out;
}

@keyframes slideUpSheet {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text {
    font-size: 36rpx;
    color: $text-muted;
  }
}

.popup-body {
  padding: 24rpx;
}

.popup-item {
  margin-bottom: 24rpx;
}

.popup-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  transition: all 0.2s;
  &.active {
    background: rgba(255, 107, 53, 0.1);
    border: 2rpx solid $primary;
  }
}

.popup-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.popup-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.popup-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  &.cancel {
    background: #f5f5f5;
    color: $text-secondary;
  }
  &.confirm {
    background: $orange-gradient;
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
  }
}
</style>
