<template>
<div>
<el-button @click="logout"> 退出</el-button>
</div>
</template>

<script>
export default {
  name: "Home",
  methods:{
    logout(){
      // 清除sessionStorage 并重定向到登录页面
      window.sessionStorage.removeItem('token')
      this.$message.success('已成功退出登录')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>

</style>