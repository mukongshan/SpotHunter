import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: '📊' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { title: '用户管理', icon: '👥' }
      },
      {
        path: 'spots',
        name: 'SpotManagement',
        component: () => import('../views/SpotManagement.vue'),
        meta: { title: '景点管理', icon: '📍' }
      },
      {
        path: 'checkins',
        name: 'CheckInManagement',
        component: () => import('../views/CheckInManagement.vue'),
        meta: { title: '打卡记录', icon: '✅' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 可以在这里添加权限验证
  document.title = to.meta.title ? `${to.meta.title} - 景区打卡管理后台` : '景区打卡管理后台'
  next()
})

export default router

