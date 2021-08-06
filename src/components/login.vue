<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avatar-box">
        <img src="../assets/logo.png" alt=""/>
      </div>
      <el-form ref="ruleForm" class="login-form" :rules="loginFormRules" label-width="0px" :model="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="icon-user iconfont"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="icon-3702mima iconfont"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="resetForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFormRules: {
        // 用户名验证规则
        username: [{required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur'}],
        // 密码验证规则
        password: [{required: true, message: '请输入登录密码', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}]
      }
    }
  },
  methods: {
    //重置表单内容
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    login() {
      // 表单预验证 是否符合规则
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('login', this.loginForm)
        // console.log(res);
        // 根据返回状态显示不同提示弹窗
        if (res.meta.status !== 200) return this.$message.error('登陆失败，请输入正确的用户名或密码')
        this.$message.success('登陆成功');
        // 保存token在sessionStorage
        window.sessionStorage.removeItem('activePath')
        window.sessionStorage.setItem('token',res.data.token)
        // 切换路由到home
        this.$router.push('/home')
      });
    },
  },
}
</script>

<style scoped lang="less">
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);

  .avatar-box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login-form {
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}

.el-form-item .btns {
  display: flex;
  justify-content: flex-end;
}
</style>