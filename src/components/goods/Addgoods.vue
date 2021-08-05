<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card class="box-card">

    <!--    信息区域-->
    <el-alert title="添加商品信息" center type="info" show-icon :closable="false">
    </el-alert>
    <!--步骤条-->
    <el-steps :active="activeindex-0" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <el-form :model="addForm" :rules="addruleForm" label-position="top" ref="addForm" label-width="100px"
             class="demo-ruleForm" @change="handleChange">
      <el-tabs @tab-click="tabClicked" :tab-position="'left'" v-model="activeindex" :before-leave="beforeTbaleLeave">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model.trim="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat"
                         :options="catelist"
                         :props="cateProps"
                         @change="handleChange"
                         clearable
                         placeholder="选择商品分类"></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for="item in manyTableData " :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox border :label="item1" v-for="(item1,i) in item.attr_vals" :key="i"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData " :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-form-item label="活动名称" prop="name">
            <!--            action是图片要上传到哪里的api地址-->
            <el-upload
                class="upload-demo"
                action="http://127.0.0.1:8888/api/private/v1/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <v-md-editor v-model="addForm.goods_introduce" height="400px"></v-md-editor>
          <!--          添加商品的按钮-->
          <el-button type="primary" class="btnadd" @click="add">添加商品</el-button>


        </el-tab-pane>
      </el-tabs>
    </el-form>

  </el-card>

  <el-dialog
      title="图片预览"
      v-model="previewVisible">
    <!--      内容主体区域-->
    <img :src="previewPath" alt="" class="previewImg">
    <!--        该:options 绑定数据源-->
    <!--        该:props 用于指定配置对象-->

  </el-dialog>
</template>

<script>
import _ from 'lodash'

export default {
  name: "Adgoods",
  components: {},
  mounted() {
  },
  data() {
    return {
      // 图片预览对话框是否显示
      previewVisible: false,
      activeindex: '0',
      // 商品信息
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        // 商品详情描述
        goods_introduce: '',
        goods_cat: [],
        pics: [],
        attrs: []


      },
      // 定义及请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 商品信息验证规则
      addruleForm: {
        goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'},
          {min: 1, message: '长度大于等于1个字符', trigger: 'blur'}],
        goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
        goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
        goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
      },

      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数组对象
      manyTableData: [],
      // 静态参数列表数组对象
      onlyTableData: [],
      // 将要预览图片地址
      previewPath: ''


    }
  },

  created() {
    this.getcatelist()
  },
  methods: {
    async getcatelist() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.catelist = res.data
      // console.log(this.total);
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      // console.log(this.addForm.goods_cat);
    },
    beforeTbaleLeave(activeName, oldActiveName) {
      // console.log(activeName);
      // console.log(this.addForm.goods_name);
      if (oldActiveName === '0' && this.addForm.goods_name === '' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类及商品名称')
        return false
      }

    },
    async tabClicked() {
      // console.log(this.activeindex);
      // 访问动态参数面板
      if (this.activeindex === '1') {
        const {data: res} = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {sel: 'many'}
            }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData);
      } else if (this.activeindex === '2') {
        const {data: res} = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {sel: 'only'}
            }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData);
      }
    },
    handlePreview(file) {
      // 处理图片预览效果
      this.previewPath = file.response.data.url
      this.previewVisible = true

    },
    // 处理移除文件的操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x =>
          x.pic === filePath
      )
      this.addForm.pics.splice(i, 1)
    },
    handleSuccess(response) {
      console.log(response);
      const picinfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picinfo)
    },
    add() {
      // console.log(this.addForm)
      this.$refs.addForm.validate(async valid => {
        if (!valid) return this.$message.error("请填写必要的表单项！")

        // 执行添加的业务逻辑
        // loadsh cloneDeep  深拷贝

        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 发起网络请求之前要处理动态参数和静态参数
        this.manyTableData.forEach(item => {
          const newnfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newnfo)
        })
        this.onlyTableData.forEach(item => {
          const newnfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newnfo)
        })
        form.attrs = this.addForm.attrs

        const {data: res} = await this.$http.post('goods', form)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')

        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    //当前选中的三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  }
}
</script>

<style scoped>

.el-steps {
  margin: 15px 0;
}

.el-step__title {
  font-size: 13px !important;
}

.el-checkbox {
  margin: 5px 5px !important;
}

.previewImg {
  width: 100%;
  height: 100%;
}

.btnadd {
  margin: 15px 0 15px 0;
}

</style>