<script setup>
// UniApp 生命周期钩子
const onLaunch = () => {}
const onShow = () => {}
const onHide = () => {}
</script>

<style lang="scss">
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #FFFAF5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 修复iOS上滑动不流畅 */
page, body {
  -webkit-overflow-scrolling: touch;
}

/* 全局链接样式 */
text, view {
  box-sizing: border-box;
}

/* 移除button默认样式 */
button {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  line-height: inherit;
}

button::after {
  border: none;
}
</style>
