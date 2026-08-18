<template>
  <div class="content">
    
    <!-- Page Header with Right-Side Calendar Month Navigator -->
    <div class="page-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
      <div>
        <h1 class="page-title" style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">
          Dashboard Overview
        </h1>
        <p class="page-description" style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4px;">
          <strong>KIEL BIEL CONSUMER GOODS TRADING</strong> • Real-time sales, profit ledger, and inventory metrics
        </p>
      </div>

      <!-- RIGHT SIDE: Calendar Month Picker & Stepper (Outside of card, placed on the right side) -->
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        
        <!-- Calendar Control Pill Widget -->
        <div class="calendar-nav-pill">
          <!-- Previous Month Arrow Button -->
          <button 
            type="button"
            class="cal-arrow-btn" 
            title="Previous Month" 
            @click="prevMonth"
          >
            <ChevronLeft style="width: 17px; height: 17px;" />
          </button>
          
          <!-- Clickable Month & Year with Native Calendar Picker Trigger -->
          <label class="cal-month-trigger" title="Click to select month from calendar">
            <Calendar style="width: 17px; height: 17px; color: var(--primary);" />
            <span>{{ selectedMonthName }}</span>
            <input 
              type="month" 
              class="cal-native-input"
              :value="monthInputValue" 
              @change="onNativeMonthChange" 
            />
          </label>

          <!-- Next Month Arrow Button -->
          <button 
            type="button"
            class="cal-arrow-btn" 
            title="Next Month" 
            @click="nextMonth"
          >
            <ChevronRight style="width: 17px; height: 17px;" />
          </button>
        </div>

        <!-- Jump to Active / Current Month Button -->
        <button 
          v-if="!isCurrentMonthSelected" 
          type="button"
          class="btn btn-mint btn-sm" 
          style="font-size: 0.78rem; font-weight: 700; border-radius: 999px; padding: 6px 14px; height: 38px;"
          @click="resetToCurrentMonth"
        >
          Jump to This Month
        </button>
        <span v-else class="status-badge status-completed" style="font-size: 0.78rem; padding: 6px 14px; font-weight: 700; border-radius: 999px;">
          Active Month
        </span>

      </div>
    </div>

    <!-- 4 Key Performance Indicator (KPI) Cards for Selected Month -->
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
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">
            ₱{{ monthlyGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div v-if="revenueGrowthPercent !== null" style="font-size: 0.72rem; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;" :style="{ color: revenueGrowthPercent >= 0 ? '#10B981' : '#EF4444' }">
            <TrendingUp v-if="revenueGrowthPercent >= 0" style="width: 12px; height: 12px;" />
            <TrendingDown v-else style="width: 12px; height: 12px;" />
            {{ revenueGrowthPercent >= 0 ? '+' : '' }}{{ revenueGrowthPercent.toFixed(1) }}% vs prev month
          </div>
          <div v-else style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
            Sales in {{ selectedMonthShort }}
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
          <div style="font-size: 1.35rem; font-weight: 800; color: #EF4444; line-height: 1.2;">
            ₱{{ monthlyCogs.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
            Capital for {{ selectedMonthShort }}
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
          <div style="font-size: 1.35rem; font-weight: 800; color: #10B981; line-height: 1.2;">
            ₱{{ monthlyNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: #10B981; font-weight: 600; margin-top: 4px;">
            Margin: {{ monthlyGrossRevenue > 0 ? ((monthlyNetProfit / monthlyGrossRevenue) * 100).toFixed(1) : '0.0' }}%
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
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">
            {{ monthlyTotalOrders }} Orders
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500; margin-top: 4px;">
            Receipts in {{ selectedMonthShort }}
          </div>
        </div>
      </div>

    </div>

    <!-- Middle Grid: Top Products + Orders Distribution Chart -->
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
      
      <!-- Left Card: Top Selling Items in Selected Month -->
      <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;">
        <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Top Items ({{ selectedMonthShort }})</h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Best performing products for {{ selectedMonthName }}</p>
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
            <p>No sales recorded in {{ selectedMonthName }}. POS checkouts in this period will populate top selling products here.</p>
          </div>
        </div>
      </div>

      <!-- Right Card: Orders Distribution Chart for Selected Month -->
      <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;">
        <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Monthly Order Distribution</h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Weekly order distribution for {{ selectedMonthShort }}</p>
          </div>
          <div class="status-badge status-completed" style="font-size: 0.75rem; padding: 4px 10px;">
            {{ selectedMonthShort }}
          </div>
        </div>

        <div class="card-body" style="padding: 1.5rem; display: flex; align-items: center; justify-content: center; min-height: 280px;">
          <canvas ref="acceptedOrdersCanvas" style="max-height: 260px; width: 100%;"></canvas>
        </div>
      </div>

    </div>

    <!-- Bottom Section: Transactions in Selected Month -->
    <div class="card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div class="card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2 class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Transactions ({{ selectedMonthShort }})</h2>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Point-of-sale customer receipts issued in {{ selectedMonthName }}</p>
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
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Date</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Status</th>
              <th style="padding: 0.875rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in displayedReceipts" :key="r.receipt_no" style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem 1.25rem;">
                <strong style="color: var(--primary); font-weight: 700;">{{ r.receipt_no }}</strong>
              </td>
              <td style="padding: 1rem 1.25rem; font-weight: 600; color: var(--text-main);">
                {{ r.customer_name || 'Walk-in Customer' }}
              </td>
              <td style="padding: 1rem 1.25rem; color: var(--text-muted);">
                <span class="status-badge" style="background: var(--input-bg); border: 1px solid var(--border); color: var(--text-main);">
                  {{ r.payment_method || 'Cash' }}
                </span>
              </td>
              <td style="padding: 1rem 1.25rem; font-weight: 800; color: var(--text-main);">
                ₱{{ Number(r.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td style="padding: 1rem 1.25rem; font-size: 0.85rem; color: var(--text-muted);">
                {{ r.created_at }}
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
            <tr v-if="!displayedReceipts.length">
              <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                No transactions recorded for {{ selectedMonthName }}.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Coffee, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import Chart from 'chart.js/auto'

const acceptedOrdersCanvas = ref(null)
let chartInstance = null

// Active Selected Month & Year
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth()) // 0 = Jan, 7 = Aug

function getReceiptDate(receipt) {
  if (!receipt || !receipt.created_at) return new Date()
  
  const raw = String(receipt.created_at).trim()
  
  // Try standard parse
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d
  
  // Format: 'YYYY-MM-DD HH:MM:SS'
  const isoStr = raw.replace(' ', 'T')
  const d2 = new Date(isoStr)
  if (!isNaN(d2.getTime())) return d2
  
  // Format: 'M/D/YYYY, H:MM:SS AM/PM'
  const parts = raw.split(',')
  if (parts.length) {
    const dateParts = parts[0].split('/')
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[0], 10) - 1
      const day = parseInt(dateParts[1], 10)
      const year = parseInt(dateParts[2], 10)
      return new Date(year, month, day)
    }
  }

  return new Date()
}

// Navigation Handlers
function prevMonth() {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11
    selectedYear.value -= 1
  } else {
    selectedMonth.value -= 1
  }
}

function nextMonth() {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0
    selectedYear.value += 1
  } else {
    selectedMonth.value += 1
  }
}

function resetToCurrentMonth() {
  const current = new Date()
  selectedYear.value = current.getFullYear()
  selectedMonth.value = current.getMonth()
}

const selectedMonthName = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const selectedMonthShort = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})

const monthInputValue = computed(() => {
  const m = String(selectedMonth.value + 1).padStart(2, '0')
  return `${selectedYear.value}-${m}`
})

function onNativeMonthChange(event) {
  if (!event.target.value) return
  const [y, m] = event.target.value.split('-').map(Number)
  selectedYear.value = y
  selectedMonth.value = m - 1
}

const isCurrentMonthSelected = computed(() => {
  const current = new Date()
  return selectedYear.value === current.getFullYear() && selectedMonth.value === current.getMonth()
})

// Filtered Receipts for Selected Month
const monthlyReceipts = computed(() => {
  return store.receipts.filter(r => {
    const d = getReceiptDate(r)
    return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
  })
})

// Filtered Receipts for Previous Month (for % change comparison)
const prevMonthReceipts = computed(() => {
  let prevM = selectedMonth.value - 1
  let prevY = selectedYear.value
  if (prevM < 0) {
    prevM = 11
    prevY -= 1
  }
  return store.receipts.filter(r => {
    const d = getReceiptDate(r)
    return d.getFullYear() === prevY && d.getMonth() === prevM
  })
})

// 1. Monthly Gross Revenue
const monthlyGrossRevenue = computed(() => {
  return monthlyReceipts.value.reduce((acc, r) => acc + (r.status === 'Completed' ? Number(r.grand_total || 0) : 0), 0)
})

// 2. Monthly COGS
const monthlyCogs = computed(() => {
  return monthlyReceipts.value.reduce((acc, r) => {
    if (r.status !== 'Completed') return acc
    if (!r.items || !r.items.length) {
      // Fallback estimate at 70% if receipt items are not attached in mock array
      return acc + (Number(r.grand_total || 0) * 0.7)
    }
    const receiptCogs = r.items.reduce((itemAcc, item) => {
      const prod = store.products.find(p => p.name.toLowerCase() === String(item.item_desc || '').toLowerCase())
      const unitCost = prod ? Number(prod.cost) : (Number(item.unit_price || 0) * 0.7)
      return itemAcc + (unitCost * Number(item.quantity || 1))
    }, 0)
    return acc + receiptCogs
  }, 0)
})

// 3. Monthly Net Sales Profit
const monthlyNetProfit = computed(() => {
  return Math.max(0, monthlyGrossRevenue.value - monthlyCogs.value)
})

// 4. Monthly Total Orders
const monthlyTotalOrders = computed(() => {
  return monthlyReceipts.value.filter(r => r.status === 'Completed').length
})

// Revenue growth vs previous month
const prevGrossRevenue = computed(() => {
  return prevMonthReceipts.value.reduce((acc, r) => acc + (r.status === 'Completed' ? Number(r.grand_total || 0) : 0), 0)
})

const revenueGrowthPercent = computed(() => {
  if (!prevGrossRevenue.value) return null
  return ((monthlyGrossRevenue.value - prevGrossRevenue.value) / prevGrossRevenue.value) * 100
})

// Top Selling Products in Selected Month
const topSellingProducts = computed(() => {
  const itemMap = {}
  const sourceReceipts = monthlyReceipts.value.length ? monthlyReceipts.value : store.receipts

  sourceReceipts.forEach(r => {
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

const displayedReceipts = computed(() => {
  if (monthlyReceipts.value.length) return monthlyReceipts.value.slice(0, 8)
  return []
})

// Chart Rendering / Updating
function renderOrUpdateChart() {
  if (!acceptedOrdersCanvas.value) return

  // 4 weekly buckets for selected month: Days 1-7, 8-14, 15-21, 22+
  const weekData = [0, 0, 0, 0]
  monthlyReceipts.value.forEach(r => {
    if (r.status === 'Completed') {
      const d = getReceiptDate(r)
      const day = d.getDate()
      if (day <= 7) weekData[0] += 1
      else if (day <= 14) weekData[1] += 1
      else if (day <= 21) weekData[2] += 1
      else weekData[3] += 1
    }
  })

  const labels = ['Week 1 (1-7)', 'Week 2 (8-14)', 'Week 3 (15-21)', 'Week 4 (22+)']

  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = weekData
    chartInstance.data.datasets[0].label = `Orders (${selectedMonthShort.value})`
    chartInstance.update()
    return
  }

  chartInstance = new Chart(acceptedOrdersCanvas.value, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Orders (${selectedMonthShort.value})`,
        data: weekData,
        backgroundColor: '#10B981',
        hoverBackgroundColor: '#059669',
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.raw} Orders Completed`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6B7280', font: { family: 'Poppins', size: 11, weight: '600' } }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(229, 231, 235, 0.5)',
            borderDash: [4, 4]
          },
          ticks: { 
            stepSize: 1,
            precision: 0,
            color: '#6B7280', 
            font: { family: 'Poppins', size: 11 } 
          }
        }
      }
    }
  })
}

onMounted(() => {
  renderOrUpdateChart()
})

watch([selectedYear, selectedMonth, monthlyReceipts], () => {
  renderOrUpdateChart()
})
</script>

<style scoped>
.calendar-nav-pill {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 999px;
  padding: 3px 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.cal-arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cal-arrow-btn:hover {
  background: var(--input-bg);
  color: var(--primary);
  transform: scale(1.08);
}

.cal-month-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-main);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
  user-select: none;
}

.cal-month-trigger:hover {
  background: var(--input-bg);
}

.cal-native-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
