<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Products Inventory</h1>
        <p class="page-description">Manage product catalog, monitor stock levels, add stock replenishments, and update supplier purchase costs.</p>
      </div>
      <div class="header-actions">
        <button v-if="store.isAdmin" class="btn btn-mint" @click="openAddProductModal">
          <Plus /> Add New Product
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div class="search-container" style="max-width: 320px;">
          <Search class="search-icon" />
          <input type="text" v-model="searchQuery" placeholder="Search products, SKUs, category..." />
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <select v-model="selectedCategory" class="form-select" style="width: 170px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Categories</option>
            <option v-for="catName in allCategoriesList" :key="catName" :value="catName">{{ catName }}</option>
          </select>
          <select v-model="selectedStatus" class="form-select" style="width: 150px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button v-if="searchQuery || selectedCategory || selectedStatus" class="btn btn-outline btn-sm" @click="clearFilters">
            Clear
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th v-if="store.isAdmin">Unit Cost (Capital)</th>
              <th>Selling Price</th>
              <th style="text-align: center;">In Stock</th>
              <th>Status</th>
              <th v-if="store.isAdmin" style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProducts" :key="p.id">
              <td>
                <span style="font-family: monospace; font-weight: 700; color: var(--primary);">{{ p.sku }}</span>
              </td>
              <td><strong style="color: var(--text-main);">{{ p.name }}</strong></td>
              <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ p.category }}</span></td>
              <td v-if="store.isAdmin" style="color: #2563EB; font-weight: 600;">₱{{ Number(p.cost).toFixed(2) }}</td>
              <td class="font-bold" style="color: var(--text-main);">₱{{ Number(p.price).toFixed(2) }}</td>
              <td style="text-align: center;">
                <span :style="{ fontWeight: '700', color: p.quantity <= p.min_stock ? '#F87171' : '#059669', fontSize: '0.95rem' }">
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
                  <button class="btn btn-mint btn-sm" title="Restock Product" @click="openRestockProduct(p)">
                    <PlusCircle style="width: 14px; height: 14px;" /> Restock
                  </button>
                  <button class="icon-btn" title="Edit Product" style="width: 32px; height: 32px;" @click="editProduct(p)">
                    <Edit3 style="width: 15px; height: 15px;" />
                  </button>
                  <button class="icon-btn text-danger" title="Delete Product" style="width: 32px; height: 32px;" @click="deleteProd(p)">
                    <Trash2 style="width: 15px; height: 15px;" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredProducts.length">
              <td colspan="8" class="text-center" style="padding: 3rem 0; color: var(--text-muted);">
                No products match the selected search or filter criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <Package style="width: 20px; height: 20px; color: var(--primary);" />
            <span>{{ isEditing ? 'Edit Product Details' : 'Register New Product' }}</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>SKU Code</label>
            <input type="text" v-model="form.sku" class="form-input" placeholder="Auto-generated if empty" />
          </div>

          <div class="form-group">
            <label>Product Name <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="form.name" class="form-input" required placeholder="e.g. Rebisco Butter Cookies" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <label style="margin-bottom: 0;">Category <span style="color: var(--red-600);">*</span></label>
                <button 
                  type="button" 
                  class="btn-link" 
                  style="font-size: 0.78rem; font-weight: 700; color: var(--primary);"
                  @click="toggleCustomCategory"
                >
                  {{ isCustomCategory ? '← Choose Existing' : '+ New Category' }}
                </button>
              </div>

              <!-- Standard Dropdown Select -->
              <select 
                v-if="!isCustomCategory" 
                v-model="form.category" 
                class="form-select" 
                @change="onCategorySelectChange"
                required
              >
                <option value="" disabled>-- Select Product Category --</option>
                <option v-for="catName in allCategoriesList" :key="catName" :value="catName">
                  {{ catName }}
                </option>
                <option value="__NEW_CATEGORY__">+ Add New Category...</option>
              </select>

              <!-- Text Input for Custom Category -->
              <div v-else style="display: flex; gap: 6px;">
                <input 
                  type="text" 
                  v-model="form.category" 
                  class="form-input" 
                  placeholder="Enter new category name (e.g. Snacks)..." 
                  required 
                />
              </div>
            </div>
            <div class="form-group">
              <label>Initial Quantity</label>
              <input type="number" v-model.number="form.quantity" min="0" class="form-input" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cost Price (Capital ₱) <span style="color: var(--red-600);">*</span></label>
              <input type="number" step="0.01" v-model.number="form.cost" min="0" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Selling Price (₱) <span style="color: var(--red-600);">*</span></label>
              <input type="number" step="0.01" v-model.number="form.price" min="0" class="form-input" required />
            </div>
          </div>

          <div class="form-group">
            <label>Min Stock Threshold</label>
            <input type="number" v-model.number="form.min_stock" min="1" class="form-input" placeholder="10" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">
              {{ isEditing ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Quick Restock Product Modal -->
    <div v-if="showRestockModal && selectedProductForRestock" class="modal-overlay" @click.self="showRestockModal = false">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <PlusCircle style="width: 22px; height: 22px; color: var(--primary);" />
              <span>Restock "{{ selectedProductForRestock.name }}"</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Category: <strong>{{ selectedProductForRestock.category }}</strong> | SKU: <strong>{{ selectedProductForRestock.sku }}</strong>
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showRestockModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <form @submit.prevent="submitRestock" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-row">
            <div class="form-group">
              <label>Current Stock</label>
              <input type="text" :value="selectedProductForRestock.quantity + ' units'" class="form-input" disabled />
            </div>
            <div class="form-group">
              <label>Quantity to Add <span style="color: var(--red-600);">*</span></label>
              <input type="number" v-model.number="restockQty" min="1" class="form-input" required autoFocus />
            </div>
          </div>

          <div class="form-group">
            <label>Supplier Unit Cost (₱) <span style="color: var(--red-600);">*</span></label>
            <input type="number" step="0.01" min="0" v-model.number="restockCost" class="form-input" required />
          </div>

          <div style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Added Supplier Purchase Cost:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">
                +₱{{ ((Number(restockQty) || 0) * (Number(restockCost) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-muted);">New In-Stock Units:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">
                {{ Number(selectedProductForRestock.quantity) + (Number(restockQty) || 0) }} units
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showRestockModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Confirm & Restock</button>
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
import { Plus, PlusCircle, Search, Edit3, Trash2, Package, X } from 'lucide-vue-next'

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

function toggleCustomCategory() {
  isCustomCategory.value = !isCustomCategory.value
  if (!isCustomCategory.value) {
    if (!form.value.category || !allCategoriesList.value.includes(form.value.category)) {
      form.value.category = allCategoriesList.value[0] || 'General'
    }
  } else {
    form.value.category = ''
  }
}

function onCategorySelectChange() {
  if (form.value.category === '__NEW_CATEGORY__') {
    isCustomCategory.value = true
    form.value.category = ''
  }
}

// Quick Restock State
const showRestockModal = ref(false)
const selectedProductForRestock = ref(null)
const restockQty = ref(20)
const restockCost = ref(25)

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
  if (!form.value.name || !form.value.name.trim()) {
    alert('Please enter a product name.')
    return
  }
  if (!form.value.category || !form.value.category.trim()) {
    alert('Please select or enter a product category.')
    return
  }
  form.value.category = form.value.category.trim()

  if (isEditing.value) {
    await store.updateProduct(form.value)
    alert(`Product "${form.value.name}" updated successfully!`)
  } else {
    await store.addProduct(form.value)
    alert(`New Product "${form.value.name}" registered under category "${form.value.category}"!\nSupplier Total Purchase and Remaining Purchase updated.`)
  }
  showModal.value = false
}

function deleteProd(p) {
  if (confirm(`Delete product "${p.name}"?`)) {
    store.deleteProduct(p.id)
    alert(`Product "${p.name}" removed.`)
  }
}

function openRestockProduct(p) {
  selectedProductForRestock.value = p
  restockQty.value = 25
  restockCost.value = Number(p.cost) || 25
  showRestockModal.value = true
}

async function submitRestock() {
  if (!selectedProductForRestock.value) return
  const qty = Number(restockQty.value) || 0
  const cost = Number(restockCost.value) || 0
  if (qty <= 0) {
    alert('Please enter a valid restock quantity.')
    return
  }

  await store.addStockToProduct(
    selectedProductForRestock.value.id || selectedProductForRestock.value.sku,
    qty,
    cost
  )
  showRestockModal.value = false
  alert(`✅ Added +${qty} units to "${selectedProductForRestock.value.name}"!\nSupplier Total Purchase and Remaining Purchase updated (+₱${(qty * cost).toFixed(2)}).`)
}
</script>
