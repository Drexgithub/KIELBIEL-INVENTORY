<template>
  <div class="login-split-container">
    

    <!-- LEFT HERO PANEL (Blue Curved Bubbles Design from Image) -->
    <div class="login-hero-left">
      <!-- Floating Circle Bubbles -->
      <div class="bubble bubble-top-left"></div>
      <div class="bubble bubble-bottom-left"></div>
      <div class="bubble bubble-center-right"></div>
      <div class="hero-curved-mask"></div>

      <div class="hero-text-content">
        <h1 class="welcome-heading">WELCOME</h1>
        <h2 class="company-sub-title">KIEL BIEL CONSUMER GOODS TRADING</h2>
        <p class="hero-tagline">
          Streamline your inventory, manage stock levels, track customer sales, and access point-of-sale reporting in real-time.
        </p>
      </div>
    </div>

    <!-- RIGHT FORM PANEL (Clean Sign In Layout) -->
    <div class="login-form-right">
      <div class="form-content-box">
        
        <div class="form-header">
          <h2 class="signin-title">Sign in</h2>
          <p class="signin-subtitle">Please enter your username and password to sign in.</p>
        </div>

        <!-- Error Alert Banner -->
        <div v-if="errorMessage" class="error-banner">
          <AlertCircle style="width: 18px; height: 18px; flex-shrink: 0;" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Sign In Form -->
        <form class="signin-form" @submit.prevent="handleLogin">
          
          <!-- User Name Input -->
          <div class="input-group">
            <div class="input-box-rounded">
              <User class="field-icon" />
              <input 
                type="text" 
                v-model="email" 
                placeholder="User Name" 
                required 
              />
            </div>
          </div>

          <!-- Password Input with SHOW / HIDE Text Toggle -->
          <div class="input-group">
            <div class="input-box-rounded">
              <Lock class="field-icon" />
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Password" 
                required 
              />
              <button 
                type="button" 
                class="show-toggle-text-btn" 
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'HIDE' : 'SHOW' }}
              </button>
            </div>
          </div>

          <!-- Options Row: Remember Me & Forgot Password -->
          <div class="form-row-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="remember" />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="showForgotModal = true">Forgot Password?</a>
          </div>

          <!-- Primary Submit Button -->
          <button type="submit" class="primary-signin-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-spinner"></span>
            <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
          </button>
        </form>



      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="modal-overlay" @click.self="showForgotModal = false">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">Reset Password</h3>
          <button class="icon-btn" style="width: 32px; height: 32px;" @click="showForgotModal = false"><X style="width: 16px; height: 16px;" /></button>
        </div>
        <form @submit.prevent="handleResetPassword" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Enter your registered account email address below to receive password recovery instructions.
          </p>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" v-model="resetEmail" class="form-input" placeholder="admin@kielbiel.com" required />
          </div>
          <div v-if="resetSuccessMessage" class="status-badge status-completed" style="padding: 0.6rem 1rem; font-size: 0.82rem;">
            {{ resetSuccessMessage }}
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
            <button type="button" class="btn btn-outline" @click="showForgotModal = false">Close</button>
            <button type="submit" class="btn btn-mint">Send Reset Link</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { supabase } from '../supabase.js'
import { User, Lock, AlertCircle, X } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const showForgotModal = ref(false)
const resetEmail = ref('')
const resetSuccessMessage = ref('')

onMounted(() => {
  const savedUser = localStorage.getItem('remembered_login_user')
  if (savedUser) {
    email.value = savedUser
  }
})

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  const inputEmail = email.value.trim().toLowerCase()
  const inputPass = password.value.trim()

  let userObj = null

  // 1. Check Supabase users table if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${inputEmail},email.eq.${inputEmail}`)
        .eq('password', inputPass)

      if (!error && data && data.length > 0) {
        userObj = {
          name: data[0].full_name || data[0].username,
          email: data[0].email || inputEmail,
          role: 'Admin User'
        }
      }
    } catch (err) {
      console.error('Supabase user auth error:', err)
    }
  }

  // 2. Strict check for authorized system Admin account
  if (!userObj) {
    const isValAdmin = (inputEmail === 'admin@kielbiel.com' || inputEmail === 'admin') && inputPass === 'KielBiel2026#Admin'
    if (isValAdmin) {
      userObj = {
        name: 'Kiel Hedrix',
        email: 'admin@kielbiel.com',
        role: 'Admin User'
      }
    }
  }

  // 3. Reject any unauthorized credentials
  if (!userObj) {
    errorMessage.value = 'Access denied! Invalid username/email or password.'
    isLoading.value = false
    return
  }

  if (remember.value) {
    localStorage.setItem('remembered_login_user', email.value)
  } else {
    localStorage.removeItem('remembered_login_user')
  }

  store.login(userObj.email, userObj.role, userObj.name)
  isLoading.value = false
  router.push('/dashboard')
}

function handleResetPassword() {
  if (!resetEmail.value) return
  resetSuccessMessage.value = `✓ Password reset link successfully sent to ${resetEmail.value}`
  setTimeout(() => {
    resetSuccessMessage.value = ''
    showForgotModal.value = false
  }, 2500)
}
</script>

<style scoped>
.login-split-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    position: relative;
    background-color: var(--surface);
    font-family: var(--font-sans);
    overflow: hidden;
}

.login-theme-switcher {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 100;
}

.theme-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-main);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
    background: var(--bg-main);
}

/* LEFT HERO PANEL WITH BLUE CURVED BUBBLES */
.login-hero-left {
    flex: 1.1;
    position: relative;
    background: linear-gradient(135deg, #0b5ed7 0%, #0d47a1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 3.5rem;
    color: #ffffff;
    overflow: hidden;
}

.hero-curved-mask {
    position: absolute;
    top: -10%;
    right: -180px;
    width: 360px;
    height: 120%;
    background: #0d47a1;
    border-radius: 50%;
    z-index: 1;
    opacity: 0.5;
}

/* Floating circles / bubbles from screenshot */
.bubble {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(13, 71, 161, 0.4) 100%);
    backdrop-filter: blur(5px);
    z-index: 2;
}

.bubble-top-left {
    width: 280px;
    height: 280px;
    top: -80px;
    left: -80px;
}

.bubble-bottom-left {
    width: 360px;
    height: 360px;
    bottom: -100px;
    left: -60px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(11, 94, 215, 0.8) 100%);
}

.bubble-center-right {
    width: 240px;
    height: 240px;
    bottom: 40px;
    right: -40px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(13, 71, 161, 0.9) 100%);
}

.hero-text-content {
    position: relative;
    z-index: 10;
    max-width: 520px;
}

.welcome-heading {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: 2px;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.company-sub-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 1.75rem;
}

.hero-tagline {
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
}

/* RIGHT FORM PANEL */
.login-form-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background-color: var(--surface);
    overflow-y: auto;
}

.form-content-box {
    width: 100%;
    max-width: 400px;
}

.form-header {
    margin-bottom: 2rem;
}

.signin-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.5px;
    margin-bottom: 0.35rem;
}

.signin-subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.error-banner {
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #DC2626;
    border-radius: 0.75rem;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.signin-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.input-box-rounded {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.25rem 0.875rem;
    transition: all 0.2s ease;
}

.input-box-rounded:focus-within {
    border-color: #0b5ed7;
    background: var(--surface);
    box-shadow: 0 0 0 3.5px rgba(11, 94, 215, 0.15);
}

.field-icon {
    width: 20px;
    height: 20px;
    color: var(--text-muted);
    flex-shrink: 0;
    margin-right: 0.75rem;
}

.input-box-rounded input {
    width: 100%;
    height: 48px;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: var(--text-main);
    outline: none;
    font-family: inherit;
}

.input-box-rounded input::placeholder {
    color: var(--text-muted);
    font-weight: 500;
}

.show-toggle-text-btn {
    background: none;
    border: none;
    color: #0b5ed7;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    padding: 0.35rem 0.5rem;
    border-radius: 4px;
    transition: opacity 0.2s;
    flex-shrink: 0;
}

.show-toggle-text-btn:hover {
    opacity: 0.8;
}

.form-row-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-muted);
    font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #0b5ed7;
    cursor: pointer;
}

.forgot-link {
    color: var(--text-main);
    font-weight: 700;
    font-size: 0.85rem;
    text-decoration: none;
}

.forgot-link:hover {
    text-decoration: underline;
}

.primary-signin-btn {
    width: 100%;
    height: 52px;
    background: #0f4c81;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 6px 18px rgba(15, 76, 129, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.primary-signin-btn:hover:not(:disabled) {
    background: #0b3d68;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(15, 76, 129, 0.4);
}

.primary-signin-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

.btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 0.8s linear infinite;
}

/* Divider Line */
.divider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.75rem 0 1.25rem;
}

.divider-line {
    flex: 1;
    height: 1px;
    background-color: var(--border);
}

.divider-text {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
}

/* Demo Role Buttons */
.demo-buttons-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.demo-role-btn {
    width: 100%;
    height: 48px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    color: var(--text-main);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

.demo-role-btn:hover, .demo-role-btn.selected {
    border-color: #0b5ed7;
    background: var(--primary-light);
    color: #0b5ed7;
}

@media (max-width: 991px) {
    .login-hero-left { display: none; }
}
</style>
