import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login',      component: () => import('@/views/LoginView.vue'),      meta: { public: true } },
  { path: '/register',   component: () => import('@/views/RegisterView.vue'),   meta: { public: true } },
  { path: '/',           component: () => import('@/views/DashboardView.vue') },
  { path: '/expenses',   component: () => import('@/views/ExpensesView.vue') },
  { path: '/categories', component: () => import('@/views/CategoriesView.vue') },
  { path: '/reports',    component: () => import('@/views/ReportsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) await auth.init()
  if (!to.meta.public && !auth.isLoggedIn) return '/login'
  if (to.meta.public && auth.isLoggedIn) return '/'
})

export default router
