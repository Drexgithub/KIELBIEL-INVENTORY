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

  // Reactive State Arrays (Live populated from Supabase)
  products: [],
  receipts: [
    { receipt_no: 'REC-2026-001', invoice_no: 'INV-1021', customer_name: 'Juan Dela Cruz', cashier_name: 'Admin User', payment_method: 'Cash', subtotal: 2500, discount: 0, tax: 0, grand_total: 2500, status: 'Completed', created_at: '2026-06-15 14:30:00', items: [] },
    { receipt_no: 'REC-2026-002', invoice_no: 'INV-1022', customer_name: 'Juan Dela Cruz', cashier_name: 'Admin User', payment_method: 'GCash', subtotal: 10000, discount: 0, tax: 0, grand_total: 10000, status: 'Completed', created_at: '2026-07-20 11:15:00', items: [] },
    { receipt_no: 'REC-2026-003', invoice_no: 'INV-1023', customer_name: 'Maria Santos', cashier_name: 'Admin User', payment_method: 'Credit Card', subtotal: 15400, discount: 400, tax: 0, grand_total: 15000, status: 'Completed', created_at: '2026-07-10 09:45:00', items: [] },
    { receipt_no: 'REC-2026-004', invoice_no: 'INV-1024', customer_name: 'Maria Santos', cashier_name: 'Admin User', payment_method: 'GCash', subtotal: 13400, discount: 0, tax: 0, grand_total: 13400, status: 'Completed', created_at: '2026-08-02 16:20:00', items: [] },
    { receipt_no: 'REC-2026-005', invoice_no: 'INV-1025', customer_name: 'ACME Supermarket', cashier_name: 'Admin User', payment_method: 'Bank Transfer', subtotal: 45000, discount: 0, tax: 0, grand_total: 45000, status: 'Completed', created_at: '2026-06-28 10:00:00', items: [] },
    { receipt_no: 'REC-2026-006', invoice_no: 'INV-1026', customer_name: 'ACME Supermarket', cashier_name: 'Admin User', payment_method: 'Bank Transfer', subtotal: 50000, discount: 0, tax: 0, grand_total: 50000, status: 'Completed', created_at: '2026-08-05 13:10:00', items: [] }
  ],
  categories: [
    { id: 1, name: 'Electronics', description: 'Hardware, cables & devices' },
    { id: 2, name: 'Beverages', description: 'Softdrinks, coffee & juices' },
    { id: 3, name: 'Food', description: 'Canned goods & snacks' },
    { id: 4, name: 'Household', description: 'Detergents & cleaning' },
    { id: 5, name: 'Furniture', description: 'Office desks & chairs' }
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

  get totalSales() {
    return this.receipts.reduce((acc, r) => acc + (r.status === 'Completed' ? Number(r.grand_total) : 0), 0)
  },
  get totalCogs() {
    return this.receipts.reduce((acc, r) => {
      if (r.status !== 'Completed' || !r.items) return acc
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

  toggleDarkMode() {
    this.darkMode = !this.darkMode
    const theme = this.darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },

  login(email, role = 'Admin User') {
    this.currentUser = {
      name: email.includes('cashier') ? 'Cashier User' : 'Kiel Hedrix',
      email: email,
      role: role,
      isAuthenticated: true
    }
  },
  logout() {
    this.currentUser.isAuthenticated = false
  },
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed
  },
  openReceipt(receipt) {
    this.activeReceiptModal = receipt
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
            status: computedStatus
          }
        })
      }

      // 2. Fetch Receipts & Receipt Items
      const { data: recs, error: recErr } = await supabase.from('receipts').select('*').order('created_at', { ascending: false })
      const { data: items, error: itemErr } = await supabase.from('receipt_items').select('*')

      if (!recErr && recs) {
        this.receipts = recs.map(r => {
          const receiptItems = (items || []).filter(i => i.receipt_no === r.receipt_no)
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
            status: r.status || 'Completed',
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

  // ====================================================================
  // LIVE SUPABASE MUTATION ACTIONS
  // ====================================================================
  async addProduct(product) {
    const qty = Number(product.quantity) || 0
    const minStock = Number(product.min_stock) || 10
    const status = qty === 0 ? 'Out of Stock' : (qty <= minStock ? 'Low Stock' : 'In Stock')

    const newProd = {
      sku: product.sku || ('SKU-' + Date.now().toString().slice(-6)),
      name: product.name,
      category: product.category || 'General',
      quantity: qty,
      cost: Number(product.cost) || 0,
      price: Number(product.price) || 0,
      min_stock: minStock,
      status: status
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
          status: newReceipt.status || 'Completed'
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
