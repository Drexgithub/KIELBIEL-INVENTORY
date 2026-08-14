<template>
  <aside class="sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="brand">
        <Store class="brand-icon" />
        <span v-if="!store.sidebarCollapsed" class="brand-text">KIEL BIEL POS</span>
      </div>
      <button class="toggle-sidebar" title="Toggle Navigation" @click="store.toggleSidebar">
        <ChevronLeft />
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-list">
        <div class="nav-label">Menu</div>
        <router-link to="/dashboard" class="nav-link" title="Dashboard">
          <LayoutDashboard class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/pos" class="nav-link" title="Point of Sale">
          <ShoppingCart class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Point of Sale</span>
        </router-link>
        <router-link to="/products" class="nav-link" title="Products">
          <Package class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Products</span>
        </router-link>
        <router-link to="/categories" class="nav-link" title="Categories">
          <Layers class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Categories</span>
        </router-link>
        <router-link to="/customers" class="nav-link" title="Customers">
          <UserCheck class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Customers</span>
        </router-link>
      </div>

      <div class="nav-list">
        <div class="nav-label">Accounting & Ledger</div>
        <router-link v-if="store.isAdmin" to="/cost-ledger" class="nav-link" title="Cost of Goods (COGS)">
          <DollarSign class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Cost of Goods (COGS)</span>
        </router-link>
        <router-link to="/receipts" class="nav-link" title="Receipts Ledger">
          <Receipt class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Receipts Ledger</span>
        </router-link>
        <router-link v-if="store.isAdmin" to="/suppliers" class="nav-link" title="Suppliers">
          <Users class="nav-icon" />
          <span v-if="!store.sidebarCollapsed">Suppliers</span>
        </router-link>
      </div>
    </nav>

    <!-- User Profile Avatar Pills at Bottom -->
    <div class="sidebar-footer">
      <div v-if="!store.sidebarCollapsed" class="user-pill" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem; background: var(--input-bg); border-radius: 8px; margin-bottom: 0.5rem;">
        <div class="avatar-badge" style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;">
          {{ (store.currentUser.name || 'U').charAt(0).toUpperCase() }}
        </div>
        <div style="flex: 1; overflow: hidden;">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; font-weight: 600; color: var(--text-main);">
            {{ store.currentUser.name || 'User' }}
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">
            {{ store.currentUser.role || 'Role' }}
          </div>
        </div>
      </div>
      <button class="nav-link text-danger w-100" style="padding: 0.5rem; justify-content: center;" @click="handleLogout" title="Logout">
        <LogOut class="nav-icon" />
        <span v-if="!store.sidebarCollapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { store } from '../store/inventoryStore.js'
import { useRouter } from 'vue-router'
import { 
  Store, 
  ChevronLeft, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Layers, 
  UserCheck,
  DollarSign,
  Receipt, 
  Users, 
  LogOut 
} from 'lucide-vue-next'

const router = useRouter()

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>
