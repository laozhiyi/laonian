<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <view class="glass-nav__brand">
        <text class="brand-emoji">➕</text>
        <text class="brand-name">添加商品</text>
      </view>
      <view class="glass-nav__placeholder" />
    </view>

    <view class="content">
      <!-- 添加表单 -->
      <view class="card">
        <view class="card__header">
          <view class="card__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </view>
          <text class="card__title">商品信息</text>
        </view>

        <view class="form">
          <view class="form__item">
            <text class="form__label">商品标题 *</text>
            <input
              class="form__input"
              v-model="form.title"
              placeholder="请输入商品标题"
              placeholder-class="form__placeholder"
            />
          </view>

          <view class="form__item">
            <text class="form__label">商品图片 *</text>
            <view class="image-upload" @tap="chooseImage">
              <image v-if="previewCover" class="image-preview" :src="previewCover" mode="aspectFill" />
              <view v-else class="image-placeholder">
                <view class="image-placeholder__icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.73478 1.10536 7.48043 1.29289 7.29289C1.48043 7.10536 1.73478 7 2 7H9L11 4H19L21 7H22C22.2652 7 22.5196 7.10536 22.7071 7.29289C22.8946 7.48043 23 7.73478 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </view>
                <text class="image-placeholder__text">点击上传图片</text>
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
                placeholder="59.9"
                placeholder-class="form__placeholder"
              />
            </view>
            <view class="form__col">
              <text class="form__label">原价(¥)</text>
              <input
                class="form__input"
                v-model="form.priceOrigin"
                type="digit"
                placeholder="79.9"
                placeholder-class="form__placeholder"
              />
            </view>
            <view class="form__col">
              <text class="form__label">库存 *</text>
              <input
                class="form__input"
                v-model="form.stock"
                type="number"
                placeholder="100"
                placeholder-class="form__placeholder"
              />
            </view>
          </view>

          <view class="form__item">
            <text class="form__label">标签（用逗号分隔）</text>
            <input
              class="form__input"
              v-model="form.tags"
              placeholder="如：助农产品,新鲜上市"
              placeholder-class="form__placeholder"
            />
          </view>

          <view class="form__item">
            <text class="form__label">商品描述</text>
            <textarea
              class="form__textarea"
              v-model="form.description"
              placeholder="请输入商品描述"
              placeholder-class="form__textarea-placeholder"
              :maxlength="200"
            />
          </view>

          <view class="form__actions">
            <view v-if="isEditing" class="btn btn--ghost" @tap="cancelEdit">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <text>取消</text>
            </view>
            <view class="btn btn--primary" @tap="handleSubmit">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <text>{{ isEditing ? '更新商品' : '添加商品' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 已添加商品列表 -->
      <view class="card" v-if="productList.length > 0">
        <view class="card__header">
          <view class="card__icon card__icon--list">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </view>
          <text class="card__title">已添加商品 ({{ productList.length }})</text>
        </view>
        <view class="product-list">
          <view class="product-item" v-for="(item, index) in productList" :key="item.id">
            <image class="product-item__cover" :src="item.cover" mode="aspectFill" />
            <view class="product-item__info">
              <view class="product-item__title">{{ item.title }}</view>
              <view class="product-item__price-row">
                <view class="product-item__price">¥{{ item.priceNow.toFixed(1) }}</view>
                <view class="product-item__stock">库存: {{ item.stock || 0 }}</view>
              </view>
            </view>
            <view class="product-item__actions">
              <view class="product-item__btn edit" @tap="handleEdit(index)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.4142 5.41421L21 8L15.5858 13.4142L13 10.8284L18.4142 5.41421Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <text>编辑</text>
              </view>
              <view class="product-item__btn delete" @tap="handleDelete(index)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <text>删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else>
        <view class="empty__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8M18 8V5M18 8H15M6 8V5M6 8H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <text class="empty__text">暂无商品</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createProduct, updateProduct, deleteProduct, getProducts, getAdminProducts, deleteAdminProduct, saveAdminProduct } from '@/utils/product.js'
import { uploadFile } from '@/utils/request.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navHeight = ref(88)

// ========== 表单数据 ==========
const form = ref({
  title: '',
  cover: '',
  priceNow: '',
  priceOrigin: '',
  stock: '',
  tags: '',
  description: ''
})

// ========== 商品列表 ==========
const productList = ref([])

// ========== 编辑模式 ==========
const isEditing = ref(false)
const editingId = ref('')

// ========== 图片上传 ==========
const previewCover = ref('')
const uploading = ref(false)

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 先显示本地预览
      previewCover.value = tempFilePath

      // 上传到服务器获取 URL
      uploading.value = true
      try {
        const uploadRes = await uploadFile('/upload', tempFilePath)
        if (uploadRes.ok) {
          form.value.cover = uploadRes.url
          uni.showToast({ title: '图片上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: uploadRes.message || '图片上传失败', icon: 'none' })
        }
      } catch (err) {
        uni.showToast({ title: err.message || '图片上传失败', icon: 'none' })
      } finally {
        uploading.value = false
      }
    }
  })
}

// ========== 加载商品列表 ==========
const loadProducts = async () => {
  // 获取后端商品列表
  const res = await getProducts()
  if (res.ok && res.list) {
    // 合并后端商品和本地管理员商品（去重）
    const adminProducts = getAdminProducts()
    const allList = [...res.list, ...adminProducts]
    // 按创建时间排序（新的在前）
    productList.value = allList.sort((a, b) => {
      const timeA = new Date(a.createdAt || a._id?.getTimestamp?.() || 0).getTime()
      const timeB = new Date(b.createdAt || b._id?.getTimestamp?.() || 0).getTime()
      return timeB - timeA
    })
  } else {
    productList.value = getAdminProducts()
  }
}

// ========== 交互方法 ==========
const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const goBack = () => {
  uni.navigateBack()
}

const handleSubmit = async () => {
  if (isEditing.value) {
    await handleUpdate()
  } else {
    await handleAdd()
  }
}

const handleAdd = async () => {
  // 验证必填项
  if (!form.value.title || !form.value.title.trim()) {
    toast('请输入商品标题')
    return
  }
  if (!form.value.cover || !form.value.cover.trim()) {
    toast('请上传商品图片')
    return
  }
  const priceNow = parseFloat(form.value.priceNow)
  if (isNaN(priceNow) || priceNow <= 0) {
    toast('请输入合法的现价')
    return
  }

  const priceOrigin = parseFloat(form.value.priceOrigin) || priceNow

  const stock = parseInt(form.value.stock)
  if (isNaN(stock) || stock < 0) {
    toast('请输入合法的库存数量')
    return
  }

  const product = {
    title: form.value.title.trim(),
    cover: form.value.cover.trim(),
    priceNow: priceNow,
    priceOrigin: priceOrigin,
    stock: stock,
    status: 1,
    tags: form.value.tags.trim() ? form.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    description: form.value.description.trim()
  }

  // 先尝试调用API创建
  const res = await createProduct(product)
  if (!res.ok) {
    // API失败时保存到本地存储
    saveAdminProduct(product)
  }

  // 更新列表
  productList.value = getAdminProducts()

  // 清空表单
  form.value = {
    title: '',
    cover: '',
    priceNow: '',
    priceOrigin: '',
    stock: '',
    tags: '',
    description: ''
  }
  previewCover.value = ''

  toast('添加成功')
}

// ========== 编辑商品 ==========
const handleEdit = (index) => {
  const product = productList.value[index]
  // 后端商品用 _id，本地用 id
  editingId.value = product._id || product.id
  form.value = {
    title: product.title || '',
    cover: product.cover || '',
    priceNow: product.priceNow ? String(product.priceNow) : '',
    priceOrigin: product.priceOrigin ? String(product.priceOrigin) : '',
    stock: product.stock ? String(product.stock) : '',
    tags: product.tags ? product.tags.join(', ') : '',
    description: product.description || ''
  }
  previewCover.value = product.cover || ''
  isEditing.value = true
}

const handleUpdate = async () => {
  try {
    if (!form.value.title || !form.value.title.trim()) {
      toast('请输入商品标题')
      return
    }
    if (!form.value.cover || !form.value.cover.trim()) {
      toast('请上传商品图片')
      return
    }

    const priceNow = parseFloat(form.value.priceNow)
    if (isNaN(priceNow) || priceNow <= 0) {
      toast('请输入合法的现价')
      return
    }

    const priceOrigin = parseFloat(form.value.priceOrigin) || priceNow
    const stock = parseInt(form.value.stock)
    if (isNaN(stock) || stock < 0) {
      toast('请输入合法的库存数量')
      return
    }

    const product = {
      title: form.value.title.trim(),
      cover: form.value.cover.trim(),
      priceNow: priceNow,
      priceOrigin: priceOrigin,
      stock: stock,
      status: 1,
      tags: form.value.tags ? form.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      description: form.value.description ? form.value.description.trim() : ''
    }

    // 先尝试调用API更新
    const res = await updateProduct(editingId.value, product)

    if (!res.ok) {
      // API失败时更新本地
      saveAdminProduct({ id: editingId.value, ...product })
    }

    // 重置表单
    cancelEdit()

    // 更新列表
    loadProducts()
    toast('更新成功')
  } catch (err) {
    toast('更新失败: ' + err.message)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = {
    title: '',
    cover: '',
    priceNow: '',
    priceOrigin: '',
    stock: '',
    tags: '',
    description: ''
  }
  previewCover.value = ''
}

const handleDelete = async (index) => {
  const product = productList.value[index]
  const productId = product._id || product.id
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        // 先尝试调用API删除（后端商品用 _id）
        const apiRes = await deleteProduct(productId)
        if (!apiRes.ok) {
          // API失败时删除本地
          deleteAdminProduct(productId)
        }
        // 重新加载商品列表
        loadProducts()
        toast('已删除')
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadProducts()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;
$border-color: #F0E6DC;
$glass-bg: rgba(255, 255, 255, 0.75);
$glass-border: rgba(255, 255, 255, 0.5);

// 动画定义
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.page {
  min-height: 100vh;
  background: $bg;
}

/* 毛玻璃导航 */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
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
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;

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

/* 内容区 */
.content {
  padding: 24rpx;
  padding-top: calc(24rpx + var(--status-bar-height, 0px) + 88rpx);
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05),
              0 2rpx 14rpx rgba(0, 0, 0, 0.02),
              inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border: 1rpx solid $border-color;
  animation: slideUpFade 0.5s ease-out;

  &--list {
    animation-delay: 0.1s;
  }
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
  width: 48rpx;
  height: 48rpx;
  color: $primary;
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.12), rgba(255, 179, 71, 0.06));
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 144, 0, 0.1);

  svg {
    width: 28rpx;
    height: 28rpx;
  }

  &--list {
    background: linear-gradient(135deg, $primary, $primary-light);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);

    svg {
      stroke: #fff;
    }
  }
}

.card__title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
  letter-spacing: 1rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 40rpx;
    height: 4rpx;
    background: linear-gradient(90deg, $primary, $primary-light);
    border-radius: 2rpx;
  }
}

/* 表单 */
.form__item {
  margin-bottom: 28rpx;
}

.form__label {
  display: block;
  font-size: 28rpx;
  color: $sub;
  margin-bottom: 12rpx;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.form__input {
  height: 92rpx;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 18rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: $text;
  border: 2rpx solid transparent;
  transition: all 0.25s ease;
  box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.02);

  &:focus {
    border-color: $primary;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(255, 144, 0, 0.1);
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
  transition: all 0.25s ease;
  box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.02);

  &:focus {
    border-color: $primary;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(255, 144, 0, 0.1);
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

.form__actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.form__actions .btn {
  flex: 1;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 28rpx;
  box-shadow: 0 8rpx 28rpx rgba(255, 144, 0, 0.4),
              0 4rpx 14rpx rgba(255, 179, 71, 0.25);
  letter-spacing: 2rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    width: 32rpx;
    height: 32rpx;
  }

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
  }
}

.btn--ghost {
  background: linear-gradient(135deg, #fafafa, #f8f8f8);
  color: $text-body;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid #eee;

  &:active {
    background: #f5f5f5;
    border-color: #ddd;
  }
}

/* 图片上传 */
.image-upload {
  width: 180rpx;
  height: 180rpx;
  border: 2rpx dashed $border-color;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf9f7, #f5f3f0);
  transition: all 0.3s ease;

  &:active {
    border-color: $primary;
    background: rgba(255, 144, 0, 0.05);
    transform: scale(0.98);
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

  &__icon {
    width: 56rpx;
    height: 56rpx;
    color: $sub;
    margin-bottom: 12rpx;
    opacity: 0.6;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    font-size: 22rpx;
    color: $sub;
    text-align: center;
    letter-spacing: 1rpx;
  }
}

/* 商品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #faf9f7, #f8f6f3);
  border-radius: 20rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1rpx solid transparent;

  &:active {
    background: linear-gradient(135deg, #f5f3f0, #f0ebe5);
    transform: scale(0.99);
    border-color: rgba(255, 144, 0, 0.15);
  }
}

.product-item__cover {
  width: 132rpx;
  height: 132rpx;
  border-radius: 20rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.product-item__info {
  flex: 1;
  min-width: 0;
}

.product-item__title {
  font-size: 30rpx;
  color: $text;
  margin-bottom: 14rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.product-item__price-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-item__price {
  font-size: 36rpx;
  color: $primary;
  font-weight: 700;
  text-shadow: 0 2rpx 8rpx rgba(255, 144, 0, 0.2);
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
}

.product-item__stock {
  font-size: 26rpx;
  color: $sub;
}

.product-item__actions {
  display: flex;
  gap: 16rpx;
}

.product-item__btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  padding: 14rpx 24rpx;
  border-radius: 14rpx;
  font-weight: 500;
  transition: all 0.2s ease;

  svg {
    width: 28rpx;
    height: 28rpx;
  }

  &.edit {
    background: linear-gradient(135deg, rgba(255, 144, 0, 0.1), rgba(255, 179, 71, 0.05));
    color: $primary;

    &:active {
      background: rgba(255, 144, 0, 0.2);
    }
  }

  &.delete {
    background: rgba(255, 59, 48, 0.08);
    color: #ff3b30;

    &:active {
      background: rgba(255, 59, 48, 0.15);
    }
  }
}

/* 空状态 */
.empty {
  padding: 120rpx 0;
  text-align: center;
  animation: slideUpFade 0.5s ease-out;

  &__icon {
    width: 120rpx;
    height: 120rpx;
    margin: 0 auto 32rpx;
    color: $sub;
    opacity: 0.3;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    font-size: 30rpx;
    color: $sub;
    letter-spacing: 2rpx;
  }
}
</style>
