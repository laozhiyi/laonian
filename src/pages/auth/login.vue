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
    uni.navigateBack()
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

.page {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg, #FFF5E6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.card {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 56rpx 40rpx;
  box-shadow: 0 8rpx 48rpx rgba(255, 144, 0, 0.12);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
}

.card__title {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary;
  text-align: center;
  margin-bottom: 40rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card__tabs {
  display: flex;
  padding: 6rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
  margin-bottom: 40rpx;
}

.card__tab {
  flex: 1;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $sub;
  transition: all 0.3s ease;
}

.card__tab.is-active {
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(255, 144, 0, 0.3);
}

.form__item {
  margin-bottom: 28rpx;
}

.form__label {
  display: block;
  font-size: 26rpx;
  color: $text;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form__input {
  height: 80rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.form__input:focus {
  background: #fff;
  border-color: $primary;
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  margin-top: 24rpx;
  border: none;
  transition: all 0.3s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn--primary {
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #fff;
  box-shadow: 0 6rpx 24rpx rgba(255, 144, 0, 0.3);
}

.btn--ghost {
  background: transparent;
  color: $sub;
  border: 2rpx solid #e8e8e8;
}
</style>
