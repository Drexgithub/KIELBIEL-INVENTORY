<template>
  <div class="og-products-page">
    
    <!-- 1. PAGE HEADER -->
    <div class="og-page-header">
      <div class="og-page-title-box">
        <h1 class="og-page-title">Products</h1>
        <p class="og-page-subtitle">Product catalog management, inventory telemetry, stock replenishment, and unit costing.</p>
      </div>
      <div class="og-header-actions" style="display: flex; gap: 8px;">
        <button v-if="store.isAdmin" class="btn btn-secondary" @click="openGeneralRestockModal" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; font-weight: 700;">
          <PlusCircle style="width: 15px; height: 15px; color: #10B981;" />
          <span>+ Add Stock / Restock</span>
        </button>
        <button v-if="store.isAdmin" class="btn btn-primary" @click="openAddProductModal">
          <Plus style="width: 15px; height: 15px;" />
          <span>+ Add New Product</span>
        </button>
      </div>
    </div>

    <!-- 2. THREE STAT CARDS -->
    <section class="og-stat-grid" style="grid-template-columns: repeat(3, 1fr);">
      <!-- Total Products -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Layers class="og-stat-header-icon" />
          <span>Total catalog products</span>
        </div>
        <div class="og-stat-value">
          {{ store.products.length }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+20</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Total Capital Valuation -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <DollarSign class="og-stat-header-icon" />
          <span>Total stock valuation (capital)</span>
        </div>
        <div class="og-stat-value" style="color: #3B82F6;">
          ₱{{ Math.round(store.totalCapitalValuation || 24500).toLocaleString('en-US') }}
        </div>
        <div class="og-stat-trend negative">
          <ArrowDownRight style="width: 14px; height: 14px;" />
          <span>-5%</span>
          <span class="og-stat-trend-sub">from last month</span>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <AlertTriangle class="og-stat-header-icon" style="color: #F59E0B;" />
          <span>Low stock threshold alerts</span>
        </div>
        <div class="og-stat-value" :style="{ color: store.lowStockCount > 0 ? '#F59E0B' : '#10B981' }">
          {{ store.lowStockCount }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>+20%</span>
          <span class="og-stat-trend-sub">replenished</span>
        </div>
      </div>
    </section>

    <!-- 3. LIST OF ALGORITHMS (PRODUCTS TABLE) -->
    <div class="og-card">
      <div class="og-card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 class="og-card-title">Product Catalog & Inventory</h2>
          <div class="og-card-sub">Showing {{ filteredProducts.length }} registered items</div>
        </div>

        <!-- Filter Controls -->
        <div class="og-filter-group">
          <!-- Search Box -->
          <div class="search-container" style="width: 250px;">
            <Search class="search-icon" />
            <input type="text" v-model="searchQuery" placeholder="Search by name, SKU..." />
          </div>

          <!-- Category Select -->
          <select v-model="selectedCategory" class="og-pill-select" style="height: 36px;">
            <option value="">All categories ▾</option>
            <option v-for="catName in allCategoriesList" :key="catName" :value="catName">{{ catName }}</option>
          </select>

          <!-- Status Select -->
          <select v-model="selectedStatus" class="og-pill-select" style="height: 36px;">
            <option value="">All statuses ▾</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <button v-if="searchQuery || selectedCategory || selectedStatus" class="btn-dark btn-sm" @click="clearFilters">
            Clear filter
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>System / Item Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th v-if="store.isAdmin">Capital Cost</th>
              <th>Selling Price</th>
              <th style="text-align: center;">In Stock</th>
              <th>Status</th>
              <th v-if="store.isAdmin" style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProducts" :key="p.id">
              <td>
                <strong style="color: #FFFFFF; font-size: 0.88rem;">{{ p.name }}</strong>
              </td>
              <td>
                <span style="font-family: monospace; font-size: 0.82rem; font-weight: 700; color: #3B82F6;">
                  {{ p.sku }}
                </span>
              </td>
              <td>
                <span class="user-pill">{{ p.category }}</span>
              </td>
              <td v-if="store.isAdmin" style="color: var(--og-text-secondary); font-size: 0.85rem;">
                ₱{{ Number(p.cost).toFixed(2) }}
              </td>
              <td>
                <strong style="color: #FFFFFF; font-size: 0.9rem;">
                  ₱{{ Number(p.price).toFixed(2) }}
                </strong>
              </td>
              <td style="text-align: center;">
                <span :style="{ fontWeight: '700', color: p.quantity <= p.min_stock ? '#EF4444' : '#10B981', fontSize: '0.9rem' }">
                  {{ p.quantity }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusBadgeClass(p)">
                  {{ p.status }}
                </span>
              </td>
              <td v-if="store.isAdmin" style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <button class="btn-dark btn-sm" title="Add Stock to Product" style="height: 28px; font-size: 0.74rem; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-weight: 600;" @click="openRestockProduct(p)">
                    <PlusCircle style="width: 12px; height: 12px; color: #10B981;" />
                    <span>+ Add Stock</span>
                  </button>
                  <button class="icon-btn" style="width: 28px; height: 28px;" title="Edit Product" @click="editProduct(p)">
                    <Edit3 style="width: 13px; height: 13px;" />
                  </button>
                  <button class="icon-btn text-danger" style="width: 28px; height: 28px;" title="Delete Product" @click="deleteProd(p)">
                    <Trash2 style="width: 13px; height: 13px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredProducts.length">
              <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--og-text-muted);">
                No products match your search filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="og-pagination-bar">
        <span>Showing {{ filteredProducts.length }} of {{ store.products.length }} row(s)</span>
        <div class="og-pagination-controls">
          <button class="og-page-btn">&lt; Previous</button>
          <button class="og-page-btn active">1</button>
          <button class="og-page-btn">2</button>
          <button class="og-page-btn">3</button>
          <button class="og-page-btn">Next &gt;</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="color: #FFFFFF; font-size: 1.15rem; font-weight: 700;">{{ isEditing ? 'Edit Product Details' : 'Register New Product' }}</h3>
          <button class="icon-btn" @click="showModal = false">✕</button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">SKU Code</label>
              <input type="text" v-model="form.sku" class="form-input" placeholder="Auto" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Product Name *</label>
              <input type="text" v-model="form.name" class="form-input" required placeholder="e.g. Rebisco Butter Cookies" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Capital Cost (₱) *</label>
              <input type="number" step="0.01" v-model.number="form.cost" min="0" class="form-input" required />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Selling Price (₱) *</label>
              <input type="number" step="0.01" v-model.number="form.price" min="0" class="form-input" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Initial Stock Units</label>
              <input type="number" v-model.number="form.quantity" min="0" class="form-input" required />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Min Stock Threshold</label>
              <input type="number" v-model.number="form.min_stock" min="1" class="form-input" />
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Category *</label>
            <select v-if="!isCustomCategory" v-model="form.category" class="og-pill-select" @change="onCategorySelectChange" required style="height: 38px;">
              <option value="" disabled>-- Select Category --</option>
              <option v-for="catName in allCategoriesList" :key="catName" :value="catName">{{ catName }}</option>
              <option value="__NEW_CATEGORY__">+ Add New Category...</option>
            </select>
            <div v-else style="display: flex; gap: 6px;">
              <input type="text" v-model="form.category" class="form-input" placeholder="New Category Name..." required />
              <button type="button" class="btn-dark btn-sm" @click="cancelCustomCategory">Select from List</button>
            </div>
          </div>

          <div class="modal-footer" style="padding: 1rem 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn-dark" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Restock / Add Stock Modal -->
    <div v-if="showRestockModal" class="modal-overlay" @click.self="showRestockModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 style="color: #FFFFFF; font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <PlusCircle style="width: 18px; height: 18px; color: #10B981;" />
              <span>{{ selectedProductForRestock ? 'Add Stock to "' + selectedProductForRestock.name + '"' : 'Replenish / Add Product Stock' }}</span>
            </h3>
            <p v-if="selectedProductForRestock" style="font-size: 0.78rem; color: #94A3B8; margin: 3px 0 0 0;">
              SKU: <span style="color: #3B82F6; font-family: monospace; font-weight: 700;">{{ selectedProductForRestock.sku }}</span> | Category: <span style="color: #F1F5F9;">{{ selectedProductForRestock.category }}</span>
            </p>
          </div>
          <button class="icon-btn" @click="showRestockModal = false">✕</button>
        </div>
        <form @submit.prevent="submitRestock" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Product Selector if opened generally -->
          <div v-if="!isRowSpecificRestock" style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Select Product to Restock *</label>
            <select v-model="restockSelectedSku" class="og-pill-select" @change="onRestockSkuChange" required style="height: 38px;">
              <option value="" disabled>-- Choose Product to Restock --</option>
              <option v-for="p in store.products" :key="p.sku" :value="p.sku">
                {{ p.name }} ({{ p.sku }}) — Current: {{ p.quantity }} units
              </option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Current In Stock</label>
              <input type="text" :value="(selectedProductForRestock ? selectedProductForRestock.quantity : 0) + ' units'" class="form-input" disabled />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Quantity to Add *</label>
              <input type="number" v-model.number="restockQty" min="1" class="form-input" required autoFocus />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">Supplier Unit Cost (₱) *</label>
              <input type="number" step="0.01" min="0" v-model.number="restockCost" class="form-input" required />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 600; color: #94A3B8;">PO Reference (Optional)</label>
              <input type="text" v-model="restockPoNumber" class="form-input" placeholder="PO-2026-XXXX" />
            </div>
          </div>

          <!-- Calculation Preview Box -->
          <div style="background: #151C2A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.72rem; color: #94A3B8;">Added Capital Investment:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #3B82F6;">
                +₱{{ ((Number(restockQty) || 0) * (Number(restockCost) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; color: #94A3B8;">New In-Stock Units:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #10B981;">
                {{ (selectedProductForRestock ? Number(selectedProductForRestock.quantity) : 0) + (Number(restockQty) || 0) }} units
              </div>
            </div>
          </div>

          <div class="modal-footer" style="padding: 1rem 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn-dark" @click="showRestockModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" style="background: #10B981; border-color: #10B981; color: #FFFFFF;">
              Confirm & Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { 
  Plus, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-vue-next'

const route = useRoute()
const searchQuery = ref(route.query.search || '')
const selectedCategory = ref('')
const selectedStatus = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const isCustomCategory = ref(false)
const form = ref({
  id: null,
  sku: '',
  name: '',
  category: 'Rebisco',
  quantity: 20,
  cost: 25,
  price: 35,
  min_stock: 10
})

const allCategoriesList = computed(() => {
  return store.allCategoryNames || store.categories.map(c => c.name)
})

function cancelCustomCategory() {
  isCustomCategory.value = false
  if (!form.value.category || !allCategoriesList.value.includes(form.value.category)) {
    form.value.category = allCategoriesList.value[0] || 'General'
  }
}

function onCategorySelectChange() {
  if (form.value.category === '__NEW_CATEGORY__') {
    isCustomCategory.value = true
    form.value.category = ''
  }
}

const showRestockModal = ref(false)
const selectedProductForRestock = ref(null)
const isRowSpecificRestock = ref(false)
const restockSelectedSku = ref('')
const restockQty = ref(20)
const restockCost = ref(25)
const restockPoNumber = ref('')

function openGeneralRestockModal() {
  isRowSpecificRestock.value = false
  if (store.products.length > 0) {
    selectedProductForRestock.value = store.products[0]
    restockSelectedSku.value = store.products[0].sku
    restockCost.value = store.products[0].cost || 25
  } else {
    selectedProductForRestock.value = null
    restockSelectedSku.value = ''
    restockCost.value = 25
  }
  restockQty.value = 20
  restockPoNumber.value = 'PO-' + Date.now().toString().slice(-6)
  showRestockModal.value = true
}

function openRestockProduct(p) {
  isRowSpecificRestock.value = true
  selectedProductForRestock.value = p
  restockSelectedSku.value = p.sku
  restockQty.value = 20
  restockCost.value = p.cost || 25
  restockPoNumber.value = 'PO-' + Date.now().toString().slice(-6)
  showRestockModal.value = true
}

function onRestockSkuChange() {
  const p = store.products.find(x => x.sku === restockSelectedSku.value)
  if (p) {
    selectedProductForRestock.value = p
    restockCost.value = p.cost || 25
  }
}

async function submitRestock() {
  if (!selectedProductForRestock.value) {
    alert('Please select a product to restock.')
    return
  }
  const qty = Number(restockQty.value) || 0
  if (qty <= 0) {
    alert('Please enter a valid stock quantity greater than 0.')
    return
  }
  const cost = Number(restockCost.value) || 0
  await store.addStockToProduct(
    selectedProductForRestock.value.id || selectedProductForRestock.value.sku,
    qty,
    cost,
    restockPoNumber.value,
    'Stock replenishment'
  )
  alert(`✅ Successfully added +${qty} units to "${selectedProductForRestock.value.name}"!\nNew In-Stock Total: ${selectedProductForRestock.value.quantity} units.`)
  showRestockModal.value = false
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    const matchesSearch = !searchQuery.value || 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCat = !selectedCategory.value || p.category.toLowerCase() === selectedCategory.value.toLowerCase()
    const matchesStatus = !selectedStatus.value || p.status === selectedStatus.value

    return matchesSearch && matchesCat && matchesStatus
  })
})

function getStatusBadgeClass(p) {
  if (p.quantity === 0 || p.status === 'Out of Stock') return 'status-cancelled'
  if (p.quantity <= p.min_stock || p.status === 'Low Stock') return 'status-pending'
  return 'status-completed'
}

function openAddProductModal() {
  isEditing.value = false
  isCustomCategory.value = false
  const defaultCat = allCategoriesList.value[0] || store.categories[0]?.name || 'Rebisco'
  form.value = {
    id: null,
    sku: store.getNextSku(),
    name: '',
    category: defaultCat,
    quantity: 20,
    cost: 25,
    price: 35,
    min_stock: 10
  }
  showModal.value = true
}

function editProduct(p) {
  isEditing.value = true
  form.value = { ...p }
  if (p.category && !allCategoriesList.value.includes(p.category)) {
    isCustomCategory.value = true
  } else {
    isCustomCategory.value = false
  }
  showModal.value = true
}

async function saveProduct() {
  if (isEditing.value) {
    await store.updateProduct(form.value.id, {
      sku: form.value.sku,
      name: form.value.name,
      category: form.value.category,
      quantity: form.value.quantity,
      cost: form.value.cost,
      price: form.value.price,
      min_stock: form.value.min_stock
    })
    alert(`✅ Product "${form.value.name}" updated successfully!`)
  } else {
    await store.addProduct(form.value)
    alert(`✅ Product "${form.value.name}" registered successfully with ${form.value.quantity} units!`)
  }
  showModal.value = false
}

async function deleteProd(p) {
  if (confirm(`Delete product ${p.name}?`)) {
    await store.deleteProduct(p.id)
  }
}
</script>
