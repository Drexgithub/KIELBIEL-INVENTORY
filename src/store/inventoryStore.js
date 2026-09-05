import { reactive } from 'vue'
import { supabase } from '../supabase.js'

export const store = reactive({
  currentUser: {
    name: '',
    email: '',
    role: '',
    isAuthenticated: false
  },
  sidebarCollapsed: false,
  darkMode: localStorage.getItem('theme') === 'dark',
  activeReceiptModal: null,

  get isAdmin() {
    return this.currentUser.isAuthenticated
  },

  login(email, role = 'Admin User', name = '') {
    this.currentUser = {
      name: name || 'Kiel Hedrix',
      email: email,
      role: 'Admin User',
      isAuthenticated: true
    }
    localStorage.setItem('pos_user_session', JSON.stringify(this.currentUser))
  },

  // Reactive State Arrays (Live populated from Supabase)
  products: [],
  receipts: [
    { receipt_no: 'REC-2026-001', invoice_no: 'INV-1021', customer_name: 'Juan Dela Cruz', cashier_name: 'Admin User', payment_method: 'Cash', subtotal: 2500, discount: 0, tax: 0, grand_total: 2500, status: 'Unpaid', created_at: '2026-06-15 14:30:00', items: [] },
    { receipt_no: 'REC-2026-002', invoice_no: 'INV-1022', customer_name: 'Juan Dela Cruz', cashier_name: 'Admin User', payment_method: 'GCash', subtotal: 10000, discount: 0, tax: 0, grand_total: 10000, status: 'Unpaid', created_at: '2026-07-20 11:15:00', items: [] },
    { receipt_no: 'REC-2026-003', invoice_no: 'INV-1023', customer_name: 'Maria Santos', cashier_name: 'Admin User', payment_method: 'Credit Card', subtotal: 15400, discount: 400, tax: 0, grand_total: 15000, status: 'Unpaid', created_at: '2026-07-10 09:45:00', items: [] },
    { receipt_no: 'REC-2026-004', invoice_no: 'INV-1024', customer_name: 'Maria Santos', cashier_name: 'Admin User', payment_method: 'GCash', subtotal: 13400, discount: 0, tax: 0, grand_total: 13400, status: 'Unpaid', created_at: '2026-08-02 16:20:00', items: [] },
    { receipt_no: 'REC-2026-005', invoice_no: 'INV-1025', customer_name: 'ACME Supermarket', cashier_name: 'Admin User', payment_method: 'Bank Transfer', subtotal: 45000, discount: 0, tax: 0, grand_total: 45000, status: 'Unpaid', created_at: '2026-06-28 10:00:00', items: [] },
    { receipt_no: 'REC-2026-006', invoice_no: 'INV-1026', customer_name: 'ACME Supermarket', cashier_name: 'Admin User', payment_method: 'Bank Transfer', subtotal: 50000, discount: 0, tax: 0, grand_total: 50000, status: 'Unpaid', created_at: '2026-08-05 13:10:00', items: [] }
  ],
  categories: [
    { id: 1, name: 'Electronics', description: 'Hardware, cables & devices' },
    { id: 2, name: 'Beverages', description: 'Softdrinks, coffee & juices' },
    { id: 3, name: 'Food', description: 'Canned goods & snacks' },
    { id: 4, name: 'Household', description: 'Detergents & cleaning' },
    { id: 5, name: 'Furniture', description: 'Office desks & chairs' },
    { id: 6, name: 'Rebisco', description: 'Biscuits, crackers, wafers & bakery snacks' }
  ],
  suppliers: [],
  customers: [
    { id: 1, name: 'Walk-in Customer', phone: 'N/A', category: 'Retail', address: 'Store Direct', totalSpent: 0, totalOrders: 0 },
    { id: 2, name: 'Juan Dela Cruz', phone: '+63 917 123 4567', category: 'Regular', address: 'Manila, Philippines', totalSpent: 12500, totalOrders: 5 },
    { id: 3, name: 'Maria Santos', phone: '+63 918 987 6543', category: 'VIP', address: 'Quezon City, Philippines', totalSpent: 28400, totalOrders: 12 },
    { id: 4, name: 'ACME Supermarket', phone: '+63 2 8888 1234', category: 'Wholesale', address: 'Makati City, Philippines', totalSpent: 95000, totalOrders: 20 }
  ],
  purchases: [],
  notifications: [
    { id: 1, title: 'POS System Ready', desc: 'System connected to Supabase backend database.', time: 'Just now', unread: true }
  ],

  // Persistent POS Draft Order State (retains encoded items across page changes)
  posDraft: (() => {
    try {
      const saved = localStorage.getItem('pos_active_draft')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          customerName: parsed.customerName || 'Walk-in Customer',
          discountPercent: Number(parsed.discountPercent) || 0,
          productSearch: parsed.productSearch || ''
        }
      }
    } catch (e) {
      console.warn('Could not load pos_active_draft:', e)
    }
    return {
      cart: [],
      customerName: 'Walk-in Customer',
      discountPercent: 0,
      productSearch: ''
    }
  })(),

  savePosDraft(draft) {
    this.posDraft = {
      cart: draft.cart || [],
      customerName: draft.customerName || 'Walk-in Customer',
      discountPercent: draft.discountPercent || 0,
      productSearch: draft.productSearch || ''
    }
    try {
      localStorage.setItem('pos_active_draft', JSON.stringify(this.posDraft))
    } catch (e) {}
  },

  clearPosDraft() {
    this.posDraft = {
      cart: [],
      customerName: 'Walk-in Customer',
      discountPercent: 0,
      productSearch: ''
    }
    try {
      localStorage.removeItem('pos_active_draft')
    } catch (e) {}
  },

  get totalSales() {
    return this.receipts.reduce((acc, r) => acc + (r.status === 'Completed' || r.status === 'Paid' ? Number(r.grand_total) : 0), 0)
  },
  get totalCogs() {
    return this.receipts.reduce((acc, r) => {
      if ((r.status !== 'Completed' && r.status !== 'Paid') || !r.items) return acc
      const receiptCogs = r.items.reduce((itemAcc, item) => {
        const prod = this.products.find(p => p.name.toLowerCase() === item.item_desc.toLowerCase())
        const unitCost = prod ? Number(prod.cost) : (Number(item.unit_price) * 0.7)
        return itemAcc + (unitCost * Number(item.quantity))
      }, 0)
      return acc + receiptCogs
    }, 0)
  },
  get netProfit() {
    return Math.max(0, this.totalSales - this.totalCogs)
  },
  get totalCapitalValuation() {
    return this.products.reduce((acc, p) => acc + (Number(p.cost) * Number(p.quantity)), 0)
  },
  get totalOrders() {
    return this.receipts.length
  },
  get lowStockCount() {
    return this.products.filter(p => Number(p.quantity) <= Number(p.min_stock)).length
  },

  // Category & Supplier Dynamic Financial Engine
  get categorySuppliers() {
    const categoryMap = new Map()

    // 1. Collect all known categories
    this.categories.forEach(c => {
      if (c && c.name && c.name.trim()) {
        const name = c.name.trim()
        categoryMap.set(name.toLowerCase(), { name: name, description: c.description || '' })
      }
    })

    this.products.forEach(p => {
      if (p && p.category && p.category.trim()) {
        const name = p.category.trim()
        const key = name.toLowerCase()
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: name, description: `${name} product inventory` })
        }
      }
    })

    this.suppliers.forEach(s => {
      if (s && s.category && s.category.trim()) {
        const name = s.category.trim()
        const key = name.toLowerCase()
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { name: name, description: `${name} supplier line` })
        }
      }
    })

    // 2. Compute metrics for each category
    const list = []
    for (const [key, catObj] of categoryMap.entries()) {
      const catName = catObj.name
      const supMatch = this.suppliers.find(s => 
        (s.category && s.category.toLowerCase().trim() === key) || 
        (s.name && s.name.toLowerCase().trim() === key) ||
        (s.code && s.code.toLowerCase().trim() === `sup-${key.slice(0, 4)}`)
      )

      // Products in this category
      const prods = this.products.filter(p => (p.category || '').toLowerCase().trim() === key)

      // Current in-stock quantity & remaining capital
      const totalStock = prods.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
      const remainingPurchase = prods.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.cost) || 0)), 0)

      // Total sold units & COGS deduction from POS receipts
      let totalSoldUnits = 0
      let soldCost = 0

      this.receipts.forEach(r => {
        if (!r.items || !Array.isArray(r.items)) return
        r.items.forEach(item => {
          const prod = prods.find(p => p.name.toLowerCase().trim() === (item.item_desc || '').toLowerCase().trim())
          if (prod) {
            const qty = Number(item.quantity) || 0
            const unitCost = Number(prod.cost) || 0
            totalSoldUnits += qty
            soldCost += qty * unitCost
          }
        })
      })

      // Purchase orders logged for this supplier/category
      const supCode = supMatch ? supMatch.code : `SUP-${catName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'CAT'}`
      const catPurchases = this.purchases.filter(p => 
        (p.supplierCode && p.supplierCode.toLowerCase() === (supMatch?.code || '').toLowerCase()) ||
        (p.supplierCode && p.supplierCode.toLowerCase() === supCode.toLowerCase()) ||
        (p.supplierCode && p.supplierCode.toLowerCase() === key)
      )
      const poTotal = catPurchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

      // Total cumulative cost = (remaining unsold stock cost + sold cost) + any standalone PO amounts
      const stockTotal = remainingPurchase + soldCost
      const totalPurchase = Math.max(stockTotal, (Number(supMatch?.totalPurchase) || 0), stockTotal + poTotal)

      // Latest purchase / restock date
      let lastDate = ''
      if (catPurchases.length > 0) {
        lastDate = catPurchases[0].date
      } else if (supMatch?.lastPurchaseDate) {
        lastDate = supMatch.lastPurchaseDate
      }

      let status = supMatch?.status || 'Active'
      if (status === 'Active') {
        if (prods.length === 0) status = 'No Products'
        else if (totalStock === 0) status = 'Out of Stock'
        else if (prods.some(p => Number(p.quantity) <= (Number(p.min_stock) || 10))) status = 'Low Stock'
      }

      list.push({
        id: supMatch?.id || supCode,
        code: supCode,
        name: supMatch?.name || catName,
        category: catName,
        contact: supMatch?.contact || 'Account Representative',
        email: supMatch?.email || `orders@${catName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: supMatch?.phone || '+63 917 888 1234',
        address: supMatch?.address || 'Metro Manila, Philippines',
        status: status,
        products: prods,
        productCount: prods.length,
        totalStock: totalStock,
        totalSoldUnits: totalSoldUnits,
        soldCost: soldCost,
        remainingPurchase: remainingPurchase,
        totalPurchase: totalPurchase,
        lastPurchaseDate: lastDate,
        rawSupplier: supMatch || null
      })
    }

    return list
  },

  get totalCategoryPurchases() {
    return this.categorySuppliers.reduce((acc, c) => acc + Number(c.totalPurchase || 0), 0)
  },
  get totalCategoryRemaining() {
    return this.categorySuppliers.reduce((acc, c) => acc + Number(c.remainingPurchase || 0), 0)
  },
  get totalCategorySoldDeductions() {
    return this.categorySuppliers.reduce((acc, c) => acc + Number(c.soldCost || 0), 0)
  },

  get allCategoryNames() {
    const catMap = new Map()
    if (Array.isArray(this.categories)) {
      this.categories.forEach(c => {
        if (c && c.name && String(c.name).trim()) {
          const name = String(c.name).trim()
          catMap.set(name.toLowerCase(), name)
        }
      })
    }
    if (Array.isArray(this.products)) {
      this.products.forEach(p => {
        if (p && p.category && String(p.category).trim()) {
          const name = String(p.category).trim()
          catMap.set(name.toLowerCase(), name)
        }
      })
    }
    if (Array.isArray(this.suppliers)) {
      this.suppliers.forEach(s => {
        if (s && s.category && String(s.category).trim()) {
          const name = String(s.category).trim()
          catMap.set(name.toLowerCase(), name)
        }
      })
    }
    const list = Array.from(catMap.values())
    list.sort((a, b) => a.localeCompare(b))
    return list.length > 0 ? list : ['General']
  },

  toggleDarkMode() {
    this.darkMode = !this.darkMode
    const theme = this.darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },

  logout() {
    this.currentUser = {
      name: '',
      email: '',
      role: '',
      isAuthenticated: false
    }
    localStorage.removeItem('pos_user_session')
  },
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed
  },
  async openReceipt(receipt) {
    if (!receipt) return
    this.activeReceiptModal = receipt

    // If receipt has no loaded items yet, fetch directly from Supabase as a fallback
    if ((!receipt.items || receipt.items.length === 0) && supabase) {
      try {
        const { data: items, error } = await supabase
          .from('receipt_items')
          .select('*')
          .eq('receipt_no', receipt.receipt_no)
        if (!error && items && items.length > 0) {
          receipt.items = items.map(i => ({
            item_desc: i.item_desc,
            quantity: Number(i.quantity),
            unit_price: Number(i.unit_price),
            line_total: Number(i.line_total)
          }))
          this.activeReceiptModal = { ...receipt }
        }
      } catch (err) {
        console.error('Error fetching line items for receipt:', err)
      }
    }
  },
  closeReceipt() {
    this.activeReceiptModal = null
  },

  // ====================================================================
  // LIVE SUPABASE FETCH ACTIONS
  // ====================================================================
  async loadAllFromSupabase() {
    if (!supabase) return

    try {
      // 1. Fetch Products
      const { data: prods, error: prodErr } = await supabase.from('products').select('*').order('id', { ascending: false })
      if (!prodErr && prods) {
        this.products = prods.map(p => {
          const qty = Number(p.quantity || 0)
          const minStock = Number(p.min_stock || 10)
          const computedStatus = qty === 0 ? 'Out of Stock' : (qty <= minStock ? 'Low Stock' : 'In Stock')
          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            cost: Number(p.cost || p.cost_price || 0),
            price: Number(p.price || p.selling_price || 0),
            quantity: qty,
            min_stock: minStock,
            status: computedStatus,
            created_at: p.created_at ? (typeof p.created_at === 'string' ? p.created_at.slice(0, 10) : new Date(p.created_at).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10)
          }
        })
      }

      // 2. Fetch Receipts & Receipt Items (relational join so receipt items are never capped by the 1000-row limit)
      const { data: recs, error: recErr } = await supabase
        .from('receipts')
        .select('*, receipt_items(*)')
        .order('created_at', { ascending: false })

      if (!recErr && recs) {
        this.receipts = recs.map(r => {
          const receiptItems = r.receipt_items || []
          return {
            receipt_no: r.receipt_no,
            invoice_no: r.invoice_no,
            customer_name: r.customer_name,
            cashier_name: r.cashier_name,
            payment_method: r.payment_method,
            subtotal: Number(r.subtotal),
            discount: Number(r.discount || 0),
            tax: Number(r.tax || 0),
            grand_total: Number(r.grand_total),
            status: r.status === 'Paid' ? 'Paid' : (r.status === 'Refunded' ? 'Refunded' : 'Unpaid'),
            created_at: r.created_at ? new Date(r.created_at).toLocaleString() : new Date().toLocaleString(),
            items: receiptItems.map(i => ({
              item_desc: i.item_desc,
              quantity: Number(i.quantity),
              unit_price: Number(i.unit_price),
              line_total: Number(i.line_total)
            }))
          }
        })
      }

      // 3. Fetch Categories
      const { data: cats, error: catErr } = await supabase.from('categories').select('*').order('name', { ascending: true })
      if (!catErr && cats) {
        this.categories = cats.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || ''
        }))
      }

      // 4. Fetch Suppliers
      const { data: sups, error: supErr } = await supabase.from('suppliers').select('*').order('id', { ascending: false })
      if (!supErr && sups) {
        this.suppliers = sups.map(s => ({
          id: s.supplier_code,
          code: s.supplier_code,
          name: s.name,
          contact: s.contact_person || '',
          email: s.email || '',
          phone: s.phone || '',
          category: s.category || 'General',
          totalPurchase: Number(s.total_purchase || 0),
          totalOrders: Number(s.total_orders || 0),
          status: s.status || 'Active',
          address: s.address || ''
        }))
      }

      // 5. Fetch Supplier Purchases
      const { data: purs, error: purErr } = await supabase.from('supplier_purchases').select('*').order('purchase_date', { ascending: false })
      if (!purErr && purs) {
        this.purchases = purs.map(p => ({
          id: 'PUR-' + p.id,
          supplierCode: p.supplier_code,
          poNumber: p.po_number,
          date: p.purchase_date,
          items: p.item_description,
          amount: Number(p.amount),
          method: p.payment_method || 'Bank Transfer',
          status: p.status || 'Paid'
        }))
      }

      // 6. Fetch Customers
      const { data: custs, error: custErr } = await supabase.from('customers').select('*').order('id', { ascending: false })
      if (!custErr && custs && custs.length > 0) {
        this.customers = custs.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          category: c.category || 'Retail',
          address: c.address || '',
          totalSpent: Number(c.total_spent || 0),
          totalOrders: Number(c.total_orders || 0)
        }))
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err)
    }
  },

  getNextSku() {
    let maxNum = 1000
    if (this.products && this.products.length > 0) {
      for (const p of this.products) {
        if (!p.sku) continue
        const match = String(p.sku).match(/SKU-(\d+)/i)
        if (match) {
          const num = parseInt(match[1], 10)
          if (!isNaN(num) && num < 1000000 && num > maxNum) {
            maxNum = num
          }
        }
      }
    }
    return `SKU-${maxNum + 1}`
  },

  // ====================================================================
  // LIVE SUPABASE MUTATION ACTIONS
  // ====================================================================
  async addStockToProduct(productIdOrSku, quantityToAdd, unitCost = null, poNumber = '', notes = '') {
    const qty = Number(quantityToAdd) || 0
    if (qty <= 0) return

    const prod = this.products.find(p => p.id === productIdOrSku || p.sku === productIdOrSku)
    if (!prod) return

    const oldQty = Number(prod.quantity) || 0
    const newQty = oldQty + qty
    const costToUse = (unitCost !== null && unitCost !== undefined && !isNaN(unitCost) && unitCost >= 0) 
      ? Number(unitCost) 
      : (Number(prod.cost) || 0)

    prod.quantity = newQty
    prod.cost = costToUse
    const minStock = Number(prod.min_stock) || 10
    prod.status = newQty === 0 ? 'Out of Stock' : (newQty <= minStock ? 'Low Stock' : 'In Stock')

    const categoryName = prod.category || 'General'
    const supCode = `SUP-${categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'GEN'}`
    const finalPoNumber = (poNumber && String(poNumber).trim()) ? String(poNumber).trim() : ('PO-' + Date.now().toString().slice(-6))
    const today = new Date().toISOString().slice(0, 10)
    const addedAmount = qty * costToUse

    // 1. Add dated purchase entry to supplier purchases ledger
    const purchaseEntry = {
      id: 'PUR-' + Math.floor(1000 + Math.random() * 9000),
      supplierCode: supCode,
      poNumber: finalPoNumber,
      date: today,
      productSku: prod.sku,
      productName: prod.name,
      items: notes ? `${notes} (+${qty}x ${prod.name})` : `Restock +${qty}x ${prod.name} (${prod.sku})`,
      amount: addedAmount,
      method: 'Stock Replenishment',
      status: 'Completed'
    }
    this.purchases.unshift(purchaseEntry)

    // 2. Ensure supplier exists and update total
    const sup = this.suppliers.find(s => (s.category || '').toLowerCase() === categoryName.toLowerCase() || s.code === supCode)
    if (sup) {
      sup.totalPurchase = (Number(sup.totalPurchase) || 0) + addedAmount
      sup.totalOrders = (Number(sup.totalOrders) || 0) + 1
      sup.lastPurchaseDate = today
    } else {
      this.suppliers.unshift({
        id: supCode,
        code: supCode,
        name: categoryName,
        contact: 'Sales Representative',
        email: `orders@${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: '+63 917 888 1234',
        category: categoryName,
        totalPurchase: addedAmount,
        totalOrders: 1,
        status: 'Active',
        address: 'Metro Manila, Philippines',
        lastPurchaseDate: today
      })
    }

    // 3. Supabase persistence
    if (supabase) {
      try {
        if (prod.id) {
          await supabase.from('products').update({
            quantity: newQty,
            cost: costToUse,
            status: prod.status
          }).eq('id', prod.id)
        }
        await supabase.from('supplier_purchases').insert([{
          supplier_code: supCode,
          po_number: purchaseEntry.poNumber,
          purchase_date: purchaseEntry.date,
          item_description: purchaseEntry.items,
          amount: purchaseEntry.amount,
          payment_method: purchaseEntry.method,
          status: purchaseEntry.status
        }])
      } catch (err) {
        console.error('Supabase addStockToProduct error:', err)
      }
    }

    // 4. Notification
    this.notifications.unshift({
      id: Date.now(),
      title: `📦 Stock Added: ${prod.name}`,
      desc: `Added +${qty} units (${categoryName}). Added capital cost: ₱${addedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      time: 'Just now',
      unread: true
    })
  },

  async addProduct(product) {
    const qty = Number(product.quantity) || 0
    const minStock = Number(product.min_stock) || 10
    const status = qty === 0 ? 'Out of Stock' : (qty <= minStock ? 'Low Stock' : 'In Stock')
    const finalSku = (product.sku && String(product.sku).trim()) ? String(product.sku).trim() : this.getNextSku()
    const catName = (product.category && String(product.category).trim()) ? String(product.category).trim() : 'General'
    const today = product.created_at || new Date().toISOString().slice(0, 10)

    // Auto-register category if not existing
    const catExists = this.categories.some(c => c.name.toLowerCase() === catName.toLowerCase())
    if (!catExists) {
      this.categories.push({ id: Date.now(), name: catName, description: `${catName} product line` })
      if (supabase) {
        try {
          await supabase.from('categories').insert([{ name: catName, description: `${catName} product line` }])
        } catch (e) {}
      }
    }

    const newProd = {
      sku: finalSku,
      name: product.name,
      category: catName,
      quantity: qty,
      cost: Number(product.cost) || 0,
      price: Number(product.price) || 0,
      min_stock: minStock,
      status: status,
      created_at: today
    }

    // If initial quantity > 0, also log initial stock purchase for supplier ledger
    if (qty > 0) {
      const supCode = `SUP-${catName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'GEN'}`
      const initialAmount = qty * (Number(product.cost) || 0)
      this.purchases.unshift({
        id: 'PUR-' + Math.floor(1000 + Math.random() * 9000),
        supplierCode: supCode,
        poNumber: 'PO-' + Date.now().toString().slice(-6),
        date: today,
        productSku: finalSku,
        productName: product.name,
        items: `Initial Catalog Stock: ${qty}x ${product.name}`,
        amount: initialAmount,
        method: 'Inventory Setup',
        status: 'Completed'
      })
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').insert([newProd]).select()
        if (!error && data && data.length) {
          this.products.unshift({
            ...data[0],
            status: status
          })
          return
        }
      } catch (err) {
        console.error('Supabase addProduct error:', err)
      }
    }

    // Local reactive fallback
    this.products.unshift({ id: Date.now(), ...newProd })
  },

  async updateProduct(product) {
    const qty = Number(product.quantity) || 0
    const minStock = Number(product.min_stock) || 10
    const status = qty === 0 ? 'Out of Stock' : (qty <= minStock ? 'Low Stock' : 'In Stock')

    const updatedFields = {
      name: product.name,
      category: product.category,
      quantity: qty,
      cost: Number(product.cost),
      price: Number(product.price),
      min_stock: minStock,
      status: status
    }

    if (supabase && product.id) {
      try {
        await supabase.from('products').update(updatedFields).eq('id', product.id)
      } catch (err) {
        console.error('Supabase updateProduct error:', err)
      }
    }

    const idx = this.products.findIndex(p => p.id === product.id || p.sku === product.sku)
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updatedFields }
    }
  },

  async deleteProduct(id) {
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id)
      } catch (err) {
        console.error('Supabase deleteProduct error:', err)
      }
    }
    this.products = this.products.filter(p => p.id !== id && p.sku !== id)
  },

  async addReceipt(newReceipt) {
    if (supabase) {
      try {
        // 1. Insert Receipt
        await supabase.from('receipts').insert([{
          receipt_no: newReceipt.receipt_no,
          invoice_no: newReceipt.invoice_no,
          customer_name: newReceipt.customer_name,
          cashier_name: newReceipt.cashier_name,
          payment_method: newReceipt.payment_method,
          subtotal: newReceipt.subtotal,
          discount: newReceipt.discount,
          tax: newReceipt.tax || 0,
          grand_total: newReceipt.grand_total,
          status: newReceipt.status || 'Unpaid'
        }])

        // 2. Insert Receipt Line Items
        if (newReceipt.items && newReceipt.items.length) {
          const itemRows = newReceipt.items.map(item => ({
            receipt_no: newReceipt.receipt_no,
            item_desc: item.item_desc,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total
          }))
          await supabase.from('receipt_items').insert(itemRows)

          // 3. Deduct product quantities in Supabase
          for (const item of newReceipt.items) {
            const prod = this.products.find(p => p.name.toLowerCase() === item.item_desc.toLowerCase())
            if (prod && prod.id) {
              const newQty = Math.max(0, prod.quantity - item.quantity)
              const minStock = Number(prod.min_stock) || 10
              const newStatus = newQty === 0 ? 'Out of Stock' : (newQty <= minStock ? 'Low Stock' : 'In Stock')
              await supabase.from('products').update({ quantity: newQty, status: newStatus }).eq('id', prod.id)
            }
          }
        }
      } catch (err) {
        console.error('Supabase addReceipt error:', err)
      }
    }

    // Local reactive update
    this.receipts.unshift(newReceipt)
    if (newReceipt.items) {
      newReceipt.items.forEach(item => {
        const prod = this.products.find(p => p.name.toLowerCase() === item.item_desc.toLowerCase())
        if (prod) {
          prod.quantity = Math.max(0, prod.quantity - item.quantity)
          const minStock = Number(prod.min_stock) || 10
          prod.status = prod.quantity === 0 ? 'Out of Stock' : (prod.quantity <= minStock ? 'Low Stock' : 'In Stock')
        }
      })
    }
  },

  async updateReceiptStatus(receiptNo, status) {
    if (supabase) {
      try {
        await supabase.from('receipts').update({ status }).eq('receipt_no', receiptNo)
      } catch (err) {
        console.error('Supabase updateReceiptStatus error:', err)
      }
    }
    const rec = this.receipts.find(r => r.receipt_no === receiptNo)
    if (rec) {
      rec.status = status
    }
  },

  async deleteReceipt(receiptNo) {
    if (supabase) {
      try {
        await supabase.from('receipts').delete().eq('receipt_no', receiptNo)
      } catch (err) {
        console.error('Supabase deleteReceipt error:', err)
      }
    }
    this.receipts = this.receipts.filter(r => r.receipt_no !== receiptNo)
  },

  async addCategory(category) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').insert([{
          name: category.name,
          description: category.description
        }]).select()
        if (error) {
          console.error('❌ Supabase addCategory Error:', error)
        } else if (data && data.length) {
          console.log('✅ Supabase Category Added:', data[0])
          this.categories.push({ id: data[0].id, name: data[0].name, description: data[0].description })
          return
        }
      } catch (err) {
        console.error('Supabase addCategory exception:', err)
      }
    }
    this.categories.push({ id: Date.now(), name: category.name, description: category.description })
  },

  async deleteCategory(id) {
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id)
      } catch (err) {
        console.error('Supabase deleteCategory error:', err)
      }
    }
    this.categories = this.categories.filter(c => c.id !== id && c.name !== id)
  },

  async addSupplier(supplier) {
    if (supabase) {
      try {
        await supabase.from('suppliers').upsert({
          supplier_code: supplier.code,
          name: supplier.name,
          contact_person: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          category: supplier.category,
          address: supplier.address
        }, { onConflict: 'supplier_code' })
      } catch (err) {
        console.error('Supabase addSupplier error:', err)
      }
    }
    this.suppliers.unshift({ id: supplier.code, ...supplier })
  },

  async deleteSupplier(code) {
    if (supabase) {
      try {
        await supabase.from('suppliers').delete().eq('supplier_code', code)
      } catch (err) {
        console.error('Supabase deleteSupplier error:', err)
      }
    }
    this.suppliers = this.suppliers.filter(s => s.code !== code && s.id !== code)
  },

  async addSupplierPurchase(purchase) {
    if (supabase) {
      try {
        await supabase.from('supplier_purchases').insert([{
          supplier_code: purchase.supplierCode,
          po_number: purchase.poNumber,
          purchase_date: purchase.date,
          item_description: purchase.items,
          amount: purchase.amount,
          payment_method: purchase.method,
          status: purchase.status
        }])
      } catch (err) {
        console.error('Supabase addSupplierPurchase error:', err)
      }
    }

    this.purchases.unshift(purchase)
    const sup = this.suppliers.find(s => s.code === purchase.supplierCode || s.id === purchase.supplierCode)
    if (sup) {
      sup.totalPurchase = (Number(sup.totalPurchase) || 0) + Number(purchase.amount)
      sup.totalOrders = (Number(sup.totalOrders) || 0) + 1
      sup.lastPurchaseDate = purchase.date
    }
  },

  async deletePurchase(purId) {
    const rawId = purId.replace('PUR-', '')
    if (supabase) {
      try {
        await supabase.from('supplier_purchases').delete().eq('id', rawId)
      } catch (err) {
        console.error('Supabase deletePurchase error:', err)
      }
    }
    this.purchases = this.purchases.filter(p => p.id !== purId)
  },

  // ====================================================================
  // CUSTOMERS ACTIONS
  // ====================================================================
  async addCustomer(customer) {
    const newCust = {
      name: customer.name,
      phone: customer.phone || '',
      category: customer.category || 'Retail',
      address: customer.address || '',
      total_spent: 0,
      total_orders: 0
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('customers').insert([newCust]).select()
        if (!error && data && data.length) {
          this.customers.unshift({
            id: data[0].id,
            name: data[0].name,
            phone: data[0].phone,
            category: data[0].category,
            address: data[0].address,
            totalSpent: 0,
            totalOrders: 0
          })
          return
        }
      } catch (err) {
        console.error('Supabase addCustomer error:', err)
      }
    }

    this.customers.unshift({
      id: Date.now(),
      name: customer.name,
      phone: customer.phone || '',
      category: customer.category || 'Retail',
      address: customer.address || '',
      totalSpent: 0,
      totalOrders: 0
    })
  },

  async updateCustomer(customer) {
    const updatedFields = {
      name: customer.name,
      phone: customer.phone,
      category: customer.category,
      address: customer.address
    }

    if (supabase && customer.id) {
      try {
        await supabase.from('customers').update(updatedFields).eq('id', customer.id)
      } catch (err) {
        console.error('Supabase updateCustomer error:', err)
      }
    }

    const idx = this.customers.findIndex(c => c.id === customer.id)
    if (idx !== -1) {
      this.customers[idx] = { ...this.customers[idx], ...updatedFields }
    }
  },

  async deleteCustomer(id) {
    if (supabase) {
      try {
        await supabase.from('customers').delete().eq('id', id)
      } catch (err) {
        console.error('Supabase deleteCustomer error:', err)
      }
    }
    this.customers = this.customers.filter(c => c.id !== id)
  }
})

// Auto-load data from Supabase on application load
store.loadAllFromSupabase()
