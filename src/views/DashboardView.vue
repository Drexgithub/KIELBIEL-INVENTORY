<template>
  <div class="content">
    
    <!-- Page Header -->
    <div class="page-header" style="margin-bottom: 2rem;">
      <div>
        <h1 class="page-title" style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">
          Dashboard Overview
        </h1>
        <p class="page-description" style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4px;">
          <strong>KIEL BIEL CONSUMER GOODS TRADING</strong> • Real-time sales, profit ledger, and inventory metrics
        </p>
      </div>
      <div class="date-picker-pill" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; font-size: 0.85rem; font-weight: 600; color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <Calendar style="width: 16px; height: 16px; color: var(--primary);" />
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- 4 Key Performance Indicator (KPI) Cards -->
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
      
      <!-- 1. Gross Revenue -->
      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 1.25rem;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(37, 99, 235, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <DollarSign style="width: 26px; height: 26px;" />
        </div>
        <div>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            Gross Revenue
          </div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">
            ₱{{ store.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: #10B981; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            <TrendingUp style="width: 12px; height: 12px;" /> +12.5% this month
          </div>
        </div>
      </div>

      <!-- 2. Cost of Goods Sold (COGS) -->
      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 1.25rem;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); color: #EF4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <TrendingDown style="width: 26px; height: 26px;" />
        </div>
        <div>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            Cost of Goods (COGS)
          </div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #EF4444; line-height: 1.2;">
            ₱{{ store.totalCogs.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
            Supplier inventory cost
          </div>
        </div>
      </div>

      <!-- 3. Net Sales Profit -->
      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 1.25rem;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); color: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <TrendingUp style="width: 26px; height: 26px;" />
        </div>
        <div>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            Net Sales Profit
          </div>
          <div style="font-size: 1.4rem; font-weight: 800; color: #10B981; line-height: 1.2;">
            ₱{{ store.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: #10B981; font-weight: 600; margin-top: 4px;">
            Net profit margin
          </div>
        </div>
      </div>

      <!-- 4. Total Paid Orders -->
      <div class="card p-4" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 1.25rem;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); color: #6366F1; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <ShoppingBag style="width: 26px; height: 26px;" />
        </div>
        <div>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            Completed Sales
          </div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">
            {{ store.totalOrders }} Orders
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
            Completed receipts
          </div>
        </div>
      </div>

    </div>

    <!-- Middle Grid: Top Products + Weekly Orders Chart -->
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
      
      <!-- Left Card: Today's Top Selling Items -->
      <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;">
        <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Today's Top Items</h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Best performing products by checkout volume</p>
          </div>
          <router-link to="/products" class="btn btn-outline btn-sm" style="font-size: 0.78rem; border-radius: 8px;">
            View All Products
          </router-link>
        </div>

        <div class="card-body" style="padding: 1rem 1.5rem;">
          <div v-if="topSellingProducts.length" style="display: flex; flex-direction: column; gap: 0.875rem;">
            <div 
              v-for="(item, idx) in topSellingProducts" 
              :key="idx" 
              style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 10px; background: var(--input-bg);"
            >
              <div style="display: flex; align-items: center; gap: 0.875rem;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <Package v-if="idx % 2 === 0" style="width: 20px; height: 20px;" />
                  <Coffee v-else style="width: 20px; height: 20px;" />
                </div>
                <div>
                  <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">{{ item.name }}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    Sold: <strong style="color: var(--primary);">{{ item.orders }} units</strong>
                  </div>
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">
                  ₱{{ Number(item.price).toFixed(2) }}
                </div>
                <span class="status-badge status-completed" style="font-size: 0.68rem; padding: 2px 6px;">Top Seller</span>
              </div>
            </div>
          </div>

          <div v-else style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
            <Package style="width: 36px; height: 36px; color: var(--border); margin-bottom: 0.5rem;" />
            <p>No sales recorded today yet. POS checkouts will automatically populate top selling products here.</p>
          </div>
        </div>
      </div>

      <!-- Right Card: Accepted Orders Weekly Bar Chart -->
      <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;">
        <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Weekly Order Volume</h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Daily checkout order distribution</p>
          </div>
          <div class="status-badge status-completed" style="font-size: 0.75rem; padding: 4px 10px;">
            This Week
          </div>
        </div>

        <div class="card-body" style="padding: 1.5rem; display: flex; align-items: center; justify-content: center; min-height: 280px;">
          <canvas ref="acceptedOrdersCanvas" style="max-height: 260px; width: 100%;"></canvas>
        </div>
      </div>

    </div>

    <!-- Bottom Section: Recent Transactions Audit Table -->
    <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Recent Transactions</h2>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Latest point-of-sale customer receipts</p>
        </div>
        <router-link to="/receipts" class="btn btn-outline btn-sm" style="font-size: 0.78rem; border-radius: 8px;">
          View All Receipts
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--input-bg); border-bottom: 1px solid var(--border);">
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Receipt No</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Customer Name</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Payment Method</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Grand Total</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Status</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in recentReceipts" :key="r.receipt_no" style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem 1.25rem;">
                <strong style="color: var(--primary); font-weight: 700;">{{ r.receipt_no }}</strong>
              </td>
              <td style="padding: 1rem 1.25rem; font-weight: 600; color: var(--text-main);">
                {{ r.customer_name || 'Walk-in Customer' }}
              </td>
              <td style="padding: 1rem 1.25rem; color: var(--text-muted);">
                <span class="status-badge" style="background: var(--input-bg); border: 1px solid var(--border); color: var(--text-main);">
                  {{ r.payment_method }}
                </span>
              </td>
              <td style="padding: 1rem 1.25rem; font-weight: 800; color: var(--text-main);">
                ₱{{ Number(r.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td style="padding: 1rem 1.25rem;">
                <span class="status-badge" :class="r.status === 'Completed' ? 'status-completed' : 'status-cancelled'">
                  {{ r.status || 'Completed' }}
                </span>
              </td>
              <td style="padding: 1rem 1.25rem; text-align: right;">
                <button class="btn btn-outline btn-sm" style="font-size: 0.75rem; gap: 4px; padding: 4px 10px;" @click="store.openReceipt(r)">
                  <Eye style="width: 14px; height: 14px;" /> Receipt
                </button>
              </td>
            </tr>
            <tr v-if="!recentReceipts.length">
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                No recent transactions recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Coffee, 
  Eye 
} from 'lucide-vue-next'
import Chart from 'chart.js/auto'

const acceptedOrdersCanvas = ref(null)
const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const recentReceipts = computed(() => store.receipts.slice(0, 5))

const topSellingProducts = computed(() => {
  const itemMap = {}
  
  store.receipts.forEach(r => {
    if (r.status === 'Completed' && r.items) {
      r.items.forEach(item => {
        const name = item.item_desc
        if (!itemMap[name]) {
          itemMap[name] = {
            name: name,
            orders: 0,
            price: Number(item.unit_price) || 0
          }
        }
        itemMap[name].orders += Number(item.quantity) || 1
      })
    }
  })

  const sorted = Object.values(itemMap).sort((a, b) => b.orders - a.orders)
  return sorted.slice(0, 4)
})

onMounted(() => {
  if (acceptedOrdersCanvas.value) {
    new Chart(acceptedOrdersCanvas.value, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Orders Processed',
          data: [440, 300, 350, 400, 350, 450, 230],
          backgroundColor: '#10B981',
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6B7280', font: { family: 'Poppins', size: 11, weight: '600' } }
          },
          y: {
            grid: {
              color: '#E5E7EB',
              borderDash: [4, 4]
            },
            ticks: { color: '#6B7280', font: { family: 'Poppins', size: 11 } }
          }
        }
      }
    })
  }
})
</script>
