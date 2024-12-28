// frontend/src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import HealthFever from './views/HealthFever.vue'
import HealthDiseases from './views/HealthDiseases.vue'
import HealthReports from './views/HealthReports.vue'
import Management from './views/Management.vue'
import SelectProfile from './views/SelectProfile.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    children: [
      { path: 'select-profile', component: SelectProfile },
      { path: 'health-fever', component: HealthFever },
      { path: 'health-diseases', component: HealthDiseases },
      { path: 'health-reports', component: HealthReports },
      { path: 'management', component: Management }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
