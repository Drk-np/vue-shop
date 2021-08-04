<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色管理</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card class="box-card">
    <el-row>
      <el-col>
        <el-button type="primary">添加角色</el-button>
      </el-col>
    </el-row>
    <el-table :data="roleslist" border stripe>
      <!--      可以展开的按钮 type="expand"-->
      <el-table-column type="expand">
        <template v-slot="scope">
          <el-row :class="['bdbottom',index === 0 ? 'bdtop':'','vcenter']" v-for="(item1,index) in scope.row.children"
                  :key="item1.id">
            <!--            渲染一级权限-->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!--            渲染二级权限-->
            <el-col :span="19">
              <el-row :class="[index === 0 ? '':'bdtop','vcenter']" v-for="(item2,index) in item1.children"
                      :key="item2.id">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}
                  </el-tag>
                </el-col>
                <el-col :span="18">
                  <el-tag @close="removeRightById(scope.row,item3.id)" closable type="warning"
                          v-for="(item3,index) in item2.children" :key="index">{{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300px">
        <template v-slot="scope">
          <!--            修改按钮-->
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!--            删除按钮-->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          <!--            分配权限按钮-->
          <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分配权限对话框-->
    <el-dialog title="分配权限" v-model="SetRightDialogVisible" width="50%" :before-close="handleClose">
      <!--      内容部分-->


      <!--      树形组件-->
      <el-tree
          :data="rightslist"
          :props="rightsprops"
          show-checkbox
          default-expand-all
          node-key="id"
          :default-checked-keys="defkeys"
          ref="treeRights"
          @close="SetRightDialogClosed">
      </el-tree>


      <template #footer>
        <span class="dialog-footer">
          <el-button @click="SetRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>

</template>
<script>
export default {
  name: "Roles",
  data() {
    return {
      roleslist: [],
      rightslist: [],
      SetRightDialogVisible: false,

      // 树形控件属性绑定对象
      rightsprops: {
        // 看到的那个属性对应的值
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的id 数组
      defkeys: [],
      roleId: ''
    }
  },
  created() {
    this.getroleslist()
  },
  methods: {
    //获取角色数据
    async getroleslist() {
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取用户角色列表失败')
      this.roleslist = res.data
    },

    // 删除权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否需要删除
      const confirmResult = await this.$confirm('此操作将永久删除此权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除此权限')
      }
      // 发起网络请求
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除此权限失败')
      }
      // this.getroleslist()
      role.children = res.data;
      this.$message.success('已经成功删除此权限')
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 获取所有的权限数据
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有的权限数据失败')
      }
      // 保存获取到的权限数据
      this.rightslist = res.data
      this.getLeafKeys(role, this.defkeys)

      // 保存当前被选择项的id值
      this.roleId = role.id

      this.SetRightDialogVisible = true
    },

    // 通过递归形式获取角色下所有三级权限啊id 并保存起来
    getLeafKeys(node, arr) {
      // 如果当前节点不包括children属性则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
          this.getLeafKeys(item, arr))
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
    // 监听分配权限的关闭事件
    SetRightDialogClosed() {
      this.defkeys = []
    },
    // 点击为角色分配权限数据
    async allotRights() {
      const keys = [...this.$refs.treeRights.getCheckedKeys(), ...this.$refs.treeRights.getHalfCheckedKeys()]
      console.log(keys);
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('修改权限数据失败')
      }
      this.$message.success('修改权限数据成功')
      this.getroleslist()
      this.SetRightDialogVisible = false

    }

  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>