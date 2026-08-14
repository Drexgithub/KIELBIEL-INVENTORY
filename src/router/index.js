import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store/inventoryStore.js'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PosView from '../views/PosView.vue'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ReceiptsView from '../views/ReceiptsView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import CostLedgerView from '../views/CostLedgerView.vue'
import CustomersView from '../views/CustomersView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/pos', name: 'pos', component: PosView },
  { path: '/products', name: 'products', component: ProductsView },
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/cost-ledger', name: 'cost-ledger', component: CostLedgerView, meta: { roles: ['Admin User'] } },
  { path: '/receipts', name: 'receipts', component: ReceiptsView },
  { path: '/suppliers', name: 'suppliers', component: SuppliersView, meta: { roles: ['Admin User'] } },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (!to.meta.public && !store.currentUser.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && store.currentUser.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.roles && !to.meta.roles.includes(store.currentUser.role)) {
    // Access Control: Block unauthorized role access to accounting/supplier views
    store.notifications.unshift({
      id: Date.now(),
      title: 'Security Alert: Access Restricted',
      desc: `Restricted route "${to.path}" requires ${to.meta.roles.join(', ')} permission.`,
      time: 'Just now',
      unread: true
    })
    next('/dashboard')
  } else {
    next()
  }
})

export default router
