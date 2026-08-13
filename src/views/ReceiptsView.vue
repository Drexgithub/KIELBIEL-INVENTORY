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
            <option value="Completed">Completed</option>
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
                <span class="status-badge" :class="r.status === 'Completed' ? 'status-completed' : 'status-cancelled'">
                  {{ r.status }}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="icon-btn" title="View Receipt" style="width: 32px; height: 32px; display: inline-flex;" @click="store.openReceipt(r)">
                  <Eye style="width: 15px; height: 15px;" />
                </button>
                <button class="icon-btn" title="Print Receipt" style="width: 32px; height: 32px; display: inline-flex; margin-left: 4px;" @click="directPrint(r)">
                  <Printer style="width: 15px; height: 15px; color: var(--primary);" />
                </button>
                <button class="icon-btn text-danger" title="Delete Receipt" style="width: 32px; height: 32px; display: inline-flex; margin-left: 4px;" @click="delReceipt(r.receipt_no)">
                  <Trash2 style="width: 15px; height: 15px;" />
                </button>
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
import { Download, Search, Eye, Printer, Trash2 } from 'lucide-vue-next'

const search = ref('')
const filterDate = ref('')
const statusFilter = ref('')

const filteredReceipts = computed(() => {
  return store.receipts.filter(r => {
    const q = search.value.toLowerCase().trim()
    const matchesSearch = !q || 
      r.receipt_no.toLowerCase().includes(q) || 
      r.customer_name.toLowerCase().includes(q) ||
      r.cashier_name.toLowerCase().includes(q) ||
      r.invoice_no.toLowerCase().includes(q)

    const matchesStatus = !statusFilter.value || r.status === statusFilter.value
    const matchesDate = !filterDate.value || r.created_at.startsWith(filterDate.value)

    return matchesSearch && matchesStatus && matchesDate
  })
})

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
    csv += `"${r.receipt_no}","${r.invoice_no}","${r.customer_name}","${r.cashier_name}","${r.payment_method}",${r.grand_total},"${r.status}","${r.created_at}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Receipts_Ledger_Export.csv'
  a.click()
}
</script>
