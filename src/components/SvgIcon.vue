<!-- SVG图标组件 -->
<template>
  <image
    v-if="isMp"
    :src="svgToPng(src)"
    :mode="mode"
    :style="iconStyle"
    class="svg-icon"
  />
  <view
    v-else
    :class="['svg-icon', customClass]"
    :style="iconStyle"
    v-html="svgCache[src] || ''"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  size: { type: [Number, String], default: 32 },
  color: { type: String, default: '' },
  mode: { type: String, default: 'aspectFit' },
  customClass: { type: String, default: '' }
})

// SVG缓存
const svgCache = ref({})

// 判断是否为小程序环境
const isMp = computed(() => {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifdef H5
  return false
  // #endif
  return false
})

// 样式
const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}rpx` : props.size
  return {
    width: size,
    height: size,
    ...(props.color ? { color: props.color } : {})
  }
})

// 预定义的SVG图标（Base64 PNG格式）
const svgToPng = (src) => {
  // 这里返回一个占位图片，实际使用时需要替换为真实的PNG路径
  // 用户可以将对应的PNG图片放到static/icons/目录下
  return `/static/icons/${src}.png`
}

// 常用图标SVG代码缓存
onMounted(() => {
  // #ifdef H5
  // H5环境直接使用内联SVG
  // #endif
})

// 导出图标路径映射
export const iconPaths = {
  // 购物相关
  cart: '/static/icons/cart.png',
  add: '/static/icons/add.png',
  minus: '/static/icons/minus.png',

  // 箭头相关
  back: '/static/icons/back.png',
  right: '/static/icons/right.png',
  down: '/static/icons/down.png',

  // 状态相关
  check: '/static/icons/check.png',
  uncheck: '/static/icons/uncheck.png',
  success: '/static/icons/success.png',
  warning: '/static/icons/warning.png',
  error: '/static/icons/error.png',

  // 编辑相关
  edit: '/static/icons/edit.png',
  delete: '/static/icons/delete.png',

  // 地址相关
  location: '/static/icons/location.png',
  home: '/static/icons/home.png',
  company: '/static/icons/company.png',

  // 订单相关
  order: '/static/icons/order.png',
  paid: '/static/icons/paid.png',
  shipped: '/static/icons/shipped.png',
  completed: '/static/icons/completed.png',
  refunded: '/static/icons/refunded.png',

  // 其他
  more: '/static/icons/more.png',
  close: '/static/icons/close.png',
  refresh: '/static/icons/refresh.png',
}

export default {
  iconPaths
}
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
