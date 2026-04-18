<template>
  <view class="page">
    <!-- 顶部背景 -->
    <view class="header-bg"></view>

    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar__back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-bar__title">余额充值</text>
      <view class="nav-bar__placeholder"></view>
    </view>

    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-card__label">当前余额</view>
      <view class="balance-card__amount">
        <text class="currency">¥</text>
        <text class="amount">{{ balance.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 充值金额选择 -->
    <view class="recharge-section">
      <view class="section-title">选择充值金额</view>
      <view class="amount-grid">
        <view
          v-for="item in amountOptions"
          :key="item"
          class="amount-item"
          :class="{ 'amount-item--active': selectedAmount === item }"
          @tap="selectAmount(item)"
        >
          <text class="amount-item__value">¥{{ item }}</text>
        </view>
      </view>

      <!-- 自定义金额 -->
      <view class="custom-amount">
        <text class="custom-label">自定义金额</text>
        <input
          class="custom-input"
          type="digit"
          v-model="customAmount"
          placeholder="请输入充值金额"
          @focus="selectedAmount = 0"
        />
      </view>
    </view>

    <!-- 充值按钮 -->
    <view class="recharge-btn-wrapper">
      <view class="recharge-btn" @tap="handleRecharge">
        <text class="recharge-btn__text">立即充值</text>
      </view>
    </view>

    <!-- 充值记录 -->
    <view class="record-section">
      <view class="section-header">
        <text class="section-title">充值记录</text>
        <text class="section-more" @tap="loadMore" v-if="hasMore">查看更多</text>
      </view>

      <view class="record-list" v-if="records.length > 0">
        <view class="record-item" v-for="item in records" :key="item.id">
          <view class="record-item__left">
            <view class="record-type" :class="'record-type--' + item.type">
              {{ getTypeText(item.type) }}
            </view>
            <view class="record-remark">{{ item.remark || '余额变动' }}</view>
            <view class="record-time">{{ formatTime(item.created_at) }}</view>
          </view>
          <view class="record-item__right">
            <text class="record-amount" :class="item.amount > 0 ? 'amount-plus' : 'amount-minus'">
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
            </text>
            <text class="record-balance">余额: {{ item.balance_after.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-else>
        <text>暂无充值记录</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="bottom-safe"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { request } from '@/utils/request.js'
import { getCurrentUser, updateCurrentUser } from '@/utils/user.js'

const statusBarHeight = ref(0)
const balance = ref(0)
const selectedAmount = ref(10)
const customAmount = ref('')
const amountOptions = [10, 30, 50, 100, 200, 500]
const records = ref([])
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)

const currentUser = computed(() => getCurrentUser())

const goBack = () => {
  uni.navigateBack()
}

const selectAmount = (amount) => {
  selectedAmount.value = amount
  customAmount.value = ''
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getTypeText = (type) => {
  const map = {
    recharge: '充值',
    purchase: '购买',
    admin_add: '管理员充值',
    admin_deduct: '管理员扣减',
    withdraw: '提现'
  }
  return map[type] || type
}

const loadBalance = async () => {
  try {
    const res = await request.get('/api/balance/info')
    balance.value = res.balance || 0
    // 更新本地用户余额
    if (currentUser.value) {
      updateCurrentUser({ ...currentUser.value, balance: res.balance })
    }
  } catch (e) {
    console.error('加载余额失败', e)
  }
}

const loadRecords = async () => {
  try {
    const res = await request.get('/api/balance/transactions', {
      page: page.value,
      page_size: pageSize
    })
    if (page.value === 1) {
      records.value = res.list || []
    } else {
      records.value = [...records.value, ...(res.list || [])]
    }
    hasMore.value = records.value.length < res.total
  } catch (e) {
    console.error('加载记录失败', e)
  }
}

const loadMore = () => {
  page.value++
  loadRecords()
}

const handleRecharge = async () => {
  const amount = selectedAmount.value > 0 ? selectedAmount.value : parseFloat(customAmount.value)

  if (!amount || amount <= 0) {
    uni.showToast({ title: '请选择或输入充值金额', icon: 'none' })
    return
  }

  uni.showLoading({ title: '充值中...' })

  try {
    const res = await request.post('/api/balance/recharge', { amount })
    uni.hideLoading()

    if (res.success) {
      balance.value = res.balance
      // 更新本地用户余额
      if (currentUser.value) {
        updateCurrentUser({ ...currentUser.value, balance: res.balance })
      }
      uni.showModal({
        title: '充值成功',
        content: `已成功充值 ¥${amount.toFixed(2)}`,
        showCancel: false
      })
      // 刷新记录
      page.value = 1
      loadRecords()
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e.detail || '充值失败', icon: 'none' })
  }
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
  loadBalance()
  loadRecords()
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$text-primary: #333333;
$text-secondary: #666666;
$text-muted: #999999;
$bg-light: #F5F5F5;
$card-bg: #FFFFFF;

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

.header-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, $primary 0%, #FF8E53 100%);
  border-radius: 0 0 40rpx 40rpx;
  z-index: 0;
}

.nav-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  padding-bottom: 10rpx;
}

.nav-bar__back,
.nav-bar__placeholder {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.balance-card {
  position: relative;
  z-index: 1;
  margin: 20rpx 30rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.balance-card__label {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.balance-card__amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
}

.currency {
  font-size: 36rpx;
  color: $primary;
  font-weight: 600;
}

.amount {
  font-size: 72rpx;
  font-weight: 700;
  color: $primary;
}

.recharge-section {
  position: relative;
  z-index: 1;
  margin: 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 28rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.amount-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-light;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.amount-item--active {
  background: #FFF5F0;
  border-color: $primary;
}

.amount-item__value {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.amount-item--active .amount-item__value {
  color: $primary;
}

.custom-amount {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.custom-label {
  font-size: 28rpx;
  color: $text-secondary;
  flex-shrink: 0;
}

.custom-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  background: $bg-light;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.recharge-btn-wrapper {
  position: relative;
  z-index: 1;
  margin: 30rpx;
}

.recharge-btn {
  height: 96rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.recharge-btn__text {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.record-section {
  position: relative;
  z-index: 1;
  margin: 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-more {
  font-size: 26rpx;
  color: $primary;
}

.record-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #F0F0F0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.record-item__left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-type {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.record-type--recharge {
  background: #E8F5E9;
  color: #4CAF50;
}

.record-type--purchase {
  background: #FFF3E0;
  color: #FF9800;
}

.record-type--admin_add {
  background: #E3F2FD;
  color: #2196F3;
}

.record-type--admin_deduct {
  background: #FFEBEE;
  color: #F44336;
}

.record-remark {
  font-size: 28rpx;
  color: $text-primary;
}

.record-time {
  font-size: 24rpx;
  color: $text-muted;
}

.record-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
}

.amount-plus {
  color: #4CAF50;
}

.amount-minus {
  color: $text-primary;
}

.record-balance {
  font-size: 24rpx;
  color: $text-muted;
}

.empty-tip {
  padding: 60rpx 0;
  text-align: center;
  color: $text-muted;
  font-size: 28rpx;
}

.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}
</style>
