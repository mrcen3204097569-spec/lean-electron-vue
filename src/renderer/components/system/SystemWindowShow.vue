<script lang="ts" setup name="SystemWindowShow">
/**
 * 制定 electron 启动后，在什么时间点显示
 */

onMounted(() => {
  window.electronWindowApi?.showMainWindow()
})
</script>

<style scoped lang="scss"></style>
