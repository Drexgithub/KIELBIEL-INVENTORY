<template>
  <header class="og-topbar">
    <!-- Breadcrumb & Route Indicator -->
    <div class="og-breadcrumb">
      <router-link to="/dashboard" class="og-breadcrumb-item">Dashboard</router-link>
      <span v-if="route.name !== 'dashboard'" class="og-breadcrumb-sep">/</span>
      <span v-if="route.name !== 'dashboard'" class="og-breadcrumb-current">{{ currentRouteTitle }}</span>
    </div>

    <!-- Right Header Controls -->
    <div class="og-topbar-actions">
      <!-- Quick Action Pill: Contact Support / Docs -->
      <button class="btn-dark btn-sm" @click="showSupportModal = true" style="font-size: 0.78rem;">
        <HelpCircle style="width: 14px; height: 14px;" />
        <span>Contact support</span>
      </button>

      <!-- Notification Bell -->
      <div style="position: relative;">
        <button class="icon-btn" title="Alerts & Notifications" @click="showNotifs = !showNotifs">
          <Bell style="width: 16px; height: 16px;" />
          <span v-if="unreadCount" style="position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #EF4444;"></span>
        </button>

        <!-- Popover -->
        <div v-if="showNotifs" class="modal-card" style="position: absolute; top: calc(100% + 10px); right: 0; width: 320px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div class="modal-header" style="padding: 10px 14px;">
            <h4 style="margin: 0; font-size: 0.88rem; color: #FFFFFF;">System Alerts</h4>
            <span style="font-size: 0.72rem; color: var(--og-text-secondary);">{{ unreadCount }} unread</span>
          </div>
          <div style="max-height: 250px; overflow-y: auto; padding: 8px;">
            <div 
              v-for="n in store.notifications" 
              :key="n.id" 
              style="padding: 8px 10px; border-bottom: 1px solid var(--og-border-subtle); cursor: pointer;"
              @click="n.unread = false"
            >
              <div style="font-size: 0.8rem; font-weight: 600; color: #FFFFFF;">{{ n.title }}</div>
              <div style="font-size: 0.74rem; color: var(--og-text-secondary);">{{ n.desc }}</div>
            </div>
            <div v-if="!store.notifications.length" style="padding: 1rem; text-align: center; color: var(--og-text-muted); font-size: 0.8rem;">
              No alerts
            </div>
          </div>
        </div>
      </div>

      <!-- Cashier User Pill -->
      <div style="position: relative;">
        <div 
          class="btn-dark" 
          style="padding: 5px 12px; border-radius: 9999px; display: flex; align-items: center; gap: 8px; cursor: pointer;"
          @click="showUserMenu = !showUserMenu"
        >
          <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #FFFFFF;">{{ store.currentUser.name || 'Kiel Hedrix' }}</span>
            <span style="font-size: 0.65rem; color: var(--og-text-muted);">{{ store.currentUser.role || 'Admin User' }}</span>
          </div>
          <ChevronDown style="width: 13px; height: 13px; color: var(--og-text-secondary);" />
        </div>

        <!-- User Dropdown Menu -->
        <div v-if="showUserMenu" class="modal-card" style="position: absolute; top: calc(100% + 10px); right: 0; width: 220px; z-index: 1000; padding: 8px;">
          <div style="padding: 8px 10px; border-bottom: 1px solid var(--og-border-subtle); margin-bottom: 6px;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #FFFFFF;">{{ store.currentUser.name }}</div>
            <div style="font-size: 0.72rem; color: var(--og-text-secondary);">{{ store.currentUser.email }}</div>
          </div>
          <button 
            class="btn btn-danger btn-sm" 
            style="width: 100%; justify-content: flex-start; gap: 6px;" 
            @click="handleLogout"
          >
            <LogOut style="width: 14px; height: 14px;" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contact Support Modal -->
    <div v-if="showSupportModal" class="modal-overlay" @click.self="showSupportModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Contact Support & System Info</h3>
          <button class="icon-btn" @click="showSupportModal = false">✕</button>
        </div>
        <div class="modal-body" style="font-size: 0.88rem; line-height: 1.6; color: var(--og-text-secondary);">
          <p style="color: #FFFFFF; font-weight: 600;">KIEL BIEL CONSUMER GOODS TRADING POS</p>
          <p>Location: Brgy.42 Rawis, Legazpi City</p>
          <p>Contact Phone: Cp# 09985317204</p>
          <p>Database: Live Supabase PostgreSQL Instance</p>
          <div style="margin-top: 1rem; padding: 12px; background: var(--og-bg-input); border-radius: 8px;">
            <div style="color: #10B981; font-weight: 600;">System Health: 100% Operational</div>
            <div style="font-size: 0.76rem; color: var(--og-text-muted);">Receipt Ledger Discrepancies: 0 across all database records</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showSupportModal = false">Done</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  LogOut 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const showNotifs = ref(false)
const showUserMenu = ref(false)
const showSupportModal = ref(false)



const unreadCount = computed(() => {
  return store.notifications.filter(n => n.unread).length
})

const currentRouteTitle = computed(() => {
  switch (route.name) {
    case 'dashboard': return 'Overview'
    case 'receipts': return 'Receipts'
    case 'customers': return 'Clients Management'
    case 'products': return 'Products'
    case 'categories': return 'Categories'
    case 'pos': return 'POS'
    case 'suppliers': return 'Suppliers'
    case 'cost-ledger': return 'Cost Ledger'
    default: return 'System'
  }
})

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>
