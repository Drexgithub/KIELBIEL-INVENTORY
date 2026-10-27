<template>
  <div v-if="isLoginPage">
    <router-view />
  </div>

  <div v-else class="og-app-layout">
    <!-- Full-Height Left Sidebar -->
    <Sidebar />

    <!-- Main Workspace Area -->
    <div class="og-main-layout">
      <Navbar />

      <main class="og-viewport">
        <router-view />
      </main>
    </div>

    <!-- Receipt Print & View Modal -->
    <ReceiptModal />

    <!-- Receipt Edit & Items Modal -->
    <EditReceiptModal />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { store } from './store/inventoryStore.js'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import ReceiptModal from './components/ReceiptModal.vue'
import EditReceiptModal from './components/EditReceiptModal.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'login')

onMounted(() => {
  if (store.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
})
</script>
