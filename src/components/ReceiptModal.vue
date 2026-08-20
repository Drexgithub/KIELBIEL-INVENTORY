<template>
  <div v-if="store.activeReceiptModal" id="receiptModal" class="modal-overlay" @click.self="store.closeReceipt">
    <div class="receipt-card printable-a4-document">
      
      <!-- Company Official Header -->
      <div class="receipt-header">
        <h1 class="company-title">KIEL BIEL CONSUMER GOODS TRADING</h1>
        <p class="company-subtitle">Brgy.42 Rawis, Legazpi City</p>
        <p class="company-subtitle">Cp# 09985317204</p>
        <div class="official-invoice-tag">OFFICIAL RECEIPT / INVOICE</div>
        <div style="margin-top: 6px;">
          <span 
            class="status-badge" 
            :class="(receipt.status === 'Paid' || receipt.status === 'Completed' || !receipt.status) ? 'status-completed' : (receipt.status === 'Refunded' ? 'status-cancelled' : 'status-pending')"
            style="font-weight: 800; font-size: 0.78rem; padding: 3px 12px; text-transform: uppercase;"
          >
            ● {{ (receipt.status === 'Paid' || receipt.status === 'Completed' || !receipt.status) ? 'PAID' : receipt.status }}
          </span>
        </div>
      </div>

      <!-- Receipt Metadata Grid -->
      <div class="receipt-meta-grid">
        <div class="meta-column">
          <div><span class="meta-label">Customer Name:</span> <strong class="meta-val">{{ receipt.customer_name || 'Walk-in Customer' }}</strong></div>
          <div><span class="meta-label">Customer Address:</span> <span class="meta-val">{{ customerAddress }}</span></div>
          <div><span class="meta-label">Cashier:</span> <span class="meta-val">{{ receipt.cashier_name }}</span></div>
          <div><span class="meta-label">Payment Method:</span> <span class="meta-val">{{ receipt.payment_method }}</span></div>
        </div>
        <div class="meta-column text-right">
          <div><span class="meta-label">Receipt No:</span> <strong class="meta-val text-primary">{{ receipt.receipt_no }}</strong></div>
          <div><span class="meta-label">Invoice Ref:</span> <span class="meta-val">{{ receipt.invoice_no }}</span></div>
          <div><span class="meta-label">Date & Time:</span> <span class="meta-val">{{ receipt.created_at }}</span></div>
          <div><span class="meta-label">Payment Status:</span> <strong class="meta-val" :style="{ color: (receipt.status === 'Paid' || receipt.status === 'Completed' || !receipt.status) ? '#10B981' : '#F59E0B', fontWeight: 700 }">{{ (receipt.status === 'Paid' || receipt.status === 'Completed' || !receipt.status) ? 'PAID' : receipt.status }}</strong></div>
        </div>
      </div>

      <!-- Itemized Table -->
      <table class="receipt-items-table">
        <thead>
          <tr>
            <th style="width: 45%;">Item Description</th>
            <th style="text-align: center; width: 15%;">Qty</th>
            <th style="text-align: right; width: 20%;">Unit Price</th>
            <th style="text-align: right; width: 20%;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in receipt.items" :key="idx">
            <td>
              <strong style="color: var(--text-main); font-weight: 700;">{{ item.item_desc }}</strong>
            </td>
            <td style="text-align: center; color: var(--text-main); font-weight: 600;">{{ item.quantity }}</td>
            <td style="text-align: right; color: var(--text-main);">₱{{ Number(item.unit_price).toFixed(2) }}</td>
            <td style="text-align: right; font-weight: 700; color: var(--text-main);">₱{{ Number(item.line_total).toFixed(2) }}</td>
          </tr>
          <tr v-if="!receipt.items || !receipt.items.length">
            <td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No items recorded for this receipt.</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals Breakdown -->
      <div class="receipt-totals-container">
        <div class="receipt-totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span style="color: var(--text-main); font-weight: 600;">₱{{ Number(receipt.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="total-row" v-if="receipt.discount > 0">
            <span>Discount:</span>
            <span style="color: var(--red-600); font-weight: 600;">-₱{{ Number(receipt.discount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="total-row" v-if="receipt.tax > 0">
            <span>VAT / Tax:</span>
            <span style="color: var(--text-main); font-weight: 600;">₱{{ Number(receipt.tax).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>GRAND TOTAL:</span>
            <span style="color: var(--text-main); font-weight: 800;">₱{{ Number(receipt.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>
      </div>

      <!-- Barcode / Reference -->
      <div class="receipt-barcode">
        <div class="barcode-lines">
          <div class="barcode-bar" style="width: 2px;"></div>
          <div class="barcode-bar" style="width: 4px;"></div>
          <div class="barcode-bar" style="width: 1px;"></div>
          <div class="barcode-bar" style="width: 3px;"></div>
          <div class="barcode-bar" style="width: 5px;"></div>
          <div class="barcode-bar" style="width: 2px;"></div>
          <div class="barcode-bar" style="width: 4px;"></div>
          <div class="barcode-bar" style="width: 1px;"></div>
          <div class="barcode-bar" style="width: 3px;"></div>
        </div>
        <div class="barcode-text">*{{ receipt.receipt_no }}*</div>
      </div>

      <!-- Official Footer Signatures -->
      <div class="receipt-footer">
        <div class="signature-section">
          <div class="sig-box">
            <div class="sig-line"></div>
            <span>Authorized Signature</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <span>Received By (Customer Signature)</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons (Hidden on Print) -->
      <div class="modal-footer no-print-controls" style="margin-top: 1.5rem; justify-content: center; gap: 1rem;">
        <button class="btn btn-outline" @click="store.closeReceipt">
          <X style="width: 16px; height: 16px;" /> Close
        </button>
        <button class="btn btn-mint" @click="printReceipt">
          <Printer style="width: 16px; height: 16px;" /> Print Full A4 Receipt
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { Printer, X } from 'lucide-vue-next'

const receipt = computed(() => store.activeReceiptModal || {})

const customerAddress = computed(() => {
  if (receipt.value.customer_address) return receipt.value.customer_address
  const custName = (receipt.value.customer_name || '').toLowerCase()
  if (!custName || custName === 'walk-in customer') return 'Store Direct'
  const found = store.customers.find(c => c.name.toLowerCase() === custName)
  return found ? (found.address || 'Store Direct') : 'Store Direct'
})

function printReceipt() {
  window.print()
}
</script>

<style scoped>
/* Screen styling for receipt card modal - adapts dynamically to dark/light mode */
.receipt-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 680px;
  width: 90%;
  margin: auto;
  border: 1px solid var(--border);
  color: var(--text-main);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.receipt-header {
  text-align: center;
  border-bottom: 2px solid var(--border);
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.company-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: var(--text-main);
}

.company-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.official-invoice-tag {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.35rem 1rem;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.85rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.receipt-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  font-size: 0.875rem;
  padding: 1rem;
  background: var(--input-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: 1.5rem;
}

.meta-label { color: var(--text-muted); font-size: 0.8rem; }
.meta-val { color: var(--text-main); }

.receipt-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.receipt-items-table th {
  padding: 0.75rem 1rem;
  background: var(--bg-main);
  border-bottom: 2px solid var(--border);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.receipt-items-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-main);
}

.receipt-totals-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.receipt-totals-box {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.total-row { display: flex; justify-content: space-between; color: var(--text-muted); }
.total-row.grand-total {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  border-top: 2px dashed var(--border);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.receipt-barcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 1.5rem 0;
}

.barcode-lines { display: flex; gap: 3px; height: 32px; align-items: center; }
.barcode-bar { background: var(--text-main); height: 100%; }
.barcode-text { font-family: monospace; font-size: 0.8rem; color: var(--text-muted); }

.receipt-footer {
  text-align: center;
  border-top: none;
  padding-top: 0;
  margin-top: 2rem;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.sig-box {
  width: 42%;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-main);
}

.sig-line {
  border-top: 1.5px solid var(--text-main);
  margin-bottom: 6px;
}

/* ==================================================================== */
/* EXACT FULL A4 PRINT STYLES (Always Solid Black Text on Paper)        */
/* ==================================================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 0mm !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  body * {
    visibility: hidden !important;
  }

  #receiptModal, #receiptModal * {
    visibility: visible !important;
  }

  #receiptModal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    min-height: 100% !important;
    background: #ffffff !important;
    backdrop-filter: none !important;
    padding: 15mm 20mm !important;
    margin: 0 !important;
    border: none !important;
    border-left: none !important;
    box-shadow: none !important;
    display: block !important;
    overflow: visible !important;
    z-index: 999999 !important;
  }

  .receipt-card {
    max-width: 100% !important;
    width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    border-left: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
  }

  .company-title { color: #000000 !important; font-size: 18pt !important; }
  .company-subtitle { color: #333333 !important; font-size: 9pt !important; }
  .official-invoice-tag {
    background: #f1f5f9 !important;
    color: #000000 !important;
    border: 1px solid #000000 !important;
  }

  .receipt-meta-grid {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #000000 !important;
  }

  .meta-label { color: #475569 !important; }
  .meta-val { color: #000000 !important; }

  .receipt-items-table th {
    background: #e2e8f0 !important;
    color: #000000 !important;
    border-bottom: 2px solid #000000 !important;
  }

  .receipt-items-table td,
  .receipt-items-table td strong,
  .receipt-items-table td span {
    color: #000000 !important;
    font-weight: 700 !important;
    border-bottom: 1px solid #cbd5e1 !important;
  }

  .total-row span { color: #000000 !important; }
  .total-row.grand-total span {
    color: #000000 !important;
    border-top: 2px solid #000000 !important;
  }

  .barcode-bar { background: #000000 !important; }
  .barcode-text { color: #000000 !important; }

  .receipt-footer {
    border-top: none !important;
    padding-top: 0 !important;
    margin-top: 40px !important;
  }

  .signature-section {
    display: flex !important;
    justify-content: space-between !important;
    margin-top: 40px !important;
    padding-top: 0 !important;
  }

  .sig-box {
    width: 42% !important;
    text-align: center !important;
    font-size: 10pt !important;
    color: #000000 !important;
  }

  .sig-line {
    border-top: 1.5px solid #000000 !important;
    margin-bottom: 8px !important;
  }

  .no-print-controls,
  .modal-footer,
  button,
  .btn {
    display: none !important;
  }
}
</style>
