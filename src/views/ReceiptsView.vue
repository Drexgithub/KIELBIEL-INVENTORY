<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Receipts & Sales Ledger</h1>
        <p class="page-description">Audit historical customer transactions, filter receipts by date, and reprint invoices.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportCSV">
          <Download /> Export CSV
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div class="search-container" style="max-width: 340px;">
          <Search class="search-icon" />
          <input type="text" v-model="search" placeholder="Search receipt #, customer name..." />
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <input type="date" v-model="filterDate" class="form-input" style="width: 160px; height: 38px; padding: 0.25rem 0.75rem;" />
          <select v-model="statusFilter" class="form-select" style="width: 150px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>
          <button v-if="filterDate" class="btn btn-outline btn-sm" @click="filterDate = ''">Clear Date</button>
        </div>
      </div>

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
              <td><strong style="color: var(--primary);">{{ r.receipt_no }}</strong></td>
              <td>{{ r.created_at }}</td>
              <td>{{ r.customer_name }}</td>
              <td>{{ r.cashier_name }}</td>
              <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ r.payment_method }}</span></td>
              <td class="font-bold" style="color: var(--text-main);">₱{{ Number(r.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
              <td>
                <span 
                  class="status-badge" 
                  :class="isPaid(r) ? 'status-completed' : (r.status === 'Refunded' ? 'status-cancelled' : 'status-pending')"
                  style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700;"
                >
                  <CheckCircle2 v-if="isPaid(r)" style="width: 12px; height: 12px;" />
                  <Clock v-else-if="r.status !== 'Refunded'" style="width: 12px; height: 12px;" />
                  {{ isPaid(r) ? 'Paid' : (r.status || 'Unpaid') }}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <button 
                    class="btn btn-sm" 
                    :class="isPaid(r) ? 'btn-paid-success' : 'btn-paid-outline'"
                    :title="isPaid(r) ? 'Click to mark as Unpaid' : 'Click to mark as Paid'"
                    @click="toggleReceiptPaid(r)"
                    style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; font-size: 0.75rem; font-weight: 700; height: 32px; border-radius: var(--radius-sm); cursor: pointer;"
                  >
                    <CheckCircle2 v-if="isPaid(r)" style="width: 13px; height: 13px;" />
                    <Clock v-else style="width: 13px; height: 13px;" />
                    <span>{{ isPaid(r) ? 'Paid' : 'Mark Paid' }}</span>
                  </button>

                  <button class="icon-btn" title="View Receipt" style="width: 32px; height: 32px; display: inline-flex;" @click="store.openReceipt(r)">
                    <Eye style="width: 15px; height: 15px;" />
                  </button>
                  <button class="icon-btn" title="Print Receipt" style="width: 32px; height: 32px; display: inline-flex;" @click="directPrint(r)">
                    <Printer style="width: 15px; height: 15px; color: var(--primary);" />
                  </button>
                  <button class="icon-btn text-danger" title="Delete Receipt" style="width: 32px; height: 32px; display: inline-flex;" @click="delReceipt(r.receipt_no)">
                    <Trash2 style="width: 15px; height: 15px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredReceipts.length">
              <td colspan="8" class="text-center" style="padding: 3rem 0; color: var(--text-muted);">
                No receipts found matching your search filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { Download, Search, Eye, Printer, Trash2, CheckCircle2, Clock } from 'lucide-vue-next'

const search = ref('')
const filterDate = ref('')
const statusFilter = ref('')

function isPaid(r) {
  return r.status === 'Paid' || r.status === 'Completed'
}

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

function delReceipt(receiptNo) {
  if (confirm(`Delete receipt entry ${receiptNo}?`)) {
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

<style scoped>
.btn-paid-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
}
.btn-paid-success:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: #10B981;
  transform: translateY(-1px);
}
.btn-paid-outline {
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.35);
  transition: all 0.2s ease;
}
.btn-paid-outline:hover {
  background: rgba(245, 158, 11, 0.22);
  border-color: #F59E0B;
  transform: translateY(-1px);
}
</style>
