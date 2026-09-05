<template>
  <div v-if="store.activeReceiptModal" id="receiptModal" class="modal-overlay" @click.self="store.closeReceipt">
    <div class="receipt-card printable-a4-document">
      
      <!-- Loop over dynamically computed pages -->
      <div 
        v-for="page in paginatedPages" 
        :key="page.pageIndex" 
        class="print-page"
        :class="{ 'first-page': page.isFirst, 'last-page': page.isLast, 'middle-page': !page.isFirst && !page.isLast }"
      >
        <!-- Page Content Wrapper -->
        <div class="page-content-wrapper">
          
          <!-- Screen-Only Page Divider for multi-page modal preview -->
          <div v-if="paginatedPages.length > 1 && !page.isFirst" class="page-screen-divider">
            <span>--- Page {{ page.pageNum }} of {{ page.totalPages }} ---</span>
          </div>

          <!-- Page 1 Only: Company Official Header -->
          <div v-if="page.isFirst" class="receipt-header">
            <h1 class="company-title">KIEL BIEL CONSUMER GOODS TRADING</h1>
            <p class="company-subtitle">Brgy.42 Rawis, Legazpi City</p>
            <p class="company-subtitle">Cp# 09985317204</p>
            <div class="official-invoice-tag">OFFICIAL RECEIPT / INVOICE</div>
          </div>

          <!-- Page 1 Only: Receipt Metadata Grid -->
          <div v-if="page.isFirst" class="receipt-meta-grid">
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

          <!-- Itemized Table for this page -->
          <table class="receipt-items-table" :class="{ 'no-header-table': !page.isFirst }">
            <!-- Table Headings ONLY on Page 1 -->
            <thead v-if="page.isFirst">
              <tr>
                <th style="width: 45%; text-align: left;">Item Description</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Unit Price</th>
                <th style="width: 20%; text-align: right;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in page.items" :key="idx">
                <td style="width: 45%; text-align: left;">
                  <strong class="item-name">{{ item.item_desc }}</strong>
                </td>
                <td style="width: 15%; text-align: center;" class="item-qty">{{ item.quantity }}</td>
                <td style="width: 20%; text-align: right;" class="item-price">₱{{ Number(item.unit_price).toFixed(2) }}</td>
                <td style="width: 20%; text-align: right;" class="item-total">₱{{ Number(item.line_total).toFixed(2) }}</td>
              </tr>
              <tr v-if="!page.items || !page.items.length">
                <td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No items recorded for this receipt.</td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- Final Page Only: Totals and Signatures Pinned to Bottom -->
        <div v-if="page.isLast" class="page-bottom-anchor">
          <!-- Totals Breakdown -->
          <div class="receipt-totals-container">
            <div class="receipt-totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span class="total-val">₱{{ Number(receipt.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="total-row" v-if="receipt.discount > 0">
                <span>Discount:</span>
                <span class="total-val text-discount">-₱{{ Number(receipt.discount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="total-row" v-if="receipt.tax > 0">
                <span>VAT / Tax:</span>
                <span class="total-val">₱{{ Number(receipt.tax).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="total-row grand-total">
                <span>GRAND TOTAL:</span>
                <span class="grand-total-val">₱{{ Number(receipt.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>

          <!-- Official Footer Signatures (Bottom of Final Page Only) -->
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

// Dynamic Pagination Algorithm
function estimateItemHeight(item) {
  const desc = (item.item_desc || '').trim()
  // Approximate character line wrap threshold for 45% description column at 14px font
  const lines = Math.max(1, Math.ceil(desc.length / 32))
  return 34 + (lines - 1) * 16
}

const paginatedPages = computed(() => {
  const items = receipt.value.items || []
  if (!items.length) {
    return [{
      pageIndex: 0,
      pageNum: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      items: []
    }]
  }

  // Printable page capacity units (px equivalent in print container with 2.54cm margins on all sides)
  const TOTAL_PAGE_CAPACITY = 850
  const PAGE_1_HEADER_SPACE = 210 // Company Header + Meta Grid + Table <thead>
  const TOTALS_AND_SIG_SPACE = 160 // Subtotal, Grand Total, Signatures, margins

  // Case 1: All items fit comfortably on a single page
  const singlePageItemCap = TOTAL_PAGE_CAPACITY - PAGE_1_HEADER_SPACE - TOTALS_AND_SIG_SPACE // ~480px (~14 items)
  let totalAllItemsHeight = 0
  for (const it of items) {
    totalAllItemsHeight += estimateItemHeight(it)
  }

  if (totalAllItemsHeight <= singlePageItemCap) {
    return [{
      pageIndex: 0,
      pageNum: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      items: items
    }]
  }

  // Case 2: Multi-page receipt calculation
  const pages = []
  let currentIndex = 0
  let pageNum = 1

  // Page 1
  const page1Capacity = TOTAL_PAGE_CAPACITY - PAGE_1_HEADER_SPACE // ~640px (~18-19 items)
  let currentAccumulated = 0
  const page1Items = []

  while (currentIndex < items.length) {
    const itemH = estimateItemHeight(items[currentIndex])
    if (currentAccumulated + itemH > page1Capacity && page1Items.length > 0) {
      break
    }
    page1Items.push(items[currentIndex])
    currentAccumulated += itemH
    currentIndex++
  }

  pages.push({
    pageIndex: 0,
    pageNum: 1,
    isFirst: true,
    isLast: false,
    items: page1Items
  })

  // Succeeding Pages (Page 2, Page 3, ...)
  while (currentIndex < items.length) {
    pageNum++
    const remainingItems = items.slice(currentIndex)
    let remainingHeight = 0
    for (const it of remainingItems) {
      remainingHeight += estimateItemHeight(it)
    }

    const lastPageCapacity = TOTAL_PAGE_CAPACITY - TOTALS_AND_SIG_SPACE // ~690px (~20 items)

    // Check if remaining items fit on this page as the LAST page
    if (remainingHeight <= lastPageCapacity) {
      pages.push({
        pageIndex: pageNum - 1,
        pageNum: pageNum,
        isFirst: false,
        isLast: true,
        items: remainingItems
      })
      break
    } else {
      // Middle Page (full height capacity for items)
      const middlePageCapacity = TOTAL_PAGE_CAPACITY // ~850px (~24-25 items)
      let midAccumulated = 0
      const midItems = []

      while (currentIndex < items.length) {
        const itemH = estimateItemHeight(items[currentIndex])
        if (midAccumulated + itemH > middlePageCapacity && midItems.length > 0) {
          break
        }
        midItems.push(items[currentIndex])
        midAccumulated += itemH
        currentIndex++
      }

      pages.push({
        pageIndex: pageNum - 1,
        pageNum: pageNum,
        isFirst: false,
        isLast: false,
        items: midItems
      })
    }
  }

  // Set totalPages on all page objects
  const total = pages.length
  pages.forEach(p => {
    p.totalPages = total
    if (p.pageIndex === total - 1) {
      p.isLast = true
    }
  })

  return pages
})

function printReceipt() {
  window.print()
}
</script>

<style scoped>
/* ==================================================================== */
/* SCREEN MODAL STYLING                                                 */
/* ==================================================================== */
.receipt-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.75rem;
  max-width: 680px;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  border: 1px solid var(--border);
  color: var(--text-main);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.4);
}

.print-page {
  display: flex;
  flex-direction: column;
}

.page-content-wrapper {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
}

.page-screen-divider {
  border-top: 1.5px dashed var(--border);
  margin: 1.5rem 0 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
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
  table-layout: fixed;
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
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.35;
}

.item-name {
  color: var(--text-main);
  font-weight: 700;
}

.item-qty {
  color: var(--text-main);
  font-weight: 600;
}

.item-price {
  color: var(--text-main);
}

.item-total {
  color: var(--text-main);
  font-weight: 700;
}

.page-bottom-anchor {
  margin-top: 0.75rem;
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

.total-row { 
  display: flex; 
  justify-content: space-between; 
  color: var(--text-muted); 
}

.total-val {
  color: var(--text-main);
  font-weight: 600;
}

.text-discount {
  color: var(--red-600) !important;
}

.total-row.grand-total {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  border-top: 1.5px dashed var(--border);
  padding-top: 0.4rem;
  margin-top: 0.2rem;
}

.grand-total-val {
  color: var(--text-main);
  font-weight: 800;
}

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
    margin: 2.54cm 2.54cm 2.54cm 2.54cm !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  #receiptModal,
  #receiptModal * {
    visibility: visible !important;
    box-sizing: border-box !important;
  }

  #receiptModal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    backdrop-filter: none !important;
    border: none !important;
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
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
  }

  .print-page {
    width: 100% !important;
    min-height: 246mm !important;
    height: 246mm !important;
    max-height: 246mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    page-break-after: always !important;
    break-after: page !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 !important;
    position: relative !important;
  }

  .print-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .page-content-wrapper {
    flex: 1 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .page-bottom-anchor {
    margin-top: auto !important;
    padding-top: 0.75rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-header {
    text-align: center !important;
    border-bottom: 2px solid #000000 !important;
    padding-bottom: 1rem !important;
    margin-bottom: 1.25rem !important;
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
    margin-top: 6px !important;
    border-radius: 999px !important;
  }

  .receipt-meta-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 0.75rem 1.25rem !important;
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #000000 !important;
    padding: 0.85rem 1rem !important;
    margin-bottom: 1.25rem !important;
    font-size: 9pt !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .meta-label { color: #475569 !important; font-size: 8.5pt !important; }
  .meta-val { color: #000000 !important; font-size: 9pt !important; }

  .receipt-items-table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
    margin-bottom: 0.5rem !important;
  }

  .receipt-items-table thead {
    display: table-header-group !important;
  }

  .receipt-items-table th {
    background: #e2e8f0 !important;
    color: #000000 !important;
    border-bottom: 2px solid #000000 !important;
    padding: 0.5rem 0.6rem !important;
    font-size: 8.5pt !important;
    text-transform: uppercase !important;
    font-weight: 700 !important;
  }

  .receipt-items-table td {
    padding: 0.4rem 0.6rem !important;
    font-size: 14px !important;
    color: #000000 !important;
    font-weight: 600 !important;
    border-bottom: none !important;
    line-height: 1.35 !important;
  }

  .receipt-items-table td strong,
  .item-name {
    color: #000000 !important;
    font-weight: 700 !important;
  }

  .item-qty,
  .item-price,
  .item-total {
    color: #000000 !important;
  }

  .receipt-items-table tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-totals-container {
    display: flex !important;
    justify-content: flex-end !important;
    margin-bottom: 1.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-totals-box {
    width: 270px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.35rem !important;
    font-size: 9.5pt !important;
  }

  .total-row span,
  .total-val { 
    color: #000000 !important; 
  }

  .total-row.grand-total {
    font-size: 12pt !important;
    padding-top: 0.4rem !important;
    margin-top: 0.25rem !important;
    border-top: 2px solid #000000 !important;
  }

  .total-row.grand-total span,
  .grand-total-val {
    color: #000000 !important;
    font-weight: 800 !important;
  }

  .receipt-footer {
    border-top: none !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .signature-section {
    display: flex !important;
    justify-content: space-between !important;
    margin-top: 1.5rem !important;
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
    margin-bottom: 6px !important;
  }

  .no-print-controls,
  .modal-footer,
  .page-screen-divider,
  button,
  .btn {
    display: none !important;
  }
}
</style>
