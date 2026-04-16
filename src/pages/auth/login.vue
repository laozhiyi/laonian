<template>
  <view class="page">
    <!-- 背景 -->
    <view class="page-bg">
      <view class="bg-gradient"></view>
    </view>

    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-icon">📚</view>
      <text class="logo-title">什么值得学</text>
      <text class="logo-slogan">终身学习，值得投资</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-section">
      <view class="login-form">
        <!-- 用户名输入 -->
        <view class="form-item">
          <view class="form-item__icon">👤</view>
          <input
            class="form-item__input"
            type="text"
            v-model="username"
            placeholder="请输入用户名"
            placeholder-class="input-placeholder"
            confirm-type="next"
          />
        </view>

        <!-- 密码输入 -->
        <view class="form-item">
          <view class="form-item__icon">🔒</view>
          <input
            class="form-item__input"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
            confirm-type="done"
            @confirm="handleLogin"
          />
          <view class="form-item__eye" @tap="togglePassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </view>
        </view>

        <!-- 登录按钮 -->
        <button class="login-btn" :disabled="loading" @tap="handleLogin">
          <text v-if="!loading">登 录</text>
          <text v-else>登录中...</text>
        </button>
      </view>

      <!-- 用户协议 -->
      <view class="agreement">
        <text class="agreement-text">登录即表示同意</text>
        <text class="agreement-link" @tap="showAgreement">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @tap="showPrivacy">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { loginUser } from '@/utils/user.js'
import { ref } from 'vue'

const username = ref('admin')
const password = ref('admin')
const showPassword = ref(false)
const loading = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!password.value.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await loginUser({
      username: username.value.trim(),
      password: password.value.trim()
    })

    if (result.ok) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        // 根据角色跳转不同页面
        if (result.user.role === 'admin') {
          uni.reLaunch({ url: '/pages/admin/admin' })
        } else {
          uni.switchTab({ url: '/pages/index/index' })
        }
      }, 1000)
    } else {
      uni.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 显示用户协议
const showAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: `用户协议

欢迎使用"什么值得学"小程序

1. 服务说明
"什么值得学"是一个课程推荐平台，我们不制作课程，只推荐优质的第三方课程内容。

2. 使用规范
用户在使用本平台时，应遵守相关法律法规，不得利用本平台从事违法违规活动。

3. 免责声明
本平台展示的课程来自第三方平台，课程质量、售后服务等均由第三方平台负责。

4. 隐私保护
我们尊重并保护用户隐私，不会非法收集用户信息。

5. 版权说明
本平台展示的课程内容版权归课程创作者或相关平台所有。

如有问题，请联系客服。`,
    showCancel: false
  })
}

// 显示隐私政策
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: `隐私政策

我们非常重视您的个人隐私保护。

1. 信息收集
• 微信授权信息：昵称、头像
• 浏览记录：用于个性化推荐
• 收藏记录：用于管理您的收藏

2. 信息使用
• 个性化推荐课程
• 统计和分析（不涉及个人信息）
• 改进服务质量

3. 信息保护
我们采用合理的安全措施保护您的个人信息。

4. 信息共享
未经您同意，我们不会与第三方共享您的个人信息。

5. 联系我们
如对隐私政策有任何疑问，请联系客服。`,
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$orange-gradient: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;

.page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 50%, #F8F5F0 100%);
}

/* Logo 区域 */
.logo-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  background: $orange-gradient;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 53, 0.3);
}

.logo-title {
  font-size: 48rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.logo-slogan {
  font-size: 28rpx;
  color: $text-muted;
}

/* 登录区域 */
.login-section {
  position: relative;
  z-index: 1;
  padding: 60rpx 48rpx 40rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 登录表单 */
.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.form-item__icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.form-item__input {
  flex: 1;
  height: 100rpx;
  font-size: 30rpx;
  color: $text-primary;
}

.input-placeholder {
  color: $text-muted;
  font-size: 28rpx;
}

.form-item__eye {
  font-size: 36rpx;
  padding: 10rpx;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  border: none;
  background: $orange-gradient;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }

  &[disabled] {
    opacity: 0.6;
  }
}

/* 用户协议 */
.agreement {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  flex-wrap: wrap;
  padding: 0 40rpx;
}

.agreement-text {
  font-size: 22rpx;
  color: $text-muted;
}

.agreement-link {
  font-size: 22rpx;
  color: $primary;
}
</style>
