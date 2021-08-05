import {createRouter, createWebHistory} from 'vue-router'
import Login from '../components/login'
import welcome from '../components/Welcome'

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
        redirect: '/welcome',
        // 子路由
        children: [
            {path: '/welcome', component: welcome},
            {path: '/users', component: () => import('../components/User/Users')},
            {path: '/rights', component: () => import('../components/power/RIghts')},
            {path: '/roles', component: () => import('../components/power/Roles')},
            {path: '/categories', component: () => import('../components/goods/Cate')},
            {path: '/params', component: () => import('../components/goods/params')},
            {path: '/goods', component: () => import('../components/goods/goodslist')},
            {path: '/goods/add', component: () => import('../components/goods/Addgoods')},
            {path: '/orders', component: () => import('../components/User/Users')},
            {path: '/reports', component: () => import('../components/User/Users')}
        ]
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
        const tokenStr = window.sessionStorage.getItem('token')

        // 如果没有touken则跳转到login页面
        if (!tokenStr) return next('/login')
        next()
    }
)


export default router
