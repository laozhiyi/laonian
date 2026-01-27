<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header__back" @tap="goBack">‹</view>
      <text class="header__title">收货地址</text>
      <view class="header__add" @tap="goAdd">添加</view>
    </view>

    <!-- 地址列表 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <view class="address-list" v-if="addressList.length > 0">
        <view
          class="address-card"
          v-for="(addr, index) in addressList"
          :key="addr.id"
        >
          <view class="address-card__info" @tap="onAddressTap(addr)">
            <view class="address-card__top">
              <view class="address-card__name">{{ addr.name }}</view>
              <view class="address-card__phone">{{ formatPhone(addr.phone) }}</view>
              <view class="address-card__tag address-card__tag--default" v-if="addr.isDefault">默认</view>
              <view class="address-card__tag address-card__tag--type" v-if="addr.type && !addr.isDefault">{{ addr.typeLabel }}</view>
            </view>
            <view class="address-card__detail">
              {{ addr.detail }}
            </view>
          </view>
          <view class="address-card__actions">
            <view class="address-card__action" @tap="setDefault(addr)">
              <text class="address-card__action-icon">{{ addr.isDefault ? '✅' : '⚪' }}</text>
              <text :class="{ 'address-card__action-text--active': addr.isDefault }">默认地址</text>
            </view>
            <view class="address-card__action" @tap="goEdit(addr)">
              <text class="address-card__action-icon">✏️</text>
              <text>编辑</text>
            </view>
            <view class="address-card__action address-card__action--delete" @tap="deleteAddr(addr)">
              <text class="address-card__action-icon">🗑️</text>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-else>
        <text class="empty__icon">📭</text>
        <text class="empty__text">暂无收货地址</text>
        <text class="empty__tip">添加地址方便收货</text>
        <view class="empty__btn" @tap="goAdd">添加地址</view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>

    <!-- 底部悬浮添加按钮 -->
    <view class="float-btn" @tap="goAdd" v-if="addressList.length > 0">
      <text>添加地址</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAddresses, deleteAddress, setDefaultAddress } from '@/utils/address.js'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const headerHeight = ref(88)

// ========== 地址列表 ==========
const addressList = ref([])

// ========== 手机号脱敏 ==========
const formatPhone = (phone) => {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + headerHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + headerHeight.value + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
}))

// ========== 加载地址列表 ==========
const loadAddresses = async () => {
  const res = await getAddresses()
  if (res.ok && res.list) {
    // 排序：默认地址在前
    addressList.value = res.list.sort((a, b) => {
      if (a.isDefault) return -1
      if (b.isDefault) return 1
      return 0
    })
  } else {
    addressList.value = []
  }
}

// ========== 交互方法 ==========
const goBack = () => {
  uni.navigateBack()
}

const goAdd = () => {
  uni.navigateTo({ url: '/pages/address/form' })
}

const goEdit = (addr) => {
  uni.navigateTo({ url: `/pages/address/form?id=${addr.id}` })
}

const onAddressTap = (addr) => {
  // 如果是从订单页面选择地址，返回选中结果
  const pages = getCurrentPages()
  if (pages.length >= 2) {
    const prevPage = pages[pages.length - 2]
    if (prevPage.route === 'pages/mall/mall' || prevPage.route === 'pages/checkout/checkout') {
      uni.setStorageSync('selected_address', JSON.stringify(addr))
      uni.navigateBack()
      return
    }
  }
  // 否则进入编辑
  goEdit(addr)
}

const setDefault = async (addr) => {
  if (addr.isDefault) return
  // 如果只有一个地址，不能取消当前默认
  if (addressList.value.length === 1) {
    uni.showToast({ title: '至少保留一个默认地址', icon: 'none' })
    return
  }
  await setDefaultAddress(addr.id)
  loadAddresses()
}

const deleteAddr = (addr) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该收货地址吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteAddress(addr.id)
        loadAddresses()
        uni.showToast({ title: '已删除', icon: 'none' })
      }
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadAddresses()
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

.header__add {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 地址列表 */
.address-list {
  padding: 0rpx 24rpx;
}

.address-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.08);
}

.address-card__info {
  padding: 28rpx 24rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.address-card__top {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.address-card__name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text;
  margin-right: 16rpx;
}

.address-card__phone {
  font-size: 28rpx;
  color: $sub;
  margin-right: 16rpx;
}

.address-card__tag {
  font-size: 22rpx;
  color: #fff;
  background: $primary;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.address-card__tag--default {
  background: $primary;
}

.address-card__tag--type {
  background: #FFF9F3;
  color: $primary;
  font-weight: 500;
}

.address-card__detail {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.6;
}

.address-card__actions {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
}

.address-card__action {
  display: flex;
  align-items: center;
  margin-right: 32rpx;
  font-size: 24rpx;
  color: $sub;
}

.address-card__action:last-child {
  margin-right: 0;
  margin-left: auto;
}

.address-card__action-icon {
  font-size: 28rpx;
  margin-right: 6rpx;
}

.address-card__action-text--active {
  color: $primary;
}

.address-card__action--delete {
  color: #ff3b30;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0 60rpx;
}

.empty__icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty__text {
  font-size: 30rpx;
  color: $text;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty__tip {
  font-size: 24rpx;
  color: $sub;
  margin-bottom: 40rpx;
}

.empty__btn {
  width: 240rpx;
  height: 72rpx;
  background: linear-gradient(135deg, $primary, #FFB347);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

/* 底部安全区 */
.bottom-safe {
  height: 40rpx;
}

/* 悬浮添加按钮 */
.float-btn {
  position: fixed;
  left: 50%;
  bottom: 40rpx;
  transform: translateX(-50%);
  background: linear-gradient(135deg, $primary, #FFB347);
  padding: 24rpx 80rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 144, 0, 0.3);
}
</style>
