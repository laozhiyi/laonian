<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar__title">橘上生香</view>
    </view>

    <!-- 滚动内容区 -->
    <scroll-view class="scroll" :style="scrollStyle" scroll-y>
      <!-- 轮播图 -->
      <view class="section banner-section">
        <swiper class="banner" circular autoplay :interval="4000" :duration="500">
          <swiper-item v-for="item in bannerList" :key="item.id">
            <image class="banner__img" :src="item.url" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>

      <!-- 品牌故事 -->
      <view class="section brand-section">
        <view class="brand-card">
          <view class="brand-card__header">
            <text class="brand-card__icon">🍊</text>
            <text class="brand-card__title">品牌故事</text>
          </view>
          <view class="brand-card__content">
            <text class="brand-card__desc">
              橘上生香，源于对自然的热爱与对农产品的执着。我们致力于将优质柑橘产品带给每一位用户，每一份产品都承载着果农的辛勤与希望。
            </text>
          </view>
          <view class="brand-card__stats">
            <view class="stat">
              <text class="stat__value">500+</text>
              <text class="stat__label">合作果农</text>
            </view>
            <view class="stat">
              <text class="stat__value">10万+</text>
              <text class="stat__label">用户好评</text>
            </view>
            <view class="stat">
              <text class="stat__value">30+</text>
              <text class="stat__label">产品种类</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 产品特色 -->
      <view class="section feature-section">
        <view class="section-header">
          <text class="section-header__icon">✨</text>
          <text class="section-header__title">产品特色</text>
        </view>
        <view class="feature-list">
          <view class="feature-item">
            <view class="feature-item__icon">🌿</view>
            <view class="feature-item__content">
              <view class="feature-item__title">生态种植</view>
              <view class="feature-item__desc">天然有机肥料，远离农药残留</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-item__icon">🚜</view>
            <view class="feature-item__content">
              <view class="feature-item__title">产地直供</view>
              <view class="feature-item__desc">从果园到餐桌，新鲜直达</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-item__icon">📦</view>
            <view class="feature-item__content">
              <view class="feature-item__title">严格品控</view>
              <view class="feature-item__desc">人工筛选，颗颗精品</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-item__icon">💚</view>
            <view class="feature-item__content">
              <view class="feature-item__title">助农公益</view>
              <view class="feature-item__desc">每单捐赠，支持乡村振兴</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 品质保证 -->
      <view class="section quality-section">
        <view class="quality-card">
          <view class="quality-card__header">
            <text class="quality-card__icon">🛡️</text>
            <text class="quality-card__title">品质保证</text>
          </view>
          <view class="quality-card__grid">
            <view class="quality-item">
              <text class="quality-item__icon">🔍</text>
              <text class="quality-item__text">7天无理由退货</text>
            </view>
            <view class="quality-item">
              <text class="quality-item__icon">📱</text>
              <text class="quality-item__text">24小时客服</text>
            </view>
            <view class="quality-item">
              <text class="quality-item__icon">🚚</text>
              <text class="quality-item__text">48小时发货</text>
            </view>
            <view class="quality-item">
              <text class="quality-item__icon">💰</text>
              <text class="quality-item__text">破损必赔</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 品类推荐 -->
      <view class="section category-section">
        <view class="section-header">
          <text class="section-header__icon">🎁</text>
          <text class="section-header__title">精选品类</text>
        </view>
        <view class="category-list">
          <view class="category-item">
            <view class="category-item__icon">🍊</view>
            <text class="category-item__name">新鲜水果</text>
          </view>
          <view class="category-item">
            <view class="category-item__icon">🌰</view>
            <text class="category-item__name">干货坚果</text>
          </view>
          <view class="category-item">
            <view class="category-item__icon">🍯</view>
            <text class="category-item__name">蜂蜜茶饮</text>
          </view>
          <view class="category-item">
            <view class="category-item__icon">🎨</view>
            <text class="category-item__name">手工制品</text>
          </view>
        </view>
      </view>

      <!-- 关于我们 -->
      <view class="section about-section">
        <view class="about-card">
          <view class="about-card__header">
            <text class="about-card__icon">📖</text>
            <text class="about-card__title">关于我们</text>
          </view>
          <view class="about-card__content">
            <text class="about-card__desc">
              橘上生香是一家专注于优质农产品电商平台，我们与全国500+优质果农建立直供合作关系，从源头把控品质，让每一位消费者都能享受到新鲜、美味、健康的农产品。
            </text>
          </view>
          <view class="about-card__contact">
            <view class="contact-item">
              <text class="contact-item__icon">📍</text>
              <text class="contact-item__text">广西·桂林</text>
            </view>
            <view class="contact-item">
              <text class="contact-item__icon">📞</text>
              <text class="contact-item__text">400-888-8888</text>
            </view>
            <view class="contact-item">
              <text class="contact-item__icon">📧</text>
              <text class="contact-item__text">service@jushengxiang.com</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

// ========== 状态栏高度 ==========
const statusBarHeight = ref(0)
const navbarHeight = ref(88)

// ========== 滚动区域样式 ==========
const scrollStyle = computed(() => ({
  paddingTop: navbarHeight.value + 'px',
  height: 'calc(100vh - ' + (88 + uni.getSystemInfoSync().safeAreaInsets?.bottom || 0) + 'rpx)',
}))

// ========== 轮播图数据 ==========
const bannerList = ref([
  {
    id: 'b1',
    url: 'https://ai-public.mastergo.com/ai/img_res/d75a41382e8c11369027b0b72c12194c.jpg',
  },
  {
    id: 'b2',
    url: 'https://ai-public.mastergo.com/ai/img_res/676ebc08f9cd6f6157b4ab4bf3191e00.jpg',
  },
])

// ========== 生命周期 ==========
onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 0
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
  color: $text;
}

/* 顶部导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 4rpx 20rpx rgba(255, 144, 0, 0.2);
}

.navbar__title {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

/* 滚动区域 */
.scroll {
  width: 100%;
}

.section {
  padding: 0 24rpx;
}

/* 区块标题通用 */
.section-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 32rpx 0 24rpx;
}

.section-header__icon {
  font-size: 36rpx;
}

.section-header__title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
}

/* 轮播图 */
.banner-section {
  padding-top: 24rpx;
}

.banner {
  height: 340rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(255, 144, 0, 0.15);
}

.banner__img {
  width: 100%;
  height: 100%;
}

/* 品牌故事 */
.brand-section {
  padding: 28rpx 24rpx 32rpx;
}

.brand-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
}

.brand-card__header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.brand-card__icon {
  font-size: 44rpx;
}

.brand-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
  position: relative;
}

.brand-card__title::after {
  content: '';
  position: absolute;
  bottom: -4rpx;
  left: 0;
  width: 60rpx;
  height: 6rpx;
  background: linear-gradient(90deg, $primary, $primary-light);
  border-radius: 3rpx;
}

.brand-card__content {
  margin-bottom: 28rpx;
}

.brand-card__desc {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.8;
}

.brand-card__stats {
  display: flex;
  justify-content: space-around;
  padding-top: 28rpx;
  border-top: 1rpx solid #f5f5f5;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat__value {
  font-size: 36rpx;
  font-weight: 700;
  background: linear-gradient(135deg, $primary, $primary-light);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8rpx;
}

.stat__label {
  font-size: 22rpx;
  color: $sub;
}

/* 产品特色 */
.feature-section {
  padding-bottom: 8rpx;
}

.feature-list {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item__icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.feature-item__content {
  flex: 1;
}

.feature-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
  margin-bottom: 6rpx;
}

.feature-item__desc {
  font-size: 22rpx;
  color: $sub;
}

/* 品质保证 */
.quality-section {
  padding: 20rpx 24rpx 32rpx;
}

.quality-card {
  background: linear-gradient(135deg, #fff, rgba(255, 144, 0, 0.05));
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
}

.quality-card__header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.quality-card__icon {
  font-size: 40rpx;
}

.quality-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
}

.quality-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.quality-item__icon {
  font-size: 32rpx;
}

.quality-item__text {
  font-size: 24rpx;
  color: $text;
}

/* 品类推荐 */
.category-section {
  padding-bottom: 8rpx;
}

.category-list {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-item__icon {
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, rgba(255, 144, 0, 0.1), rgba(255, 179, 71, 0.15));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.category-item__name {
  font-size: 22rpx;
  color: $text;
}

/* 关于我们 */
.about-section {
  padding: 20rpx 24rpx 32rpx;
}

.about-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 144, 0, 0.1);
}

.about-card__header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.about-card__icon {
  font-size: 40rpx;
}

.about-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
}

.about-card__content {
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.about-card__desc {
  font-size: 26rpx;
  color: $sub;
  line-height: 1.8;
}

.about-card__contact {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.contact-item__icon {
  font-size: 28rpx;
}

.contact-item__text {
  font-size: 24rpx;
  color: $text;
}

/* 底部安全区 */
.bottom-safe {
  height: 140rpx;
}
</style>
