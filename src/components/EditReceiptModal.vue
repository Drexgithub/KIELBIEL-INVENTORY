<template>
  <transition name="fade">
    <div v-if="store.activeEditReceiptModal" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-card edit-receipt-modal" style="max-width: 860px; width: 95%; max-height: 92vh; display: flex; flex-direction: column;">
        
        <!-- MODAL HEADER -->
        <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="header-icon-box">
              <Edit3 style="width: 20px; height: 20px; color: #3B82F6;" />
            </div>
            <div>
              <h3 style="color: #FFFFFF; font-size: 1.2rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>Edit Receipt</span>
                <span class="receipt-pill-no">{{ form.receipt_no }}</span>
              </h3>
              <p style="color: var(--og-text-secondary, #94A3B8); font-size: 0.8rem; margin: 0.2rem 0 0 0;">
                Ref: {{ form.invoice_no }} • Modify line items, customer details, or payment status
              </p>
            </div>
          </div>
          <button type="button" class="icon-btn" @click="handleCancel" title="Close" style="color: #94A3B8;">
            <X style="width: 18px; height: 18px;" />
          </button>
        </div>

        <!-- MODAL SCROLLABLE BODY -->
        <div class="modal-body" style="overflow-y: auto; padding: 1.25rem 0; flex: 1; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- ERROR / ALERT BANNER -->
          <div v-if="errorMessage" class="edit-error-banner">
            <AlertCircle style="width: 16px; height: 16px; flex-shrink: 0;" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- TOP METADATA GRID -->
          <div class="receipt-edit-grid">
            <!-- Customer Name -->
            <div class="form-group">
              <label class="form-label">Customer Name</label>
              <div style="position: relative;">
                <input 
                  type="text" 
                  v-model="form.customer_name" 
                  class="form-input" 
                  placeholder="e.g. Walk-in Customer" 
                  list="customer-suggestions"
                  required
                />
                <datalist id="customer-suggestions">
                  <option value="Walk-in Customer" />
                  <option v-for="c in store.customers" :key="c.id" :value="c.name" />
                </datalist>
              </div>
            </div>

            <!-- Cashier Name -->
            <div class="form-group">
              <label class="form-label">Cashier / Staff</label>
              <input 
                type="text" 
                v-model="form.cashier_name" 
                class="form-input" 
                placeholder="Cashier Name" 
                required
              />
            </div>

            <!-- Payment Method -->
            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select v-model="form.payment_method" class="og-pill-select" style="width: 100%; height: 38px;">
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <!-- Payment Status -->
            <div class="form-group">
              <label class="form-label">Payment Status</label>
              <select v-model="form.status" class="og-pill-select" style="width: 100%; height: 38px;">
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <!-- SECTION: PRODUCTS / LINE ITEMS -->
          <div class="edit-items-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <Package style="width: 16px; height: 16px; color: #10B981;" />
                <h4 style="color: #FFFFFF; font-size: 0.95rem; font-weight: 700; margin: 0;">Products in this Receipt</h4>
                <span class="count-badge">{{ formItems.length }} item(s)</span>
              </div>
              
              <!-- Searchable Add Product from Inventory Combobox Bar -->
              <div style="display: flex; gap: 8px; align-items: center; flex: 1; max-width: 480px; justify-content: flex-end;">
                <div ref="productSearchWrapper" class="product-search-combobox">
                  <div class="search-input-wrap">
                    <Search class="search-box-icon" />
                    <input 
                      type="text" 
                      v-model="productSearchQuery" 
                      placeholder="Search product from inventory..." 
                      class="product-combobox-input"
                      @focus="showProductDropdown = true"
                      @input="showProductDropdown = true"
                      @keydown.enter.prevent="handleProductSearchEnter"
                      @keydown.esc="showProductDropdown = false"
                    />
                    <!-- Clear query button -->
                    <button 
                      v-if="productSearchQuery" 
                      type="button" 
                      class="clear-search-btn" 
                      @click="productSearchQuery = ''; showProductDropdown = true"
                      title="Clear search"
                    >
                      <X style="width: 13px; height: 13px;" />
                    </button>
                    <!-- Toggle dropdown button -->
                    <button 
                      type="button" 
                      class="dropdown-toggle-btn" 
                      @click="toggleDropdown"
                      :title="showProductDropdown ? 'Close list' : 'Browse all products'"
                    >
                      <ChevronDown style="width: 15px; height: 15px;" :style="{ transform: showProductDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }" />
                    </button>
                  </div>

                  <!-- Floating Search Results Dropdown -->
                  <transition name="fade">
                    <div 
                      v-if="showProductDropdown" 
                      class="product-dropdown-card"
                    >
                      <div class="dropdown-header-bar">
                        <span>{{ filteredProductsList.length }} product(s) available</span>
                        <span v-if="productSearchQuery" class="matching-for">matching "{{ productSearchQuery }}"</span>
                      </div>

                      <div class="dropdown-scroll-list">
                        <div 
                          v-for="p in filteredProductsList" 
                          :key="p.id" 
                          class="product-dropdown-item"
                          @click="selectProductToAdd(p)"
                        >
                          <div class="item-left">
                            <strong class="item-product-name">{{ p.name }}</strong>
                            <div class="item-badges-row">
                              <span v-if="p.sku" class="sku-tag">{{ p.sku }}</span>
                              <span v-if="p.category" class="cat-tag">{{ p.category }}</span>
                              <span class="stock-tag" :class="getStockTagClass(p)">
                                ● {{ p.quantity }} in stock
                              </span>
                            </div>
                          </div>
                          <div class="item-right">
                            <span class="item-price-tag">₱{{ Number(p.price).toFixed(2) }}</span>
                            <button type="button" class="quick-add-btn" title="Add to receipt">
                              <Plus style="width: 13px; height: 13px;" />
                            </button>
                          </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="!filteredProductsList.length" class="empty-dropdown-results">
                          <AlertCircle style="width: 18px; height: 18px; opacity: 0.5; margin-bottom: 4px;" />
                          <div>No inventory products matching "{{ productSearchQuery }}"</div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- Custom non-inventory line button -->
                <button 
                  type="button" 
                  class="btn-dark btn-sm" 
                  @click="addCustomItem" 
                  title="Add blank custom line item" 
                  style="height: 36px; padding: 0 12px; font-size: 0.78rem; white-space: nowrap; flex-shrink: 0;"
                >
                  + Custom
                </button>
              </div>
            </div>

            <!-- ITEMS TABLE -->
            <div class="table-responsive" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; background: rgba(0, 0, 0, 0.2);">
              <table class="table" style="margin: 0; font-size: 0.84rem;">
                <thead>
                  <tr style="background: rgba(255, 255, 255, 0.02);">
                    <th style="width: 44%;">Product / Item Description</th>
                    <th style="width: 18%; text-align: right;">Unit Price (₱)</th>
                    <th style="width: 18%; text-align: center;">Quantity</th>
                    <th style="width: 14%; text-align: right;">Line Total (₱)</th>
                    <th style="width: 6%; text-align: center;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in formItems" :key="idx" class="edit-table-row">
                    <!-- Description -->
                    <td>
                      <input 
                        type="text" 
                        v-model="item.item_desc" 
                        class="form-input table-inline-input" 
                        placeholder="Item name / description"
                        required 
                      />
                      <div v-if="getStockPreview(item.item_desc)" class="stock-pill-indicator">
                        <span>Current Stock: {{ getStockPreview(item.item_desc).quantity }}</span>
                      </div>
                    </td>

                    <!-- Unit Price -->
                    <td style="text-align: right;">
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        v-model.number="item.unit_price" 
                        class="form-input table-inline-input text-right"
                        @input="recalcLine(item)"
                        required
                      />
                    </td>

                    <!-- Quantity with Steppers -->
                    <td style="text-align: center;">
                      <div class="qty-stepper-wrap">
                        <button type="button" class="qty-btn" @click="decQty(item)" :disabled="item.quantity <= 1">-</button>
                        <input 
                          type="number" 
                          min="1" 
                          v-model.number="item.quantity" 
                          class="form-input qty-input"
                          @input="recalcLine(item)"
                          required
                        />
                        <button type="button" class="qty-btn" @click="incQty(item)">+</button>
                      </div>
                    </td>

                    <!-- Line Total -->
                    <td style="text-align: right; font-weight: 700; color: #FFFFFF;">
                      ₱{{ Number((item.unit_price || 0) * (item.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </td>

                    <!-- Remove Button -->
                    <td style="text-align: center;">
                      <button 
                        type="button" 
                        class="icon-btn text-danger" 
                        @click="removeItem(idx)" 
                        title="Remove product from receipt"
                        style="width: 28px; height: 28px; border-radius: 6px;"
                      >
                        <Trash2 style="width: 14px; height: 14px;" />
                      </button>
                    </td>
                  </tr>

                  <!-- Empty state -->
                  <tr v-if="!formItems.length">
                    <td colspan="5" style="text-align: center; padding: 2.5rem 1rem; color: #94A3B8;">
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                        <Package style="width: 28px; height: 28px; opacity: 0.5;" />
                        <span>No products in this receipt. Search and select a product above to add items.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- REAL-TIME STOCK DELTA SUMMARY BANNER -->
          <div class="stock-sync-banner">
            <div style="display: flex; align-items: flex-start; gap: 0.6rem;">
              <RefreshCw style="width: 16px; height: 16px; color: #3B82F6; margin-top: 2px; flex-shrink: 0;" />
              <div style="font-size: 0.8rem; line-height: 1.45;">
                <strong style="color: #60A5FA;">Automatic Inventory Stock Sync:</strong>
                <span style="color: #CBD5E1;"> Saving changes will automatically return stock to inventory for decreased quantities/removed items, and deduct stock for increased quantities/new items.</span>
                <div v-if="stockDeltas.length > 0" class="deltas-list">
                  <span v-for="(d, i) in stockDeltas" :key="i" class="delta-tag" :class="d.delta > 0 ? 'delta-return' : 'delta-deduct'">
                    {{ d.name }}: {{ d.delta > 0 ? `+${d.delta} returning to stock` : `${d.delta} deducting from stock` }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- FINANCIAL TOTALS BREAKDOWN -->
          <div class="edit-totals-box">
            <div class="totals-col">
              <label class="form-label">Subtotal (Items Sum)</label>
              <div class="totals-val-preview">₱{{ Number(computedSubtotal).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
            </div>

            <div class="totals-col">
              <label class="form-label">Discount (₱)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                v-model.number="form.discount" 
                class="form-input" 
                placeholder="0.00" 
              />
            </div>

            <div class="totals-col">
              <label class="form-label">Tax / VAT (₱)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                v-model.number="form.tax" 
                class="form-input" 
                placeholder="0.00" 
              />
            </div>

            <div class="totals-col highlight-col">
              <label class="form-label" style="color: #10B981;">New Grand Total</label>
              <div class="grand-total-display">
                ₱{{ Number(computedGrandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </div>
            </div>
          </div>

        </div>

        <!-- MODAL FOOTER ACTIONS -->
        <div class="modal-footer" style="padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button 
            type="button" 
            class="btn btn-outline" 
            @click="handleCancel" 
            :disabled="isSaving"
          >
            Cancel
          </button>

          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSave" 
            :disabled="isSaving || !formItems.length"
            style="min-width: 160px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;"
          >
            <span v-if="isSaving" class="btn-spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
            <Save v-else style="width: 15px; height: 15px;" />
            <span>{{ isSaving ? 'Saving Changes...' : 'Save Receipt' }}</span>
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Edit3, 
  X, 
  Trash2, 
  Plus, 
  Package, 
  RefreshCw, 
  Save, 
  AlertCircle,
  Search,
  ChevronDown
} from 'lucide-vue-next'

const isSaving = ref(false)
const errorMessage = ref('')

// Searchable product combobox state
const productSearchWrapper = ref(null)
const productSearchQuery = ref('')
const showProductDropdown = ref(false)

const form = reactive({
  receipt_no: '',
  invoice_no: '',
  customer_name: 'Walk-in Customer',
  cashier_name: 'Admin User',
  payment_method: 'Cash',
  status: 'Unpaid',
  discount: 0,
  tax: 0,
  created_at: '',
  raw_created_at: ''
})

const formItems = ref([])
const originalItems = ref([])

// When activeEditReceiptModal changes, initialize form
watch(() => store.activeEditReceiptModal, (newVal) => {
  if (newVal) {
    errorMessage.value = ''
    productSearchQuery.value = ''
    showProductDropdown.value = false

    form.receipt_no = newVal.receipt_no || ''
    form.invoice_no = newVal.invoice_no || ''
    form.customer_name = newVal.customer_name || 'Walk-in Customer'
    form.cashier_name = newVal.cashier_name || 'Admin User'
    form.payment_method = newVal.payment_method || 'Cash'
    form.status = newVal.status || 'Unpaid'
    form.discount = Number(newVal.discount) || 0
    form.tax = Number(newVal.tax) || 0
    form.created_at = newVal.created_at || ''
    form.raw_created_at = newVal.raw_created_at || ''

    const rawItems = Array.isArray(newVal.items) ? newVal.items : []
    formItems.value = rawItems.map(it => ({
      item_desc: it.item_desc || it.name || 'Item',
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      unit_price: Number(it.unit_price || it.price || 0),
      line_total: Number(it.line_total || ((Number(it.unit_price || it.price || 0)) * (parseInt(it.quantity, 10) || 1)))
    }))

    // Keep deep copy of original items to compute live delta
    originalItems.value = JSON.parse(JSON.stringify(formItems.value))
  } else {
    formItems.value = []
    originalItems.value = []
    errorMessage.value = ''
    productSearchQuery.value = ''
    showProductDropdown.value = false
  }
}, { immediate: true })

const filteredProductsList = computed(() => {
  const q = productSearchQuery.value.trim().toLowerCase()
  if (!q) {
    return store.products || []
  }
  return (store.products || []).filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(q)
    const skuMatch = (p.sku || '').toLowerCase().includes(q)
    const catMatch = (p.category || '').toLowerCase().includes(q)
    return nameMatch || skuMatch || catMatch
  })
})

function toggleDropdown() {
  showProductDropdown.value = !showProductDropdown.value
}

function selectProductToAdd(prod) {
  if (!prod) return
  // Check if item already exists in formItems
  const existing = formItems.value.find(i => i.item_desc.trim().toLowerCase() === prod.name.trim().toLowerCase())
  if (existing) {
    existing.quantity = (parseInt(existing.quantity, 10) || 1) + 1
    recalcLine(existing)
  } else {
    formItems.value.push({
      item_desc: prod.name,
      quantity: 1,
      unit_price: Number(prod.price) || 0,
      line_total: Number(prod.price) || 0
    })
  }

  productSearchQuery.value = ''
  showProductDropdown.value = false
}

function handleProductSearchEnter() {
  if (filteredProductsList.value.length > 0) {
    selectProductToAdd(filteredProductsList.value[0])
  }
}

function getStockTagClass(p) {
  const qty = Number(p.quantity || 0)
  const minStock = Number(p.min_stock || 10)
  if (qty === 0) return 'stock-out'
  if (qty <= minStock) return 'stock-low'
  return 'stock-ok'
}

function handleClickOutside(e) {
  if (productSearchWrapper.value && !productSearchWrapper.value.contains(e.target)) {
    showProductDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

function getStockPreview(desc) {
  return store.findProductByItemDesc(desc)
}

function recalcLine(item) {
  const q = Math.max(1, parseInt(item.quantity, 10) || 1)
  const p = Number(item.unit_price) || 0
  item.quantity = q
  item.line_total = q * p
}

function incQty(item) {
  item.quantity = (parseInt(item.quantity, 10) || 1) + 1
  recalcLine(item)
}

function decQty(item) {
  if (item.quantity > 1) {
    item.quantity = (parseInt(item.quantity, 10) || 1) - 1
    recalcLine(item)
  }
}

function removeItem(idx) {
  formItems.value.splice(idx, 1)
}

function addCustomItem() {
  formItems.value.push({
    item_desc: 'Custom Product',
    quantity: 1,
    unit_price: 0,
    line_total: 0
  })
}

const computedSubtotal = computed(() => {
  return formItems.value.reduce((acc, it) => acc + (Number(it.unit_price || 0) * (parseInt(it.quantity, 10) || 1)), 0)
})

const computedGrandTotal = computed(() => {
  const sub = computedSubtotal.value
  const disc = Number(form.discount) || 0
  const tax = Number(form.tax) || 0
  return Math.max(0, sub - disc + tax)
})

// Calculate live stock deltas
const stockDeltas = computed(() => {
  const oldMap = {}
  for (const it of originalItems.value) {
    const k = (it.item_desc || '').trim().toLowerCase()
    if (!k) continue
    oldMap[k] = (oldMap[k] || 0) + (Number(it.quantity) || 0)
  }

  const newMap = {}
  for (const it of formItems.value) {
    const k = (it.item_desc || '').trim().toLowerCase()
    if (!k) continue
    newMap[k] = (newMap[k] || 0) + (Number(it.quantity) || 0)
  }

  const keys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)])
  const deltas = []

  for (const k of keys) {
    const oldQ = oldMap[k] || 0
    const newQ = newMap[k] || 0
    const delta = oldQ - newQ
    if (delta !== 0) {
      const prod = store.findProductByItemDesc(k)
      deltas.push({
        name: prod ? prod.name : k,
        delta
      })
    }
  }

  return deltas
})

function handleCancel() {
  store.closeEditReceipt()
}

async function handleSave() {
  errorMessage.value = ''
  if (!formItems.value.length) {
    errorMessage.value = 'A receipt must have at least one product item.'
    return
  }

  // Validate items
  for (let i = 0; i < formItems.value.length; i++) {
    const it = formItems.value[i]
    if (!it.item_desc || !it.item_desc.trim()) {
      errorMessage.value = `Line #${i + 1} has an empty product description.`
      return
    }
    if (it.quantity < 1) {
      errorMessage.value = `Line #${i + 1} must have a quantity of at least 1.`
      return
    }
  }

  isSaving.value = true
  try {
    const updatedData = {
      customer_name: form.customer_name || 'Walk-in Customer',
      cashier_name: form.cashier_name || 'Admin User',
      payment_method: form.payment_method || 'Cash',
      status: form.status || 'Unpaid',
      discount: Number(form.discount) || 0,
      tax: Number(form.tax) || 0,
      created_at: form.created_at,
      raw_created_at: form.raw_created_at
    }

    const cleanItems = formItems.value.map(it => ({
      item_desc: it.item_desc.trim(),
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      unit_price: Number(it.unit_price) || 0,
      line_total: (Number(it.unit_price) || 0) * (Math.max(1, parseInt(it.quantity, 10) || 1))
    }))

    await store.updateReceipt(form.receipt_no, updatedData, cleanItems)
  } catch (err) {
    console.error('Failed to update receipt:', err)
    errorMessage.value = 'Failed to save receipt: ' + (err.message || err)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.edit-receipt-modal {
  background: #0D131F !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9) !important;
  border-radius: 12px;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.receipt-pill-no {
  font-family: monospace;
  font-size: 0.88rem;
  background: rgba(59, 130, 246, 0.15);
  color: #60A5FA;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.receipt-edit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .receipt-edit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.count-badge {
  font-size: 0.72rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  padding: 2px 7px;
  border-radius: 999px;
  font-weight: 600;
}

/* Searchable Combobox Styles */
.product-search-combobox {
  position: relative;
  width: 100%;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  position: relative;
  background: #0A0F1A;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-input-wrap:focus-within {
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  background: #0E1626;
}

.search-box-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: #64748B;
  pointer-events: none;
}

.product-combobox-input {
  width: 100% !important;
  height: 36px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 54px 0 32px !important;
  font-size: 0.82rem !important;
  color: #FFFFFF !important;
}

.product-combobox-input::placeholder {
  color: #64748B;
}

.clear-search-btn {
  position: absolute;
  right: 28px;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.clear-search-btn:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-toggle-btn {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.dropdown-toggle-btn:hover {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

.product-dropdown-card {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1050;
  background: #0F172A;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75);
  overflow: hidden;
}

.dropdown-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.72rem;
  color: #94A3B8;
  font-weight: 600;
}

.matching-for {
  color: #60A5FA;
  font-weight: 500;
}

.dropdown-scroll-list {
  max-height: 250px;
  overflow-y: auto;
}

.product-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s ease;
}

.product-dropdown-item:last-child {
  border-bottom: none;
}

.product-dropdown-item:hover {
  background: rgba(59, 130, 246, 0.15);
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 72%;
}

.item-product-name {
  font-size: 0.84rem;
  color: #FFFFFF;
  line-height: 1.25;
}

.item-badges-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sku-tag {
  font-family: monospace;
  font-size: 0.68rem;
  background: rgba(255, 255, 255, 0.08);
  color: #94A3B8;
  padding: 1px 5px;
  border-radius: 4px;
}

.cat-tag {
  font-size: 0.68rem;
  background: rgba(59, 130, 246, 0.12);
  color: #60A5FA;
  padding: 1px 5px;
  border-radius: 4px;
}

.stock-tag {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.stock-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.stock-low {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.stock-out {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-price-tag {
  font-size: 0.88rem;
  font-weight: 700;
  color: #10B981;
}

.quick-add-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #2563EB;
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s, background 0.15s;
}

.product-dropdown-item:hover .quick-add-btn {
  background: #3B82F6;
  transform: scale(1.08);
}

.empty-dropdown-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  font-size: 0.8rem;
  color: #64748B;
  text-align: center;
}

/* Table inline inputs */
.table-inline-input {
  height: 32px !important;
  font-size: 0.82rem !important;
  padding: 4px 8px !important;
  background: rgba(15, 23, 42, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.table-inline-input:focus {
  border-color: #3B82F6 !important;
  background: #0F172A !important;
}

.stock-pill-indicator {
  font-size: 0.7rem;
  color: #64748B;
  margin-top: 3px;
}

.qty-stepper-wrap {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  overflow: hidden;
  background: #0A0F1A;
}

.qty-btn {
  width: 28px;
  height: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.qty-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-input {
  width: 50px !important;
  height: 30px !important;
  text-align: center;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 0.84rem;
  font-weight: 600;
  color: #FFFFFF;
}

.stock-sync-banner {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.deltas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0.5rem;
}

.delta-tag {
  font-size: 0.74rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.delta-return {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.delta-deduct {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.edit-totals-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1rem;
}

.totals-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.totals-val-preview {
  font-size: 1rem;
  font-weight: 700;
  color: #FFFFFF;
  padding: 6px 0;
}

.highlight-col {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding-left: 1rem;
}

.grand-total-display {
  font-size: 1.25rem;
  font-weight: 800;
  color: #10B981;
  padding: 4px 0;
}

.edit-error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #F87171;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
