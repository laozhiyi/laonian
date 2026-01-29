<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="glass-nav__title">
        <text class="brand-name">收货地址</text>
      </view>
      <view class="glass-nav__placeholder" />
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
              <view class="address-card__action-icon">
                <svg v-if="addr.isDefault" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#ddd" stroke-width="2"/>
                </svg>
              </view>
              <text :class="{ 'address-card__action-text--active': addr.isDefault }">默认地址</text>
            </view>
            <view class="address-card__action" @tap="goEdit(addr)">
              <view class="address-card__action-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.4142 5.41421L21 8L15.5858 13.4142L13 10.8284L18.4142 5.41421Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </view>
              <text>编辑</text>
            </view>
            <view class="address-card__action address-card__action--delete" @tap="deleteAddr(addr)">
              <view class="address-card__action-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </view>
              <text>删除</text>
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
const navHeight = ref(88)
const headerHeight = computed(() => navHeight.value)

// ========== 地址列表 ==========
const addressList = ref([])

// ========== 手机号脱敏 ==========
const formatPhone = (phone) => {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: (statusBarHeight.value + navHeight.value) + 'px',
  height: 'calc(100vh - ' + (statusBarHeight.value + navHeight.value + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'px)',
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
$primary-light: #FFB347;
$text: #2B2B2B;
$text-body: #5A5A5A;
$sub: #999999;
$bg: #FFFAF5;
$border-color: #F0E6DC;

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
  50% { transform: translateY(-6rpx); }
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
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(30rpx);
  -webkit-backdrop-filter: blur(30rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.glass-nav__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 56rpx;
  color: $text;
  padding: 0 8rpx;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.9);
  }
}

.glass-nav__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.glass-nav__action {
  display: flex;
  align-items: center;
}

.action-text {
  font-size: 30rpx;
  color: $text;
  font-weight: 600;
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 24rpx;

  &:active {
    background: rgba(0, 0, 0, 0.1);
  }
}

.glass-nav__brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
  letter-spacing: 2rpx;
}

/* 滚动区域 */
.scroll {
  width: 100%;
}

/* 地址列表 */
.address-list {
  padding: 0 24rpx;
}

.address-card {
  background: #fff;
  border-radius: 28rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 28rpx rgba(0, 0, 0, 0.05),
              0 2rpx 14rpx rgba(0, 0, 0, 0.02),
              inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUpFade 0.5s ease-out;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  }
}

.address-card__info {
  padding: 28rpx 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 144, 0, 0.02);
  }
}

.address-card__top {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
  gap: 8rpx;
}

.address-card__name {
  font-size: 36rpx;
  font-weight: 600;
  color: $text;
  margin-right: 20rpx;
}

.address-card__phone {
  font-size: 30rpx;
  color: $sub;
  margin-right: 20rpx;
}

.address-card__tag {
  font-size: 24rpx;
  color: #fff;
  background: $primary;
  padding: 6rpx 18rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 10rpx rgba(255, 144, 0, 0.3);
  font-weight: 500;
}

.address-card__tag--default {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.address-card__tag--type {
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.1), rgba(255, 179, 71, 0.05));
  color: $primary;
  font-weight: 500;
}

.address-card__detail {
  font-size: 30rpx;
  color: $text-body;
  line-height: 1.6;
}

.address-card__actions {
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  background: linear-gradient(180deg, #fafafa, #f8f8f8);
}

.address-card__action {
  display: flex;
  align-items: center;
  margin-right: 36rpx;
  font-size: 26rpx;
  color: $sub;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 144, 0, 0.08);
    color: $primary;
  }

  &:last-child {
    margin-right: 0;
    margin-left: auto;
  }
}

.address-card__action-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
}

.address-card__action-text--active {
  color: $primary;
  font-weight: 500;
}

.address-card__action--delete {
  color: #ff3b30;

  &:active {
    background: rgba(255, 59, 48, 0.1);
    color: #ff3b30;
  }
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0 80rpx;
  animation: slideUpFade 0.6s ease-out;
}

.empty__icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 32rpx;
  color: $sub;
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty__text {
  font-size: 32rpx;
  color: $text;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.empty__tip {
  font-size: 26rpx;
  color: $sub;
  margin-bottom: 48rpx;
  letter-spacing: 1rpx;
}

.empty__btn {
  width: 280rpx;
  height: 84rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8rpx 28rpx rgba(255, 144, 0, 0.4);
  letter-spacing: 2rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
  }
}

/* 底部安全区 */
.bottom-safe {
  height: 60rpx;
}

/* 悬浮添加按钮 */
.float-btn {
  position: fixed;
  left: 50%;
  bottom: 48rpx;
  transform: translateX(-50%);
  background: linear-gradient(135deg, $primary 0%, #FF6B35 100%);
  padding: 32rpx 96rpx;
  border-radius: 52rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8rpx 36rpx rgba(255, 144, 0, 0.45),
              0 4rpx 18rpx rgba(255, 107, 53, 0.25);
  letter-spacing: 3rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;

  &:active {
    transform: translateX(-50%) scale(0.96);
    box-shadow: 0 4rpx 24rpx rgba(255, 144, 0, 0.35);
  }
}
</style>
