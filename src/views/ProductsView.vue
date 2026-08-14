<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Products Inventory</h1>
        <p class="page-description">Manage product catalog, monitor stock levels, and update prices.</p>
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
          <input type="text" v-model="searchQuery" placeholder="Search products, SKUs..." />
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <select v-model="selectedCategory" class="form-select" style="width: 160px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Categories</option>
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
          </select>
          <select v-model="selectedStatus" class="form-select" style="width: 150px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th v-if="store.isAdmin">Cost Price</th>
              <th>Selling Price</th>
              <th>Quantity</th>
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
              <td v-if="store.isAdmin">₱{{ Number(p.cost).toFixed(2) }}</td>
              <td class="font-bold" style="color: var(--text-main);">₱{{ Number(p.price).toFixed(2) }}</td>
              <td>
                <span :style="{ fontWeight: '700', color: p.quantity <= p.min_stock ? '#F87171' : '#34D399' }">
                  {{ p.quantity }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusBadgeClass(p)">
                  {{ p.status }}
                </span>
              </td>
              <td v-if="store.isAdmin" style="text-align: right;">
                <button class="icon-btn" title="Edit Product" style="width: 32px; height: 32px; display: inline-flex;" @click="editProduct(p)">
                  <Edit3 style="width: 15px; height: 15px;" />
                </button>
                <button class="icon-btn text-danger" title="Delete Product" style="width: 32px; height: 32px; display: inline-flex; margin-left: 4px;" @click="deleteProd(p)">
                  <Trash2 style="width: 15px; height: 15px;" />
                </button>
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
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">
            <Package style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;" />
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
            <input type="text" v-model="form.name" class="form-input" required placeholder="e.g. Wireless Mouse" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select v-model="form.category" class="form-select">
                <option v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Initial Quantity</label>
              <input type="number" v-model.number="form.quantity" min="0" class="form-input" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cost Price (₱)</label>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { Plus, Search, Edit3, Trash2, Package, X } from 'lucide-vue-next'

const route = useRoute()
const searchQuery = ref(route.query.search || '')
const selectedCategory = ref('')
const selectedStatus = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null,
  sku: '',
  name: '',
  category: 'Electronics',
  quantity: 10,
  cost: 0,
  price: 0,
  min_stock: 10
})

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    const matchesSearch = !searchQuery.value || 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCat = !selectedCategory.value || p.category === selectedCategory.value
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
  form.value = {
    id: null,
    sku: 'SKU-' + (1000 + store.products.length + 1),
    name: '',
    category: store.categories[0]?.name || 'Electronics',
    quantity: 20,
    cost: 50,
    price: 75,
    min_stock: 10
  }
  showModal.value = true
}

function editProduct(p) {
  isEditing.value = true
  form.value = { ...p }
  showModal.value = true
}

function saveProduct() {
  if (!form.value.name) return

  if (isEditing.value) {
    store.updateProduct(form.value)
    alert(`Product "${form.value.name}" updated successfully!`)
  } else {
    store.addProduct(form.value)
    alert(`New Product "${form.value.name}" registered!`)
  }
  showModal.value = false
}

function deleteProd(p) {
  if (confirm(`Delete product "${p.name}"?`)) {
    store.deleteProduct(p.id)
    alert(`Product "${p.name}" removed.`)
  }
}
</script>
