<template>
  <view class="page">
    <!-- 毛玻璃导航 -->
    <view class="glass-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + navHeight) + 'px' }">
      <view class="glass-nav__back" @tap="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="glass-nav__title">联系我们</text>
      <view class="glass-nav__placeholder" />
    </view>

    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 联系我们卡片 -->
      <view class="contact-card">
        <text class="contact-icon">📞</text>
        <text class="contact-title">什么值得学</text>
        <text class="contact-subtitle">终身学习，值得投资</text>
      </view>

      <!-- 联系方式 -->
      <view class="contact-list">
        <view class="section-title">联系方式</view>

        <view class="contact-item">
          <view class="contact-item__icon">💬</view>
          <view class="contact-item__info">
            <text class="contact-item__label">微信客服</text>
            <text class="contact-item__value">smz_service</text>
          </view>
          <view class="contact-item__action" @tap="copyText('smz_service')">
            <text>复制</text>
          </view>
        </view>

        <view class="contact-item">
          <view class="contact-item__icon">📧</view>
          <view class="contact-item__info">
            <text class="contact-item__label">邮箱地址</text>
            <text class="contact-item__value">service@smzlearning.com</text>
          </view>
          <view class="contact-item__action" @tap="copyText('service@smzlearning.com')">
            <text>复制</text>
          </view>
        </view>

        <view class="contact-item">
          <view class="contact-item__icon">⏰</view>
          <view class="contact-item__info">
            <text class="contact-item__label">服务时间</text>
            <text class="contact-item__value">周一至周五 9:00-18:00</text>
          </view>
        </view>
      </view>

      <!-- 常见问题 -->
      <view class="faq-section">
        <view class="section-title">常见问题</view>

        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @tap="toggleFaq(index)">
          <view class="faq-question">
            <text class="faq-q-text">{{ item.q }}</text>
            <text class="faq-arrow" :class="{ open: openFaqIndex === index }">›</text>
          </view>
          <view class="faq-answer" v-if="openFaqIndex === index">
            <text>{{ item.a }}</text>
          </view>
        </view>
      </view>

      <!-- 意见反馈 -->
      <view class="feedback-section">
        <view class="section-title">意见反馈</view>
        <view class="feedback-form">
          <textarea
            class="feedback-textarea"
            v-model="feedbackContent"
            placeholder="请输入您的意见或建议..."
            maxlength="500"
          />
          <view class="feedback-footer">
            <text class="feedback-count">{{ feedbackContent.length }}/500</text>
            <view class="feedback-submit" @tap="submitFeedback">
              <text>提交反馈</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const statusBarHeight = ref(0)
const navHeight = ref(88)
const feedbackContent = ref('')
const openFaqIndex = ref(null)

const scrollStyle = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom || 0
  const totalTop = statusBarHeight.value + navHeight.value
  return {
    paddingTop: totalTop + 'px',
    height: `calc(100vh - ${totalTop}px - ${safeBottom}px)`,
  }
})

const faqList = [
  {
    q: '购课过程中遇到问题怎么办？',
    a: '请通过微信客服或邮箱联系我们，我们会尽快为您处理。也可在意见反馈中详细描述您遇到的问题。'
  },
  {
    q: '课程价格可以优惠吗？',
    a: '课程价格由第三方平台制定，本平台不参与定价。建议关注平台方是否有优惠活动。'
  },
  {
    q: '如何申请成为推广员？',
    a: '目前推广员功能正在建设中，敬请期待。后续可在个人中心查看相关入口。'
  },
  {
    q: '课程购买后在哪里学习？',
    a: '课程购买后，请在课程所属第三方平台（如得到、小鹅通等）登录您的账号即可开始学习。'
  },
  {
    q: '可以开发票吗？',
    a: '发票由课程所属第三方平台开具，具体发票政策请咨询对应平台的客服。'
  }
]

const goBack = () => {
  uni.navigateBack()
}

const toggleFaq = (index) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const copyText = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

const submitFeedback = () => {
  if (!feedbackContent.value.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }
  uni.showToast({ title: '反馈已提交，感谢您的建议', icon: 'success' })
  feedbackContent.value = ''
}

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
})
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$primary-light: #FF9F5A;
$secondary: #4ECDC4;
$text-primary: #1A1A1A;
$text-secondary: #5A5A5A;
$text-muted: #999999;
$bg-light: #F8F5F0;

.page {
  min-height: 100vh;
  background: $bg-light;
}

.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.88);
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
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { opacity: 0.7; }

  .back-arrow {
    font-size: 48rpx;
    font-weight: 300;
    color: $text-primary;
  }
}

.glass-nav__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.glass-nav__placeholder {
  width: 64rpx;
}

.scroll {
  position: relative;
  z-index: 1;
}

/* 联系我们卡片 */
.contact-card {
  background: linear-gradient(135deg, $primary 0%, #FF8E53 50%, $primary-light 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .contact-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .contact-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12rpx;
  }

  .contact-subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

/* 联系方式列表 */
.contact-list {
  padding: 0 24rpx 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.contact-item__icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.contact-item__info {
  flex: 1;
}

.contact-item__label {
  display: block;
  font-size: 24rpx;
  color: $text-muted;
  margin-bottom: 6rpx;
}

.contact-item__value {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.contact-item__action {
  padding: 10rpx 28rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    opacity: 0.8;
    transform: scale(0.96);
  }
}

/* 常见问题 */
.faq-section {
  padding: 0 24rpx 20rpx;
}

.faq-item {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
}

.faq-q-text {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  flex: 1;
}

.faq-arrow {
  font-size: 40rpx;
  color: $text-muted;
  transition: transform 0.3s;

  &.open {
    transform: rotate(90deg);
  }
}

.faq-answer {
  padding: 0 24rpx 28rpx;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
  border-top: 1rpx solid #f5f5f5;
  padding-top: 20rpx;
}

/* 意见反馈 */
.feedback-section {
  padding: 0 24rpx 20rpx;
}

.feedback-form {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.feedback-textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
}

.feedback-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.feedback-count {
  font-size: 24rpx;
  color: $text-muted;
}

.feedback-submit {
  padding: 14rpx 36rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  border-radius: 24rpx;

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}

.bottom-spacer {
  height: 60rpx;
}
</style>
