<template>
  <view class="page">
    <!-- 背景装饰 - 水墨山水意境 -->
    <view class="bg-decoration">
      <view class="bg-blob bg-blob--1"></view>
      <view class="bg-blob bg-blob--2"></view>
    </view>

    <scroll-view class="scroll" scroll-y>
      <!-- 品牌标识 -->
      <view class="brand-section">
        <text class="brand-name">颐享学堂</text>
        <text class="brand-slogan">专注老年教育 · 丰富退休生活</text>
      </view>

      <!-- 登录卡片 -->
      <view class="card">
        <!-- 卡片顶部装饰 -->
        <view class="card__header">
          <view class="card__tab-indicator" :class="{ 'is-login': mode === 'login' }"></view>
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

        <!-- 表单内容 -->
        <view class="form">
          <!-- 用户名输入 -->
          <view class="form__item">
            <text class="form__label">用户名</text>
            <input
              class="form__input"
              v-model="username"
              placeholder="请输入用户名"
              placeholder-class="form__placeholder"
            />
          </view>

          <!-- 密码输入 -->
          <view class="form__item">
            <text class="form__label">密码</text>
            <input
              class="form__input"
              v-model="password"
              password
              placeholder="请输入密码"
              placeholder-class="form__placeholder"
            />
          </view>

          <!-- 提交按钮 -->
          <button class="btn btn--primary" @tap="onSubmit">
            <text class="btn__text">{{ mode === 'login' ? '登 录' : '注册并登录' }}</text>
          </button>

          <!-- 返回按钮 -->
          <button class="btn btn--ghost" @tap="goBack">
            <text class="btn__text btn__text--ghost">返 回</text>
          </button>
        </view>
      </view>

      <!-- 底部服务保障 -->
      <view class="service-hint">
        <text class="service-hint__text">登录即表示同意</text>
        <text class="service-hint__link">《用户服务协议》</text>
        <text class="service-hint__text">和</text>
        <text class="service-hint__link">《隐私政策》</text>
      </view>
    </scroll-view>
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
      const msg = res.message || '注册失败'
      if (msg.includes('已存在')) {
        uni.showModal({
          title: '提示',
          content: '该用户名已存在，是否切换到登录？',
          confirmText: '去登录',
          cancelText: '取消',
          success: (confirm) => {
            if (confirm.confirm) {
              mode.value = 'login'
              password.value = ''
            }
          }
        })
      } else {
        toast(msg)
      }
      return
    }
    toast('注册成功，正在登录...')
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
// ========== 新中式水墨风格设计规范 ==========
$primary: #4A6FA5;           // 藏蓝色
$primary-light: #6B8BB8;    // 浅藏蓝
$secondary: #7BA05B;         // 松石绿
$accent: #D4915C;            // 赭石色
$accent-warm: #C4785C;       // 暖赭色
$text-primary: #2C3E50;      // 墨色
$text-secondary: #5D6D7E;    // 淡墨色
$text-muted: #95A5A6;        // 浅墨色
$bg-light: #FAF8F5;          // 宣纸白
$bg-card: #FFFFFF;          // 卡片白
$ink-red: #C94043;          // 梅花红
$ink-brown: #8B7355;         // 棕褐色

// 水墨渐变色
$ink-gradient: linear-gradient(180deg, #E8E4DD 0%, #FAF8F5 100%);
$mist-gradient: linear-gradient(135deg, rgba(74, 111, 165, 0.08) 0%, rgba(74, 111, 165, 0.02) 100%);

@mixin ink-border {
  border: 1px solid rgba(139, 115, 85, 0.15);
  box-shadow: 0 4rpx 20rpx rgba(139, 115, 85, 0.08);
}

@mixin ink-brush-stroke {
  border-left: 4rpx solid $primary;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

@keyframes mist-float {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 0.5; transform: translateX(10rpx); }
}

.page {
  min-height: 100vh;
  background: $bg-light;
  position: relative;
}

/* ========== 背景装饰 ========== */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $ink-gradient;
    opacity: 0.5;
  }
}

.bg-blob {
  position: absolute;
  opacity: 0.15;
}

.bg-blob--1 {
  width: 100%;
  height: 400rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 400"><path fill="%238B7355" opacity="0.3" d="M0,400 L0,300 Q200,200 400,280 Q600,360 720,250 Q840,140 960,220 Q1080,300 1200,200 Q1320,100 1440,180 L1440,400 Z"/></svg>') no-repeat center bottom;
  background-size: cover;
  top: 0;
  filter: blur(2px);
}

.bg-blob--2 {
  width: 100%;
  height: 300rpx;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 300"><path fill="%234A6FA5" opacity="0.15" d="M0,300 L0,200 Q300,100 600,180 Q900,260 1200,150 Q1350,80 1440,120 L1440,300 Z"/></svg>') no-repeat center bottom;
  background-size: cover;
  bottom: 0;
  top: auto;
  filter: blur(1px);
}

.scroll {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-top: 60rpx;
}

/* ========== 品牌标识区 ========== */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 48rpx;
  animation: slideUpFade 0.6s ease-out;
}

.brand-name {
  font-size: 56rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 8rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
  margin-bottom: 16rpx;
}

.brand-slogan {
  font-size: 28rpx;
  color: $text-muted;
  letter-spacing: 2rpx;
}

/* ========== 登录卡片 ========== */
.card {
  margin: 0 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  @include ink-border;
  position: relative;
  overflow: hidden;
  animation: slideUpFade 0.6s ease-out 0.1s both;
  
  // 水墨山峦装饰
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 80%;
    height: 80rpx;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80"><path fill="%234A6FA5" opacity="0.06" d="M0,80 L0,50 Q100,20 200,45 Q300,70 400,30 L400,80 Z"/></svg>') no-repeat right bottom;
    background-size: contain;
    pointer-events: none;
  }
}

.card__header {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
  position: relative;
  background: $mist-gradient;
  border-radius: 16rpx;
  padding: 8rpx;
}

.card__tab-indicator {
  position: absolute;
  width: 50%;
  height: 72rpx;
  background: $bg-card;
  border-radius: 12rpx;
  @include ink-border;
  transition: transform 0.3s ease;
  left: 4rpx;
  
  &.is-login {
    transform: translateX(0);
  }
  
  &:not(.is-login) {
    transform: translateX(100%);
  }
}

.card__tab {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: $text-secondary;
  font-weight: 500;
  z-index: 1;
  letter-spacing: 2rpx;

  &:active {
    opacity: 0.8;
  }
}

.card__tab.is-active {
  color: $primary;
  font-weight: 600;
}

/* ========== 表单样式 ========== */
.form {
  position: relative;
  z-index: 1;
}

.form__item {
  margin-bottom: 32rpx;
}

.form__label {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.form__input {
  height: 96rpx;
  border-radius: 16rpx;
  background: $mist-gradient;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: $text-primary;
  border: 1rpx solid rgba(139, 115, 85, 0.1);
  @include ink-brush-stroke;
  transition: all 0.3s ease;

  &:focus {
    background: $bg-card;
    border-color: $primary;
    box-shadow: 0 0 0 4rpx rgba(74, 111, 165, 0.1);
  }
}

.form__placeholder {
  color: $text-muted;
  font-size: 28rpx;
}

/* ========== 按钮样式 ========== */
.btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn__text {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.btn__text--ghost {
  font-weight: 500;
}

.btn--primary {
  background: $bg-card;
  @include ink-border;
  @include ink-brush-stroke;
  box-shadow: 0 8rpx 24rpx rgba(74, 111, 165, 0.15);

  .btn__text {
    color: $primary;
  }

  &:active {
    background: $mist-gradient;
    box-shadow: 0 4rpx 16rpx rgba(74, 111, 165, 0.1);
  }
}

.btn--ghost {
  background: $mist-gradient;
  border: 1rpx solid rgba(139, 115, 85, 0.15);

  .btn__text--ghost {
    color: $text-muted;
    font-size: 30rpx;
  }

  &:active {
    background: rgba(139, 115, 85, 0.05);
  }
}

/* ========== 服务保障 ========== */
.service-hint {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 40rpx 32rpx;
  gap: 8rpx;
  animation: slideUpFade 0.6s ease-out 0.2s both;
}

.service-hint__text {
  font-size: 24rpx;
  color: $text-muted;
}

.service-hint__link {
  font-size: 24rpx;
  color: $primary;
}

/* ========== 底部安全区 ========== */
.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 60rpx);
}
</style>
