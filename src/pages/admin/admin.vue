<template>
  <view class="page">
    <view class="header">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">添加商品</text>
    </view>

    <view class="content">
      <!-- 添加表单 -->
      <view class="card">
        <view class="card__title">商品信息</view>

        <view class="form">
          <view class="form__item">
            <text class="form__label">商品标题 *</text>
            <input
              class="form__input"
              v-model="form.title"
              placeholder="请输入商品标题"
            />
          </view>

          <view class="form__item">
            <text class="form__label">商品图片 *</text>
            <view class="image-upload" @tap="chooseImage">
              <image v-if="previewCover" class="image-preview" :src="previewCover" mode="aspectFill" />
              <view v-else class="image-placeholder">
                <text class="image-placeholder__icon">📷</text>
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
              />
            </view>
            <view class="form__col">
              <text class="form__label">原价(¥)</text>
              <input
                class="form__input"
                v-model="form.priceOrigin"
                type="digit"
                placeholder="79.9"
              />
            </view>
            <view class="form__col">
              <text class="form__label">库存 *</text>
              <input
                class="form__input"
                v-model="form.stock"
                type="number"
                placeholder="100"
              />
            </view>
          </view>

          <view class="form__item">
            <text class="form__label">标签（用逗号分隔）</text>
            <input
              class="form__input"
              v-model="form.tags"
              placeholder="如：助农产品,新鲜上市"
            />
          </view>

          <view class="form__item">
            <text class="form__label">商品描述</text>
            <textarea
              class="form__textarea"
              v-model="form.description"
              placeholder="请输入商品描述"
              :maxlength="200"
            />
          </view>

          <view class="form__actions">
            <button v-if="isEditing" class="btn btn--ghost" @tap="cancelEdit">取消</button>
            <button class="btn btn--primary" @tap="handleSubmit">
              {{ isEditing ? '更新商品' : '添加商品' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 已添加商品列表 -->
      <view class="card" v-if="productList.length > 0">
        <view class="card__title">已添加商品 ({{ productList.length }})</view>
        <view class="product-list">
          <view class="product-item" v-for="(item, index) in productList" :key="item.id">
            <image class="product-item__cover" :src="item.cover" mode="aspectFill" />
            <view class="product-item__info">
              <view class="product-item__title">{{ item.title }}</view>
              <view class="product-item__row">
                <view class="product-item__price">¥{{ item.priceNow.toFixed(1) }}</view>
                <view class="product-item__stock">库存: {{ item.stock || 0 }}</view>
              </view>
            </view>
            <view class="product-item__actions">
              <view class="product-item__btn edit" @tap="handleEdit(index)">编辑</view>
              <view class="product-item__btn delete" @tap="handleDelete(index)">删除</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else>
        <text class="empty__text">暂无商品</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createProduct, updateProduct, deleteProduct, getProducts, getAdminProducts, deleteAdminProduct, saveAdminProduct } from '@/utils/product.js'
import { uploadFile } from '@/utils/request.js'

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
  console.log('🔄 handleSubmit called, isEditing:', isEditing.value)
  if (isEditing.value) {
    await handleUpdate()
  } else {
    await handleAdd()
  }
}

const handleAdd = async () => {
  console.log('🔄 handleAdd called')
  console.log('📋 form:', JSON.stringify(form.value))

  // 验证必填项
  if (!form.value.title || !form.value.title.trim()) {
    console.log('❌ Validation failed: title empty')
    toast('请输入商品标题')
    return
  }
  if (!form.value.cover || !form.value.cover.trim()) {
    console.log('❌ Validation failed: cover empty')
    toast('请上传商品图片')
    return
  }
  const priceNow = parseFloat(form.value.priceNow)
  console.log('💰 priceNow:', form.value.priceNow, '->', priceNow)
  if (isNaN(priceNow) || priceNow <= 0) {
    console.log('❌ Validation failed: priceNow invalid')
    toast('请输入合法的现价')
    return
  }

  const priceOrigin = parseFloat(form.value.priceOrigin) || priceNow

  const stock = parseInt(form.value.stock)
  console.log('📦 stock:', form.value.stock, '->', stock)
  if (isNaN(stock) || stock < 0) {
    console.log('❌ Validation failed: stock invalid')
    toast('请输入合法的库存数量')
    return
  }

  const product = {
    title: form.value.title.trim(),
    cover: form.value.cover.trim(),
    priceNow: priceNow,
    priceOrigin: priceOrigin,
    stock: stock,
    status: 1, // 1-上架，0-下架
    tags: form.value.tags.trim() ? form.value.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    description: form.value.description.trim()
  }

  console.log('📤 Creating product:', JSON.stringify(product))

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
    console.log('🔄 handleUpdate called, isEditing:', isEditing.value, 'editingId:', editingId.value)
    console.log('📋 form data:', JSON.stringify(form.value))

    if (!form.value.title || !form.value.title.trim()) {
      toast('请输入商品标题')
      return
    }
    if (!form.value.cover || !form.value.cover.trim()) {
      toast('请上传商品图片')
      return
    }

    const priceNow = parseFloat(form.value.priceNow)
    console.log('💰 priceNow:', form.value.priceNow, '->', priceNow)
    if (isNaN(priceNow) || priceNow <= 0) {
      toast('请输入合法的现价')
      return
    }

    const priceOrigin = parseFloat(form.value.priceOrigin) || priceNow
    const stock = parseInt(form.value.stock)
    console.log('📦 stock:', form.value.stock, '->', stock)
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

    console.log('📤 Updating product:', editingId.value, JSON.stringify(product))

    // 先尝试调用API更新
    const res = await updateProduct(editingId.value, product)
    console.log('📥 Update result:', res)

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
    console.error('❌ Update error:', err)
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
  loadProducts()
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$primary-light: #FFB347;
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.header__back {
  font-size: 48rpx;
  color: $text;
  padding: 0 16rpx;
  margin-left: -16rpx;
}

.header__title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text;
}

/* 内容区 */
.content {
  padding: 24rpx;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

/* 表单 */
.form__item {
  margin-bottom: 20rpx;
}

.form__label {
  display: block;
  font-size: 24rpx;
  color: $sub;
  margin-bottom: 8rpx;
}

.form__input {
  height: 76rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}

/* 图片上传 */
.image-upload {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-placeholder__icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.image-placeholder__text {
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.form__textarea {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.form__row {
  display: flex;
  gap: 16rpx;
}

.form__col {
  flex: 1;
}

.form__actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.form__actions .btn {
  flex: 1;
}

.btn {
  width: 100%;
  height: 80rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, $primary, #ffb347);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
}

.btn--ghost {
  background: #f5f5f5;
  color: #666;
  border: 1rpx solid #e8e8e8;
}

/* 商品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.product-item__cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.product-item__info {
  flex: 1;
}

.product-item__title {
  font-size: 26rpx;
  color: $text;
  margin-bottom: 8rpx;
}

.product-item__row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.product-item__price {
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

.product-item__stock {
  font-size: 22rpx;
  color: $sub;
}

.product-item__actions {
  display: flex;
  gap: 8rpx;
}

.product-item__btn {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.product-item__btn.edit {
  background: #FFB347;
  color: #fff;
}

.product-item__btn.delete {
  background: #ff3b30;
  color: #fff;
}

/* 空状态 */
.empty {
  padding: 60rpx 0;
  text-align: center;
}

.empty__text {
  font-size: 26rpx;
  color: $sub;
}
</style>
