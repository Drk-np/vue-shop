<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card class="box-card">
    <!--    搜索与添加区域-->
    <el-row :gutter="20">
      <el-col :span="7">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserlist">
          <template #append>
            <el-button icon="el-icon-search" @click="getUserlist"></el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <!--    用户列表区域-->
    <el-table :data="userlist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="姓名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" prop="mg_state">
        <!--          v-slot="scope"  scope.row可以获取相应行数据-->
        <template v-slot="scope">
          <el-switch v-model="scope.row.mg_state" @change="userstatechanged(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template v-slot="scope">
          <!--            修改按钮-->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!--            删除按钮-->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <!--            分配权限按钮-->
          <el-tooltip content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="SetRoleDialog(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--    分页区域-->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>


    <!--    添加用户的对话框-->
    <el-dialog
        title="添加用户"
        v-model="dialogVisible"
        width="50%"
        :before-close="handleClose"
        @close="addDialogClosed">

      <!--      内容主体区域-->

      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px" size="mini">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密  码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮  箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手  机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!--        按钮区域-->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>


    <!--    修改用户的对话框-->

    <el-dialog
        title="修改用户"
        v-model="editDialogVisible"
        width="50%"
        :before-close="handleClose"
        @close="editDialogClosed">

      <!--      内容主体区域-->

      <el-form ref="editForm" :model="editForm" :rules="addFormRules" label-width="70px" size="mini">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮  箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手  机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--        按钮区域-->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="changeuser">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!--    分配角色对话框-->

    <el-dialog title="分配角色" v-model="SetRoleDialogVisible" width="50%"
               :before-close="handleClose">
      <!--      内容部分-->

      <div>
        <p>当前用户: {{ userInfo.username }}</p>
        <p>当前角色: {{ userInfo.role_name }}</p>
        <p>分配新角色: <el-select v-model="selectedvalueId" placeholder="请选择角色">
          <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
          </el-option>
        </el-select></p>

      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="SetRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>


  </el-card>

</template>

<script>
export default {
  name: "Users",
  data() {
    // email的验证规则  el中的input中的验证规则用法
    var checkEmail = (rule, value, cb) => {

      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^1[34578]\d{9}$/

      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      userlist: [],
      total: 0,

      // 对当前被选择的用户信息
      userInfo: {},

      // 控制添加用户对话框的显示与隐藏
      dialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制修改用户角色对话框的显示与隐藏
      SetRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },

      //查询到的用户信息
      editForm: {},
      // 查询到的角色列表
      rolesList: [],
      // 选择的角色ID
      selectedvalueId: '',

      // 表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ],

        // 自定义验证规则
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ],
      }
    }
  },
  created() {
    this.getUserlist()
  },
  methods: {
    // 获取用户列表
    async getUserlist() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(this.userlist);
    },
    // 监听pagesizi改变的事件
    handleSizeChange(newsize) {
      // console.log(newsize);
      this.queryInfo.pagesize = newsize
      this.getUserlist()
    },

    // 监听页码值改变的事件
    handleCurrentChange(newpage) {
      // console.log(newpage);
      this.queryInfo.pagenum = newpage
      this.getUserlist()
    },

    // 监听swich开关状态的改变
    async userstatechanged(userinfo) {
      const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
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
    //监听添加用户对话框关闭事件 关闭后重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //监听修改用户对话框关闭事件 关闭后重置表单
    editDialogClosed() {
      this.$refs.editForm.resetFields();
    },

    // 点击按钮添加新用户
    addUser() {
      // 先验证是否符合规则 再发起网络请求
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 添加成功后关闭对话框
        this.dialogVisible = false
        //重新获取列表数据
        this.getUserlist()
      })
    },

    // 展示用户编辑的对话框
    async showEditDialog(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 修改用户 并提交
    async changeuser() {
      this.$refs.editForm.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const {data: res} = await this.$http.put('users/' + this.editForm.id, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 添加成功后关闭对话框
        this.editDialogVisible = false
        //重新获取列表数据
        this.getUserlist()
        this.$message.success('修改用户成功')
      })
    },

    // 根据id删除对应的用户信息
    async removeUserById(id) {
      // console.log(id);
      //弹窗询问客户是否需要删除  这是饿了么组件
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      // console.log(confirmResult);
      // 判断用户是点了确认 还是取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const {data: res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.getUserlist()
      this.$message.success('已经成功删除')
    },

    // 分配角色权限对话框

    async SetRoleDialog(userInfo) {
      // 展示对话框之前，获取所有的角色列表
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取所有的角色列表失败')

      this.rolesList = res.data
      this.userInfo = []
      this.userInfo = userInfo
      this.SetRoleDialogVisible = true
    },

    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedvalueId) return this.$message.error('当前没有选择角色，请重新选择角色')
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedvalueId})
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')

      this.SetRoleDialogVisible = false
      this.getUserlist()
      this.selectedvalueId=''
      this.$message.success('已经成功分配角色')
    }

  }
}
</script>

<style scoped>

</style>