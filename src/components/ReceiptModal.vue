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

          <!-- Page 1 ONLY: Company Official Header -->
          <div v-if="page.isFirst" class="receipt-header">
            <h1 class="company-title">KIEL BIEL CONSUMER GOODS TRADING</h1>
            <p class="company-subtitle">Brgy.42 Rawis, Legazpi City</p>
            <p class="company-subtitle">Cp# 09985317204</p>
            <div class="official-invoice-tag">OFFICIAL RECEIPT / INVOICE</div>
          </div>

          <!-- Page 1 ONLY: Receipt Metadata Grid (Customer, Date, Receipt No) -->
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

          <!-- Itemized Table (Frameless / No Lines between items) -->
          <table v-if="(page.items && page.items.length) || page.isFirst" class="receipt-items-table">
            <thead v-if="page.isFirst">
              <tr>
                <th style="width: 46%; text-align: left;">ITEM DESCRIPTION</th>
                <th style="width: 14%; text-align: center;">QTY</th>
                <th style="width: 20%; text-align: right;">UNIT PRICE</th>
                <th style="width: 20%; text-align: right;">LINE TOTAL</th>
              </tr>
            </thead>
            <tbody v-if="page.items && page.items.length">
              <tr v-for="(item, idx) in page.items" :key="idx" class="receipt-item-row">
                <td style="width: 46%; text-align: left;" class="col-desc">
                  <strong class="item-name">{{ item.item_desc }}</strong>
                </td>
                <td style="width: 14%; text-align: center;" class="col-qty item-qty">{{ item.quantity }}</td>
                <td style="width: 20%; text-align: right;" class="col-price item-price">₱{{ Number(item.unit_price).toFixed(2) }}</td>
                <td style="width: 20%; text-align: right;" class="col-total item-total">₱{{ Number(item.line_total).toFixed(2) }}</td>
              </tr>
            </tbody>

            <!-- Fallback if receipt has zero items recorded -->
            <tbody v-else-if="page.isFirst">
              <tr>
                <td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No items recorded for this receipt.</td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- Final Page Only: Totals and Signatures Anchor -->
        <div v-if="page.isLast" class="page-bottom-anchor">
          <!-- Totals Breakdown -->
          <div class="receipt-totals-container">
            <div class="receipt-totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span class="total-val">₱{{ Number(computedSubtotal).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
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
                <span class="grand-total-val">₱{{ Number(computedGrandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
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
      <div class="modal-footer no-print-controls" style="margin-top: 1.5rem; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-outline" @click="store.closeReceipt">
          <X style="width: 16px; height: 16px;" /> Close
        </button>
        <button class="btn btn-primary" @click="printReceipt">
          <Printer style="width: 16px; height: 16px;" /> Print Full A4 Receipt
        </button>
        <button class="btn btn-outline" style="color: #3B82F6; border-color: rgba(59, 130, 246, 0.4);" @click="editReceiptFromModal">
          <Edit3 style="width: 16px; height: 16px;" /> Edit Receipt
        </button>
        <button class="btn btn-mint" @click="goToReceipts">
          <ArrowRight style="width: 16px; height: 16px;" /> View in Receipts Ledger
        </button>
        <button class="btn btn-outline" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.4);" @click="deleteFromModal" :disabled="isDeletingModal">
          <Trash2 style="width: 16px; height: 16px;" /> {{ isDeletingModal ? 'Deleting...' : 'Delete Receipt' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { Printer, X, ArrowRight, Trash2, Edit3 } from 'lucide-vue-next'

const router = useRouter()
const isDeletingModal = ref(false)

function editReceiptFromModal() {
  const currentRec = receipt.value
  store.closeReceipt()
  store.openEditReceipt(currentRec)
}

function goToReceipts() {
  store.closeReceipt()
  router.push('/receipts')
}

async function deleteFromModal() {
  if (!receipt.value?.receipt_no || isDeletingModal.value) return
  const recNo = receipt.value.receipt_no
  if (confirm(`Are you sure you want to delete receipt ${recNo}?`)) {
    isDeletingModal.value = true
    try {
      await store.deleteReceipt(recNo)
      store.closeReceipt()
    } catch (err) {
      alert('Failed to delete receipt: ' + (err.message || err))
    } finally {
      isDeletingModal.value = false
    }
  }
}

const receipt = computed(() => store.activeReceiptModal || {})

const computedSubtotal = computed(() => {
  const items = receipt.value.items || []
  if (items.length > 0) {
    return items.reduce((sum, item) => sum + Number(item.line_total || 0), 0)
  }
  return Number(receipt.value.subtotal || 0)
})

const computedGrandTotal = computed(() => {
  const sub = computedSubtotal.value
  const disc = Number(receipt.value.discount || 0)
  const tax = Number(receipt.value.tax || 0)
  return Math.max(0, sub - disc + tax)
})

const customerAddress = computed(() => {
  if (receipt.value.customer_address) return receipt.value.customer_address
  const custName = (receipt.value.customer_name || '').toLowerCase()
  if (!custName || custName === 'walk-in customer') return 'Store Direct'
  const found = store.customers.find(c => c.name.toLowerCase() === custName)
  return found ? (found.address || 'Store Direct') : 'Store Direct'
})

// Dynamic Pagination Algorithm calibrated to fully occupy A4 paper without empty gaps
function estimateItemHeight(item) {
  const desc = (item.item_desc || '').trim()
  // With 12.5px font, 0.40rem vertical padding, line-height 1.1:
  // Base 1-line item height is ~27px
  const lines = Math.max(1, Math.ceil(desc.length / 45))
  return 27 + (lines - 1) * 14
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

  // Exact Printable Page Capacity Units (A4 portrait = 297mm = 1122.5px):
  // Margins: 10mm top + 10mm bottom = 20mm = ~76px
  // Usable printable height: ~1046px.
  // 1030px gives ~98.5% page coverage, filling white space on every page
  const TOTAL_PAGE_CAPACITY = 1030
  const PAGE_1_HEADER_SPACE = 260 // Company Header (~120px) + Meta Grid (~110px) + Table <thead> (~30px)
  const TABLE_HEADER_SPACE = 0    // No Table <thead> on Page 2+
  const TOTALS_AND_SIG_SPACE = 185 // Subtotal, Grand Total, Signatures (~185px)

  // Case 1: All items fit comfortably on a single page (~21 items max)
  const singlePageItemCap = TOTAL_PAGE_CAPACITY - PAGE_1_HEADER_SPACE - TOTALS_AND_SIG_SPACE // ~585px
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

  // Page 1 Capacity: ~770px (fills entire page with up to ~28 items to eliminate white space!)
  const page1Capacity = TOTAL_PAGE_CAPACITY - PAGE_1_HEADER_SPACE
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

    // Last Page Capacity (has remaining items + totals & signatures)
    const lastPageCapacity = TOTAL_PAGE_CAPACITY - TABLE_HEADER_SPACE - TOTALS_AND_SIG_SPACE // ~845px (~31 items)

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
      // Middle Page (full paper height, holds up to ~38 items to occupy full page)
      const middlePageCapacity = TOTAL_PAGE_CAPACITY - TABLE_HEADER_SPACE // ~1030px
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
  const card = document.querySelector('.receipt-card')
  if (card) card.scrollTop = 0
  window.scrollTo(0, 0)
  setTimeout(() => {
    window.print()
  }, 100)
}
</script>

<style scoped>
/* ==================================================================== */
/* SCREEN MODAL STYLING                                                 */
/* ==================================================================== */
.receipt-card {
  background: #FFFFFF !important;
  color: #111827 !important;
  --text-main: #111827 !important;
  --text-muted: #4B5563 !important;
  --border: #E5E7EB !important;
  --bg-main: #F3F4F6 !important;
  --input-bg: #F9FAFB !important;
  border-radius: var(--radius-lg);
  padding: 1.5rem 2rem;
  max-width: 760px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  border: 1px solid #E5E7EB;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.7);
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
  border-top: 2px dashed #94A3B8;
  margin: 2rem 0 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.06em;
}

.receipt-header {
  text-align: center;
  border-bottom: 2px solid #111827;
  padding-bottom: 0.75rem;
  margin-bottom: 0.85rem;
}

.company-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: var(--text-main);
  margin: 0;
  line-height: 1.2;
}

.company-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.3;
}

.official-invoice-tag {
  display: inline-block;
  margin-top: 0.45rem;
  padding: 0.25rem 0.9rem;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.8rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.receipt-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.25rem;
  font-size: 0.82rem;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: 0.85rem;
  line-height: 1.5;
}

.meta-label { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; }
.meta-val { color: var(--text-main); font-size: 0.84rem; font-weight: 700; }

/* Frameless Clean Table with Generous Row Spacing */
.receipt-items-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin-bottom: 0.75rem;
  border: none !important;
}

.receipt-items-table th {
  padding: 0.6rem 0.6rem;
  background: transparent;
  border-top: 1.5px solid #111827;
  border-bottom: 1.5px solid #111827;
  border-left: none !important;
  border-right: none !important;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-main);
  font-weight: 800;
}

.receipt-items-table td {
  padding: 0.40rem 0.4rem;
  font-size: 12.5px;
  color: var(--text-main);
  line-height: 1;
  border: none !important;
  vertical-align: middle;
}

.item-name {
  color: var(--text-main);
  font-weight: 700;
  font-size: 12.5px;
  display: block;
}

.item-qty {
  color: var(--text-main);
  font-weight: 700;
  font-size: 12.5px;
}

.item-price {
  color: var(--text-main);
  font-weight: 600;
  font-size: 12.5px;
}

.item-total {
  color: var(--text-main);
  font-weight: 700;
  font-size: 12.5px;
}

.page-bottom-anchor {
  margin-top: 1rem;
}

.receipt-totals-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.receipt-totals-box {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
  background: transparent;
  padding: 0;
  border: none;
}

.total-row { 
  display: flex; 
  justify-content: space-between; 
  color: var(--text-muted); 
  font-weight: 600;
}

.total-val {
  color: var(--text-main);
  font-weight: 700;
}

.text-discount {
  color: var(--red-600) !important;
}

.total-row.grand-total {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  border-top: 1.5px solid #111827;
  padding-top: 0.45rem;
  margin-top: 0.25rem;
}

.grand-total-val {
  color: var(--text-main);
  font-weight: 800;
}

.receipt-footer {
  text-align: center;
  border-top: none;
  padding-top: 0;
  margin-top: 0.75rem;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.sig-box {
  width: 44%;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.sig-line {
  border-top: 1.5px solid var(--text-main);
  margin-bottom: 5px;
}

/* ==================================================================== */
/* EXACT FULL A4 PRINT STYLES (No Lines/Frames, Occupies Full Page)     */
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
    height: auto !important;
    min-height: 100% !important;
    max-height: none !important;
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
    height: auto !important;
    max-height: none !important;
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
    min-height: auto !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    box-sizing: border-box !important;
    padding: 10mm 15mm 10mm 15mm !important;
    margin: 0 !important;
    position: relative !important;
  }

  .print-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .page-content-wrapper {
    display: flex !important;
    flex-direction: column !important;
  }

  .page-bottom-anchor {
    margin-top: 1.25rem !important;
    padding-top: 0.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Company Header (Page 1 Only) */
  .receipt-header {
    text-align: center !important;
    border-bottom: 2px solid #000000 !important;
    padding-bottom: 0.75rem !important;
    margin-bottom: 0.75rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .company-title {
    color: #000000 !important;
    font-size: 20pt !important;
    font-weight: 800 !important;
    letter-spacing: -0.3px !important;
    margin: 0 0 4px 0 !important;
    line-height: 1.15 !important;
  }

  .company-subtitle {
    color: #222222 !important;
    font-size: 10.5pt !important;
    margin: 1px 0 !important;
    line-height: 1.3 !important;
  }

  .official-invoice-tag {
    display: inline-block !important;
    background: #f1f5f9 !important;
    color: #000000 !important;
    border: 1.5px solid #000000 !important;
    font-size: 10pt !important;
    font-weight: 800 !important;
    padding: 3px 16px !important;
    margin-top: 6px !important;
    border-radius: 999px !important;
    letter-spacing: 0.05em !important;
  }

  /* Metadata Grid (Page 1 Only) */
  .receipt-meta-grid {
    display: grid !important;
    grid-template-columns: 1.15fr 0.85fr !important;
    gap: 0.5rem 1.5rem !important;
    background: #f8fafc !important;
    border: 1px solid #94a3b8 !important;
    color: #000000 !important;
    padding: 0.75rem 1rem !important;
    margin-bottom: 0.85rem !important;
    font-size: 10.5pt !important;
    line-height: 1.4 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .meta-label {
    color: #334155 !important;
    font-size: 10pt !important;
    font-weight: 600 !important;
  }

  .meta-val {
    color: #000000 !important;
    font-size: 10.5pt !important;
    font-weight: 700 !important;
  }

  /* Clean, Frameless Table (NO BOX, NO VERTICAL OR ROW BORDERS) */
  .receipt-items-table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
    margin-bottom: 0.5rem !important;
    border: none !important;
  }

  .receipt-items-table thead {
    display: table-row-group !important;
  }

  .receipt-items-table th {
    background: transparent !important;
    color: #000000 !important;
    border-top: 1.5px solid #000000 !important;
    border-bottom: 1.5px solid #000000 !important;
    border-left: none !important;
    border-right: none !important;
    padding: 0.65rem 0.6rem !important;
    font-size: 11pt !important;
    text-transform: uppercase !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
  }

  .receipt-items-table td {
    padding: 0.40rem 0.4rem !important;
    font-size: 12.5px !important;
    color: #000000 !important;
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
    line-height: 1.1 !important;
    vertical-align: middle !important;
  }

  .item-name {
    color: #000000 !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    display: block !important;
  }

  .item-qty {
    font-size: 12.5px !important;
    font-weight: 700 !important;
  }

  .item-price {
    font-size: 12.5px !important;
    font-weight: 600 !important;
  }

  .item-total {
    font-size: 12.5px !important;
    font-weight: 700 !important;
  }

  .receipt-items-table tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Totals Container (Clean, Frameless) */
  .receipt-totals-container {
    display: flex !important;
    justify-content: flex-end !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.6rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .receipt-totals-box {
    width: 290px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.35rem !important;
    font-size: 11.5pt !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }

  .total-row {
    display: flex !important;
    justify-content: space-between !important;
    color: #334155 !important;
    font-weight: 600 !important;
  }

  .total-val {
    color: #000000 !important;
    font-weight: 700 !important;
  }

  .total-row.grand-total {
    font-size: 13.5pt !important;
    padding-top: 0.45rem !important;
    margin-top: 0.25rem !important;
    border-top: 1.5px solid #000000 !important;
  }

  .total-row.grand-total span,
  .grand-total-val {
    color: #000000 !important;
    font-weight: 800 !important;
  }

  /* Signatures */
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
    margin-top: 1.8rem !important;
    padding-top: 0.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .sig-box {
    width: 44% !important;
    text-align: center !important;
    font-size: 10.5pt !important;
    font-weight: 700 !important;
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
