<template>
  <div class="content">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Customers Directory</h1>
        <p class="page-description">Manage customer profiles, buyer categories, contact details, and monthly spending history.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-mint" @click="openAddModal">
          <UserPlus style="width: 16px; height: 16px;" /> Add New Customer
        </button>
      </div>
    </div>

    <!-- Summary Stats Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <div class="card p-4" style="flex-direction: row; align-items: center; gap: 1rem;">
        <div class="stat-icon-circle" style="background: rgba(37, 99, 235, 0.1); color: var(--primary);">
          <Users style="width: 24px; height: 24px;" />
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Total Customers</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">{{ store.customers.length }}</div>
        </div>
      </div>

      <div class="card p-4" style="flex-direction: row; align-items: center; gap: 1rem;">
        <div class="stat-icon-circle" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">
          <Crown style="width: 24px; height: 24px;" />
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">VIP Members</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">{{ vipCount }}</div>
        </div>
      </div>

      <div class="card p-4" style="flex-direction: row; align-items: center; gap: 1rem;">
        <div class="stat-icon-circle" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">
          <Building2 style="width: 24px; height: 24px;" />
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Wholesale Clients</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">{{ wholesaleCount }}</div>
        </div>
      </div>

      <div class="card p-4" style="flex-direction: row; align-items: center; gap: 1rem;">
        <div class="stat-icon-circle" style="background: rgba(139, 92, 246, 0.1); color: #8B5CF6;">
          <Calendar style="width: 24px; height: 24px;" />
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Selected Month Sales</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">
            ₱{{ totalSalesInSelectedMonth.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Month Navigation & Date Selection Bar Card -->
    <div class="card p-4 mb-4" style="background: var(--surface); border: 1px solid var(--border);">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        
        <!-- Month Navigation Controls -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
            <Calendar style="width: 18px; height: 18px; color: var(--primary);" /> Month Filter:
          </div>

          <button class="btn btn-outline btn-sm" @click="navigateMonth(-1)" title="Previous Month">
            <ChevronLeft style="width: 16px; height: 16px;" /> Prev
          </button>

          <input 
            type="month" 
            v-model="selectedMonth" 
            class="form-input" 
            style="width: 170px; height: 36px; padding: 4px 10px; font-weight: 600;" 
          />

          <button class="btn btn-outline btn-sm" @click="navigateMonth(1)" title="Next Month">
            Next <ChevronRight style="width: 16px; height: 16px;" />
          </button>

          <button v-if="selectedMonth" class="btn btn-sm btn-link" style="font-size: 0.8rem;" @click="selectedMonth = ''">
            Show All-Time Total
          </button>
        </div>

        <!-- Month Banner Indicator -->
        <div class="status-badge status-completed" style="font-size: 0.85rem; padding: 6px 14px; font-weight: 700;">
          📅 {{ formattedSelectedMonthLabel }}
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar Card -->
    <div class="card p-4 mb-4">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div class="search-container" style="max-width: 380px; flex: 1;">
          <Search class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by customer name, phone, or location..." 
          />
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Category Filter:</label>
          <select v-model="selectedCategory" class="form-select" style="width: 180px;">
            <option value="All">All Categories</option>
            <option value="Retail">Retail</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Wholesale">Wholesale</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Customers Data Table Card -->
    <div class="card p-0" style="overflow: hidden;">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Category</th>
              <th>Address</th>
              <th style="text-align: right;">
                {{ selectedMonth ? 'Spent (' + formattedMonthShort + ')' : 'All-Time Spent' }}
              </th>
              <th style="text-align: center;">Orders</th>
              <th style="width: 160px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCustomers" :key="c.id">
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="user-pill" style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; background: var(--primary-light); color: var(--primary); font-size: 0.9rem;">
                    {{ c.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong style="color: var(--text-main); display: block; font-size: 0.9rem;">{{ c.name }}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">ID: CUST-{{ String(c.id).padStart(4, '0') }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
                  <Phone style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px; color: var(--text-muted);" />
                  {{ c.phone || 'N/A' }}
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getCategoryBadgeClass(c.category)">
                  {{ c.category || 'Retail' }}
                </span>
              </td>
              <td style="font-size: 0.85rem; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ c.address || 'Store Direct' }}
              </td>
              <td style="text-align: right;">
                <div style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">
                  ₱{{ getCustomerSpent(c.name).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
                <div v-if="selectedMonth" style="font-size: 0.72rem; color: var(--text-muted);">
                  All-time: ₱{{ getCustomerAllTimeSpent(c.name).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
              </td>
              <td style="text-align: center; font-weight: 600;">
                {{ getCustomerOrders(c.name) }}
              </td>
              <td style="text-align: center;">
                <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
                  <button class="btn btn-outline btn-sm" title="View Monthly Breakdown" style="padding: 2px 8px; font-size: 0.75rem;" @click="openBreakdownModal(c)">
                    <BarChart2 style="width: 13px; height: 13px;" /> Monthly
                  </button>
                  <button class="icon-btn" title="Edit Customer" style="width: 28px; height: 28px;" @click="openEditModal(c)">
                    <Edit3 style="width: 14px; height: 14px;" />
                  </button>
                  <button class="icon-btn text-danger" title="Delete Customer" style="width: 28px; height: 28px;" @click="deleteCustomer(c)">
                    <Trash2 style="width: 14px; height: 14px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length">
              <td colspan="7" class="text-center" style="padding: 3rem 0; color: var(--text-muted);">
                <Users style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 0.5rem;" />
                <div v-if="selectedMonth">No customers found with recorded purchases in <strong>{{ formattedSelectedMonthLabel }}</strong>.</div>
                <div v-else>No customers found matching your criteria.</div>
                <button v-if="selectedMonth" class="btn btn-outline btn-sm" style="margin-top: 0.75rem;" @click="selectedMonth = ''">
                  Show All-Time Total
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Customer Modal (Email Field Removed Completely) -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">
            <UserPlus style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;" />
            {{ isEditing ? 'Edit Customer Details' : 'Add New Customer' }}
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <form @submit.prevent="saveCustomer" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Customer Full Name / Business <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="form.name" class="form-input" placeholder="e.g. Juan Dela Cruz" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contact Phone Number</label>
              <input type="text" v-model="form.phone" class="form-input" placeholder="e.g. +63 917 000 0000" />
            </div>
            <div class="form-group">
              <label>Customer Category</label>
              <select v-model="form.category" class="form-select">
                <option value="Retail">Retail</option>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Complete Address / Location</label>
            <textarea v-model="form.address" class="form-textarea" placeholder="Street address, City, Province..." style="min-height: 75px;"></textarea>
          </div>

          <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;">
            <button type="button" class="btn btn-outline" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">
              {{ isEditing ? 'Update Customer' : 'Save Customer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Monthly Spending Breakdown Modal for Specific Customer -->
    <div v-if="showBreakdownModal" class="modal-overlay" @click.self="showBreakdownModal = false">
      <div class="modal-card" style="max-width: 560px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">
              <BarChart2 style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px; color: var(--primary);" />
              Monthly Spending Breakdown
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Customer: <strong style="color: var(--text-main);">{{ selectedCustomerForBreakdown?.name }}</strong>
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showBreakdownModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <div class="modal-body" style="gap: 1rem;">
          <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
            <table class="table">
              <thead>
                <tr>
                  <th>Month & Year</th>
                  <th style="text-align: center;">Orders Count</th>
                  <th style="text-align: right;">Amount Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in monthlyBreakdownList" :key="item.monthKey">
                  <td style="font-weight: 600; color: var(--text-main);">
                    📅 {{ item.monthLabel }}
                  </td>
                  <td style="text-align: center; font-weight: 600;">
                    {{ item.ordersCount }} order(s)
                  </td>
                  <td style="text-align: right; font-weight: 800; color: var(--primary);">
                    ₱{{ item.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </td>
                </tr>
                <tr v-if="!monthlyBreakdownList.length">
                  <td colspan="3" class="text-center" style="padding: 2rem 0; color: var(--text-muted);">
                    No recorded monthly purchase transactions for this customer yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background: var(--input-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">All-Time Total Purchase:</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">
              ₱{{ getCustomerAllTimeSpent(selectedCustomerForBreakdown?.name).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); text-align: right;">
          <button class="btn btn-outline" @click="showBreakdownModal = false">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { Users, UserPlus, Search, Crown, Building2, Calendar, Phone, ChevronLeft, ChevronRight, BarChart2, Edit3, Trash2, X } from 'lucide-vue-next'

// Default Month to current year and month (e.g. '2026-08')
const selectedMonth = ref('2026-08')
const searchQuery = ref('')
const selectedCategory = ref('All')

// Modal States
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
  return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const formattedMonthShort = computed(() => {
  if (!selectedMonth.value) return 'All-Time'
  const [year, month] = selectedMonth.value.split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, 1)
  return dateObj.toLocaleString('default', { month: 'short', year: 'numeric' })
})

function navigateMonth(delta) {
  if (!selectedMonth.value) {
    selectedMonth.value = '2026-08'
    return
  }
  const [yearStr, monthStr] = selectedMonth.value.split('-')
  let y = Number(yearStr)
  let m = Number(monthStr) + delta

  if (m < 1) {
    m = 12
    y -= 1
  } else if (m > 12) {
    m = 1
    y += 1
  }
  selectedMonth.value = `${y}-${String(m).padStart(2, '0')}`
}

function getCustomerSpent(customerName) {
  if (!selectedMonth.value) {
    return getCustomerAllTimeSpent(customerName)
  }

  const receipts = store.receipts.filter(r => {
    if (r.customer_name.toLowerCase() !== customerName.toLowerCase()) return false
    if (r.status !== 'Completed') return false

    // Match YYYY-MM
    let dateStr = r.created_at
    if (dateStr.includes('/')) {
      const parts = dateStr.split(',')[0].split('/')
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`
      }
    }
    return dateStr.startsWith(selectedMonth.value)
  })

  return receipts.reduce((sum, r) => sum + Number(r.grand_total || 0), 0)
}

function getCustomerOrders(customerName) {
  if (!selectedMonth.value) {
    const cust = store.customers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
    const receiptCount = store.receipts.filter(r => r.customer_name.toLowerCase() === customerName.toLowerCase()).length
    return Math.max(receiptCount, cust?.totalOrders || 0)
  }

  return store.receipts.filter(r => {
    if (r.customer_name.toLowerCase() !== customerName.toLowerCase()) return false
    let dateStr = r.created_at
    if (dateStr.includes('/')) {
      const parts = dateStr.split(',')[0].split('/')
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`
      }
    }
    return dateStr.startsWith(selectedMonth.value)
  }).length
}

function getCustomerAllTimeSpent(customerName) {
  const cust = store.customers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
  const receiptTotal = store.receipts.filter(r => r.customer_name.toLowerCase() === customerName.toLowerCase() && r.status === 'Completed')
    .reduce((sum, r) => sum + Number(r.grand_total || 0), 0)

  return Math.max(receiptTotal, cust?.totalSpent || 0)
}

const totalSalesInSelectedMonth = computed(() => {
  return store.customers.reduce((sum, c) => sum + getCustomerSpent(c.name), 0)
})

const filteredCustomers = computed(() => {
  return store.customers.filter(c => {
    // 1. Category Filter
    const matchesCategory = selectedCategory.value === 'All' || (c.category || 'Retail') === selectedCategory.value
    if (!matchesCategory) return false

    // 2. Month Filter: If a specific month is selected, ONLY show customers with spending > 0 in that month
    if (selectedMonth.value) {
      const monthSpent = getCustomerSpent(c.name)
      if (monthSpent <= 0) return false
    }

    // 3. Search Query Filter
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.toLowerCase().trim()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    )
  })
})

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'VIP': return 'status-completed'
    case 'Wholesale': return 'status-pending'
    case 'Regular': return 'bg-blue-100 text-blue-600'
    default: return 'status-badge'
  }
}

function openAddModal() {
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    phone: '',
    category: 'Retail',
    address: ''
  }
  showModal.value = true
}

function openEditModal(customer) {
  isEditing.value = true
  form.value = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    category: customer.category || 'Retail',
    address: customer.address
  }
  showModal.value = true
}

function openBreakdownModal(customer) {
  selectedCustomerForBreakdown.value = customer
  showBreakdownModal.value = true
}

const monthlyBreakdownList = computed(() => {
  if (!selectedCustomerForBreakdown.value) return []
  const custName = selectedCustomerForBreakdown.value.name.toLowerCase()
  const map = {}

  store.receipts.forEach(r => {
    if (r.customer_name.toLowerCase() !== custName) return
    let key = r.created_at.slice(0, 7) // 'YYYY-MM'
    if (r.created_at.includes('/')) {
      const parts = r.created_at.split(',')[0].split('/')
      if (parts.length === 3) {
        key = `${parts[2]}-${String(parts[0]).padStart(2, '0')}`
      }
    }

    if (!map[key]) {
      const [y, m] = key.split('-')
      const d = new Date(Number(y), Number(m) - 1, 1)
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
      map[key] = { monthKey: key, monthLabel: label, ordersCount: 0, totalSpent: 0 }
    }

    map[key].ordersCount += 1
    map[key].totalSpent += Number(r.grand_total || 0)
  })

  return Object.values(map).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
})

function saveCustomer() {
  if (!form.value.name.trim()) return

  if (isEditing.value) {
    store.updateCustomer({ ...form.value })
    alert(`Customer "${form.value.name}" updated successfully!`)
  } else {
    store.addCustomer({ ...form.value })
    alert(`Customer "${form.value.name}" added successfully!`)
  }

  showModal.value = false
}

function deleteCustomer(c) {
  if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
    store.deleteCustomer(c.id)
  }
}
</script>
