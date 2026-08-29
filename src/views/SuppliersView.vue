<template>
  <div class="content">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers & Category Purchase Ledger</h1>
        <p class="page-description">Track all product categories, monitor total supplier purchase costs, view live POS deductions, and manage remaining inventory balances.</p>
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
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Product Categories</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">{{ store.categorySuppliers.length }}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">All product lines tracked</div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37, 99, 235, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center;">
            <Layers style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>

      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Purchase (Capital)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #2563EB; margin-top: 0.25rem;">
              ₱{{ store.totalCategoryPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Cumulative stock cost supplied</div>
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
              ₱{{ store.totalCategoryRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
            <div style="font-size: 0.75rem; color: #059669; font-weight: 600; margin-top: 0.2rem;">Current unsold stock valuation</div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #059669; display: flex; align-items: center; justify-content: center;">
            <CheckCircle2 style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>

      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Sold Deductions (COGS)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #D97706; margin-top: 0.25rem;">
              -₱{{ store.totalCategorySoldDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Deducted via POS receipts</div>
          </div>
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(217, 119, 6, 0.1); color: #D97706; display: flex; align-items: center; justify-content: center;">
            <ShoppingCart style="width: 22px; height: 22px;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Suppliers & Category Ledger Table Card -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div class="search-container" style="max-width: 360px;">
          <Search class="search-icon" />
          <input type="text" v-model="search" placeholder="Search category, supplier name, SKU..." />
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <select v-model="selectedCategoryFilter" class="form-select" style="width: 170px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Categories</option>
            <option v-for="cat in store.categorySuppliers" :key="cat.category" :value="cat.category">{{ cat.category }}</option>
          </select>
          <select v-model="statusFilter" class="form-select" style="width: 140px; height: 38px; padding: 0.25rem 0.75rem;">
            <option value="">All Statuses</option>
            <option value="Active">Active / Stocked</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <input type="date" v-model="filterDate" class="form-input" style="width: 155px; height: 38px; padding: 0.25rem 0.75rem;" title="Filter by Purchase Date" />
          <button v-if="filterDate || selectedCategoryFilter || statusFilter || search" class="btn btn-outline btn-sm" @click="clearFilters">
            Clear Filters
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Category & Supplier</th>
              <th>Contact Details</th>
              <th style="text-align: center;">In Stock</th>
              <th style="text-align: center;">Units Sold</th>
              <th style="color: #2563EB;">Total Purchase (₱)</th>
              <th style="color: #D97706;">Sold Deductions (₱)</th>
              <th style="color: #059669; font-weight: 800;">Remaining Purchase (₱)</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSuppliers" :key="s.code + s.category">
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="user-pill" style="font-size: 0.8rem; font-weight: 700; padding: 3px 10px; background: var(--primary-light); color: var(--primary);">
                    {{ s.category }}
                  </span>
                  <span style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">{{ s.code }}</span>
                </div>
                <strong style="color: var(--text-main); font-size: 0.92rem; display: block; margin-top: 3px;">{{ s.name }}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  {{ s.productCount }} {{ s.productCount === 1 ? 'product' : 'products' }} registered
                </div>
              </td>
              <td>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main);">{{ s.contact }}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">{{ s.phone }}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); opacity: 0.85;">{{ s.email }}</div>
              </td>
              <td style="text-align: center;">
                <span style="font-weight: 700; font-size: 0.95rem;" :style="{ color: s.totalStock === 0 ? '#DC2626' : (s.status === 'Low Stock' ? '#D97706' : 'var(--text-main)') }">
                  {{ s.totalStock }}
                </span>
                <div style="font-size: 0.7rem; color: var(--text-muted);">units</div>
              </td>
              <td style="text-align: center;">
                <span style="font-weight: 700; font-size: 0.95rem; color: #D97706;">
                  {{ s.totalSoldUnits }}
                </span>
                <div style="font-size: 0.7rem; color: var(--text-muted);">sold</div>
              </td>
              <!-- Total Purchase Column -->
              <td>
                <div class="font-bold" style="color: #2563EB; font-size: 0.95rem;">
                  ₱{{ Number(s.totalPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
                <div v-if="s.lastPurchaseDate" style="font-size: 0.7rem; color: var(--text-muted);">
                  <Calendar style="width: 11px; height: 11px; display: inline-block; vertical-align: middle;" /> {{ s.lastPurchaseDate }}
                </div>
              </td>
              <!-- Sold Deductions Column -->
              <td>
                <div class="font-bold" style="color: #D97706; font-size: 0.95rem;">
                  -₱{{ Number(s.soldCost).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">via POS receipts</div>
              </td>
              <!-- Remaining Purchase Column -->
              <td>
                <div class="font-bold" style="color: #059669; font-size: 1.05rem; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; display: inline-block;">
                  ₱{{ Number(s.remainingPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
                <div style="font-size: 0.7rem; color: #059669; font-weight: 500; margin-top: 2px;">in-stock capital</div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusBadgeClass(s)">
                  {{ s.status }}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <button class="btn btn-mint btn-sm" title="Add Product Stock to this Category" @click="openQuickRestockModal(s)">
                    <PlusCircle style="width: 14px; height: 14px;" /> Restock
                  </button>
                  <button class="icon-btn" title="View Category Products & Cost Breakdown" @click="openCategoryProductsModal(s)">
                    <Package style="width: 16px; height: 16px; color: var(--primary);" />
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
            <tr v-if="!filteredSuppliers.length">
              <td colspan="9" class="text-center" style="padding: 3.5rem 0; color: var(--text-muted);">
                <Package style="width: 42px; height: 42px; opacity: 0.3; margin-bottom: 0.5rem;" />
                <div>No category or supplier matching the selected filters.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- MODAL: ADD STOCK TO CATEGORY / PRODUCT (RESTOCK ACTION)               -->
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
              Stock replenishment will automatically update the supplier's Total Purchase and Remaining Purchase.
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showRestockModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <form @submit.prevent="saveRestock" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Category Selector -->
          <div class="form-group">
            <label>Product Category <span style="color: var(--red-600);">*</span></label>
            <select v-model="restockForm.category" class="form-select" @change="onRestockCategoryChange" required>
              <option v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Product Mode: Select Existing Product OR Add New Product -->
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

            <!-- Existing Product Select -->
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

            <!-- New Product Fields if creating new -->
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

          <!-- Quantity to Add & Unit Cost -->
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

          <!-- PO Reference & Batch Notes -->
          <div class="form-row">
            <div class="form-group">
              <label>PO Reference # (Optional)</label>
              <input type="text" v-model="restockForm.poNumber" class="form-input" placeholder="PO-2026-XXXX" />
            </div>
            <div class="form-group">
              <label>Batch / Invoice Note</label>
              <input type="text" v-model="restockForm.notes" class="form-input" placeholder="e.g. Batch #42 Delivery" />
            </div>
          </div>

          <!-- Live Cost Calculation Card -->
          <div style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Added Supplier Purchase Cost:</div>
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
              <span>{{ activeCategorySupplier.category }} Products & Cost Breakdown</span>
              <span class="user-pill" style="font-size: 0.75rem; padding: 2px 8px;">{{ activeCategorySupplier.code }}</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              View all products assigned under this category, individual unit costs, units sold, and current remaining purchase balances.
            </p>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showCategoryProductsModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Category Summary Pill Bar -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; background: var(--input-bg); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Total Category Purchase</span>
              <strong style="font-size: 0.95rem; color: #2563EB;">₱{{ Number(activeCategorySupplier.totalPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Sold Deductions (COGS)</span>
              <strong style="font-size: 0.95rem; color: #D97706;">-₱{{ Number(activeCategorySupplier.soldCost).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Remaining Purchase</span>
              <strong style="font-size: 0.95rem; color: #059669;">₱{{ Number(activeCategorySupplier.remainingPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Current In-Stock Units</span>
              <strong style="font-size: 0.95rem; color: var(--text-main);">{{ activeCategorySupplier.totalStock }} units</strong>
            </div>
          </div>

          <!-- Filter / Search Inside Category Products -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
            <div class="search-container" style="max-width: 320px;">
              <Search class="search-icon" />
              <input type="text" v-model="categoryProductSearch" placeholder="Search product SKU or name..." />
            </div>
            <button class="btn btn-mint btn-sm" @click="openQuickRestockModal(activeCategorySupplier)">
              <PlusCircle style="width: 14px; height: 14px;" /> Add Stock to {{ activeCategorySupplier.category }}
            </button>
          </div>

          <!-- Products Table -->
          <div class="table-responsive" style="max-height: 360px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table class="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th style="text-align: center;">In Stock</th>
                  <th>Unit Cost (Capital)</th>
                  <th>Selling Price</th>
                  <th style="text-align: center;">Sold (POS)</th>
                  <th style="color: #059669;">Remaining Cost (₱)</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredActiveCategoryProducts" :key="p.sku || p.id">
                  <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">{{ p.sku }}</span></td>
                  <td><strong style="color: var(--text-main);">{{ p.name }}</strong></td>
                  <td style="text-align: center;">
                    <span :style="{ fontWeight: '700', color: p.quantity <= (p.min_stock || 10) ? '#DC2626' : 'var(--text-main)' }">
                      {{ p.quantity }}
                    </span>
                  </td>
                  <td>₱{{ Number(p.cost).toFixed(2) }}</td>
                  <td>₱{{ Number(p.price).toFixed(2) }}</td>
                  <td style="text-align: center; color: #D97706; font-weight: 600;">
                    {{ getProductUnitsSold(p.name) }}
                  </td>
                  <td class="font-bold" style="color: #059669;">
                    ₱{{ (Number(p.quantity) * Number(p.cost)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-outline btn-sm" title="Restock this product" @click="quickRestockSingleProduct(p)">
                      + Restock
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredActiveCategoryProducts.length">
                  <td colspan="8" class="text-center" style="padding: 2.5rem 0; color: var(--text-muted);">
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
    <!-- MODAL: REGISTER NEW SUPPLIER / BRAND                                  -->
    <!-- ==================================================================== -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <Users style="width: 20px; height: 20px; color: var(--primary);" />
            <span>Register New Supplier</span>
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
              <label>Category Line</label>
              <input type="text" v-model="supForm.category" class="form-input" required placeholder="e.g. Rebisco" />
            </div>
          </div>
          <div class="form-group">
            <label>Supplier / Company Name <span style="color: var(--red-600);">*</span></label>
            <input type="text" v-model="supForm.name" class="form-input" required placeholder="e.g. Rebisco Distribution Inc." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contact Person</label>
              <input type="text" v-model="supForm.contact" class="form-input" placeholder="Representative Name" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="text" v-model="supForm.phone" class="form-input" placeholder="+63 9XX XXX XXXX" />
            </div>
          </div>
          <div class="form-group">
            <label>Email Address <span style="color: var(--red-600);">*</span></label>
            <input type="email" v-model="supForm.email" class="form-input" required />
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
                {{ s.category }} ({{ s.name }})
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
            <input type="text" v-model="purForm.items" class="form-input" placeholder="e.g. 50x Rebisco Fudgee Barr, 20x Crackers" required />
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
    <!-- MODAL: SUPPLIER PURCHASE HISTORY & DATE LEDGER                       -->
    <!-- ==================================================================== -->
    <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
      <div class="modal-card" style="max-width: 860px; width: 95%;">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <History style="width: 22px; height: 22px; color: var(--primary);" />
            <span>Purchase History & Date Ledger — {{ activeSupplier?.category || activeSupplier?.name }}</span>
          </h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showHistoryModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div>
              <strong>Category:</strong> {{ activeSupplier?.category }} | 
              <strong>Code:</strong> {{ activeSupplier?.code }} |
              <strong>Contact:</strong> {{ activeSupplier?.contact }}
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
                    No purchase history logged for this category/supplier yet.
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
const selectedCategoryFilter = ref('')
const filterDate = ref('')
const statusFilter = ref('')

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

function clearFilters() {
  search.value = ''
  selectedCategoryFilter.value = ''
  filterDate.value = ''
  statusFilter.value = ''
}

const filteredSuppliers = computed(() => {
  return store.categorySuppliers.filter(s => {
    const q = search.value.toLowerCase().trim()
    const matchesSearch = !q || 
      s.name.toLowerCase().includes(q) || 
      s.code.toLowerCase().includes(q) || 
      s.contact.toLowerCase().includes(q) || 
      s.category.toLowerCase().includes(q) ||
      s.products.some(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))

    const matchesCategory = !selectedCategoryFilter.value || s.category.toLowerCase() === selectedCategoryFilter.value.toLowerCase()
    
    let matchesStatus = true
    if (statusFilter.value) {
      if (statusFilter.value === 'Active') {
        matchesStatus = s.status === 'Active' || s.status === 'In Stock'
      } else {
        matchesStatus = s.status === statusFilter.value
      }
    }
    
    let matchesDate = true
    if (filterDate.value) {
      const supPurchases = store.purchases.filter(p => 
        p.supplierCode === s.code || 
        p.supplierCode === s.id || 
        p.supplierCode === s.category
      )
      matchesDate = supPurchases.some(p => p.date === filterDate.value) || s.lastPurchaseDate === filterDate.value
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate
  })
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

function getStatusBadgeClass(s) {
  if (s.totalStock === 0 || s.status === 'Out of Stock') return 'status-cancelled'
  if (s.status === 'Low Stock') return 'status-pending'
  return 'status-completed'
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

function quickRestockSingleProduct(prod) {
  restockForm.value.category = prod.category || 'General'
  restockForm.value.isNewProduct = false
  restockForm.value.selectedProductSku = prod.sku
  restockForm.value.quantityToAdd = 25
  restockForm.value.unitCost = Number(prod.cost) || 25
  restockForm.value.poNumber = 'PO-' + Date.now().toString().slice(-6)
  restockForm.value.notes = 'Direct Item Restock'
  showRestockModal.value = true
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
    category: store.categories[0]?.name || 'Rebisco',
    address: '',
    status: 'Active'
  }
  showRegisterModal.value = true
}

function saveSupplier() {
  if (!supForm.value.name || !supForm.value.email) return
  store.addSupplier({ ...supForm.value, totalPurchase: 0, totalOrders: 0 })
  showRegisterModal.value = false
  alert(`Supplier "${supForm.value.name}" registered under category "${supForm.value.category}"!`)
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
  let csv = 'Category,Supplier Code,Supplier Name,Contact,Phone,Products Count,In-Stock Units,Sold Units,Total Purchase,Sold Deductions,Remaining Purchase,Last Purchase Date,Status\n'
  store.categorySuppliers.forEach(s => {
    csv += `"${s.category}","${s.code}","${s.name}","${s.contact}","${s.phone}",${s.productCount},${s.totalStock},${s.totalSoldUnits},${s.totalPurchase},${s.soldCost},${s.remainingPurchase},"${s.lastPurchaseDate || ''}","${s.status}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Suppliers_Category_Purchase_Ledger.csv'
  a.click()
}
</script>
