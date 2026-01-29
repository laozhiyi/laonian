<template>
  <view class="page">
    <view class="card">
      <view class="card__title">橘上生香</view>
      <view class="card__tabs">
        <view
          class="card__tab"
          :class="{ 'is-active': mode === 'login' }"
          @tap="mode = 'login'"
        >
          登录
        </view>
        <view
          class="card__tab"
          :class="{ 'is-active': mode === 'register' }"
          @tap="mode = 'register'"
        >
          注册
        </view>
      </view>

      <view class="form">
        <view class="form__item">
          <text class="form__label">用户名</text>
          <input
            class="form__input"
            v-model="username"
            placeholder="请输入用户名"
          />
        </view>

        <view class="form__item">
          <text class="form__label">密码</text>
          <input
            class="form__input"
            v-model="password"
            password
            placeholder="请输入密码"
          />
        </view>

        <button class="btn btn--primary" @tap="onSubmit">
          {{ mode === 'login' ? '登录' : '注册并登录' }}
        </button>

        <button class="btn btn--ghost" @tap="goBack">
          返回
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser, registerUser } from '@/utils/user.js'

const mode = ref('login')
const username = ref('')
const password = ref('')

const toast = (title) => {
  uni.showToast({ title, icon: 'none' })
}

const onSubmit = async () => {
  const name = username.value.trim()
  const pwd = password.value.trim()

  if (!name || !pwd) {
    toast('请输入用户名和密码')
    return
  }

  if (mode.value === 'login') {
    const res = await loginUser({ username: name, password: pwd })
    if (!res.ok) {
      toast(res.message || '登录失败')
      return
    }
    toast('登录成功')
  } else {
    const res = await registerUser({ username: name, password: pwd, role: 'user' })
    if (!res.ok) {
      toast(res.message || '注册失败')
      return
    }
    toast('注册成功')
  }

  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 500)
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
$primary: #FF9000;
$primary-light: #FFB347;
$bg: #FFF9F3;
$text: #2B2B2B;
$sub: #7A7A7A;

// 动画定义
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15rpx); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.page {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg 0%, #FFF5E6 50%, #FFF0D6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -100rpx;
    right: -100rpx;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(255, 144, 0, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -80rpx;
    left: -80rpx;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(255, 179, 71, 0.06) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.card {
  width: 100%;
  max-width: 640rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 72rpx 56rpx;
  box-shadow: 0 16rpx 56rpx rgba(255, 144, 0, 0.12),
              0 4rpx 32rpx rgba(255, 144, 0, 0.05),
              inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8rpx;
    background: linear-gradient(90deg, $primary, $primary-light, $primary, $primary-light, $primary);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }

  &::after {
    content: '🍊';
    position: absolute;
    top: 40rpx;
    right: 40rpx;
    font-size: 60rpx;
    opacity: 0.06;
    pointer-events: none;
    animation: float 4s ease-in-out infinite;
  }
}

.card__title {
  font-size: 52rpx;
  font-weight: 700;
  color: $primary;
  text-align: center;
  margin-bottom: 56rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 50%, #FFCC80 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80rpx;
    height: 6rpx;
    background: linear-gradient(90deg, $primary, $primary-light);
    border-radius: 3rpx;
  }
}

.card__tabs {
  display: flex;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
  margin-bottom: 48rpx;
}

.card__tab {
  flex: 1;
  height: 72rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: $sub;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}

.card__tab.is-active {
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(255, 144, 0, 0.35);
}

.form__item {
  margin-bottom: 36rpx;
}

.form__label {
  display: block;
  font-size: 30rpx;
  color: $text;
  margin-bottom: 16rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.form__input {
  height: 96rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  padding: 0 32rpx;
  font-size: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.02);

  &:focus {
    background: #fff;
    border-color: $primary;
    box-shadow: 0 0 0 4rpx rgba(255, 144, 0, 0.1);
  }
}

.btn {
  width: 100%;
  height: 104rpx;
  border-radius: 52rpx;
  font-size: 34rpx;
  margin-top: 32rpx;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 104rpx;
  text-align: center;
}

.btn:active {
  transform: scale(0.97);
}

.btn--primary {
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  color: #fff;
  box-shadow: 0 8rpx 32rpx rgba(255, 144, 0, 0.4),
              0 4rpx 16rpx rgba(255, 179, 71, 0.25);
  letter-spacing: 3rpx;
  font-weight: 600;

  &:active {
    box-shadow: 0 4rpx 20rpx rgba(255, 144, 0, 0.3);
  }
}

.btn--ghost {
  background: linear-gradient(135deg, #fafafa, #f8f8f8);
  color: $sub;
  border: 2rpx solid #e8e8e8;
  letter-spacing: 2rpx;
  font-weight: 500;

  &:active {
    background: #f5f5f5;
    border-color: #ddd;
  }
}
</style>
