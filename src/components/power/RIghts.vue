<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card class="box-card">
    <!-- 权限列表区域-->
    <el-table :data="rightslist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="权限名称" prop="authName"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="权限等级" prop="level">
        <template v-slot="scope">
          <el-tag v-if="scope.row.level ==='0'">一级</el-tag>
           <el-tag v-else-if= "scope.row.level ==='1'" type="success">二级</el-tag>
           <el-tag v-else type="warning">三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  name: "RIghts",
  data(){
    return{
      rightslist:[]
    }
  },
  created() {
       this.getrightslist()
  },
  methods:{
     async getrightslist(){
      const {data: res} = await this.$http.get('rights/list')
       console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取用户权限列表失败')
      this.rightslist = res.data


     }
  }
}
</script>

<style scoped>

</style>