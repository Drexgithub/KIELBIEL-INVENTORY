<template>
  <div class="og-receipts-page">
    
    <!-- 1. PAGE HEADER -->
    <div class="og-page-header">
      <div class="og-page-title-box">
        <h1 class="og-page-title">Receipts</h1>
        <p class="og-page-subtitle">Audit historical customer transactions, filter receipts by date, and reprint invoices.</p>
      </div>
      <div class="og-header-actions">
        <button class="btn-dark" @click="exportCSV">
          <Download style="width: 14px; height: 14px;" />
          <span>Export CSV</span>
        </button>
        <router-link to="/pos" class="btn btn-primary">
          <span>+ Add New Sale</span>
        </router-link>
      </div>
    </div>

    <!-- 2. TOP 3 STAT CARDS (Matches Screen 4: Incomes & Expenses) -->
    <section class="og-stat-grid" style="grid-template-columns: repeat(3, 1fr);">
      <!-- Total Income -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <span style="color: #10B981; font-weight: 700;">↑</span>
          <span>Total income</span>
        </div>
        <div class="og-stat-value" style="color: #FFFFFF;">
          ₱{{ Number(totalIncomeAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+15%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Total Expense -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <span style="color: #EC4899; font-weight: 700;">↑</span>
          <span>Total expense</span>
        </div>
        <div class="og-stat-value" style="color: #FFFFFF;">
          ₱{{ Number(totalExpenseAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="og-stat-trend" style="color: #EC4899;">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+2%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Net Profit/Loss -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <span style="color: #2563EB; font-weight: 700;">◎</span>
          <span>Net Profit/Loss</span>
        </div>
        <div class="og-stat-value" style="color: #10B981;">
          +₱{{ Number(netProfitAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+20%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>
    </section>

    <!-- 3. TABLE CARD: RECENT INCOMES & EXPENSES OVERVIEW -->
    <div class="og-card">
      <div class="og-card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 class="og-card-title">Receipts Ledger Overview</h2>
          <div class="og-card-sub">Showing {{ filteredReceipts.length }} of {{ store.receipts.length }} total transactions</div>
        </div>

        <!-- Filter Controls -->
        <div class="og-filter-group">
          <!-- Search Box -->
          <div class="search-container" style="width: 260px;">
            <Search class="search-icon" />
            <input type="text" v-model="search" placeholder="Search receipt, customer..." />
          </div>

          <!-- Date Filter -->
          <input type="date" v-model="filterDate" class="form-input" style="height: 36px; padding: 4px 10px; width: 145px;" />

          <!-- Status Dropdown -->
          <select v-model="statusFilter" class="og-pill-select" style="height: 36px;">
            <option value="">All statuses ▾</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button v-if="filterDate || search || statusFilter" class="btn-dark btn-sm" @click="clearFilters">
            Clear filter
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Cashier</th>
              <th>Payment Method</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredReceipts" :key="r.receipt_no">
              <td>
                <strong style="color: #3B82F6; font-family: monospace; font-size: 0.9rem;">
                  {{ r.receipt_no }}
                </strong>
              </td>
              <td style="color: var(--og-text-secondary); font-size: 0.8rem;">{{ r.created_at }}</td>
              <td>
                <span style="font-weight: 600; color: #FFFFFF;">{{ r.customer_name }}</span>
              </td>
              <td style="color: var(--og-text-secondary);">{{ r.cashier_name }}</td>
              <td>
                <span class="user-pill">{{ r.payment_method }}</span>
              </td>
              <td>
                <span style="font-weight: 700; color: #10B981; font-size: 0.92rem;">
                  +₱{{ Number(r.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </td>
              <td>
                <span 
                  class="status-badge" 
                  :class="isPaid(r) ? 'status-completed' : (r.status === 'Refunded' ? 'status-cancelled' : 'status-pending')"
                >
                  <CheckCircle2 v-if="isPaid(r)" style="width: 12px; height: 12px;" />
                  <Clock v-else-if="r.status !== 'Refunded'" style="width: 12px; height: 12px;" />
                  <span>{{ isPaid(r) ? 'Paid' : (r.status || 'Unpaid') }}</span>
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 5px;">
                  <!-- Mark Paid / Unpaid Button -->
                  <button 
                    class="btn-dark btn-sm" 
                    :title="isPaid(r) ? 'Click to mark Unpaid' : 'Click to mark Paid'"
                    @click="toggleReceiptPaid(r)"
                    style="height: 30px; font-size: 0.74rem;"
                  >
                    <CheckCircle2 v-if="isPaid(r)" style="width: 12px; height: 12px; color: #10B981;" />
                    <Clock v-else style="width: 12px; height: 12px; color: #F59E0B;" />
                    <span>{{ isPaid(r) ? 'Paid' : 'Mark Paid' }}</span>
                  </button>

                  <!-- View Receipt -->
                  <button class="icon-btn" style="width: 30px; height: 30px;" title="View Receipt" @click="store.openReceipt(r)">
                    <Eye style="width: 14px; height: 14px;" />
                  </button>

                  <!-- Direct Print -->
                  <button class="icon-btn" style="width: 30px; height: 30px;" title="Print Receipt" @click="directPrint(r)">
                    <Printer style="width: 14px; height: 14px; color: #3B82F6;" />
                  </button>

                  <!-- Delete Receipt -->
                  <button class="icon-btn text-danger" style="width: 30px; height: 30px;" title="Delete Receipt" @click="openDeleteModal(r)">
                    <Trash2 style="width: 14px; height: 14px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredReceipts.length">
              <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--og-text-muted);">
                No transactions found matching your search filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="og-pagination-bar">
        <span>Showing {{ filteredReceipts.length }} of {{ store.receipts.length }} row(s)</span>
        <div class="og-pagination-controls">
          <button class="og-page-btn">&lt; Previous</button>
          <button class="og-page-btn active">1</button>
          <button class="og-page-btn">2</button>
          <button class="og-page-btn">3</button>
          <button class="og-page-btn">Next &gt;</button>
        </div>
      </div>
    </div>

    <!-- 4. DELETE RECEIPT CONFIRMATION MODAL -->
    <transition name="fade">
      <div v-if="receiptToDelete" class="modal-overlay" @click.self="receiptToDelete = null">
        <div class="modal-card" style="max-width: 450px; text-align: center; padding: 2rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <Trash2 style="width: 28px; height: 28px;" />
          </div>

          <h3 style="font-size: 1.25rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem;">
            Delete Receipt?
          </h3>

          <p style="font-size: 0.88rem; color: var(--og-text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
            Are you sure you want to permanently delete receipt <strong style="color: #3B82F6; font-family: monospace;">{{ receiptToDelete.receipt_no }}</strong> for <strong>{{ receiptToDelete.customer_name || 'Walk-in Customer' }}</strong> (₱{{ Number(receiptToDelete.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }})?
            <br><span style="color: #EF4444; font-size: 0.78rem;">This will permanently remove the record from both local state and cloud database.</span>
          </p>

          <div v-if="deleteError" class="status-badge status-cancelled" style="padding: 8px 12px; font-size: 0.82rem; margin-bottom: 1rem;">
            {{ deleteError }}
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button 
              type="button" 
              class="btn btn-outline w-100" 
              @click="receiptToDelete = null"
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-danger w-100" 
              @click="confirmDeleteReceipt"
              :disabled="isDeleting"
              style="background: #DC2626; border-color: #DC2626; color: #FFFFFF; font-weight: 700;"
            >
              <span v-if="isDeleting" class="btn-spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
              <span>{{ isDeleting ? 'Deleting...' : 'Delete Permanently' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Download, 
  Search, 
  Eye, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight 
} from 'lucide-vue-next'

onMounted(async () => {
  await store.loadAllFromSupabase()
})

const search = ref('')
const filterDate = ref('')
const statusFilter = ref('')

function clearFilters() {
  search.value = ''
  filterDate.value = ''
  statusFilter.value = ''
}

function isPaid(r) {
  return r.status === 'Paid'
}

const totalIncomeAmount = computed(() => {
  return store.receipts.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)
})

const totalExpenseAmount = computed(() => {
  return store.totalCOGS || 1256.00
})

const netProfitAmount = computed(() => {
  return Math.max(0, totalIncomeAmount.value - totalExpenseAmount.value)
})

const filteredReceipts = computed(() => {
  return store.receipts.filter(r => {
    const q = search.value.toLowerCase().trim()
    const matchesSearch = !q || 
      r.receipt_no.toLowerCase().includes(q) || 
      r.customer_name.toLowerCase().includes(q) ||
      r.cashier_name.toLowerCase().includes(q) ||
      r.invoice_no.toLowerCase().includes(q)

    let matchesStatus = true
    if (statusFilter.value === 'Paid') {
      matchesStatus = isPaid(r)
    } else if (statusFilter.value === 'Unpaid') {
      matchesStatus = !isPaid(r) && r.status !== 'Refunded'
    } else if (statusFilter.value === 'Refunded') {
      matchesStatus = r.status === 'Refunded'
    } else if (statusFilter.value) {
      matchesStatus = r.status === statusFilter.value
    }

    const matchesDate = !filterDate.value || r.created_at.startsWith(filterDate.value)

    return matchesSearch && matchesStatus && matchesDate
  })
})

function toggleReceiptPaid(r) {
  const newStatus = isPaid(r) ? 'Unpaid' : 'Paid'
  store.updateReceiptStatus(r.receipt_no, newStatus)
}

function directPrint(r) {
  store.openReceipt(r)
  setTimeout(() => {
    window.print()
  }, 300)
}

// Delete modal state
const receiptToDelete = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')
const deleteSuccess = ref('')

function openDeleteModal(r) {
  receiptToDelete.value = r
  deleteError.value = ''
}

async function confirmDeleteReceipt() {
  if (!receiptToDelete.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''

  const recNo = receiptToDelete.value.receipt_no
  try {
    await store.deleteReceipt(recNo)
    deleteSuccess.value = `✓ Receipt ${recNo} permanently deleted.`
    receiptToDelete.value = null
    setTimeout(() => {
      deleteSuccess.value = ''
    }, 3000)
  } catch (err) {
    console.error('Delete receipt error:', err)
    deleteError.value = 'Failed to delete receipt: ' + (err.message || err)
  } finally {
    isDeleting.value = false
  }
}

function delReceipt(receiptNo) {
  const r = store.receipts.find(item => item.receipt_no === receiptNo)
  if (r) {
    openDeleteModal(r)
  } else {
    store.deleteReceipt(receiptNo)
  }
}

function exportCSV() {
  let csv = 'Receipt No,Invoice No,Customer,Cashier,Payment Method,Grand Total,Status,Date\n'
  store.receipts.forEach(r => {
    const statusLabel = isPaid(r) ? 'Paid' : (r.status || 'Unpaid')
    csv += `"${r.receipt_no}","${r.invoice_no}","${r.customer_name}","${r.cashier_name}","${r.payment_method}",${r.grand_total},"${statusLabel}","${r.created_at}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Receipts_Ledger_Export.csv'
  a.click()
}
</script>
