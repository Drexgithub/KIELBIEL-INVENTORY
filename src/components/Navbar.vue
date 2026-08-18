<template>
  <header class="topbar" style="justify-content: flex-end;">
    <div class="topbar-right">
      <!-- Cosy POS Date Pill Badge -->
      <div class="date-picker-pill">
        <Calendar style="width: 15px; height: 15px;" />
        <span>{{ currentDate }} ▾</span>
      </div>

      <div class="quick-actions">
        <router-link to="/pos" class="btn btn-mint btn-sm">
          <PlusCircle />
          <span>New Order</span>
        </router-link>

        <!-- Notification Icon with Dropdown -->
        <div style="position: relative;">
          <button class="icon-btn" title="Notifications" @click="showNotifs = !showNotifs">
            <Bell />
            <span v-if="unreadCount" class="badge badge-danger">{{ unreadCount }}</span>
          </button>

          <div v-if="showNotifs" class="modal-card" style="position: absolute; top: calc(100% + 10px); right: 0; width: 340px; z-index: 1000;">
            <div class="modal-header">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Notifications</h4>
              <span class="text-sm text-muted">{{ store.notifications.length }} alerts</span>
            </div>
            <div style="max-height: 280px; overflow-y: auto;">
              <div 
                v-for="n in store.notifications" 
                :key="n.id" 
                style="padding: 0.875rem 1.25rem; border-bottom: 1px solid var(--border); cursor: pointer;"
                @click="n.unread = false"
              >
                <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">{{ n.title }}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">{{ n.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store/inventoryStore.js'
import { PlusCircle, Bell, Calendar } from 'lucide-vue-next'

const showNotifs = ref(false)

const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const unreadCount = computed(() => store.notifications.filter(n => n.unread).length)
</script>
