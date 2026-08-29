<template>
  <div class="content">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-description">Monitor supplier purchase capital, track in-stock and sold quantities, and review date-filtered purchase balances.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="exportSuppliersCSV">
          <Download /> Export CSV
        </button>
        <button class="btn btn-mint" @click="openQuickRestockModal(null)">
          <PlusCircle /> Add Product Stock
        </button>
        <button class="btn btn-primary" @click="openRegisterSupplierModal">
          <Plus /> Register Supplier
        </button>
      </div>
    </div>

    <!-- Top Summary Financial KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Suppliers & Categories</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">{{ displayedSuppliers.length }}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Active supplier lines</div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37, 99, 235, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center;">
            <Layers style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>

      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Purchase</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #2563EB; margin-top: 0.25rem;">
              ₱{{ totalFilteredPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
              {{ (startDate || endDate) ? 'Purchases in date range' : 'Cumulative stock capital' }}
            </div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37, 99, 235, 0.1); color: #2563EB; display: flex; align-items: center; justify-content: center;">
            <DollarSign style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>

      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Remaining Purchase</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #059669; margin-top: 0.25rem;">
              ₱{{ totalFilteredRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
            <div style="font-size: 0.75rem; color: #059669; font-weight: 600; margin-top: 0.2rem;">Current in-stock valuation</div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #059669; display: flex; align-items: center; justify-content: center;">
            <CheckCircle2 style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>

      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Units Sold</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #D97706; margin-top: 0.25rem;">
              {{ totalFilteredSoldUnits.toLocaleString('en-US') }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
              {{ (startDate || endDate) ? 'Sold units in date range' : 'Sold across all receipts' }}
            </div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(217, 119, 6, 0.1); color: #D97706; display: flex; align-items: center; justify-content: center;">
            <ShoppingCart style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Date Range & Search Control Card -->
    <div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        
        <!-- Search bar -->
        <div class="search-container" style="max-width: 320px; flex: 1;">
          <Search class="search-icon" />
          <input type="text" v-model="search" placeholder="Search supplier or category..." />
        </div>

        <!-- Date Range Filter Group -->
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0;">From:</label>
            <input 
              type="date" 
              v-model="startDate" 
              class="form-input" 
              style="width: 145px; height: 36px; padding: 0.25rem 0.5rem; font-size: 0.8rem;" 
              title="Start Date" 
            />
          </div>

          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0;">To:</label>
            <input 
              type="date" 
              v-model="endDate" 
              class="form-input" 
              style="width: 145px; height: 36px; padding: 0.25rem 0.5rem; font-size: 0.8rem;" 
              title="End Date" 
            />
          </div>

          <!-- Quick Date Range Presets -->
          <div class="quick-date-pills" style="display: flex; gap: 4px;">
            <button 
              type="button" 
              class="btn-date-pill" 
              :class="{ active: activeDatePreset === 'today' }" 
              @click="setDatePreset('today')"
            >
              Today
            </button>
            <button 
              type="button" 
              class="btn-date-pill" 
              :class="{ active: activeDatePreset === 'week' }" 
              @click="setDatePreset('week')"
            >
              This Week
            </button>
            <button 
              type="button" 
              class="btn-date-pill" 
              :class="{ active: activeDatePreset === 'month' }" 
              @click="setDatePreset('month')"
            >
              This Month
            </button>
            <button 
              type="button" 
              class="btn-date-pill" 
              :class="{ active: activeDatePreset === 'all' }" 
              @click="setDatePreset('all')"
            >
              All Time
            </button>
          </div>

          <button 
            v-if="startDate || endDate || search" 
            class="btn btn-outline btn-sm" 
            style="height: 36px;" 
            @click="clearFilters"
          >
            Reset
          </button>
        </div>

      </div>

      <!-- Active Date Range Notice -->
      <div v-if="startDate || endDate" style="margin-top: 0.65rem; padding-top: 0.65rem; border-top: 1px dashed var(--border); font-size: 0.78rem; color: var(--primary); display: flex; align-items: center; gap: 6px;">
        <Calendar style="width: 13px; height: 13px;" />
        <span>Filtered Date Range: <strong>{{ startDate || 'Earliest' }}</strong> to <strong>{{ endDate || 'Latest' }}</strong></span>
      </div>
    </div>

    <!-- Main Supplier Table -->
    <div class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th style="text-align: center;">In Stock</th>
              <th style="text-align: center;">Units Sold</th>
              <th style="color: #2563EB;">Total Purchase (₱)</th>
              <th style="color: #059669; font-weight: 800;">Remaining Purchase (₱)</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in displayedSuppliers" :key="s.code + s.category">
              <!-- Single Supplier Name -->
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="color: var(--text-main); font-size: 0.95rem;">{{ s.category }}</strong>
                  <span style="font-family: monospace; font-size: 0.72rem; color: var(--text-muted); background: var(--input-bg); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">
                    {{ s.code }}
                  </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                  {{ s.productCount }} {{ s.productCount === 1 ? 'product' : 'products' }} registered
                </div>
              </td>

              <!-- In Stock Units -->
              <td style="text-align: center;">
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  {{ s.totalStock }}
                </span>
                <div style="font-size: 0.7rem; color: var(--text-muted);">units</div>
              </td>

              <!-- Units Sold (date-range sensitive) -->
              <td style="text-align: center;">
                <span style="font-weight: 700; font-size: 0.95rem; color: #D97706;">
                  {{ s.dateFilteredSoldUnits }}
                </span>
                <div style="font-size: 0.7rem; color: var(--text-muted);">sold</div>
              </td>

              <!-- Total Purchase Column (date-range sensitive) -->
              <td>
                <div class="font-bold" style="color: #2563EB; font-size: 0.95rem;">
                  ₱{{ Number(s.dateFilteredTotalPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
                <div v-if="s.lastPurchaseDate" style="font-size: 0.7rem; color: var(--text-muted);">
                  <Calendar style="width: 11px; height: 11px; display: inline-block; vertical-align: middle;" /> {{ s.lastPurchaseDate }}
                </div>
              </td>

              <!-- Remaining Purchase Column -->
              <td>
                <div class="font-bold" style="color: #059669; font-size: 1.05rem; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; display: inline-block;">
                  ₱{{ Number(s.remainingPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
              </td>

              <!-- Actions (Restock button removed; View Products, Log PO, History, Delete retained) -->
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <button class="btn btn-outline btn-sm" title="View Products in this Category" @click="openCategoryProductsModal(s)">
                    <Package style="width: 14px; height: 14px;" /> View Products
                  </button>
                  <button class="icon-btn" title="Log Dated Purchase Order" @click="openLogPurchaseModal(s)">
                    <FileText style="width: 15px; height: 15px; color: #64748B;" />
                  </button>
                  <button class="icon-btn" title="View Purchase Order Ledger History" @click="openHistoryModal(s)">
                    <History style="width: 15px; height: 15px; color: #64748B;" />
                  </button>
                  <button v-if="s.rawSupplier" class="icon-btn text-danger" title="Delete Supplier Record" @click="deleteSup(s.code)">
                    <Trash2 style="width: 15px; height: 15px;" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!displayedSuppliers.length">
              <td colspan="6" class="text-center" style="padding: 3.5rem 0; color: var(--text-muted);">
                <Package style="width: 42px; height: 42px; opacity: 0.3; margin-bottom: 0.5rem;" />
                <div>No suppliers found matching the criteria.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: ADD STOCK TO CATEGORY / PRODUCT                               -->
    <!-- ==================================================================== -->
    <div v-if="showRestockModal" class="modal-overlay" @click.self="showRestockModal = false">
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <PlusCircle style="width: 22px; height: 22px; color: var(--primary);" />
              <span>Add Stock to {{ restockForm.category }}</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Adding stock will automatically increase the supplier's Total Purchase and Remaining Purchase.
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showRestockModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <form @submit.prevent="saveRestock" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Product Category <span style="color: var(--red-600);">*</span></label>
            <select v-model="restockForm.category" class="form-select" @change="onRestockCategoryChange" required>
              <option v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="margin-bottom: 0;">Target Product</label>
              <button 
                type="button" 
                class="btn-link" 
                style="font-size: 0.78rem; font-weight: 700;"
                @click="restockForm.isNewProduct = !restockForm.isNewProduct"
              >
                {{ restockForm.isNewProduct ? '← Select Existing Product' : '+ Add New Product Under ' + restockForm.category }}
              </button>
            </div>

            <select 
              v-if="!restockForm.isNewProduct" 
              v-model="restockForm.selectedProductSku" 
              class="form-select" 
              @change="onRestockProductSelect"
              required
            >
              <option value="" disabled>-- Choose Product to Restock --</option>
              <option v-for="p in categoryProductsForRestock" :key="p.sku" :value="p.sku">
                {{ p.name }} ({{ p.sku }}) — Current Stock: {{ p.quantity }} units @ ₱{{ Number(p.cost).toFixed(2) }}
              </option>
            </select>

            <div v-else style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--input-bg); padding: 0.75rem; border-radius: 8px; border: 1px dashed var(--border);">
              <div>
                <label style="font-size: 0.78rem;">New Product Name <span style="color: var(--red-600);">*</span></label>
                <input type="text" v-model="restockForm.newProductName" class="form-input" placeholder="e.g. Rebisco Sandwich Crackers" required />
              </div>
              <div class="form-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 0.78rem;">SKU (Optional)</label>
                  <input type="text" v-model="restockForm.newProductSku" class="form-input" placeholder="Auto-generated" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-size: 0.78rem;">Selling Price (₱) <span style="color: var(--red-600);">*</span></label>
                  <input type="number" step="0.01" min="0" v-model.number="restockForm.newProductPrice" class="form-input" required />
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Stock Quantity to Add <span style="color: var(--red-600);">*</span></label>
              <input type="number" v-model.number="restockForm.quantityToAdd" min="1" class="form-input" required placeholder="e.g. 50" />
            </div>
            <div class="form-group">
              <label>Supplier Unit Cost (₱) <span style="color: var(--red-600);">*</span></label>
              <input type="number" step="0.01" min="0" v-model.number="restockForm.unitCost" class="form-input" required placeholder="25.00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>PO Reference # (Optional)</label>
              <input type="text" v-model="restockForm.poNumber" class="form-input" placeholder="PO-2026-XXXX" />
            </div>
            <div class="form-group">
              <label>Batch / Invoice Note</label>
              <input type="text" v-model="restockForm.notes" class="form-input" placeholder="e.g. Batch Delivery" />
            </div>
          </div>

          <div style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Added Supplier Capital Cost:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">
                +₱{{ (Number(restockForm.quantityToAdd || 0) * Number(restockForm.unitCost || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-muted);">New In-Stock Units:</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">
                {{ (selectedProductCurrentStock + Number(restockForm.quantityToAdd || 0)) }} units
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showRestockModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">
              <CheckCircle2 style="width: 16px; height: 16px;" /> Confirm & Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: CATEGORY PRODUCTS & REMAINING PURCHASE BREAKDOWN              -->
    <!-- ==================================================================== -->
    <div v-if="showCategoryProductsModal && activeCategorySupplier" class="modal-overlay" @click.self="showCategoryProductsModal = false">
      <div class="modal-card" style="max-width: 860px; width: 95%;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <Package style="width: 22px; height: 22px; color: var(--primary);" />
              <span>{{ activeCategorySupplier.category }} Products</span>
              <span style="font-family: monospace; font-size: 0.75rem; background: var(--input-bg); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">{{ activeCategorySupplier.code }}</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              All products assigned under {{ activeCategorySupplier.category }} with individual costs and remaining stock valuation.
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showCategoryProductsModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; background: var(--input-bg); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Total Purchase</span>
              <strong style="font-size: 0.95rem; color: #2563EB;">₱{{ Number(activeCategorySupplier.totalPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Remaining Purchase</span>
              <strong style="font-size: 0.95rem; color: #059669;">₱{{ Number(activeCategorySupplier.remainingPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Current In-Stock</span>
              <strong style="font-size: 0.95rem; color: var(--text-main);">{{ activeCategorySupplier.totalStock }} units</strong>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
            <div class="search-container" style="max-width: 320px;">
              <Search class="search-icon" />
              <input type="text" v-model="categoryProductSearch" placeholder="Search SKU or product name..." />
            </div>
            <button class="btn btn-mint btn-sm" @click="openQuickRestockModal(activeCategorySupplier)">
              <PlusCircle style="width: 14px; height: 14px;" /> Add Stock to {{ activeCategorySupplier.category }}
            </button>
          </div>

          <div class="table-responsive" style="max-height: 360px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table class="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th style="text-align: center;">In Stock</th>
                  <th>Unit Cost (₱)</th>
                  <th>Selling Price (₱)</th>
                  <th style="text-align: center;">Sold (Units)</th>
                  <th style="color: #059669;">Remaining Cost (₱)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredActiveCategoryProducts" :key="p.sku || p.id">
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">{{ p.sku }}</span></td>
                  <td><strong style="color: var(--text-main);">{{ p.name }}</strong></td>
                  <td style="text-align: center; font-weight: 700;">{{ p.quantity }}</td>
                  <td>₱{{ Number(p.cost).toFixed(2) }}</td>
                  <td>₱{{ Number(p.price).toFixed(2) }}</td>
                  <td style="text-align: center; color: #D97706; font-weight: 600;">
                    {{ getProductUnitsSold(p.name) }}
                  </td>
                  <td class="font-bold" style="color: #059669;">
                    ₱{{ (Number(p.quantity) * Number(p.cost)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </td>
                </tr>
                <tr v-if="!filteredActiveCategoryProducts.length">
                  <td colspan="7" class="text-center" style="padding: 2.5rem 0; color: var(--text-muted);">
                    No products registered in this category yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="showCategoryProductsModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: REGISTER NEW SUPPLIER                                          -->
    <!-- ==================================================================== -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <Users style="width: 20px; height: 20px; color: var(--primary);" />
            <span>Register Supplier</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showRegisterModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="saveSupplier" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-row">
            <div class="form-group">
              <label>Supplier Code</label>
              <input type="text" v-model="supForm.code" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Category / Supplier Name <span style="color: var(--red-600);">*</span></label>
              <input type="text" v-model="supForm.category" class="form-input" required placeholder="e.g. Caceras prime or Rebisco" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contact Person (Optional)</label>
              <input type="text" v-model="supForm.contact" class="form-input" placeholder="Representative Name" />
            </div>
            <div class="form-group">
              <label>Phone (Optional)</label>
              <input type="text" v-model="supForm.phone" class="form-input" placeholder="+63 9XX XXX XXXX" />
            </div>
          </div>
          <div class="form-group">
            <label>Business Address</label>
            <input type="text" v-model="supForm.address" class="form-input" placeholder="City, Province" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showRegisterModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: LOG PURCHASE ORDER                                            -->
    <!-- ==================================================================== -->
    <div v-if="showLogPurchaseModal" class="modal-overlay" @click.self="showLogPurchaseModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <FileText style="width: 20px; height: 20px; color: var(--primary);" />
            <span>Log Purchase Order</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showLogPurchaseModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="savePurchaseOrder" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Supplier / Category</label>
            <select v-model="purForm.supplierCode" class="form-select" required>
              <option v-for="s in store.categorySuppliers" :key="s.code" :value="s.code">
                {{ s.category }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Purchase Date <span style="color: var(--red-600);">*</span></label>
              <input type="date" v-model="purForm.date" class="form-input" required />
            </div>
            <div class="form-group">
              <label>PO Reference # <span style="color: var(--red-600);">*</span></label>
              <input type="text" v-model="purForm.poNumber" class="form-input" required />
            </div>
          </div>
          <div class="form-group">
            <label>Item Description / Batch Details <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="purForm.items" class="form-input" placeholder="e.g. Batch stock delivery" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (₱) <span style="color: var(--red-600);">*</span></label>
              <input type="number" step="0.01" v-model.number="purForm.amount" min="1" class="form-input" required />
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select v-model="purForm.method" class="form-select">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="GCash Biz">GCash Biz</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showLogPurchaseModal = false">Cancel</button>
            <button type="submit" class="btn btn-mint">Record Purchase</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: PURCHASE HISTORY & DATE LEDGER                                -->
    <!-- ==================================================================== -->
    <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
      <div class="modal-card" style="max-width: 860px; width: 95%;">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <History style="width: 22px; height: 22px; color: var(--primary);" />
            <span>Purchase History & Date Ledger — {{ activeSupplier?.category }}</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showHistoryModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div>
              <strong>Supplier:</strong> {{ activeSupplier?.category }} | 
              <strong>Code:</strong> {{ activeSupplier?.code }}
            </div>
            <div class="status-badge status-completed" style="font-size: 0.9rem;">
              Total Spent: ₱{{ activeSupplierTotalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
          </div>

          <div class="table-responsive" style="max-height: 320px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Purchase Date</th>
                  <th>PO Reference</th>
                  <th>Items Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in activeSupplierPurchases" :key="p.id">
                  <td><strong style="color: var(--text-main);"><Calendar style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" /> {{ p.date }}</strong></td>
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">#{{ p.poNumber }}</span></td>
                  <td>{{ p.items }}</td>
                  <td class="font-bold" style="color: #2563EB;">₱{{ Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                  <td><span class="user-pill" style="display: inline-block; font-size: 0.75rem; padding: 2px 10px;">{{ p.method }}</span></td>
                  <td><span class="status-badge status-completed">{{ p.status }}</span></td>
                  <td style="text-align: right;">
                    <button class="icon-btn text-danger" title="Delete Purchase Entry" style="width: 32px; height: 32px;" @click="delPurchase(p.id)">
                      <Trash2 style="width: 15px; height: 15px;" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!activeSupplierPurchases.length">
                  <td colspan="7" class="text-center" style="padding: 2rem 0; color: var(--text-muted);">
                    No purchase history logged for this supplier yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showHistoryModal = false">Close Ledger</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Download, 
  Plus, 
  PlusCircle, 
  Search, 
  Calendar, 
  History, 
  Trash2, 
  Users, 
  X, 
  Layers, 
  DollarSign, 
  ShoppingCart, 
  CheckCircle2, 
  Package, 
  FileText 
} from 'lucide-vue-next'

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const activeDatePreset = ref('all')

// Modals
const showRegisterModal = ref(false)
const showLogPurchaseModal = ref(false)
const showHistoryModal = ref(false)
const showRestockModal = ref(false)
const showCategoryProductsModal = ref(false)

const activeSupplier = ref(null)
const activeCategorySupplier = ref(null)
const categoryProductSearch = ref('')

// Restock Form State
const restockForm = ref({
  category: 'Rebisco',
  selectedProductSku: '',
  quantityToAdd: 20,
  unitCost: 25,
  poNumber: '',
  notes: '',
  isNewProduct: false,
  newProductName: '',
  newProductSku: '',
  newProductPrice: 35
})

const supForm = ref({
  code: 'SUP-00' + (store.suppliers.length + 1),
  name: '',
  contact: '',
  email: '',
  phone: '',
  category: 'Rebisco',
  address: '',
  status: 'Active'
})

const purForm = ref({
  supplierCode: '',
  date: new Date().toISOString().slice(0, 10),
  poNumber: 'PO-2026-001',
  items: '',
  amount: 0,
  method: 'Bank Transfer',
  status: 'Paid'
})

function setDatePreset(preset) {
  activeDatePreset.value = preset
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  if (preset === 'today') {
    startDate.value = todayStr
    endDate.value = todayStr
  } else if (preset === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
    const monday = new Date(now.setDate(diff))
    startDate.value = monday.toISOString().slice(0, 10)
    endDate.value = todayStr
  } else if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.value = firstDay.toISOString().slice(0, 10)
    endDate.value = todayStr
  } else if (preset === 'all') {
    startDate.value = ''
    endDate.value = ''
  }
}

function clearFilters() {
  search.value = ''
  startDate.value = ''
  endDate.value = ''
  activeDatePreset.value = 'all'
}

// Compute Date-Filtered metrics for each supplier
const displayedSuppliers = computed(() => {
  const q = search.value.toLowerCase().trim()
  const sDate = startDate.value ? new Date(startDate.value + 'T00:00:00') : null
  const eDate = endDate.value ? new Date(endDate.value + 'T23:59:59') : null
  const isDateFiltered = !!(sDate || eDate)

  return store.categorySuppliers.map(s => {
    // 1. Calculate sold units within date range
    let rangeSoldUnits = 0
    let rangeSoldCost = 0

    store.receipts.forEach(r => {
      if (!r.items || !Array.isArray(r.items)) return
      
      let inDateRange = true
      if (isDateFiltered && r.created_at) {
        const rDate = new Date(r.created_at)
        if (sDate && rDate < sDate) inDateRange = false
        if (eDate && rDate > eDate) inDateRange = false
      }

      if (inDateRange) {
        r.items.forEach(item => {
          const prod = s.products.find(p => p.name.toLowerCase().trim() === (item.item_desc || '').toLowerCase().trim())
          if (prod) {
            const qty = Number(item.quantity) || 0
            const unitCost = Number(prod.cost) || 0
            rangeSoldUnits += qty
            rangeSoldCost += qty * unitCost
          }
        })
      }
    })

    // 2. Calculate purchases within date range
    const supCode = (s.code || '').toLowerCase()
    const catName = (s.category || '').toLowerCase()

    let rangePoAmount = 0
    store.purchases.forEach(p => {
      const pSupCode = (p.supplierCode || '').toLowerCase()
      if (pSupCode === supCode || pSupCode === catName) {
        let inDateRange = true
        if (isDateFiltered && p.date) {
          const pDate = new Date(p.date + 'T12:00:00')
          if (sDate && pDate < sDate) inDateRange = false
          if (eDate && pDate > eDate) inDateRange = false
        }
        if (inDateRange) {
          rangePoAmount += Number(p.amount) || 0
        }
      }
    })

    // If date range is active, compute date-scoped total purchase and sold units
    const dateFilteredTotalPurchase = isDateFiltered
      ? (rangePoAmount > 0 ? rangePoAmount : (rangeSoldCost + s.remainingPurchase))
      : s.totalPurchase

    const dateFilteredSoldUnits = isDateFiltered ? rangeSoldUnits : s.totalSoldUnits

    return {
      ...s,
      dateFilteredTotalPurchase: dateFilteredTotalPurchase,
      dateFilteredSoldUnits: dateFilteredSoldUnits
    }
  }).filter(s => {
    if (!q) return true
    return s.category.toLowerCase().includes(q) || 
      s.code.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q) ||
      s.products.some(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  })
})

const totalFilteredPurchases = computed(() => {
  return displayedSuppliers.value.reduce((sum, s) => sum + Number(s.dateFilteredTotalPurchase || 0), 0)
})

const totalFilteredRemaining = computed(() => {
  return displayedSuppliers.value.reduce((sum, s) => sum + Number(s.remainingPurchase || 0), 0)
})

const totalFilteredSoldUnits = computed(() => {
  return displayedSuppliers.value.reduce((sum, s) => sum + Number(s.dateFilteredSoldUnits || 0), 0)
})

const activeSupplierPurchases = computed(() => {
  if (!activeSupplier.value) return []
  const targetCode = (activeSupplier.value.code || '').toLowerCase()
  const targetCat = (activeSupplier.value.category || '').toLowerCase()
  return store.purchases.filter(p => {
    const sc = (p.supplierCode || '').toLowerCase()
    return sc === targetCode || sc === targetCat
  })
})

const activeSupplierTotalSpent = computed(() => {
  return activeSupplierPurchases.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

const categoryProductsForRestock = computed(() => {
  const cat = (restockForm.value.category || '').toLowerCase().trim()
  return store.products.filter(p => (p.category || '').toLowerCase().trim() === cat)
})

const selectedProductCurrentStock = computed(() => {
  if (restockForm.value.isNewProduct) return 0
  const prod = store.products.find(p => p.sku === restockForm.value.selectedProductSku)
  return prod ? Number(prod.quantity) : 0
})

const filteredActiveCategoryProducts = computed(() => {
  if (!activeCategorySupplier.value) return []
  const prods = activeCategorySupplier.value.products || []
  const q = categoryProductSearch.value.trim().toLowerCase()
  if (!q) return prods
  return prods.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
})

function getProductUnitsSold(productName) {
  let sold = 0
  const qName = productName.toLowerCase().trim()
  store.receipts.forEach(r => {
    if (!r.items) return
    r.items.forEach(item => {
      if ((item.item_desc || '').toLowerCase().trim() === qName) {
        sold += Number(item.quantity) || 0
      }
    })
  })
  return sold
}

function openQuickRestockModal(categoryItem) {
  const cat = categoryItem ? categoryItem.category : (store.categories[0]?.name || 'Rebisco')
  restockForm.value.category = cat
  restockForm.value.isNewProduct = false
  restockForm.value.quantityToAdd = 20
  restockForm.value.poNumber = 'PO-' + Date.now().toString().slice(-6)
  restockForm.value.notes = 'Batch Restock'
  restockForm.value.newProductName = ''
  restockForm.value.newProductSku = ''
  restockForm.value.newProductPrice = 0

  const prods = store.products.filter(p => (p.category || '').toLowerCase().trim() === cat.toLowerCase().trim())
  if (prods.length > 0) {
    restockForm.value.selectedProductSku = prods[0].sku
    restockForm.value.unitCost = Number(prods[0].cost) || 25
  } else {
    restockForm.value.selectedProductSku = ''
    restockForm.value.isNewProduct = true
    restockForm.value.unitCost = 25
    restockForm.value.newProductPrice = 35
  }

  showRestockModal.value = true
}

function onRestockCategoryChange() {
  const cat = (restockForm.value.category || '').toLowerCase().trim()
  const prods = store.products.filter(p => (p.category || '').toLowerCase().trim() === cat)
  if (prods.length > 0) {
    restockForm.value.isNewProduct = false
    restockForm.value.selectedProductSku = prods[0].sku
    restockForm.value.unitCost = Number(prods[0].cost) || 25
  } else {
    restockForm.value.selectedProductSku = ''
    restockForm.value.isNewProduct = true
  }
}

function onRestockProductSelect() {
  const prod = store.products.find(p => p.sku === restockForm.value.selectedProductSku)
  if (prod) {
    restockForm.value.unitCost = Number(prod.cost) || 0
  }
}

async function saveRestock() {
  const qty = Number(restockForm.value.quantityToAdd) || 0
  const cost = Number(restockForm.value.unitCost) || 0
  if (qty <= 0) {
    alert('Please enter a valid stock quantity greater than 0.')
    return
  }

  if (restockForm.value.isNewProduct) {
    if (!restockForm.value.newProductName.trim()) {
      alert('Please enter a product name.')
      return
    }
    const newSku = restockForm.value.newProductSku.trim() || store.getNextSku()
    await store.addProduct({
      sku: newSku,
      name: restockForm.value.newProductName.trim(),
      category: restockForm.value.category,
      quantity: qty,
      cost: cost,
      price: Number(restockForm.value.newProductPrice) || (cost * 1.3),
      min_stock: 10
    })
    alert(`✅ Product "${restockForm.value.newProductName}" added with ${qty} units in ${restockForm.value.category} category!\nSupplier Total Purchase & Remaining Purchase updated (+₱${(qty * cost).toFixed(2)}).`)
  } else {
    const prod = store.products.find(p => p.sku === restockForm.value.selectedProductSku)
    if (!prod) {
      alert('Selected product not found.')
      return
    }
    await store.addStockToProduct(
      prod.id || prod.sku,
      qty,
      cost,
      restockForm.value.poNumber,
      restockForm.value.notes
    )
    alert(`✅ Added +${qty} units to "${prod.name}"!\nSupplier Total Purchase and Remaining Purchase updated (+₱${(qty * cost).toFixed(2)}).`)
  }

  showRestockModal.value = false
}

function openCategoryProductsModal(catSupplier) {
  activeCategorySupplier.value = catSupplier
  categoryProductSearch.value = ''
  showCategoryProductsModal.value = true
}

function openRegisterSupplierModal() {
  supForm.value = {
    code: 'SUP-00' + (store.suppliers.length + 1),
    name: '',
    contact: '',
    email: '',
    phone: '',
    category: 'Rebisco',
    address: '',
    status: 'Active'
  }
  showRegisterModal.value = true
}

function saveSupplier() {
  if (!supForm.value.category) return
  store.addSupplier({
    ...supForm.value,
    name: supForm.value.category,
    totalPurchase: 0,
    totalOrders: 0
  })
  showRegisterModal.value = false
  alert(`Supplier "${supForm.value.category}" registered!`)
}

function openLogPurchaseModal(s) {
  purForm.value = {
    supplierCode: s.code,
    date: new Date().toISOString().slice(0, 10),
    poNumber: 'PO-2026-10' + (store.purchases.length + 1),
    items: `Bulk Replenishment for ${s.category}`,
    amount: 15000,
    method: 'Bank Transfer',
    status: 'Paid'
  }
  showLogPurchaseModal.value = true
}

function savePurchaseOrder() {
  if (!purForm.value.amount || !purForm.value.items) return
  store.addSupplierPurchase({
    id: 'PUR-' + Math.floor(1000 + Math.random() * 9000),
    ...purForm.value
  })
  showLogPurchaseModal.value = false
  alert(`Recorded Purchase Order #${purForm.value.poNumber} for ₱${Number(purForm.value.amount).toFixed(2)}!`)
}

function openHistoryModal(s) {
  activeSupplier.value = s
  showHistoryModal.value = true
}

function delPurchase(purId) {
  if (confirm('Delete this purchase transaction entry?')) {
    store.deletePurchase(purId)
  }
}

function deleteSup(code) {
  if (confirm(`Delete supplier entry ${code}?`)) {
    store.deleteSupplier(code)
  }
}

function exportSuppliersCSV() {
  let csv = 'Supplier Name,Supplier Code,Products Count,In-Stock Units,Sold Units,Total Purchase,Remaining Purchase,Last Purchase Date\n'
  displayedSuppliers.value.forEach(s => {
    csv += `"${s.category}","${s.code}",${s.productCount},${s.totalStock},${s.dateFilteredSoldUnits},${s.dateFilteredTotalPurchase},${s.remainingPurchase},"${s.lastPurchaseDate || ''}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Suppliers_Date_Filtered_Ledger.csv'
  a.click()
}
</script>

<style scoped>
.btn-date-pill {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-date-pill:hover {
  background: var(--surface);
  color: var(--text-main);
  border-color: var(--primary);
}

.btn-date-pill.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}
</style>
