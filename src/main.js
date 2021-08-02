import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import axios from 'axios'

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

// createApp(App)
//     .use(store)
//     .use(router)
//     .use(ElementPlus, { size: 'small', zIndex: 3000 })
//     .provide('http', axios)
//     .mount('#app')

const app = createApp(App)
app.use(ElementPlus, { size: 'small', zIndex: 3000 })
app.use(store)
app.use(router)
app.config.globalProperties.$http = axios // 自定义添加
app.mount('#app')