<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card class="box-card">
    <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false">
    </el-alert>

    <el-row>
      <el-col>
        <span>选择商品分类: <el-cascader
            v-model="selectCateList"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
            clearable
            placeholder="选择商品分类"></el-cascader>
        </span>
      </el-col>
    </el-row>

    <el-tabs v-model="activeName" @tab-click="handleClick">

      <!--      添加动态参数面板-->
      <el-tab-pane label="动态参数" name="many">
        <el-row>
          <el-col>
            <el-button type="primary" @click="addCateDialog" size="mini" :disabled="isBtnDisanled">添加参数</el-button>
          </el-col>
        </el-row>

        <!--        动态参数表格-->
        <el-table :data="manyTableData" border stripe>

          <!--          展开行-->

          <el-table-column type="expand">
            <template v-slot="scope">
              <el-tag v-for="(item, index) in scope.row.attr_vals"
                      :key="index"
                      closable
                      :disable-transitions="false"
                      @close="handleClosed(index,scope.row)">{{ item }}
              </el-tag>
              <el-input class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="mini"

                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
              </el-input>
              <el-button v-else class="button-new-tag" size="mini" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>

          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditDialog(scope.row.attr_id)">修改
              </el-button>
              <!--            删除按钮-->
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>


      </el-tab-pane>
      <!--      添加静态属性面板-->
      <el-tab-pane label="静态属性" name="only">
        <el-row>
          <el-col>
            <el-button type="primary" @click="addCateDialog" size="mini" :disabled="isBtnDisanled">添加属性</el-button>
          </el-col>
        </el-row>

        <!--        静态参数表格-->

        <el-table :data="onlyTableData" border stripe>
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-tag v-for="(item, index) in scope.row.attr_vals"
                      :key="index"
                      closable
                      :disable-transitions="false"
                      @close="handleClosed(index,scope.row)">{{ item }}
              </el-tag>
              <el-input class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="mini"

                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
              </el-input>
              <el-button v-else class="button-new-tag" size="mini" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>

          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditDialog(scope.row.attr_id)">修改
              </el-button>
              <!--            删除按钮-->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
    </el-tabs>

  </el-card>

  <!--  公用的对话框-->
  <el-dialog
      :title="'添加'+titleText"
      v-model="addDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="addDialogClosed">
    <!--      内容主体区域-->
    <el-form ref="addCateFormRef" :model="addForm" :rules="addFormRules" label-width="100px" size="mini">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="addForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <!--        按钮区域-->
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addparams">确 定</el-button>
        </span>
    </template>
  </el-dialog>


  <!--  修改对话框-->
  <el-dialog
      :title="'修改'+titleText"
      v-model="editDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="editDialogClosed">
    <!--      内容主体区域-->
    <el-form ref="editCateFormRef" :model="editForm" :rules="editFormRules" label-width="100px" size="mini">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="editForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <!--        按钮区域-->
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editparams">确 定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "params",
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectCateList: [],
      // 默认选择的标签页
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 是否显示添加参数的对话框
      addDialogVisible: false,
      editDialogVisible: false,

      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_name: ''
      },

      // 添加表单的验证规则数据对象
      addFormRules: {
        attr_name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'},
        ]
      },
      editFormRules: {
        attr_name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'},
        ]
      },
    }
  },
  created() {
    this.getcatelist()
  },
  methods: {
    // 获取商品分类列表
    async getcatelist() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.catelist = res.data
      this.total = res.data.total
      // console.log(this.total);
      // console.log(this.catelist);
    },

    //级联选择框选中项变化，会触发这个函数
    handleChange() {
      this.getparamsData()
    },

    // 点击标签页会触发的函数
    handleClick() {
      this.getparamsData()
    },

    // 封装成一个函数
    async getparamsData() {
      if (this.selectCateList.length !== 3) {
        this.selectCateList = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')

      // 将返回值中的字符串分割成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        // 文本框的输入的值
        item.inputValue = '';
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      }
      this.onlyTableData = res.data
      console.log(this.manyTableData);

    },
    addCateDialog() {
      this.addDialogVisible = true
    },
    addDialogClosed() {

      this.$refs.addCateFormRef.resetFields()
      this.addDialogVisible = false
    },
    editDialogClosed() {
      //重置修改的表单
      this.$refs.editCateFormRef.resetFields()
      this.editDialogVisible = false
    },
    //点击添加用户对话框的外侧触发的函数
    handleClose(done) {
      this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    },
    // 添加参数 动态参数 或者静态参数
    addparams() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post
        (`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        // console.log(res);
        // 根据返回状态显示不同提示弹窗
        if (res.meta.status !== 201) return this.$message.error('添加动态参数或者静态参数失败')
        this.$message.success('添加参数成功')
        this.getparamsData()
        this.addDialogVisible = false
      });
    },

    // 编辑当前参数信息
    editparams() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        })
        // console.log(res);
        // 根据返回状态显示不同提示弹窗
        if (res.meta.status !== 200) return this.$message.error('修改动态参数或者静态参数失败')
        this.$message.success('修改参数成功')
        this.getparamsData()
        this.editDialogVisible = false
      });
    },

    // 查询当前参数信息
    async showeditDialog(attr_id) {
      const {data: res} = await this.$http.get
      (`categories/${this.cateId}/attributes/${attr_id}`,
          {
            params: {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }
          })
      if (res.meta.status !== 200) return this.$message.error('查询当前参数信息失败')
      this.editForm = res.data
      this.attr_id = attr_id
      this.editDialogVisible = true
    },


    // 点击删除参数信息
    async removeParams(attr_id) {

      const confirmResult = await this.$confirm('此操作将永久删除当前参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      // console.log(confirmResult);
      // 判断用户是点了确认 还是取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const {data: res} = await this.$http.delete
      (`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除当前参数信息失败')
      this.getparamsData()
      this.$message.success('已成功删除当前参数信息')

    },
    // 文本框失去焦点 或者摁下enter都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = '';
      row.inputVisible = false;
      // 发起请求保存本次操作


      this.saveAttrVals(row)

    },

    // 将对attr_vals（Tag） 的操作 保存到数据库
    async saveAttrVals(row) {
      const {data: res} = await this.$http.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },

    // 点击吧输入框显示出来
    showInput(row) {
      row.inputVisible = true;
    },


    // 删除对应的参数可选项
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {

    // 如果按钮需要北京用 则返回true 否则返回false
    isBtnDisanled() {
      if (this.selectCateList.length !== 3) {
        return true
      }
      return false
    },
    //当前选中的三级分类的id
    cateId() {
      if (this.selectCateList.length === 3) {
        return this.selectCateList[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  }
}
</script>

<style scoped>
.el-tabs {
  margin-top: 15px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 130px;

}

.el-alert {
  margin-bottom: 15px;
}
</style>