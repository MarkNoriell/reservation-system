import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/Homepage.vue'
import Dashboard from '../views/Dashboard.vue'
import Reservation from '../views/Reservation.vue'
import Inventory from '../views/Inventory.vue'
import Sales from '../views/Sales.vue'
import Accounts from '../views/Accounts.vue'
import AboutUs from '../views/AboutUs.vue'
import Test from '../views/Test.vue'
import { persistStore } from '../stores/persistStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: true }
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
      meta: { requiresAuth: true } // This route is protected
    },
    {
      path: '/reservation',
      name: 'reservation',
      component: Reservation,
      meta: { requiresAuth: true } // This route is protected
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: Inventory,
      meta: { requiresAuth: true } // This route is protected
    },
    {
      path: '/sales',
      name: 'sales',
      component: Sales,
      meta: { requiresAuth: true } // This route is protected
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: Accounts,
      meta: { requiresAuth: true } // This route is protected
    },
    {
      path: '/aboutus',
      name: 'aboutus',
      component: AboutUs,
    },
    {
      path: '/testpath',
      name: 'test',
      component: Test,
      // This route is not protected
    },
  ],
})

// Global navigation guard
// In your router file (e.g., /router/index.js)

router.beforeEach((to, from, next) => {
  console.log(`Navigating to: ${to.path}`);

  const usePersistStore = persistStore();
  const username = usePersistStore.accountCredentials.username;

  // Log the values we are checking
  console.log('Route requires auth?:', to.meta.requiresAuth);
  console.log('Username from Pinia store:', `"${username}"`); // Quotes help see if it's truly empty

  const isAuthenticated = username !== '' && username !== null && username !== undefined;
  console.log('Is user authenticated?:', isAuthenticated);

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login page...');
    next({ name: 'login' });
  } else {
    console.log('Allowing navigation.');
    next();
  }
});

export default router;