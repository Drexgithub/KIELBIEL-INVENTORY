<template>
  <aside class="og-sidebar">
    <!-- Brand Header -->
    <router-link to="/dashboard" class="og-sidebar-brand">
      <div class="og-brand-logo-mark" style="background: #000000; border: 1px solid rgba(255, 255, 255, 0.15); padding: 2px; overflow: hidden; border-radius: 9px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
        <img src="/logo.png" alt="KIELBIEL Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" />
      </div>
      <div>
        <div class="og-brand-text" style="font-size: 0.95rem; letter-spacing: 0.05em;">KIELBIEL CONSUMER</div>
        <div class="og-brand-sub">GOODS TRADING POS</div>
      </div>
    </router-link>

    <!-- Main Navigation List -->
    <nav class="og-sidebar-nav">
      <!-- 1. Dashboard -->
      <router-link 
        to="/dashboard" 
        class="og-nav-item" 
        :class="{ active: route.name === 'dashboard' }"
        title="Dashboard"
      >
        <LayoutGrid class="og-nav-icon" />
        <span>Dashboard</span>
      </router-link>

      <!-- 2. Receipts -->
      <router-link 
        to="/receipts" 
        class="og-nav-item" 
        :class="{ active: route.name === 'receipts' }"
        title="Receipts Ledger"
      >
        <Receipt class="og-nav-icon" />
        <span>Receipts</span>
      </router-link>

      <!-- 3. Clients Management (Customers) -->
      <router-link 
        to="/customers" 
        class="og-nav-item" 
        :class="{ active: route.name === 'customers' }"
        title="Clients management"
      >
        <Users class="og-nav-icon" />
        <span>Clients management</span>
      </router-link>

      <!-- 4. Products -->
      <router-link 
        to="/products" 
        class="og-nav-item" 
        :class="{ active: route.name === 'products' }"
        title="Products Inventory"
      >
        <Package class="og-nav-icon" />
        <span>Products</span>
      </router-link>

      <!-- 5. Categories -->
      <router-link 
        to="/categories" 
        class="og-nav-item" 
        :class="{ active: route.name === 'categories' }"
        title="Categories"
      >
        <Layers class="og-nav-icon" />
        <span>Categories</span>
      </router-link>

      <!-- 6. POS (Point of Sale) -->
      <router-link 
        to="/pos" 
        class="og-nav-item" 
        :class="{ active: route.name === 'pos' }"
        title="Point of Sale (POS)"
      >
        <CreditCard class="og-nav-icon" />
        <span>POS</span>
      </router-link>

      <!-- 7. Suppliers -->
      <router-link 
        to="/suppliers" 
        class="og-nav-item" 
        :class="{ active: route.name === 'suppliers' }"
        title="Suppliers"
      >
        <Truck class="og-nav-icon" />
        <span>Suppliers</span>
      </router-link>

      <!-- 8. Cost Ledger (Accounting) -->
      <router-link 
        to="/cost-ledger" 
        class="og-nav-item" 
        :class="{ active: route.name === 'cost-ledger' }"
        title="Cost Ledger & COGS"
      >
        <BarChart3 class="og-nav-icon" />
        <span>Cost Ledger</span>
      </router-link>

      <!-- Section Divider -->
      <div style="height: 1px; background: var(--og-border-subtle); margin: 6px 0;"></div>

      <!-- Secondary Utility Nav -->
      <a href="javascript:void(0)" class="og-nav-item" @click="showHelp = true" title="Reports">
        <LineChart class="og-nav-icon" />
        <span>Reports</span>
      </a>

      <a href="javascript:void(0)" class="og-nav-item" @click="showHelp = true" title="Settings">
        <Settings class="og-nav-icon" />
        <span>Settings</span>
      </a>

      <a href="javascript:void(0)" class="og-nav-item" @click="showHelp = true" title="Help & Support">
        <HelpCircle class="og-nav-icon" />
        <span>Help & Support</span>
      </a>
    </nav>

    <!-- Bottom Surprise Box & Logout -->
    <div class="og-sidebar-bottom">
      <div class="og-surprise-box" @click="showHelp = true" title="System Quick Guide">
        <Gift style="width: 16px; height: 16px; color: #EC4899;" />
        <span>Surprise box</span>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px;">
        <button 
          class="btn-dark btn-sm" 
          style="display: flex; align-items: center; gap: 6px; font-size: 0.76rem;" 
          @click="store.toggleDarkMode()"
          :title="store.darkMode ? 'Switch theme' : 'Switch theme'"
        >
          <Moon style="width: 13px; height: 13px;" />
          <span>Dark Mode</span>
        </button>

        <button 
          class="icon-btn text-danger" 
          style="width: 30px; height: 30px; border-radius: 6px;" 
          title="Sign Out" 
          @click="handleLogout"
        >
          <LogOut style="width: 14px; height: 14px;" />
        </button>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="modal-overlay" @click.self="showHelp = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>KIELBIEL CONSUMER POS & Inventory Guide</h3>
          <button class="icon-btn" @click="showHelp = false">✕</button>
        </div>
        <div class="modal-body" style="font-size: 0.88rem; line-height: 1.6; color: var(--og-text-secondary);">
          <p style="color: #FFFFFF; font-weight: 600;">Welcome to KIELBIEL CONSUMER GOODS TRADING POS & Inventory System.</p>
          <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 10px; margin: 12px 0;">
            <li><strong>Dashboard:</strong> Visual telemetry showing live revenue vs expense spline curves, category breakdowns, daily calendar navigator, and key KPI cards in Philippine Peso (₱).</li>
            <li><strong>Receipts:</strong> Comprehensive receipts ledger auditing all sales transactions, payment methods, and live database sync.</li>
            <li><strong>POS:</strong> High-speed POS terminal with real-time barcode/item search, cart calculation, and instant A4 official receipt printing.</li>
            <li><strong>Customers:</strong> Customer directory with tiering (VIP, Wholesale, Regular) and spending history.</li>
            <li><strong>Products:</strong> Product inventory catalog with live stock tracking, stock replenishment (+ Add Stock), and costing.</li>
            <li><strong>Categories:</strong> Departmental category lines and product segmentation.</li>
            <li><strong>Suppliers:</strong> Supplier accounts, replenishment purchase orders, and expenditure analytics.</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showHelp = false">Close Guide</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { 
  LayoutGrid, 
  Receipt,
  Users, 
  Package, 
  Layers, 
  CreditCard, 
  Truck, 
  BarChart3, 
  LineChart, 
  Settings, 
  HelpCircle, 
  Gift, 
  Moon, 
  LogOut 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const showHelp = ref(false)

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>
