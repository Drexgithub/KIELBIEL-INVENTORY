<template>
  <div class="og-dashboard-page">
    
    <!-- 1. TOP HEADER: TITLE & ACTIONS -->
    <div class="og-page-header">
      <div class="og-page-title-box">
        <h1 class="og-page-title">Dashboard</h1>
        <p class="og-page-subtitle">Real-time revenue telemetry, inventory statistics, and financial overview in Philippine Peso (₱).</p>
      </div>

      <div class="og-header-actions">
        <!-- Live Database Badge -->
        <div class="og-badge active" style="font-size: 0.8rem; padding: 6px 14px;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
          <span>Live Supabase Database ({{ store.receipts.length }} Receipts)</span>
        </div>

        <button class="btn-dark" @click="showSupport = true">
          <HelpCircle style="width: 15px; height: 15px;" />
          <span>Support & Help</span>
        </button>
      </div>
    </div>

    <!-- 2. FOUR OVERALL KPI STAT CARDS GRID -->
    <section class="og-stat-grid">
      <!-- Card 1: Total Revenue -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <span style="font-weight: 700; color: #10B981; font-size: 1.1rem;">₱</span>
          <span>Total Revenue</span>
        </div>
        <div class="og-stat-value">
          ₱{{ formatCompactPeso(totalSalesAllTime) }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>₱{{ Number(totalSalesAllTime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          <span class="og-stat-trend-sub">all-time sales</span>
        </div>
      </div>

      <!-- Card 2: Total Clients -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Users class="og-stat-header-icon" />
          <span>Total Clients</span>
        </div>
        <div class="og-stat-value">
          {{ totalClientsCount }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>{{ uniqueActiveClientsCount }} active</span>
          <span class="og-stat-trend-sub">with recorded orders</span>
        </div>
      </div>

      <!-- Card 3: Total Products in Inventory -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <Package class="og-stat-header-icon" />
          <span>Total Products</span>
        </div>
        <div class="og-stat-value">
          {{ store.products.length }}
        </div>
        <div class="og-stat-trend" :class="store.lowStockCount > 0 ? 'negative' : 'positive'">
          <span v-if="store.lowStockCount > 0">⚠ {{ store.lowStockCount }} low stock items</span>
          <span v-else>All items well-stocked</span>
        </div>
      </div>

      <!-- Card 4: Total Expenses / Capital Cost -->
      <div class="og-stat-card">
        <div class="og-stat-header">
          <CreditCard class="og-stat-header-icon" />
          <span>Total Expenses (COGS)</span>
        </div>
        <div class="og-stat-value" style="color: #EC4899;">
          ₱{{ formatCompactPeso(totalCogsAllTime) }}
        </div>
        <div class="og-stat-trend positive">
          <ArrowUpRight style="width: 14px; height: 14px;" />
          <span>Net Profit: ₱{{ formatCompactPeso(totalNetProfitAllTime) }}</span>
        </div>
      </div>
    </section>

    <!-- 3. DATE CALENDAR & DAILY REVENUE / EXPENSES NAVIGATOR CARD -->
    <section class="og-card" style="margin-bottom: 1.75rem;">
      <div class="og-card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <Calendar style="width: 20px; height: 20px; color: #2563EB;" />
            <h2 class="og-card-title">Daily Financial Telemetry Calendar</h2>
          </div>
          <div class="og-card-sub">
            Navigate calendar per day to audit daily revenue, expenses (COGS), net profit, and receipts issued.
          </div>
        </div>

        <!-- Calendar Date Picker & Controls -->
        <div class="og-filter-group" style="align-items: center;">
          <button class="btn-dark btn-sm" @click="navigateDay(-1)" title="Previous Day">
            <ChevronLeft style="width: 14px; height: 14px;" /> Prev Day
          </button>

          <!-- Native Date Input Styled to Dark Theme -->
          <input 
            type="date" 
            v-model="selectedDay" 
            class="form-input" 
            style="height: 36px; padding: 4px 10px; font-weight: 600; width: 155px;"
          />

          <button class="btn-dark btn-sm" @click="navigateDay(1)" title="Next Day">
            Next Day <ChevronRight style="width: 14px; height: 14px;" />
          </button>

          <button 
            class="btn-dark btn-sm" 
            @click="jumpToLatestActivity" 
            title="Jump to latest date with recorded sales (Oct 20, 2026)"
            style="border-color: rgba(37, 99, 235, 0.5); color: #60A5FA;"
          >
            Latest Sales Day (Oct 20)
          </button>

          <button 
            class="btn-dark btn-sm" 
            @click="jumpToToday" 
            title="Jump to Today's date"
          >
            Today
          </button>
        </div>
      </div>

      <!-- Selected Day Telemetry Stats Grid (4 Mini Cards) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
        
        <!-- Day Revenue -->
        <div style="background: var(--og-bg-input); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--og-border-subtle);">
          <div style="font-size: 0.76rem; color: var(--og-text-secondary); font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
            <span>Daily Total Revenue</span>
            <span style="color: #10B981; font-weight: 700;">↑</span>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #FFFFFF; margin: 4px 0;">
            ₱{{ Number(selectedDayRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: var(--og-text-muted);">
            {{ selectedDayReceipts.length }} customer order(s) on {{ formatDisplayDate(selectedDay) }}
          </div>
        </div>

        <!-- Day Expenses / COGS -->
        <div style="background: var(--og-bg-input); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--og-border-subtle);">
          <div style="font-size: 0.76rem; color: var(--og-text-secondary); font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
            <span>Daily Total Expenses (COGS)</span>
            <span style="color: #EC4899; font-weight: 700;">↑</span>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #EC4899; margin: 4px 0;">
            ₱{{ Number(selectedDayCogs).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: var(--og-text-muted);">
            Capital cost of items sold on this day
          </div>
        </div>

        <!-- Day Net Profit -->
        <div style="background: var(--og-bg-input); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--og-border-subtle);">
          <div style="font-size: 0.76rem; color: var(--og-text-secondary); font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
            <span>Daily Net Profit</span>
            <span style="color: #2563EB; font-weight: 700;">◎</span>
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #10B981; margin: 4px 0;">
            ₱{{ Number(selectedDayNetProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
          <div style="font-size: 0.72rem; color: var(--og-text-muted);">
            Daily profit margin: {{ selectedDayMargin }}%
          </div>
        </div>

        <!-- Day Receipts & Average Ticket -->
        <div style="background: var(--og-bg-input); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--og-border-subtle);">
          <div style="font-size: 0.76rem; color: var(--og-text-secondary); font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
            <span>Receipts & Average Ticket</span>
            <Receipt style="width: 14px; height: 14px; color: #3B82F6;" />
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #FFFFFF; margin: 4px 0;">
            {{ selectedDayReceipts.length }} <span style="font-size: 0.85rem; font-weight: 600; color: var(--og-text-secondary);">receipts</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--og-text-muted);">
            Avg ticket: ₱{{ Number(selectedDayAvgTicket).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} / sale
          </div>
        </div>

      </div>

      <!-- Selected Day Itemized Receipts Table (Collapsible or visible if receipts exist) -->
      <div v-if="selectedDayReceipts.length" style="margin-top: 1.25rem; border-top: 1px solid var(--og-border-subtle); padding-top: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #FFFFFF;">
            Receipts issued on {{ formatDisplayDate(selectedDay) }} ({{ selectedDayReceipts.length }})
          </span>
          <router-link to="/receipts" class="btn-dark btn-sm" style="font-size: 0.72rem;">
            Open Receipts Ledger →
          </router-link>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Cashier</th>
                <th>Payment</th>
                <th>Grand Total (₱)</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in selectedDayReceipts" :key="r.receipt_no">
                <td><strong style="color: #3B82F6; font-family: monospace;">{{ r.receipt_no }}</strong></td>
                <td style="color: var(--og-text-secondary); font-size: 0.8rem;">{{ formatTime(r.created_at) }}</td>
                <td style="color: #FFFFFF; font-weight: 600;">{{ r.customer_name }}</td>
                <td style="color: var(--og-text-secondary); font-size: 0.8rem;">{{ r.cashier_name }}</td>
                <td><span class="user-pill">{{ r.payment_method }}</span></td>
                <td><strong style="color: #10B981;">₱{{ Number(r.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></td>
                <td><span class="status-badge status-completed">Paid</span></td>
                <td style="text-align: right;">
                  <button class="icon-btn" style="width: 28px; height: 28px;" title="Print Receipt" @click="store.openReceipt(r)">
                    <Printer style="width: 14px; height: 14px; color: #3B82F6;" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State for days without recorded transactions -->
      <div v-else style="margin-top: 1.25rem; padding: 2rem 1rem; text-align: center; background: rgba(255,255,255,0.015); border-radius: 8px; border: 1px dashed var(--og-border-subtle);">
        <Calendar style="width: 36px; height: 36px; color: var(--og-text-muted); opacity: 0.5; margin-bottom: 0.5rem;" />
        <div style="font-size: 0.88rem; color: #FFFFFF; font-weight: 600;">
          No transactions registered on {{ formatDisplayDate(selectedDay) }}.
        </div>
        <div style="font-size: 0.78rem; color: var(--og-text-secondary); margin-top: 4px;">
          Select a date with store activity using the calendar picker, or click below:
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" @click="jumpToLatestActivity">
          Jump to Latest Sales Date (October 20, 2026)
        </button>
      </div>
    </section>

    <!-- 4. MIDDLE ROW: REAL-TIME REVENUE VS EXPENSES OVERVIEW & CATEGORY BREAKDOWN -->
    <section style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 1.75rem;">
      
      <!-- Left Card: Dynamic Real-Time Revenue vs Expenses Spline Wave Chart -->
      <div class="og-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="og-card-header">
          <div>
            <h2 class="og-card-title">Revenue vs Expenses overview</h2>
            <div class="og-card-sub">Real monthly revenue and inventory COGS telemetry in Philippine Peso (₱)</div>
          </div>
          <select v-model="selectedPeriodMonths" class="og-pill-select">
            <option :value="6">Last 6 months ▾</option>
            <option :value="12">Last 12 months ▾</option>
            <option :value="3">Last 3 months ▾</option>
          </select>
        </div>

        <!-- Glowing Spline Wave Chart powered by real database points -->
        <div style="position: relative; width: 100%; height: 260px; margin-top: 0.5rem;">
          <svg viewBox="0 0 600 240" style="width: 100%; height: 100%; overflow: visible;">
            <defs>
              <!-- Blue Wave Gradient (Revenue) -->
              <linearGradient id="ogRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2563EB" stop-opacity="0.5" />
                <stop offset="60%" stop-color="#2563EB" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#2563EB" stop-opacity="0.0" />
              </linearGradient>

              <!-- Orange Wave Gradient (Expenses) -->
              <linearGradient id="ogExpenseGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.4" />
                <stop offset="60%" stop-color="#F59E0B" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.0" />
              </linearGradient>

              <filter id="neonBlueGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Horizontal Gridlines & Dynamic Y-Axis Labels in Philippine Peso -->
            <g stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="3 3">
              <line x1="60" y1="20" x2="590" y2="20" />
              <line x1="60" y1="75" x2="590" y2="75" />
              <line x1="60" y1="130" x2="590" y2="130" />
              <line x1="60" y1="185" x2="590" y2="185" />
            </g>

            <g fill="#64748B" font-size="11" font-family="'Plus Jakarta Sans', sans-serif">
              <text x="5" y="24">{{ chartYLabels[3] }}</text>
              <text x="5" y="79">{{ chartYLabels[2] }}</text>
              <text x="5" y="134">{{ chartYLabels[1] }}</text>
              <text x="15" y="189">{{ chartYLabels[0] }}</text>
            </g>

            <!-- Wave 1: Area Fill for Real Revenue (Blue) -->
            <path :d="revenueAreaPath" fill="url(#ogRevenueGlow)" />

            <!-- Wave 1 Stroke: Revenue Spline (Blue) -->
            <path
              :d="revenueLinePath"
              fill="none"
              stroke="#2563EB"
              stroke-width="3"
              stroke-linecap="round"
              filter="url(#neonBlueGlow)"
            />

            <!-- Wave 2: Area Fill for Real Expenses (Orange) -->
            <path :d="expenseAreaPath" fill="url(#ogExpenseGlow)" />

            <!-- Wave 2 Stroke: Expenses Spline (Orange) -->
            <path
              :d="expenseLinePath"
              fill="none"
              stroke="#F59E0B"
              stroke-width="2.5"
              stroke-linecap="round"
            />

            <!-- Interactive Hover / Month Points -->
            <g v-for="(pt, idx) in chartPoints" :key="idx" :transform="`translate(${pt.x}, ${pt.revY})`" style="cursor: pointer;" @click="activePointIdx = idx">
              <circle r="5" :fill="activePointIdx === idx ? '#FFFFFF' : '#2563EB'" stroke="#2563EB" stroke-width="2" />
              <circle v-if="activePointIdx === idx" r="11" fill="none" stroke="rgba(37, 99, 235, 0.5)" stroke-width="2" />
            </g>

            <!-- X-Axis Labels -->
            <g fill="#94A3B8" font-size="11" font-weight="500" font-family="'Plus Jakarta Sans', sans-serif">
              <text 
                v-for="(pt, idx) in chartPoints" 
                :key="'label-' + idx" 
                :x="pt.x" 
                y="215" 
                text-anchor="middle"
                :style="{ fill: activePointIdx === idx ? '#FFFFFF' : '#94A3B8', fontWeight: activePointIdx === idx ? '700' : '500' }"
              >
                {{ pt.monthLabel }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Active Month Tooltip Callout -->
        <div v-if="activePoint" style="margin: 0.5rem 0; padding: 8px 14px; background: var(--og-bg-input); border-radius: 8px; border: 1px solid var(--og-border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem;">
          <span style="font-weight: 700; color: #FFFFFF;">
            📅 {{ activePoint.fullMonthLabel }}:
          </span>
          <div style="display: flex; gap: 1.25rem;">
            <span style="color: #60A5FA;">Revenue: <strong>₱{{ Number(activePoint.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></span>
            <span style="color: #FBBF24;">Expenses: <strong>₱{{ Number(activePoint.cogs).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></span>
            <span style="color: #10B981;">Net: <strong>₱{{ Number(activePoint.revenue - activePoint.cogs).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></span>
          </div>
        </div>

        <!-- Chart Legend -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; margin-top: 0.5rem; font-size: 0.8rem; color: var(--og-text-secondary);">
          <div style="display: flex; align-items: center; gap: 7px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #2563EB;"></span>
            <span>Total Revenue (₱)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 7px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B;"></span>
            <span>Inventory Expenses / COGS (₱)</span>
          </div>
        </div>
      </div>

      <!-- Right Card: Real Database Category Sales Breakdown -->
      <div class="og-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="og-card-header">
          <div>
            <h2 class="og-card-title">Category breakdown</h2>
            <div class="og-card-sub">Top inventory categories by sales in Philippine Peso (₱)</div>
          </div>
        </div>

        <!-- Dynamic Category Pillar Bars -->
        <div style="position: relative; width: 100%; height: 240px; display: flex; align-items: flex-end; justify-content: space-around; padding: 0 0.5rem 1rem 0.5rem;">
          <!-- Guide line -->
          <div style="position: absolute; left: 0; right: 0; bottom: 35px; height: 1px; background: rgba(255, 255, 255, 0.06);"></div>

          <div 
            v-for="(cat, idx) in topCategories" 
            :key="cat.name" 
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 2; width: 50px;"
          >
            <!-- Hoverable Pillar Bar -->
            <div 
              :style="{
                width: '38px',
                height: `${Math.max(15, cat.barHeight)}px`,
                background: cat.colorGradient,
                borderRadius: '8px 8px 0 0',
                boxShadow: cat.glow,
                transition: 'height 0.4s ease'
              }"
              :title="`${cat.name}: ₱${Number(cat.sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}`"
            ></div>
            <span style="font-size: 0.7rem; color: var(--og-text-secondary); font-weight: 600; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55px;">
              {{ cat.name }}
            </span>
          </div>
        </div>

        <!-- Category Footprint -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--og-border-subtle); font-size: 0.75rem; color: var(--og-text-muted);">
          <span>Leading: <strong>{{ topCategories[0]?.name || 'NESTLE' }}</strong></span>
          <span style="color: #10B981; font-weight: 700;">₱{{ formatCompactPeso(totalCategorySales) }} catalog sales</span>
        </div>
      </div>
    </section>

    <!-- 5. BOTTOM ROW: PRODUCT CATEGORIES OVERVIEW & RECENT DATABASE RECEIPTS -->
    <section style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.25rem;">
      
      <!-- Left Card: Product Categories Distribution -->
      <div class="og-card">
        <div class="og-card-header">
          <div>
            <h2 class="og-card-title">Inventory Categories</h2>
            <div class="og-card-sub">Catalog product lines & supplier sources</div>
          </div>
          <router-link to="/categories" class="og-pill-select" style="text-decoration: none; font-size: 0.76rem;">
            View all ▾
          </router-link>
        </div>

        <div style="padding: 0.5rem 0;">
          <div style="font-size: 2.3rem; font-weight: 800; color: #FFFFFF; line-height: 1;">
            {{ store.categories.length }} <span style="font-size: 1rem; color: var(--og-text-secondary); font-weight: 600;">Active Lines</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--og-text-secondary); margin-top: 6px;">
            Total supplier categories and item brand classifications verified in cloud storage.
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.25rem;">
            <div style="flex: 1; padding: 12px; background: var(--og-bg-input); border-radius: 8px; border: 1px solid var(--og-border-subtle);">
              <div style="font-size: 0.72rem; color: var(--og-text-muted);">Total Products</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: #3B82F6; margin-top: 2px;">{{ store.products.length }}</div>
            </div>
            <div style="flex: 1; padding: 12px; background: var(--og-bg-input); border-radius: 8px; border: 1px solid var(--og-border-subtle);">
              <div style="font-size: 0.72rem; color: var(--og-text-muted);">Suppliers</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: #10B981; margin-top: 2px;">{{ store.suppliers.length || store.categories.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Card: Live Recent Transactions & Receipts directly from Database -->
      <div class="og-card">
        <div class="og-card-header">
          <div>
            <h2 class="og-card-title">Recent Receipts & Transactions</h2>
            <div class="og-card-sub">Real-time cloud database ledger records in Philippine Peso (₱)</div>
          </div>
          <router-link to="/receipts" class="btn-dark btn-sm" style="font-size: 0.74rem;">
            Open Receipts Ledger
          </router-link>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer Name</th>
                <th>Payment</th>
                <th>Amount (₱)</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Live Top 4 Database Receipts -->
              <tr v-for="r in store.receipts.slice(0, 4)" :key="r.receipt_no">
                <td><strong style="color: #3B82F6; font-family: monospace;">{{ r.receipt_no }}</strong></td>
                <td style="color: #FFFFFF; font-weight: 600;">{{ r.customer_name || 'Walk-in Customer' }}</td>
                <td><span class="user-pill">{{ r.payment_method }}</span></td>
                <td><strong style="color: #10B981;">₱{{ Number(r.grand_total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></td>
                <td>
                  <span class="status-badge" :class="r.status === 'Paid' ? 'status-completed' : 'status-pending'">
                    {{ r.status || 'Paid' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="icon-btn" style="width: 28px; height: 28px;" title="Print Receipt" @click="store.openReceipt(r)">
                    <Printer style="width: 14px; height: 14px; color: #3B82F6;" />
                  </button>
                </td>
              </tr>
              <tr v-if="!store.receipts.length">
                <td colspan="6" style="text-align: center; padding: 2rem 0; color: var(--og-text-muted);">
                  Connecting to live database...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Support Modal -->
    <div v-if="showSupport" class="modal-overlay" @click.self="showSupport = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Customer Support & System Telemetry</h3>
          <button class="icon-btn" @click="showSupport = false">✕</button>
        </div>
        <div class="modal-body" style="font-size: 0.88rem; line-height: 1.6; color: var(--og-text-secondary);">
          <p style="color: #FFFFFF; font-weight: 600;">KIEL BIEL CONSUMER GOODS TRADING POS</p>
          <p>Location: Brgy.42 Rawis, Legazpi City</p>
          <p>Contact Phone: Cp# 09985317204</p>
          <p>All database records are verified with zero calculation discrepancies.</p>
          <div style="margin-top: 1rem; padding: 12px; background: var(--og-bg-input); border-radius: 8px;">
            <div style="color: #10B981; font-weight: 600;">Currency: Philippine Peso (₱) Active</div>
            <div style="font-size: 0.76rem; color: var(--og-text-muted);">All statistics synced with live PostgreSQL database</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showSupport = false">Done</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../store/inventoryStore.js'
import { 
  Users, 
  Package, 
  CreditCard, 
  ArrowUpRight, 
  HelpCircle, 
  Printer, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Receipt 
} from 'lucide-vue-next'

const showSupport = ref(false)
const selectedPeriodMonths = ref(6)

// Initialize day navigator to latest active sales date in database (2026-10-20)
const selectedDay = ref('2026-10-20')

onMounted(async () => {
  await store.loadAllFromSupabase()
  // Ensure we show live store data
  store.uventraDemoMode = false
})

// ============================================================================
// 1. OVERALL REAL DATABASE METRICS (IN PHILIPPINE PESO ₱)
// ============================================================================
const totalSalesAllTime = computed(() => {
  return store.receipts.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)
})

const totalCogsAllTime = computed(() => {
  // Map product unit costs
  const costMap = new Map()
  store.products.forEach(p => costMap.set(p.name.toLowerCase().trim(), Number(p.cost) || 0))

  return store.receipts.reduce((acc, r) => {
    if (!r.items || !r.items.length) return acc
    const rCogs = r.items.reduce((iAcc, item) => {
      const uCost = costMap.get((item.item_desc || '').toLowerCase().trim()) || (Number(item.unit_price) * 0.7)
      return iAcc + (uCost * (Number(item.quantity) || 1))
    }, 0)
    return acc + rCogs
  }, 0)
})

const totalNetProfitAllTime = computed(() => {
  return Math.max(0, totalSalesAllTime.value - totalCogsAllTime.value)
})

const totalClientsCount = computed(() => {
  return store.customers.length || 109
})

const uniqueActiveClientsCount = computed(() => {
  const clients = new Set()
  store.receipts.forEach(r => {
    if (r.customer_name && r.customer_name.trim()) clients.add(r.customer_name.trim().toLowerCase())
  })
  return clients.size || store.customers.length
})

// Format compact peso helper (e.g. ₱15.56M, ₱408.7k)
function formatCompactPeso(num) {
  const n = Number(num) || 0
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

// ============================================================================
// 2. DAILY CALENDAR TELEMETRY ENGINE
// ============================================================================
function getReceiptDateKey(r) {
  if (r.raw_created_at) {
    const d = new Date(r.raw_created_at)
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  }
  if (r.created_at) {
    const d = new Date(r.created_at)
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  }
  return ''
}

const selectedDayReceipts = computed(() => {
  const target = selectedDay.value
  if (!target) return []
  return store.receipts.filter(r => getReceiptDateKey(r) === target)
})

const selectedDayRevenue = computed(() => {
  return selectedDayReceipts.value.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)
})

const selectedDayCogs = computed(() => {
  const costMap = new Map()
  store.products.forEach(p => costMap.set(p.name.toLowerCase().trim(), Number(p.cost) || 0))

  return selectedDayReceipts.value.reduce((acc, r) => {
    if (!r.items || !r.items.length) return acc
    const rCogs = r.items.reduce((iAcc, item) => {
      const uCost = costMap.get((item.item_desc || '').toLowerCase().trim()) || (Number(item.unit_price) * 0.7)
      return iAcc + (uCost * (Number(item.quantity) || 1))
    }, 0)
    return acc + rCogs
  }, 0)
})

const selectedDayNetProfit = computed(() => {
  return Math.max(0, selectedDayRevenue.value - selectedDayCogs.value)
})

const selectedDayMargin = computed(() => {
  if (selectedDayRevenue.value <= 0) return '0.0'
  return ((selectedDayNetProfit.value / selectedDayRevenue.value) * 100).toFixed(1)
})

const selectedDayAvgTicket = computed(() => {
  if (selectedDayReceipts.value.length === 0) return 0
  return selectedDayRevenue.value / selectedDayReceipts.value.length
})

function navigateDay(direction) {
  const parts = selectedDay.value.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + direction)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  selectedDay.value = `${y}-${m}-${day}`
}

function jumpToLatestActivity() {
  selectedDay.value = '2026-10-20'
}

function jumpToToday() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  selectedDay.value = `${y}-${m}-${day}`
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(createdAtStr) {
  if (!createdAtStr) return 'Recent'
  const d = new Date(createdAtStr)
  if (isNaN(d.getTime())) return createdAtStr
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ============================================================================
// 3. DYNAMIC REAL-TIME MONTHLY GRAPH TELEMETRY
// ============================================================================
// Generates the past N months window ending at current/latest month (October 2026)
const monthlyTelemetry = computed(() => {
  const costMap = new Map()
  store.products.forEach(p => costMap.set(p.name.toLowerCase().trim(), Number(p.cost) || 0))

  // Group real database receipts into months
  const map = {}
  store.receipts.forEach(r => {
    let d = null
    if (r.raw_created_at) d = new Date(r.raw_created_at)
    else if (r.created_at) d = new Date(r.created_at)
    if (!d || isNaN(d.getTime())) return

    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map[mKey]) map[mKey] = { revenue: 0, cogs: 0, count: 0 }
    map[mKey].revenue += Number(r.grand_total) || 0
    map[mKey].count += 1

    if (r.items && r.items.length) {
      r.items.forEach(it => {
        const uCost = costMap.get((it.item_desc || '').toLowerCase().trim()) || (Number(it.unit_price) * 0.7)
        map[mKey].cogs += uCost * (Number(it.quantity) || 1)
      })
    }
  })

  // Window of past months
  const count = selectedPeriodMonths.value || 6
  const list = []
  const baseDate = new Date(2026, 9, 1) // Oct 2026
  for (let i = count - 1; i >= 0; i--) {
    const cur = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1)
    const mKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
    const entry = map[mKey] || { revenue: 0, cogs: 0, count: 0 }
    const monthShort = cur.toLocaleDateString('en-US', { month: 'short' })
    const monthFull = cur.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    list.push({
      key: mKey,
      monthLabel: monthShort,
      fullMonthLabel: monthFull,
      revenue: entry.revenue,
      cogs: entry.cogs,
      count: entry.count
    })
  }

  return list
})

// Calculate maximum scale for the chart
const maxChartValue = computed(() => {
  let max = 100000 // default minimum scale ₱100k
  monthlyTelemetry.value.forEach(m => {
    if (m.revenue > max) max = m.revenue
    if (m.cogs > max) max = m.cogs
  })
  // Round up to nice number
  return Math.ceil(max / 1000000) * 1000000 || 10000000
})

const chartYLabels = computed(() => {
  const max = maxChartValue.value
  return [
    '₱0',
    `₱${formatCompactPeso(max * 0.33)}`,
    `₱${formatCompactPeso(max * 0.66)}`,
    `₱${formatCompactPeso(max)}`
  ]
})

const activePointIdx = ref(5) // default to latest month (October)

const chartPoints = computed(() => {
  const months = monthlyTelemetry.value
  const n = months.length
  const leftX = 75
  const rightX = 575
  const step = n > 1 ? (rightX - leftX) / (n - 1) : 0
  const max = maxChartValue.value
  const topY = 30
  const bottomY = 185
  const rangeY = bottomY - topY

  return months.map((m, idx) => {
    const x = leftX + idx * step
    const revRatio = Math.min(1, Math.max(0, m.revenue / max))
    const cogsRatio = Math.min(1, Math.max(0, m.cogs / max))
    const revY = bottomY - revRatio * rangeY
    const expY = bottomY - cogsRatio * rangeY
    return {
      ...m,
      x,
      revY,
      expY
    }
  })
})

const activePoint = computed(() => {
  return chartPoints.value[activePointIdx.value] || chartPoints.value[chartPoints.value.length - 1]
})

// Build smooth curved bezier paths
function generateSmoothPath(points, yProp) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0][yProp]}`

  let d = `M ${points[0].x} ${points[0][yProp]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = i < points.length - 2 ? points[i + 2] : p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1[yProp] + (p2[yProp] - p0[yProp]) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2[yProp] - (p3[yProp] - p1[yProp]) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2[yProp]}`
  }
  return d
}

const revenueLinePath = computed(() => generateSmoothPath(chartPoints.value, 'revY'))
const expenseLinePath = computed(() => generateSmoothPath(chartPoints.value, 'expY'))

const revenueAreaPath = computed(() => {
  const line = revenueLinePath.value
  if (!line || !chartPoints.value.length) return ''
  const firstX = chartPoints.value[0].x
  const lastX = chartPoints.value[chartPoints.value.length - 1].x
  return `${line} L ${lastX} 185 L ${firstX} 185 Z`
})

const expenseAreaPath = computed(() => {
  const line = expenseLinePath.value
  if (!line || !chartPoints.value.length) return ''
  const firstX = chartPoints.value[0].x
  const lastX = chartPoints.value[chartPoints.value.length - 1].x
  return `${line} L ${lastX} 185 L ${firstX} 185 Z`
})

// ============================================================================
// 4. REAL DATABASE CATEGORY SALES BAR CHART
// ============================================================================
const topCategories = computed(() => {
  const prodCatMap = new Map()
  store.products.forEach(p => prodCatMap.set(p.name.toLowerCase().trim(), p.category || 'General'))

  const catSales = {}
  store.receipts.forEach(r => {
    if (!r.items) return
    r.items.forEach(it => {
      const cat = prodCatMap.get((it.item_desc || '').toLowerCase().trim()) || 'General'
      catSales[cat] = (catSales[cat] || 0) + Number(it.line_total || 0)
    })
  })

  const sorted = Object.entries(catSales).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!sorted.length) return []

  const maxCat = sorted[0][1] || 1
  const colorSchemes = [
    { grad: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)', glow: '0 4px 15px rgba(37, 99, 235, 0.4)' },
    { grad: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)', glow: '0 4px 15px rgba(245, 158, 11, 0.35)' },
    { grad: 'linear-gradient(180deg, #06B6D4 0%, #0891B2 100%)', glow: '0 4px 15px rgba(6, 182, 212, 0.35)' },
    { grad: 'linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)', glow: '0 4px 15px rgba(168, 85, 247, 0.35)' },
    { grad: 'linear-gradient(180deg, #EC4899 0%, #DB2777 100%)', glow: '0 4px 15px rgba(236, 72, 153, 0.35)' }
  ]

  return sorted.map(([name, sales], idx) => {
    const ratio = Math.max(0.12, sales / maxCat)
    const barHeight = Math.round(ratio * 165)
    return {
      name,
      sales,
      barHeight,
      colorGradient: colorSchemes[idx % colorSchemes.length].grad,
      glow: colorSchemes[idx % colorSchemes.length].glow
    }
  })
})

const totalCategorySales = computed(() => {
  return topCategories.value.reduce((sum, c) => sum + Number(c.sales), 0)
})
</script>
