<template>
  <el-container class="home-container">
    <el-header>
      <div class="home-header">
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="logout"> 退出</el-button>
    </el-header>
    <el-container>

      <!--      侧边栏宽度动态宽度-->
      <el-aside :width="isCollpase ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
            unique-opened
            :collapse="isCollpase"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath" >
          <!--          一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!--            一级菜单的模板区-->
            <template #title>
              <!--              一级菜单图标-->
              <i :class="iconobj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="'/'+childrenitem.path+''"
                          v-for="childrenitem in item.children"
                          :key="item.id"
            @click="saveNavState('/'+childrenitem.path)">
              <i class="el-icon-menu"></i>
              <span>{{ childrenitem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!--        路由站位-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: "Home",
  data() {
    return {
      menulist: [],
      iconobj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollpase: false,
      //当前被点击的路由
      activePath:''
    }
  },
  created(){
    this.getMenulist()
    // console.log('1561');
    this.activePath = window.sessionStorage.getItem('activePath')
    // console.log(this.activePath);
  },
  methods: {
    logout() {
      // 清除sessionStorage 并重定向到登录页面
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('activePath')
      this.$message.success('已成功退出登录')
      this.$router.push('/login')
    },


    //获取左侧侧边栏的数据内容 并赋值给menulist
    async getMenulist() {
      const {data: res} = await this.$http.get('menus')
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log('menulist', this.menulist);
    },

    //点击折叠或者展开
    toggleCollapse() {
      this.isCollpase = !this.isCollpase
    },
    //保存当前被点击的对象
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped lang="less">
.home-container {
  height: 100%;
}

.home-header {
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 15px;
    background-color: #0086b3;
  }

  color: #fff;
  font-size: 20px;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #E9EDF1;
}

.iconfont {
  margin-right: 10px;
}

.el-menu {
  border-right: 0;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>