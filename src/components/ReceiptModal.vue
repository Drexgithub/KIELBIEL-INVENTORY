<template>
  <div v-if="store.activeReceiptModal" id="receiptModal" class="modal-overlay" @click.self="store.closeReceipt">
    <div class="receipt-card printable-a4-document">
      
      <!-- Company Official Header -->
      <div class="receipt-header">
        <h1 class="company-title">KIEL BIEL CONSUMER GOODS TRADING</h1>
        <p class="company-subtitle">Brgy.42 Rawis, Legazpi City</p>
        <p class="company-subtitle">Cp# 09985317204</p>
        <div class="official-invoice-tag">OFFICIAL RECEIPT / INVOICE</div>
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
/* Screen styling for receipt card modal - compact, space-efficient, highly legible */
.receipt-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.75rem;
  max-width: 640px;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  border: 1px solid var(--border);
  color: var(--text-main);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.4);
}

.receipt-header {
  text-align: center;
  border-bottom: 1.5px solid var(--border);
  padding-bottom: 0.6rem;
  margin-bottom: 0.75rem;
}

.company-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: var(--text-main);
  margin: 0;
  line-height: 1.2;
}

.company-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 1px;
  line-height: 1.3;
}

.official-invoice-tag {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.2rem 0.75rem;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.72rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.receipt-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  font-size: 0.75rem;
  padding: 0.6rem 0.85rem;
  background: var(--input-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: 0.75rem;
  line-height: 1.45;
}

.meta-label { color: var(--text-muted); font-size: 0.72rem; }
.meta-val { color: var(--text-main); font-size: 0.75rem; }

.receipt-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.75rem;
}

.receipt-items-table th {
  padding: 0.4rem 0.5rem;
  background: var(--bg-main);
  border-bottom: 1.5px solid var(--border);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  font-weight: 700;
}

.receipt-items-table td {
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-main);
  line-height: 1.3;
}

.receipt-totals-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.6rem;
}

.receipt-totals-box {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.total-row { display: flex; justify-content: space-between; color: var(--text-muted); }
.total-row.grand-total {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  border-top: 1.5px dashed var(--border);
  padding-top: 0.4rem;
  margin-top: 0.2rem;
}

.receipt-barcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0.5rem 0;
}

.barcode-lines { display: flex; gap: 2.5px; height: 22px; align-items: center; }
.barcode-bar { background: var(--text-main); height: 100%; }
.barcode-text { font-family: monospace; font-size: 0.7rem; color: var(--text-muted); }

.receipt-footer {
  text-align: center;
  border-top: none;
  padding-top: 0;
  margin-top: 0.5rem;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.sig-box {
  width: 42%;
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-main);
}

.sig-line {
  border-top: 1.2px solid var(--text-main);
  margin-bottom: 4px;
}

/* ==================================================================== */
/* EXACT FULL A4 PRINT STYLES (Clean Multi-Page Overflow Support)       */
/* ==================================================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 15mm 15mm 15mm !important;
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
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    min-height: auto !important;
    background: #ffffff !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-left: none !important;
    box-shadow: none !important;
    display: block !important;
    overflow: visible !important;
    z-index: auto !important;
  }

  .receipt-card {
    max-width: 100% !important;
    width: 100% !important;
    max-height: none !important;
    box-shadow: none !important;
    border: none !important;
    border-left: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
  }

  .receipt-header {
    text-align: center !important;
    border-bottom: 2px solid #000000 !important;
    padding-bottom: 1.25rem !important;
    margin-bottom: 1.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .company-title {
    color: #000000 !important;
    font-size: 18pt !important;
    font-weight: 800 !important;
  }

  .company-subtitle {
    color: #333333 !important;
    font-size: 9pt !important;
  }

  .official-invoice-tag {
    display: inline-block !important;
    background: #f1f5f9 !important;
    color: #000000 !important;
    border: 1px solid #000000 !important;
    font-size: 8.5pt !important;
    font-weight: 800 !important;
    padding: 3px 12px !important;
    margin-top: 8px !important;
    border-radius: 999px !important;
  }

  .receipt-meta-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1rem !important;
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #000000 !important;
    padding: 1rem !important;
    margin-bottom: 1.5rem !important;
    font-size: 9pt !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .meta-label { color: #475569 !important; font-size: 8.5pt !important; }
  .meta-val { color: #000000 !important; font-size: 9pt !important; }

  .receipt-items-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 1.5rem !important;
    page-break-inside: auto !important;
  }

  .receipt-items-table thead {
    display: table-header-group !important;
  }

  .receipt-items-table tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-items-table th {
    background: #e2e8f0 !important;
    color: #000000 !important;
    border-bottom: 2px solid #000000 !important;
    padding: 0.6rem 0.75rem !important;
    font-size: 8.5pt !important;
    text-transform: uppercase !important;
    font-weight: 700 !important;
  }

  .receipt-items-table td,
  .receipt-items-table td strong,
  .receipt-items-table td span {
    color: #000000 !important;
    font-weight: 600 !important;
    border-bottom: none !important;
    padding: 0.5rem 0.75rem !important;
    font-size: 9pt !important;
  }

  .receipt-totals-container {
    display: flex !important;
    justify-content: flex-end !important;
    margin-bottom: 1.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-totals-box {
    width: 280px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.4rem !important;
    font-size: 9pt !important;
  }

  .total-row span { color: #000000 !important; }
  .total-row.grand-total {
    font-size: 12pt !important;
    padding-top: 0.5rem !important;
    margin-top: 0.25rem !important;
  }
  .total-row.grand-total span {
    color: #000000 !important;
    font-weight: 800 !important;
    border-top: 2px solid #000000 !important;
  }

  .receipt-barcode {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 4px !important;
    margin: 1.5rem 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .barcode-lines { display: flex !important; gap: 3px !important; height: 28px !important; align-items: center !important; }
  .barcode-bar { background: #000000 !important; height: 100% !important; }
  .barcode-text { color: #000000 !important; font-size: 8.5pt !important; font-family: monospace !important; }

  .receipt-footer {
    border-top: none !important;
    padding-top: 0 !important;
    margin-top: 2rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .signature-section {
    display: flex !important;
    justify-content: space-between !important;
    margin-top: 40px !important;
    padding-top: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .sig-box {
    width: 42% !important;
    text-align: center !important;
    font-size: 9.5pt !important;
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
