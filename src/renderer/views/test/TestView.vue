<template>
  <div>
    test组件test组件test组件test组件test组件

    <el-button @click="back">返回</el-button>
  </div>
</template>

<script lang="ts" setup name="TestView">
const router = useRouter()
const back = () => {
  router.back()
}
</script>

<style scoped lang="scss"></style>
