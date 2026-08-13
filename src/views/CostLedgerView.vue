<template>
  <div class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Product Costing & COGS Ledger</h1>
        <p class="page-description">Input product purchase costs (capital), monitor profit margins, and track net sales revenue.</p>
      </div>
      <div class="date-picker-pill">
        <DollarSign style="width: 14px; height: 14px; color: var(--primary);" />
        <span>Net Profit Margin: {{ averageMargin.toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Product Cost & Margin Table -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <h2 class="card-title">Product Purchase Price Ledger</h2>
        <div class="search-container" style="max-width: 320px;">
          <Search class="search-icon" />
          <input type="text" v-model="search" placeholder="Search product name, SKU..." />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Cost (Bought For)</th>
              <th>Selling Price</th>
              <th>Profit / Unit</th>
              <th>Margin (%)</th>
              <th>In Stock</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProducts" :key="p.id">
              <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">{{ p.sku }}</span></td>
              <td><strong style="color: var(--text-main);">{{ p.name }}</strong></td>
              <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ p.category }}</span></td>
              
              <!-- Editable Unit Cost Field -->
              <td>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: var(--text-muted);">₱</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    v-model.number="p.cost" 
                    class="form-input" 
                    style="width: 100px; padding: 4px 8px; height: 34px; font-weight: 700;"
                    @change="updateCost(p)"
                  />
                </div>
              </td>

              <!-- Selling Price -->
              <td><strong style="color: var(--text-main);">₱{{ Number(p.price).toFixed(2) }}</strong></td>

              <!-- Profit per unit -->
              <td class="font-bold" :style="{ color: (p.price - p.cost) >= 0 ? '#34D399' : '#F87171' }">
                ₱{{ (p.price - p.cost).toFixed(2) }}
              </td>

              <!-- Margin % -->
              <td>
                <span class="status-badge" :class="(p.price - p.cost) >= 0 ? 'status-completed' : 'status-cancelled'">
                  {{ getMarginPercent(p).toFixed(1) }}%
                </span>
              </td>

              <!-- Stock Quantity -->
              <td>{{ p.quantity }}</td>

              <!-- Save Action Button -->
              <td style="text-align: right;">
                <button class="btn btn-mint btn-sm" @click="updateCost(p)">
                  <Save style="width: 14px; height: 14px;" /> Save Cost
                </button>
              </td>
            </tr>
            <tr v-if="!filteredProducts.length">
              <td colspan="9" class="text-center" style="padding: 3rem 0; color: var(--text-muted);">
                No products found matching your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { DollarSign, TrendingUp, TrendingDown, Package, Search, Save } from 'lucide-vue-next'

const search = ref('')

const filteredProducts = computed(() => {
  if (!search.value.trim()) return store.products
  const q = search.value.toLowerCase().trim()
  return store.products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  )
})

const averageMargin = computed(() => {
  if (!store.products.length) return 0
  const margins = store.products.map(p => getMarginPercent(p))
  return margins.reduce((a, b) => a + b, 0) / margins.length
})

function getMarginPercent(p) {
  if (!p.price || p.price <= 0) return 0
  return ((p.price - p.cost) / p.price) * 100
}

function updateCost(p) {
  store.updateProduct(p)
  alert(`Cost price for "${p.name}" updated to ₱${Number(p.cost).toFixed(2)}!`)
}
</script>
