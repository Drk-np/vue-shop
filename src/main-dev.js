import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import axios from 'axios'

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

// import * as echarts from 'echarts'

// Prism
import Prism from 'prismjs';
// highlight code
import 'prismjs/components/prism-json';

VMdEditor.use(vuepressTheme, {
  Prism,
});

// 本机地址
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

// axios 请求拦截器
axios.interceptors.request.use((config) => {
    // console.log(config);
    // 调用接口的时候添加touken
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

// createApp(App)
//     .use(store)
//     .use(router)
//     .use(ElementPlus, { size: 'small', zIndex: 3000 })
//     .provide('http', axios)
//     .mount('#app')

const app = createApp(App)
app.use(ElementPlus, {size: 'small', zIndex: 3000})
app.use(store)
app.use(router)
app.use(VMdEditor);
// app.echarts=echarts
app.config.globalProperties.$http = axios // 自定义添加
app.mount('#app')