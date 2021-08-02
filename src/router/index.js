import {createRouter, createWebHistory} from 'vue-router'
import Login from '../components/login'

const routes = [
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/',
        // 重定向到login
        redirect: '/login'
    },
    {
        path: '/home',
        component: () => import('../components/Home'),
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})
 // 挂在路由导航守卫
router.beforeEach((to, from, next) => {
        if (to.path === '/login') return next();
        // 获取token
        const tokenStr =window.sessionStorage.getItem('token')
        // 如果没有touken则跳转到login页面
        if(!tokenStr) return next('/login')
        next()
    }
)


export default router
