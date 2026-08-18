<template>
  <div class="content">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Point of Sale</h1>
        <p class="page-description">Process customer sales, issue receipts, and manage orders.</p>
      </div>
      <div class="date-picker-pill">
        <User style="width: 14px; height: 14px;" />
        <span>Cashier: {{ store.currentUser.name }}</span>
      </div>
    </div>

    <!-- Main Grid Layout -->
    <div style="display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: flex-start; width: 100%;">
      
      <!-- LEFT SIDE: Order Items Card with Search Bar & Line Items Table -->
      <div class="card p-4" style="gap: 1.25rem;">
        
        <!-- Header & Clear Cart -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Order Items ({{ cart.length }})</h3>
          <button v-if="cart.length" class="btn-link" style="font-size: 0.8rem; color: var(--red-600);" @click="cart = []">Clear Order</button>
        </div>

        <!-- Integrated Search Bar Input inside Order Items Card -->
        <div ref="searchWrapper" style="position: relative;">
          <div class="search-container" style="max-width: 100%;">
            <Search class="search-icon" />
            <input 
              type="text" 
              v-model="productSearch" 
              placeholder="Type item name, SKU, or category..." 
              @focus="showSuggestions = true"
              @input="showSuggestions = true"
              @keyup.enter="handleSearchEnter"
            />
          </div>

          <!-- Product Search Suggestions Dropdown -->
          <div v-if="showSuggestions && filteredSuggestions.length" class="card" style="position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000; max-height: 240px; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div 
              v-for="p in filteredSuggestions" 
              :key="p.id" 
              style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
              @click="addItemToCart(p)"
            >
              <div>
                <strong style="color: var(--text-main); font-size: 0.9rem;">{{ p.name }}</strong>
                <span class="user-pill" style="display: inline-block; margin-left: 8px; font-size: 0.7rem; padding: 1px 8px;">{{ p.sku }}</span>
                <!-- Low Stock Tag in Dropdown -->
                <span v-if="p.quantity <= (p.min_stock || 10)" class="status-badge status-pending" style="margin-left: 8px; font-size: 0.65rem; padding: 1px 6px;">
                  {{ p.quantity === 0 ? 'Out of Stock' : 'Low Stock (' + p.quantity + ')' }}
                </span>
              </div>
              <span style="font-weight: 700; color: var(--primary);">₱{{ Number(p.price).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Selected Order Line Items Cart Table -->
        <div class="table-responsive" style="min-height: 320px;">
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="width: 130px;">Price</th>
                <th style="width: 95px; text-align: center;">Qty</th>
                <th style="width: 110px; text-align: right;">Line Total</th>
                <th style="width: 45px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in cart" :key="index">
                <td>
                  <strong style="color: var(--text-main);">{{ item.name }}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">{{ item.sku }}</div>
                  <!-- Low Stock Alert Badge under cart item -->
                  <span v-if="item.stock <= (item.min_stock || 10)" style="font-size: 0.7rem; font-weight: 700; color: #F87171; display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;">
                    <AlertTriangle style="width: 12px; height: 12px;" /> Low Stock: {{ item.stock }} left
                  </span>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">₱</span>
                    <input 
                      type="number" 
                      v-model.number="item.price" 
                      min="0" 
                      step="any" 
                      class="form-input" 
                      style="width: 85px; padding: 4px 6px; font-weight: 700; color: var(--primary);"
                      @input="validateCartPrice(item)"
                    />
                  </div>
                </td>
                <td style="text-align: center;">
                  <input 
                    type="number" 
                    v-model.number="item.quantity" 
                    min="1" 
                    class="form-input" 
                    style="width: 65px; text-align: center; padding: 4px;"
                    @change="validateCartQuantity(item)"
                  />
                </td>
                <td style="text-align: right; font-weight: 700; color: var(--primary);">
                  ₱{{ ((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2) }}
                </td>
                <td style="text-align: center;">
                  <button class="icon-btn text-danger" style="width: 28px; height: 28px; display: inline-flex;" @click="removeItem(index)">
                    <Trash2 style="width: 15px; height: 15px;" />
                  </button>
                </td>
              </tr>
              <tr v-if="!cart.length">
                <td colspan="5" class="text-center" style="padding: 4rem 0; color: var(--text-muted);">
                  <ShoppingCart style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 0.5rem;" />
                  <div>Order cart is empty. Type in search bar above to add items.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RIGHT SIDE: Sticky Checkout Summary & Payment Panel -->
      <div class="card p-4" style="gap: 1.25rem; position: sticky; top: 84px;">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Checkout Summary</h3>

        <div ref="customerWrapper" class="form-group" style="position: relative;">
          <label>Customer Name</label>
          <div style="position: relative; display: flex; align-items: center;">
            <input 
              type="text" 
              v-model="customerName" 
              class="form-input" 
              placeholder="Search or select customer..." 
              @focus="showCustomerDropdown = true"
              @input="showCustomerDropdown = true"
              style="padding-right: 36px;"
            />
            <button 
              type="button"
              @click="showCustomerDropdown = !showCustomerDropdown"
              style="position: absolute; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;"
            >
              <ChevronDown style="width: 16px; height: 16px;" :style="{ transform: showCustomerDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }" />
            </button>
          </div>

          <!-- Searchable Customer Suggestions Dropdown -->
          <div 
            v-if="showCustomerDropdown && filteredCustomerOptions.length" 
            class="card" 
            style="position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000; max-height: 220px; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3);"
          >
            <div 
              v-for="c in filteredCustomerOptions" 
              :key="c.id" 
              style="padding: 0.65rem 1rem; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
              :style="{ background: customerName === c.name ? 'var(--primary-light)' : 'transparent' }"
              @click="selectCustomer(c)"
            >
              <div>
                <strong style="color: var(--text-main); font-size: 0.88rem; display: block;">{{ c.name }}</strong>
                <span style="font-size: 0.72rem; color: var(--text-muted);">{{ c.phone || 'Store Customer' }}</span>
              </div>
              <span class="status-badge" :class="getCategoryBadgeClass(c.category)" style="font-size: 0.7rem; padding: 2px 8px;">
                {{ c.category || 'Retail' }}
              </span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Payment Method</label>
          <select v-model="paymentMethod" class="form-select">
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div class="form-group">
          <label>Discount (%)</label>
          <input type="number" v-model.number="discountPercent" min="0" max="100" class="form-input" placeholder="0" />
        </div>

        <div class="border-t" style="padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
          <div class="space-between" style="display: flex;">
            <span class="text-muted">Subtotal:</span>
            <span>₱{{ subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="space-between" style="display: flex;" v-if="discountAmount > 0">
            <span class="text-muted">Discount ({{ discountPercent }}%):</span>
            <span style="color: var(--red-600);">-₱{{ discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="space-between" style="display: flex; font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.5rem; padding-top: 0.75rem; border-top: 2px dashed var(--border);">
            <span>Grand Total:</span>
            <span style="color: var(--primary);">₱{{ grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <button 
          class="btn btn-mint w-100" 
          style="height: 48px; font-size: 1rem; font-weight: 700; border-radius: var(--radius-md);" 
          :disabled="!cart.length"
          @click="processCheckout"
        >
          <CheckCircle style="width: 20px; height: 20px;" /> Complete Order & Print Receipt
        </button>

        <button class="btn btn-outline w-100" @click="resetPos">
          Reset Order Form
        </button>
      </div>

    </div>

    <!-- ==================================================================== -->
    <!-- LOW STOCK / OUT OF STOCK WARNING POPUP MODAL                         -->
    <!-- ==================================================================== -->
    <div v-if="showLowStockModal" class="modal-overlay" @click.self="showLowStockModal = false">
      <div class="modal-card" style="max-width: 480px; text-align: center; padding: 2rem;">
        
        <!-- Warning Icon -->
        <div style="width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;"
             :style="{ background: warningType === 'out' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: warningType === 'out' ? '#F87171' : '#FBBF24' }">
          <XCircle v-if="warningType === 'out'" style="width: 36px; height: 36px;" />
          <AlertTriangle v-else style="width: 36px; height: 36px;" />
        </div>

        <!-- Warning Title & Description -->
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">
          {{ warningType === 'out' ? '⚠️ OUT OF STOCK WARNING!' : '⚠️ LOW STOCK ALERT!' }}
        </h3>
        
        <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
          <template v-if="warningType === 'out'">
            <strong>"{{ warningProduct?.name }}"</strong> is completely 
            <span style="color: #F87171; font-weight: 700;">OUT OF STOCK (0 units)</span>! Cannot add to order cart.
          </template>
          <template v-else>
            <strong>"{{ warningProduct?.name }}"</strong> is running low on stock! 
            Only <span style="color: #FBBF24; font-weight: 800; font-size: 1.1rem;">{{ warningProduct?.quantity }} units</span> remaining in inventory (Threshold: {{ warningProduct?.min_stock || 10 }} units).
          </template>
        </p>

        <!-- Product Summary Pill -->
        <div style="background: var(--input-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; text-align: left;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">{{ warningProduct?.name }}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">SKU: {{ warningProduct?.sku }}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.85rem; font-weight: 700;" :style="{ color: warningType === 'out' ? '#F87171' : '#FBBF24' }">
              {{ warningProduct?.quantity }} remaining
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">₱{{ Number(warningProduct?.price || 0).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Modal Action Buttons -->
        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-outline w-100" @click="showLowStockModal = false">
            Dismiss Warning
          </button>
          <router-link to="/products" class="btn btn-mint w-100">
            Go Restock Product
          </router-link>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store } from '../store/inventoryStore.js'
import { User, Search, ShoppingCart, Trash2, CheckCircle, AlertTriangle, XCircle, ChevronDown } from 'lucide-vue-next'

const productSearch = ref('')
const showSuggestions = ref(false)
const searchWrapper = ref(null)
const customerName = ref('Walk-in Customer')
const showCustomerDropdown = ref(false)
const customerWrapper = ref(null)
const paymentMethod = ref('Cash')
const discountPercent = ref(0)
const cart = ref([])

function handleClickOutside(event) {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target)) {
    showSuggestions.value = false
  }
  if (customerWrapper.value && !customerWrapper.value.contains(event.target)) {
    showCustomerDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const filteredCustomerOptions = computed(() => {
  if (!customerName.value.trim()) return store.customers
  const q = customerName.value.toLowerCase().trim()
  return store.customers.filter(c => 
    c.name.toLowerCase().includes(q) ||
    (c.phone && c.phone.toLowerCase().includes(q)) ||
    (c.category && c.category.toLowerCase().includes(q))
  )
})

function selectCustomer(c) {
  customerName.value = c.name
  showCustomerDropdown.value = false
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'VIP': return 'status-completed'
    case 'Wholesale': return 'status-pending'
    case 'Regular': return 'bg-blue-100 text-blue-600'
    default: return 'status-badge'
  }
}

// Low Stock Warning Popup State
const showLowStockModal = ref(false)
const warningProduct = ref(null)
const warningType = ref('low') // 'low' or 'out'

const filteredSuggestions = computed(() => {
  if (!productSearch.value.trim()) return store.products
  const q = productSearch.value.toLowerCase().trim()
  return store.products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  )
})

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0))
const discountAmount = computed(() => subtotal.value * ((discountPercent.value || 0) / 100))
const grandTotal = computed(() => Math.max(0, subtotal.value - discountAmount.value))

function addItemToCart(prod) {
  const currentStock = Number(prod.quantity)
  const threshold = Number(prod.min_stock) || 10

  // 1. If product is completely OUT OF STOCK (0 units)
  if (currentStock === 0) {
    warningProduct.value = prod
    warningType.value = 'out'
    showLowStockModal.value = true

    // Add alert notification
    store.notifications.unshift({
      id: Date.now(),
      title: '❌ Out of Stock Alert',
      desc: `Cannot select ${prod.name} (${prod.sku}) — Stock is 0!`,
      time: 'Just now',
      unread: true
    })
    return
  }

  // 2. If product stock is LOW (quantity <= min_stock)
  if (currentStock <= threshold) {
    warningProduct.value = prod
    warningType.value = 'low'
    showLowStockModal.value = true

    // Add warning notification
    store.notifications.unshift({
      id: Date.now(),
      title: '⚠️ Low Stock Warning',
      desc: `${prod.name} (${prod.sku}) is low on stock! Only ${currentStock} remaining.`,
      time: 'Just now',
      unread: true
    })
  }

  // Add to cart
  const existing = cart.value.find(item => item.id === prod.id)
  if (existing) {
    if (existing.quantity + 1 > currentStock) {
      alert(`⚠️ Cannot add more units! Only ${currentStock} units available in stock.`)
      return
    }
    existing.quantity += 1
  } else {
    cart.value.push({
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      price: Number(prod.price) || 0,
      quantity: 1,
      stock: currentStock,
      min_stock: threshold
    })
  }

  productSearch.value = ''
  showSuggestions.value = false
}

function validateCartPrice(item) {
  if (item.price === null || item.price === undefined || isNaN(item.price) || item.price < 0) {
    item.price = 0
  }
}

function validateCartQuantity(item) {
  const prod = store.products.find(p => p.id === item.id || p.sku === item.sku)
  if (prod && item.quantity > prod.quantity) {
    item.quantity = prod.quantity
    alert(`⚠️ Cannot exceed available stock! Reduced quantity to ${prod.quantity}.`)
  }
}

function removeItem(index) {
  cart.value.splice(index, 1)
}

function handleSearchEnter() {
  if (!productSearch.value.trim()) return
  const q = productSearch.value.toLowerCase().trim()
  const matched = store.products.find(p => 
    p.sku.toLowerCase() === q || 
    p.name.toLowerCase() === q
  ) || filteredSuggestions.value[0]

  if (matched) {
    addItemToCart(matched)
  } else {
    alert(`❌ No product found matching "${productSearch.value}"`)
  }
}

function processCheckout() {
  if (!cart.value.length) return

  const receiptNo = 'REC-2026-00' + (store.receipts.length + 1)
  const invoiceNo = 'INV-' + (1020 + store.receipts.length + 1)
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const newReceipt = {
    receipt_no: receiptNo,
    invoice_no: invoiceNo,
    customer_name: customerName.value.trim() || 'Walk-in Customer',
    cashier_name: store.currentUser.name,
    payment_method: paymentMethod.value,
    subtotal: subtotal.value,
    discount: discountAmount.value,
    tax: 0,
    grand_total: grandTotal.value,
    created_at: nowStr,
    status: 'Completed',
    items: cart.value.map(item => ({
      item_desc: item.name,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.price) || 0,
      line_total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
    }))
  }

  // Update customer totals if matched in store.customers
  const selectedCust = store.customers.find(c => c.name === customerName.value)
  if (selectedCust) {
    selectedCust.totalSpent = (Number(selectedCust.totalSpent) || 0) + grandTotal.value
    selectedCust.totalOrders = (Number(selectedCust.totalOrders) || 0) + 1
  }

  store.addReceipt(newReceipt)
  store.openReceipt(newReceipt)
  resetPos()
}

function resetPos() {
  cart.value = []
  productSearch.value = ''
  customerName.value = 'Walk-in Customer'
  discountPercent.value = 0
  paymentMethod.value = 'Cash'
  showCustomerDropdown.value = false
}
</script>
