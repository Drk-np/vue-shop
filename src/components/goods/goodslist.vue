<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card class="box-card">
    <!--    搜索与添加区域-->
    <el-row :gutter="20">
      <el-col :span="7">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getgoodslist">
          <template #append>
            <el-button icon="el-icon-search" @click="getgoodslist"></el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="goAddpage">添加商品</el-button>
      </el-col>
    </el-row>
    <!--表格区域-->
    <el-table :data="goodsList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
      <el-table-column label="商品创建时间" prop="add_time" width="140px"></el-table-column>
      <el-table-column label="操作" width="130px">
        <template v-slot="scope">
          <!--            修改按钮-->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog(scope.row.goods_id)"></el-button>
          <!--            删除按钮-->
          <el-button type="danger" icon="el-icon-delete" size="mini"
                     @click="removeById(scope.row.goods_id)"></el-button>
          <!--            分配权限按钮-->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>

  </el-card>
</template>

<script>
import {dataformat} from '@/common/utils'

export default {
  name: "goodslist",
  data() {
    return {
      goods: '',

      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 产品总数
      total: 0
    }
  },
  created() {
    this.getgoodslist()
  },
  methods: {
    // 获取商品列表
    async getgoodslist() {
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      res.data.goods.forEach(item => {
        item.add_time = item.add_time ? dataformat(item.add_time) : ''
      })
      this.goodsList = res.data.goods
      //   console.log(this.goodsList)
      this.total = res.data.total

      console.log(this.goodsList);
    },
    // 监听pagesizi改变的事件
    handleSizeChange(newsize) {
      // console.log(newsize);
      this.queryInfo.pagesize = newsize
      this.getgoodslist()
    },

    // 监听页码值改变的事件
    handleCurrentChange(newpage) {
      // console.log(newpage);
      this.queryInfo.pagenum = newpage
      this.getgoodslist()
    },
    // 删除商品 并发起网络请求
    async removeById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除当前商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      // console.log(confirmResult);
      // 判断用户是点了确认 还是取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除当前商品失败')

      this.$message.success('删除商品成功')
      this.getgoodslist()
    },
    goAddpage(){
      this.$router.push('/goods/add')
    }
  },
}
</script>

<style scoped>

</style>