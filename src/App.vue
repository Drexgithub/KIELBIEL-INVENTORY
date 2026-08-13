<template>
  <div v-if="isLoginPage">
    <router-view />
  </div>

  <div v-else class="app-container">
    <Sidebar />
    <main class="main-content">
      <Navbar />
      <router-view />
    </main>
    <ReceiptModal />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { store } from './store/inventoryStore.js'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import ReceiptModal from './components/ReceiptModal.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'login')

onMounted(() => {
  if (store.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>
