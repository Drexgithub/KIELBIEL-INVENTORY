<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="page-description">Organize products into brand & item categories. Click any category card to view its product inventory list.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-mint" @click="showAddModal = true">
          <Plus /> Add New Category
        </button>
      </div>
    </div>

    <!-- Category Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div 
        v-for="cat in store.categories" 
        :key="cat.id" 
        class="card p-4 category-interactive-card"
        :class="{ 'active-category-card': selectedCategory === cat.name }"
        style="justify-content: space-between; cursor: pointer; transition: all 0.25s ease; border: 1.5px solid var(--border);"
        @click="openCategoryProducts(cat.name)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div class="stat-icon-circle" style="margin-bottom: 0; background: var(--primary-light); color: var(--primary);">
            <Layers />
          </div>
          <button 
            class="icon-btn text-danger" 
            title="Delete Category" 
            style="width: 32px; height: 32px;" 
            @click.stop="deleteCategory(cat)"
          >
            <Trash2 style="width: 15px; height: 15px;" />
          </button>
        </div>

        <div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
            {{ cat.name }}
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
            {{ cat.description || 'General product category' }}
          </p>
        </div>

        <div style="margin-top: 1.25rem; padding-top: 0.875rem; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">
            {{ getProductCount(cat.name) }} Products Assigned
          </span>
          <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
            View List <ChevronRight style="width: 14px; height: 14px;" />
          </span>
        </div>
      </div>
    </div>

    <!-- Category Products Modal / Drawer -->
    <div v-if="selectedCategory" class="modal-overlay" @click.self="selectedCategory = null">
      <div class="modal-card" style="max-width: 820px; width: 95%;">
        
        <!-- Modal Header -->
        <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px;">
              <Package style="width: 22px; height: 22px; color: var(--primary);" />
              <span>{{ selectedCategory }} Products</span>
              <span class="status-badge status-completed" style="font-size: 0.75rem; margin-left: 6px;">
                {{ categoryProducts.length }} Items
              </span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              All registered products assigned under <strong>{{ selectedCategory }}</strong> category
            </p>
          </div>
          <button class="icon-btn" style="width: 34px; height: 34px;" @click="selectedCategory = null">
            <X style="width: 18px; height: 18px;" />
          </button>
        </div>

        <!-- Filter & Search Bar inside Category Products Modal -->
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; margin-top: 0.5rem;">
          <div style="position: relative; flex: 1;">
            <Search style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);" />
            <input 
              type="text" 
              v-model="productSearch" 
              placeholder="Search product name or SKU..." 
              class="form-input" 
              style="padding-left: 36px; height: 38px; font-size: 0.85rem;"
            />
          </div>
          <router-link to="/products" class="btn btn-primary btn-sm" style="height: 38px; gap: 6px;">
            <Plus style="width: 14px; height: 14px;" /> Register New Item
          </router-link>
        </div>

        <!-- Products Table -->
        <div class="table-responsive" style="max-height: 420px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px;">
          <table class="table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--input-bg); border-bottom: 1px solid var(--border);">
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">SKU</th>
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">Product Name</th>
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">Quantity</th>
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">Cost (₱)</th>
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">Price (₱)</th>
                <th style="padding: 0.75rem 1rem; font-size: 0.75rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredCategoryProducts" :key="p.sku || p.id" style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem 1rem; font-size: 0.8rem; font-family: monospace; font-weight: 600; color: var(--primary);">
                  {{ p.sku || 'SKU-001' }}
                </td>
                <td style="padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 700; color: var(--text-main);">
                  {{ p.name }}
                </td>
                <td style="padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600;">
                  {{ p.quantity }} units
                </td>
                <td style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-muted);">
                  ₱{{ Number(p.cost || 0).toFixed(2) }}
                </td>
                <td style="padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 800; color: var(--text-main);">
                  ₱{{ Number(p.price || 0).toFixed(2) }}
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <span 
                    class="status-badge" 
                    :class="p.quantity > (p.min_stock || 10) ? 'status-completed' : (p.quantity > 0 ? 'status-pending' : 'status-cancelled')"
                    style="font-size: 0.72rem;"
                  >
                    {{ p.quantity > (p.min_stock || 10) ? 'In Stock' : (p.quantity > 0 ? 'Low Stock' : 'Out of Stock') }}
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredCategoryProducts.length">
                <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
                  <Package style="width: 32px; height: 32px; color: var(--border); margin-bottom: 0.5rem;" />
                  <p>No products found under "<strong>{{ selectedCategory }}</strong>".</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer" style="margin-top: 1.25rem; padding-top: 1rem;">
          <button type="button" class="btn btn-outline" @click="selectedCategory = null">Close List</button>
        </div>

      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #0F172A;">
            <Layers style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px;" /> 
            Add New Category
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showAddModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="saveCategory" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Category Name <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="newCat.name" class="form-input" placeholder="e.g. Nestle or Beverages" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newCat.description" class="form-textarea" placeholder="Brief summary of items in this category..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Save Category</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { Plus, Layers, Trash2, X, ChevronRight, Package, Search } from 'lucide-vue-next'

const showAddModal = ref(false)
const selectedCategory = ref(null)
const productSearch = ref('')

const newCat = ref({
  name: '',
  description: ''
})

function openCategoryProducts(categoryName) {
  selectedCategory.value = categoryName
  productSearch.value = ''
}

function getProductCount(catName) {
  return store.products.filter(p => (p.category || '').toLowerCase() === catName.toLowerCase()).length
}

const categoryProducts = computed(() => {
  if (!selectedCategory.value) return []
  return store.products.filter(p => (p.category || '').toLowerCase() === selectedCategory.value.toLowerCase())
})

const filteredCategoryProducts = computed(() => {
  const query = productSearch.value.trim().toLowerCase()
  if (!query) return categoryProducts.value
  return categoryProducts.value.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.sku && p.sku.toLowerCase().includes(query))
  )
})

function saveCategory() {
  if (!newCat.value.name.trim()) return
  store.addCategory({
    name: newCat.value.name.trim(),
    description: newCat.value.description.trim()
  })
  newCat.value = { name: '', description: '' }
  showAddModal.value = false
}

function deleteCategory(cat) {
  if (confirm(`Delete category "${cat.name}"?`)) {
    store.deleteCategory(cat.id)
    if (selectedCategory.value === cat.name) {
      selectedCategory.value = null
    }
  }
}
</script>

<style scoped>
.category-interactive-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary) !important;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12) !important;
}
.active-category-card {
  border-color: var(--primary) !important;
  background-color: var(--primary-light) !important;
}
</style>
