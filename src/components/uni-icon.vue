<template>
  <text class="uni-icon" :style="iconStyle" @tap="handleTap">{{ icon }}</text>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Icon name mapping to Unicode characters
  name: {
    type: String,
    required: true,
    validator: (value) => {
      const icons = [
        'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
        'cart', 'user', 'home', 'mall', 'search',
        'check', 'close', 'delete', 'edit', 'add',
        'info', 'alert', 'success', 'message', 'order',
        'address', 'about', 'contact', 'logout', 'login',
        'star', 'heart', 'setting', 'share', 'more'
      ]
      return icons.includes(value)
    }
  },
  size: {
    type: [Number, String],
    default: 32
  },
  color: {
    type: String,
    default: ''
  }
})

// Unicode icon mappings
const iconMap = {
  'arrow-right': '>',  // →
  'arrow-left': '<',   // ←
  'arrow-up': '^',
  'arrow-down': '▼',
  'cart': '🛒',
  'user': '👤',
  'home': '🏠',
  'mall': '🛍️',
  'search': '🔍',
  'check': '✓',
  'close': '✕',
  'delete': '🗑️',
  'edit': '✏️',
  'add': '+',
  'info': 'ℹ',
  'alert': '⚠',
  'success': '✔',
  'message': '💬',
  'order': '📋',
  'address': '📍',
  'about': 'ℹ',
  'contact': '📞',
  'logout': '🚪',
  'login': '🔑',
  'star': '⭐',
  'heart': '❤️',
  'setting': '⚙',
  'share': '📤',
  'more': '⋯'
}

const icon = computed(() => iconMap[props.name] || '?')

const iconStyle = computed(() => {
  const style = {
    fontSize: typeof props.size === 'number' ? `${props.size}rpx` : props.size
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})

const emit = defineEmits(['tap'])

const handleTap = (e) => {
  emit('tap', e)
}
</script>

<style scoped>
.uni-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
}
</style>
