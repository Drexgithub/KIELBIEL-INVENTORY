<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-description">Track supplier directories, log batch purchase orders by date, and manage supplier balances.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportSuppliersCSV">
          <Download /> Export CSV
        </button>
        <button class="btn btn-mint" @click="openRegisterSupplierModal">
          <Plus /> Register New Supplier
        </button>
      </div>
    </div>

    <!-- Main Supplier Table -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div class="search-container" style="max-width: 340px;">
          <Search class="search-icon" />
          <input type="text" v-model="search" placeholder="Search supplier code, name, category..." />
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <input type="date" v-model="filterDate" class="form-input" style="width: 160px; height: 38px; padding: 0.25rem 0.75rem;" title="Filter by Purchase Date" />
          <select v-model="statusFilter" class="form-select" style="width: 140px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button v-if="filterDate" class="btn btn-outline btn-sm" @click="filterDate = ''">Clear Date</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Supplier Code</th>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Email / Phone</th>
              <th>Category</th>
              <th>Total Purchase</th>
              <th>Last Purchase Date</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSuppliers" :key="s.code">
              <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">{{ s.code }}</span></td>
              <td>
                <strong style="color: var(--text-main);">{{ s.name }}</strong>
                <div v-if="s.address" style="font-size: 0.75rem; color: var(--text-muted);">{{ s.address }}</div>
              </td>
              <td>{{ s.contact }}</td>
              <td>
                <div>{{ s.email }}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">{{ s.phone }}</div>
              </td>
              <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ s.category }}</span></td>
              <td class="font-bold" style="color: #34D399;">₱{{ Number(s.totalPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
              <td>
                <span v-if="s.lastPurchaseDate" style="font-weight: 600; color: var(--text-main);">
                  <Calendar style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" /> {{ s.lastPurchaseDate }}
                </span>
                <span v-else class="text-muted">No date</span>
              </td>
              <td>
                <span class="status-badge" :class="s.status === 'Active' ? 'status-completed' : 'status-cancelled'">
                  {{ s.status }}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="icon-btn" title="Log New Purchase Order" style="width: 32px; height: 32px; display: inline-flex;" @click="openLogPurchaseModal(s)">
                  <PlusCircle style="width: 15px; height: 15px; color: var(--primary);" />
                </button>
                <button class="icon-btn" title="View Purchase History & Date Ledger" style="width: 32px; height: 32px; display: inline-flex; margin-left: 4px;" @click="openHistoryModal(s)">
                  <History style="width: 15px; height: 15px; color: #A7F3D0;" />
                </button>
                <button class="icon-btn text-danger" title="Delete Supplier" style="width: 32px; height: 32px; display: inline-flex; margin-left: 4px;" @click="deleteSup(s.code)">
                  <Trash2 style="width: 15px; height: 15px;" />
                </button>
              </td>
            </tr>
            <tr v-if="!filteredSuppliers.length">
              <td colspan="9" class="text-center" style="padding: 3rem 0; color: var(--text-muted);">
                No suppliers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Register Supplier -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);"><Users style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;" /> Register New Supplier</h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showRegisterModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="saveSupplier" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-row">
            <div class="form-group">
              <label>Supplier Code</label>
              <input type="text" v-model="supForm.code" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="supForm.category" class="form-select">
                <option v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Supplier Name <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="supForm.name" class="form-input" required placeholder="Company or Business Name" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contact Person</label>
              <input type="text" v-model="supForm.contact" class="form-input" placeholder="Full Name" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="text" v-model="supForm.phone" class="form-input" placeholder="+63 9XX XXX XXXX" />
            </div>
          </div>
          <div class="form-group">
            <label>Email Address <span style="color: var(--red-600);">*</span></label>
            <input type="email" v-model="supForm.email" class="form-input" required />
          </div>
          <div class="form-group">
            <label>Business Address</label>
            <input type="text" v-model="supForm.address" class="form-input" placeholder="City, Province" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showRegisterModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Log Purchase Order on Specific Date -->
    <div v-if="showLogPurchaseModal" class="modal-overlay" @click.self="showLogPurchaseModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);"><PlusCircle style="width: 20px; height: 20px; color: var(--primary); display: inline-block; vertical-align: middle; margin-right: 6px;" /> Log Purchase Order</h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showLogPurchaseModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="savePurchaseOrder" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Supplier</label>
            <select v-model="purForm.supplierCode" class="form-select" required>
              <option v-for="s in store.suppliers" :key="s.code" :value="s.code">{{ s.name }} ({{ s.code }})</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Purchase Date <span style="color: var(--red-600);">*</span></label>
              <input type="date" v-model="purForm.date" class="form-input" required />
            </div>
            <div class="form-group">
              <label>PO Reference # <span style="color: var(--red-600);">*</span></label>
              <input type="text" v-model="purForm.poNumber" class="form-input" required />
            </div>
          </div>
          <div class="form-group">
            <label>Item Description / Batch Details <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="purForm.items" class="form-input" placeholder="e.g. 50x Logitech Master 3, 20x Monitors" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (₱) <span style="color: var(--red-600);">*</span></label>
              <input type="number" step="0.01" v-model.number="purForm.amount" min="1" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select v-model="purForm.method" class="form-select">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="GCash Biz">GCash Biz</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showLogPurchaseModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Record Purchase</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Supplier History & Date Ledger -->
    <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
      <div class="modal-card" style="max-width: 840px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">
            <History style="width: 22px; height: 22px; color: var(--primary); display: inline-block; vertical-align: middle; margin-right: 6px;" />
            <span>Purchase History & Date Ledger — {{ activeSupplier?.name }}</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showHistoryModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div>
              <strong>Code:</strong> {{ activeSupplier?.code }} | 
              <strong>Contact:</strong> {{ activeSupplier?.contact }} ({{ activeSupplier?.phone }})
            </div>
            <div class="status-badge status-completed" style="font-size: 0.9rem;">
              Total Spent: ₱{{ activeSupplierTotalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
          </div>

          <div class="table-responsive" style="max-height: 320px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Purchase Date</th>
                  <th>PO Reference</th>
                  <th>Items Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in activeSupplierPurchases" :key="p.id">
                  <td><strong style="color: var(--text-main);"><Calendar style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" /> {{ p.date }}</strong></td>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">#{{ p.poNumber }}</span></td>
                  <td>{{ p.items }}</td>
                  <td class="font-bold" style="color: #34D399;">₱{{ Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                  <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ p.method }}</span></td>
                  <td><span class="status-badge status-completed">{{ p.status }}</span></td>
                  <td style="text-align: right;">
                    <button class="icon-btn text-danger" title="Delete Purchase Entry" style="width: 32px; height: 32px;" @click="delPurchase(p.id)">
                      <Trash2 style="width: 15px; height: 15px;" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!activeSupplierPurchases.length">
                  <td colspan="7" class="text-center" style="padding: 2rem 0; color: var(--text-muted);">
                    No purchase history logged for this supplier yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showHistoryModal = false">Close Ledger</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { Download, Plus, Search, Calendar, PlusCircle, History, Trash2, Users, X } from 'lucide-vue-next'

const search = ref('')
const filterDate = ref('')
const statusFilter = ref('')

const showRegisterModal = ref(false)
const showLogPurchaseModal = ref(false)
const showHistoryModal = ref(false)

const activeSupplier = ref(null)

const supForm = ref({
  code: 'SUP-00' + (store.suppliers.length + 1),
  name: '',
  contact: '',
  email: '',
  phone: '',
  category: 'Electronics',
  address: '',
  totalPurchase: 0,
  totalOrders: 0,
  status: 'Active'
})

const purForm = ref({
  supplierCode: '',
  date: new Date().toISOString().slice(0, 10),
  poNumber: 'PO-2026-001',
  items: '',
  amount: 0,
  method: 'Bank Transfer',
  status: 'Paid'
})

const filteredSuppliers = computed(() => {
  return store.suppliers.filter(s => {
    const q = search.value.toLowerCase().trim()
    const matchesSearch = !q || 
      s.name.toLowerCase().includes(q) || 
      s.code.toLowerCase().includes(q) || 
      s.contact.toLowerCase().includes(q) || 
      s.category.toLowerCase().includes(q)

    const matchesStatus = !statusFilter.value || s.status === statusFilter.value
    
    let matchesDate = true
    if (filterDate.value) {
      const supPurchases = store.purchases.filter(p => p.supplierCode === s.code || p.supplierCode === s.id)
      matchesDate = supPurchases.some(p => p.date === filterDate.value) || s.lastPurchaseDate === filterDate.value
    }

    return matchesSearch && matchesStatus && matchesDate
  })
})

const activeSupplierPurchases = computed(() => {
  if (!activeSupplier.value) return []
  return store.purchases.filter(p => p.supplierCode === activeSupplier.value.code || p.supplierCode === activeSupplier.value.id)
})

const activeSupplierTotalSpent = computed(() => {
  return activeSupplierPurchases.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

function openRegisterSupplierModal() {
  supForm.value = {
    code: 'SUP-00' + (store.suppliers.length + 1),
    name: '',
    contact: '',
    email: '',
    phone: '',
    category: store.categories[0]?.name || 'Electronics',
    address: '',
    totalPurchase: 0,
    totalOrders: 0,
    status: 'Active'
  }
  showRegisterModal.value = true
}

function saveSupplier() {
  if (!supForm.value.name || !supForm.value.email) return
  store.addSupplier({ ...supForm.value })
  showRegisterModal.value = false
  alert(`Supplier "${supForm.value.name}" registered!`)
}

function openLogPurchaseModal(s) {
  purForm.value = {
    supplierCode: s.code,
    date: new Date().toISOString().slice(0, 10),
    poNumber: 'PO-2026-10' + (store.purchases.length + 1),
    items: 'Stock Batch Replenishment',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'Paid'
  }
  showLogPurchaseModal.value = true
}

function savePurchaseOrder() {
  if (!purForm.value.amount || !purForm.value.items) return
  store.addSupplierPurchase({
    id: 'PUR-' + Math.floor(1000 + Math.random() * 9000),
    ...purForm.value
  })
  showLogPurchaseModal.value = false
  alert(`Recorded Purchase Order #${purForm.value.poNumber} for ${purForm.value.date}!`)
}

function openHistoryModal(s) {
  activeSupplier.value = s
  showHistoryModal.value = true
}

function delPurchase(purId) {
  if (confirm('Delete this purchase transaction entry?')) {
    store.deletePurchase(purId)
  }
}

function deleteSup(code) {
  if (confirm(`Delete supplier ${code}?`)) {
    store.deleteSupplier(code)
  }
}

function exportSuppliersCSV() {
  let csv = 'Code,Name,Contact,Email,Phone,Category,Total Purchase,Last Purchase Date,Status\n'
  store.suppliers.forEach(s => {
    csv += `"${s.code}","${s.name}","${s.contact}","${s.email}","${s.phone}","${s.category}",${s.totalPurchase},"${s.lastPurchaseDate || ''}","${s.status}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Suppliers_Date_Ledger.csv'
  a.click()
}
</script>
