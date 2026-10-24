<template>
  <div class="og-customers-page">
    
    <!-- 1. PAGE HEADER -->
    <div class="og-page-header">
      <div class="og-page-title-box">
        <h1 class="og-page-title">Clients management</h1>
        <p class="og-page-subtitle">Manage customer accounts, buyer categories, contact details, and spending history.</p>
      </div>
      <div class="og-header-actions">
        <button class="btn btn-primary" @click="openAddModal">
          <UserPlus style="width: 15px; height: 15px;" />
          <span>+ Add new client</span>
        </button>
      </div>
    </div>

    <!-- 2. FOUR KPI STAT CARDS (Matches Screen 5: Clients Management) -->
    <section class="og-stat-grid">
      <!-- Total Clients -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Users class="og-stat-header-icon" />
          <span>Total clients</span>
        </div>
        <div class="og-stat-value">
          {{ store.uventraDemoMode ? '12,236' : store.customers.length }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+10%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- VIP Members -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Crown class="og-stat-header-icon" />
          <span>VIP Members</span>
        </div>
        <div class="og-stat-value">
          {{ store.uventraDemoMode ? '640' : vipCount }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+12%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Wholesale Clients -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Building2 class="og-stat-header-icon" />
          <span>Wholesale clients</span>
        </div>
        <div class="og-stat-value">
          {{ store.uventraDemoMode ? '480' : wholesaleCount }}
        </div>
        <div class="og-stat-trend negative">
          <ArrowDownRight style="width: 14px; height: 14px;" />
          <span>-5%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Selected Month Sales -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Calendar class="og-stat-header-icon" />
          <span>Selected month sales</span>
        </div>
        <div class="og-stat-value" style="color: #3B82F6;">
          ₱{{ totalSalesInSelectedMonth.toLocaleString('en-US', { minimumFractionDigits: 0 }) }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+8%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>
    </section>

    <!-- 3. CLIENTS DIRECTORY CARD -->
    <div class="og-card">
      
      <!-- Top Filter Row (Screen 5 Filter Bar) -->
      <div class="og-filter-row">
        <!-- Category & Date Filters -->
        <div class="og-filter-group">
          <select v-model="selectedCategory" class="og-pill-select">
            <option value="All">All categories ▾</option>
            <option value="Retail">Retail</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Wholesale">Wholesale</option>
          </select>

          <!-- Month Selector -->
          <div style="display: flex; align-items: center; gap: 4px;">
            <button class="btn-dark btn-sm" @click="navigateMonth(-1)" title="Prev Month">&lt;</button>
            <input 
              type="month" 
              v-model="selectedMonth" 
              class="form-input" 
              style="height: 36px; padding: 4px 10px; width: 145px;" 
            />
            <button class="btn-dark btn-sm" @click="navigateMonth(1)" title="Next Month">&gt;</button>
          </div>

          <button v-if="searchQuery || selectedCategory !== 'All' || selectedMonth" class="btn-dark btn-sm" @click="clearFilters">
            Clear filter
          </button>
        </div>

        <!-- Search Box -->
        <div class="og-filter-group">
          <div class="search-container" style="width: 280px;">
            <Search class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by name, phone, address..." 
            />
          </div>
        </div>
      </div>

      <!-- Filter Tabs (Screen 5 Tabs) -->
      <div class="og-tabs-bar">
        <button 
          class="og-tab-pill" 
          :class="{ active: selectedCategory === 'All' }" 
          @click="selectedCategory = 'All'"
        >
          All
        </button>
        <button 
          class="og-tab-pill" 
          :class="{ active: selectedCategory === 'VIP' }" 
          @click="selectedCategory = 'VIP'"
        >
          VIP Members
        </button>
        <button 
          class="og-tab-pill" 
          :class="{ active: selectedCategory === 'Wholesale' }" 
          @click="selectedCategory = 'Wholesale'"
        >
          Wholesale
        </button>
        <button 
          class="og-tab-pill" 
          :class="{ active: selectedCategory === 'Retail' || selectedCategory === 'Regular' }" 
          @click="selectedCategory = 'Retail'"
        >
          Retail
        </button>
      </div>

      <!-- Clients List Table -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Address / Location</th>
              <th style="text-align: right;">
                {{ selectedMonth ? 'Spent (' + formattedMonthShort + ')' : 'All-Time Spent' }}
              </th>
              <th style="text-align: center;">Orders</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCustomers" :key="c.id">
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #1E273A; border: 1px solid var(--og-border-card); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #3B82F6; font-size: 0.85rem;">
                    {{ c.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong style="color: #FFFFFF; font-size: 0.88rem; display: block;">{{ c.name }}</strong>
                    <span style="font-size: 0.72rem; color: var(--og-text-muted);">CUST-{{ String(c.id).padStart(4, '0') }}</span>
                  </div>
                </div>
              </td>
              <td style="color: var(--og-text-secondary); font-size: 0.82rem;">
                <Phone style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px; color: var(--og-text-muted);" />
                {{ c.phone || 'N/A' }}
              </td>
              <td>
                <span class="user-pill">{{ c.category || 'Retail' }}</span>
              </td>
              <td style="color: var(--og-text-secondary); font-size: 0.82rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ c.address || 'Store Direct' }}
              </td>
              <td style="text-align: right;">
                <div style="font-weight: 700; color: #10B981; font-size: 0.9rem;">
                  ₱{{ getCustomerSpent(c.name).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
              </td>
              <td style="text-align: center; font-weight: 600; color: #FFFFFF;">
                {{ getCustomerOrders(c.name) }}
              </td>
              <td>
                <span class="status-badge status-completed">
                  Active
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <button class="btn-dark btn-sm" title="View Monthly Breakdown" style="height: 28px; font-size: 0.72rem;" @click="openBreakdownModal(c)">
                    <BarChart2 style="width: 12px; height: 12px;" />
                    <span>Monthly</span>
                  </button>
                  <button class="icon-btn" style="width: 28px; height: 28px;" title="Edit Client" @click="openEditModal(c)">
                    <Edit3 style="width: 13px; height: 13px;" />
                  </button>
                  <button class="icon-btn text-danger" style="width: 28px; height: 28px;" title="Delete Client" @click="deleteCustomer(c)">
                    <Trash2 style="width: 13px; height: 13px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length">
              <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--og-text-muted);">
                No clients found matching your search filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="og-pagination-bar">
        <span>Showing {{ filteredCustomers.length }} of {{ store.customers.length }} row(s)</span>
        <div class="og-pagination-controls">
          <button class="og-page-btn">&lt; Previous</button>
          <button class="og-page-btn active">1</button>
          <button class="og-page-btn">2</button>
          <button class="og-page-btn">3</button>
          <button class="og-page-btn">Next &gt;</button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Client Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Client Details' : 'Add New Client' }}</h3>
          <button class="icon-btn" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="saveCustomer" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--og-text-secondary);">Client Name *</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="e.g. Juan Dela Cruz" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--og-text-secondary);">Phone Number</label>
              <input type="text" v-model="form.phone" class="form-input" placeholder="+63 917 000 0000" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: var(--og-text-secondary);">Client Tier</label>
              <select v-model="form.category" class="og-pill-select" style="height: 38px;">
                <option value="Retail">Retail</option>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--og-text-secondary);">Address / Delivery Location</label>
            <input type="text" v-model="form.address" class="form-input" placeholder="Street, City, Province" />
          </div>

          <div class="modal-footer" style="padding: 1rem 0 0 0; border-top: 1px solid var(--og-border-subtle); display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn-dark" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Update Client' : 'Save Client' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Monthly Spending Breakdown Modal -->
    <div v-if="showBreakdownModal" class="modal-overlay" @click.self="showBreakdownModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>Monthly Spending Breakdown</h3>
            <p style="font-size: 0.8rem; color: var(--og-text-secondary); margin: 3px 0 0 0;">
              Client: <strong style="color: #FFFFFF;">{{ selectedCustomerForBreakdown?.name }}</strong>
            </p>
          </div>
          <button class="icon-btn" @click="showBreakdownModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
            <table class="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th style="text-align: center;">Orders</th>
                  <th style="text-align: right;">Amount Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in monthlyBreakdownList" :key="item.monthKey">
                  <td style="font-weight: 600; color: #FFFFFF;">{{ item.monthLabel }}</td>
                  <td style="text-align: center;">{{ item.ordersCount }} order(s)</td>
                  <td style="text-align: right; font-weight: 700; color: #10B981;">
                    ₱{{ item.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </td>
                </tr>
                <tr v-if="!monthlyBreakdownList.length">
                  <td colspan="3" style="text-align: center; padding: 2rem 0; color: var(--og-text-muted);">
                    No recorded monthly purchase transactions for this client.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showBreakdownModal = false">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Users, 
  UserPlus, 
  Search, 
  Crown, 
  Building2, 
  Calendar, 
  Phone, 
  BarChart2, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-vue-next'

const selectedMonth = ref('2026-08')
const searchQuery = ref('')
const selectedCategory = ref('All')

const showModal = ref(false)
const isEditing = ref(false)

const showBreakdownModal = ref(false)
const selectedCustomerForBreakdown = ref(null)

const form = ref({
  id: null,
  name: '',
  phone: '',
  category: 'Retail',
  address: ''
})

const vipCount = computed(() => store.customers.filter(c => c.category === 'VIP').length)
const wholesaleCount = computed(() => store.customers.filter(c => c.category === 'Wholesale').length)

const formattedSelectedMonthLabel = computed(() => {
  if (!selectedMonth.value) return 'All-Time Purchases'
  const [year, month] = selectedMonth.value.split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, 1)
  return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const formattedMonthShort = computed(() => {
  if (!selectedMonth.value) return 'All-Time'
  const [year, month] = selectedMonth.value.split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, 1)
  return dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})

function navigateMonth(direction) {
  let [year, month] = selectedMonth.value.split('-').map(Number)
  month += direction
  if (month > 12) {
    month = 1
    year += 1
  } else if (month < 1) {
    month = 12
    year -= 1
  }
  selectedMonth.value = `${year}-${String(month).padStart(2, '0')}`
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'All'
  selectedMonth.value = ''
}

const totalSalesInSelectedMonth = computed(() => {
  return store.receipts.reduce((sum, r) => {
    if (selectedMonth.value && !r.created_at.startsWith(selectedMonth.value)) return sum
    return sum + (Number(r.grand_total) || 0)
  }, 0)
})

function getCustomerSpent(customerName) {
  return store.receipts.reduce((sum, r) => {
    if (r.customer_name !== customerName) return sum
    if (selectedMonth.value && !r.created_at.startsWith(selectedMonth.value)) return sum
    return sum + (Number(r.grand_total) || 0)
  }, 0)
}

function getCustomerAllTimeSpent(customerName) {
  return store.receipts.reduce((sum, r) => {
    if (r.customer_name !== customerName) return sum
    return sum + (Number(r.grand_total) || 0)
  }, 0)
}

function getCustomerOrders(customerName) {
  return store.receipts.filter(r => {
    if (r.customer_name !== customerName) return false
    if (selectedMonth.value && !r.created_at.startsWith(selectedMonth.value)) return false
    return true
  }).length
}

const filteredCustomers = computed(() => {
  return store.customers.filter(c => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q || 
      c.name.toLowerCase().includes(q) || 
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))

    const matchesCategory = selectedCategory.value === 'All' || c.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

function openAddModal() {
  isEditing.value = false
  form.value = { id: null, name: '', phone: '', category: 'Retail', address: '' }
  showModal.value = true
}

function openEditModal(c) {
  isEditing.value = true
  form.value = { ...c }
  showModal.value = true
}

function saveCustomer() {
  if (!form.value.name.trim()) return
  if (isEditing.value) {
    const idx = store.customers.findIndex(c => c.id === form.value.id)
    if (idx !== -1) {
      store.customers[idx] = { ...form.value }
    }
  } else {
    const newId = store.customers.length ? Math.max(...store.customers.map(c => c.id)) + 1 : 1
    store.customers.push({ ...form.value, id: newId })
  }
  showModal.value = false
}

function deleteCustomer(c) {
  if (confirm(`Delete customer ${c.name}?`)) {
    store.customers = store.customers.filter(cust => cust.id !== c.id)
  }
}

const monthlyBreakdownList = computed(() => {
  if (!selectedCustomerForBreakdown.value) return []
  const name = selectedCustomerForBreakdown.value.name
  const receipts = store.receipts.filter(r => r.customer_name === name)

  const monthMap = {}
  receipts.forEach(r => {
    const monthKey = r.created_at ? r.created_at.slice(0, 7) : '2026-08'
    if (!monthMap[monthKey]) {
      const [year, month] = monthKey.split('-')
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      monthMap[monthKey] = { monthKey, monthLabel: label, ordersCount: 0, totalSpent: 0 }
    }
    monthMap[monthKey].ordersCount += 1
    monthMap[monthKey].totalSpent += (Number(r.grand_total) || 0)
  })

  return Object.values(monthMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
})

function openBreakdownModal(c) {
  selectedCustomerForBreakdown.value = c
  showBreakdownModal.value = true
}
</script>
