<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>

  <!--  卡片区域-->
  <el-card class="box-card">
    <el-row>
      <el-col>
        <el-button type="primary" @click="addCateDialog">添加分类</el-button>
      </el-col>
    </el-row>

    <el-table :data="catelist" border stripe row-key="cat_id"
              :tree-props="{children: 'children'}">
      <el-table-column type="index"
                       ></el-table-column>
      <el-table-column label="分类名称"
                       prop="cat_name">
      </el-table-column>
      <el-table-column label="是否有效" prop="cat_deleted">

        <!--        是否有效模板-->
        <template v-slot="isok">
          <i v-if="isok.row.cat_deleted===false" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="cat_level">
        <!--        排序模板-->
        <template v-slot="order">
          <el-tag v-if="order.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="order.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px">
        <template v-slot="scope">
          <!--            修改按钮-->
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!--            删除按钮-->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--页码区域-->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
  </el-card>


  <!--  添加分类的对话框-->
  <el-dialog
      title="添加分类"
      v-model="addCateDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="editDialogClosed">

    <!--      内容主体区域-->

    <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="100px" size="mini">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="editCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <!--        该:options 绑定数据源-->
        <!--        该:props 用于指定配置对象-->

        <el-cascader
            v-model="selectCateList"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            placeholder="请选择父级分类"
        ></el-cascader>
      </el-form-item>
    </el-form>
    <!--        按钮区域-->
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCateDialog">确 定</el-button>
        </span>
    </template>
  </el-dialog>

</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 是否显示添加分类对话框
      addCateDialogVisible: false,

      // 添加分类的表单数据对象
      editCateForm: {
        cat_name: '',
        cat_pid: 0,

        // 默认添加的分类是一级分类
        cat_level: 0
      },
      // 添加分类的表单数据验证规则对象
      editCateFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
      },
      // 获取的父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 被选中的级联选择器结果对象
      selectCateList: [],
    }
  },
  created() {
    this.getcatelist()
  }
  ,
  methods: {
    // 获取商品分类列表
    async getcatelist() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.catelist = res.data.result
      this.total = res.data.total
      // console.log(this.total);
      console.log(this.catelist);
    }
    ,
    // 监听pagesizi改变的事件
    handleSizeChange(newsize) {
      // console.log(newsize);
      this.queryInfo.pagesize = newsize
      this.getcatelist()
    }
    ,

    // 监听页码值改变的事件
    handleCurrentChange(newpage) {
      // console.log(newpage);
      this.queryInfo.pagenum = newpage
      this.getcatelist()
    }
    ,
    // 控制是否显示添加分类的对话框
    addCateDialog() {
      this.getParentCateList()

      this.addCateDialogVisible = true
      // console.log(this.selectCateList);
    },

    // 添加分类 先预验证 然后再发送网络请求
    saveCateDialog() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('categories', this.editCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        // console.log(this.editCateForm);
        this.addCateDialogVisible = false
        this.getcatelist()
        this.$message.success('添加分类成功')
      })

    }
    ,
    //点击添加用户对话框的外侧触发的函数
    handleClose(done) {
      this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    }
    ,
    // 点击添加用户对话框关闭的时候触发
    editDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.selectCateList = []
      this.editCateForm.cat_pid = 0
      this.editCateForm.cat_level = 0
    }
    ,

    // 获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if (res.meta.status !== 200) return this.$message.error('获取父级分类的数据列表失败')
      console.log(res.data);
      this.parentCateList = res.data
    }
    ,

    // 选择项发生变化是触发
    parentCateChange() {
      console.log(this.selectCateList);

      if (this.selectCateList.length > 0) {
        // 父级分类的等级
        this.editCateForm.cat_pid = this.selectCateList[this.selectCateList.length - 1]
        this.editCateForm.cat_level = this.selectCateList.length
      } else {
        this.editCateForm.cat_pid = 0
        this.editCateForm.cat_level = 0
      }
    },
  },
}
</script>

<style scoped>

</style>