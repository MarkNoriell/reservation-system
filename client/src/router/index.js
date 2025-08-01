import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/Homepage.vue'
import Dashboard from '../views/Dashboard.vue'
import Reservation from '../views/Reservation.vue'
import Inventory from '../views/Inventory.vue'
import Sales from '../views/Sales.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/loginpage',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/reservation',
      name: 'reservation',
      component: Reservation,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: Inventory,
    },
    {
      path: '/sales',
      name: 'sales',
      component: Sales,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
  ],
})

export default router
