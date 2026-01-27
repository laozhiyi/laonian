<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">{{ isEdit ? '编辑地址' : '添加地址' }}</text>
      <view class="header__save" @tap="handleSave">保存</view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form__item">
        <view class="form__label">收货人</view>
        <input
          class="form__input"
          v-model="form.name"
          placeholder="请输入收货人姓名"
          placeholder-class="form__placeholder"
        />
      </view>

      <view class="form__item">
        <view class="form__label">手机号码</view>
        <input
          class="form__input"
          v-model="form.phone"
          type="number"
          placeholder="请输入手机号码"
          placeholder-class="form__placeholder"
          maxlength="11"
        />
      </view>

      <view class="form__item">
        <view class="form__label">详细地址</view>
        <textarea
          class="form__textarea"
          v-model="form.detail"
          placeholder="请输入详细地址"
          placeholder-class="form__placeholder"
          :maxlength="200"
        />
      </view>

      <view class="form__item form__item--switch">
        <view class="form__label">设为默认地址</view>
        <view
          class="form__switch"
          :class="{ 'form__switch--active': form.isDefault }"
          @tap="form.isDefault = !form.isDefault"
        >
          <view class="form__switch-circle" />
        </view>
      </view>
    </view>

    <!-- 删除按钮（编辑时显示） -->
    <view class="delete-btn" v-if="isEdit" @tap="handleDelete">
      <text>删除地址</text>
    </view>

    <!-- 底部保存按钮 -->
    <view class="save-bar">
      <view class="save-btn" @tap="handleSave">
        <text>保存地址</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createAddress, updateAddress, deleteAddress, getAddresses } from '@/utils/address.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)

// ========== 表单数据 ==========
const form = ref({
  name: '',
  phone: '',
  detail: '',
  isDefault: false
})

// ========== 编辑模式 ==========
const isEdit = ref(false)
const addressId = ref('')

// ========== 交互方法 ==========
const goBack = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  // 验证
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  if (!form.value.phone.trim() || !/^1\d{10}$/.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
    return
  }
  if (!form.value.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  const data = {
    name: form.value.name.trim(),
    phone: form.value.phone.trim(),
    detail: form.value.detail.trim(),
    isDefault: form.value.isDefault
  }

  try {
    if (isEdit.value) {
      await updateAddress(addressId.value, data)
    } else {
      await createAddress(data)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (err) {
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该收货地址吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteAddress(addressId.value)
        uni.showToast({ title: '已删除', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(async () => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0

  // 获取地址ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id

  if (id) {
    isEdit.value = true
    addressId.value = id

    // 从地址列表中查找
    const res = await getAddresses()
    if (res.ok && res.list) {
      const addr = res.list.find(a => a.id === id)
      if (addr) {
        form.value = {
          name: addr.name || '',
          phone: addr.phone || '',
          detail: addr.detail || '',
          isDefault: addr.isDefault || false
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$text: #2B2B2B;
$sub: #7A7A7A;
$bg: #FFF9F3;

.page {
  min-height: 100vh;
  background: $bg;
}

/* 顶部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 100;
}

.header__back {
  font-size: 48rpx;
  color: #fff;
  padding: 0 8rpx;
}

.header__title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 48rpx;
}

.header__save {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

/* 表单 */
.form {
  padding: 24rpx;
  padding-top: 112rpx;
  padding-bottom: 140rpx;
}

.form__item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.form__label {
  font-size: 26rpx;
  color: $sub;
  margin-bottom: 16rpx;
}

.form__input {
  font-size: 30rpx;
  color: $text;
  height: 56rpx;
}

.form__placeholder {
  color: #bbb;
}

.form__textarea {
  width: 100%;
  height: 160rpx;
  font-size: 30rpx;
  color: $text;
  line-height: 1.5;
}

.form__item--switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form__switch {
  width: 96rpx;
  height: 52rpx;
  background: #e8e8e8;
  border-radius: 26rpx;
  position: relative;
  transition: background 0.3s;
}

.form__switch--active {
  background: $primary;
}

.form__switch-circle {
  width: 44rpx;
  height: 44rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form__switch--active .form__switch-circle {
  transform: translateX(44rpx);
}

/* 删除按钮 */
.delete-btn {
  margin: 48rpx 24rpx;
  height: 88rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ff3b30;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

/* 底部保存栏 */
.save-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.save-btn {
  height: 88rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}
</style>
