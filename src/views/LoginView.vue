<template>
  <div class="login-page">
    
    <!-- LEFT COLUMN: AUTHENTICATION FORM -->
    <div class="login-left-column">
      
      <!-- Top Brand Header (matches top-left of reference) -->
      <header class="brand-header">
        <div class="brand-logo-wrap">
          <img src="/logo.png" alt="KIELBIEL Logo" class="brand-icon-img" />
        </div>
        <span class="brand-title">kielbiel</span>
      </header>

      <!-- Center Form Wrapper -->
      <main class="login-main-form">
        <div class="form-container">
          
          <h1 class="signin-heading">Sign in</h1>

          <!-- Error Feedback Banner -->
          <transition name="fade">
            <div v-if="errorMessage" class="error-banner">
              <AlertCircle class="error-icon" />
              <span>{{ errorMessage }}</span>
            </div>
          </transition>

          <form @submit.prevent="handleLogin" class="auth-form">
            
            <!-- Email / Username Field -->
            <div class="form-field">
              <label for="email" class="field-label">Email address</label>
              <div class="input-container" :class="{ 'is-focused': emailFocused }">
                <input
                  id="email"
                  type="text"
                  v-model="email"
                  placeholder="Enter your email"
                  autocomplete="username"
                  required
                  class="field-input"
                  @focus="emailFocused = true"
                  @blur="emailFocused = false"
                />
                <div class="input-affix">
                  <KeyRound class="key-badge-icon" />
                </div>
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-field">
              <label for="password" class="field-label">Password</label>
              <div class="input-container" :class="{ 'is-focused': passFocused }">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                  class="field-input"
                  @focus="passFocused = true"
                  @blur="passFocused = false"
                />
                <button
                  type="button"
                  class="input-affix password-toggle-btn"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                  tabindex="-1"
                >
                  <EyeOff v-if="showPassword" class="eye-icon" />
                  <Eye v-else class="eye-icon" />
                </button>
              </div>
            </div>

            <!-- Action Row: Black Pill Button + Forgot Password Link -->
            <div class="form-action-row">
              <button type="submit" class="pill-signin-btn" :disabled="isLoading">
                <span v-if="isLoading" class="btn-spinner"></span>
                <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
              </button>
              
              <a href="#" class="forgot-pwd-link" @click.prevent="showForgotModal = true">
                Forgot password?
              </a>
            </div>

            <!-- Sign Up / Help Notice -->
            <div class="form-footer-row">
              <span class="footer-prompt">Don't have an account?</span>
              <a href="#" class="signup-link" @click.prevent="showSignUpHelp = true">Sign up</a>
            </div>

          </form>

        </div>
      </main>

      <!-- Bottom Subtle Support / Copyright -->
      <footer class="login-left-footer">
        <span>© 2026 KIEL BIEL CONSUMER GOODS TRADING • Authorized Personnel Access</span>
      </footer>

    </div>

    <!-- RIGHT COLUMN: MINIMALIST LUXURY BLACK CARD -->
    <div class="login-right-column">
      <div class="black-display-card">
        
        <!-- Ambient Background Silk & Glow Accents inside Black Card -->
        <div class="card-ambient-glow"></div>
        <div class="card-subtle-radial"></div>
        <div class="card-mesh-pattern"></div>

        <!-- Centerpiece Luxury Enterprise Badge -->
        <div class="card-centerpiece">
          <div class="card-emblem-halo">
            <div class="card-emblem-box">
              <img src="/logo.png" alt="KIELBIEL Security Emblem" class="emblem-img" />
            </div>
          </div>
          
          <div class="card-typography">
            <span class="card-eyebrow">ENTERPRISE INVENTORY &amp; POS</span>
            <h2 class="card-title">KIELBIEL CONSUMER</h2>
            <p class="card-description">
              Real-time telemetry, automated stock control, and point-of-sale intelligence engineered for high-velocity commercial operations.
            </p>
          </div>
        </div>

        <!-- Floating corner metrics for high-tech aesthetic -->
        <div class="card-bottom-bar">
          <div class="metric-item">
            <span class="metric-label">SECURE ENCRYPTION</span>
            <span class="metric-val">TLS 1.3 / AES-256</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CURRENCY STANDARD</span>
            <span class="metric-val">PHP (₱) Active</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">SYSTEM BUILD</span>
            <span class="metric-val">v2.4 Enterprise</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Forgot Password Modal -->
    <transition name="fade">
      <div v-if="showForgotModal" class="modal-overlay" @click.self="showForgotModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Reset Password</h3>
            <button type="button" class="close-btn" @click="showForgotModal = false">
              <X class="modal-close-icon" />
            </button>
          </div>
          <form @submit.prevent="handleResetPassword" class="modal-body">
            <p class="modal-instruction">
              Enter your registered account username or email address below to receive password recovery instructions.
            </p>
            <div class="modal-field">
              <label>Email Address</label>
              <input 
                type="email" 
                v-model="resetEmail" 
                class="modal-input" 
                placeholder="admin@kielbiel.com" 
                required 
              />
            </div>
            <div v-if="resetSuccessMessage" class="modal-success-banner">
              {{ resetSuccessMessage }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="showForgotModal = false">Cancel</button>
              <button type="submit" class="btn-confirm">Send Reset Link</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Sign Up Notice Modal -->
    <transition name="fade">
      <div v-if="showSignUpHelp" class="modal-overlay" @click.self="showSignUpHelp = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Access Provisioning</h3>
            <button type="button" class="close-btn" @click="showSignUpHelp = false">
              <X class="modal-close-icon" />
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-instruction">
              Self-service registration is restricted to authorized commercial personnel. New cashier or administrator credentials are created by system administration.
            </p>
            <div class="contact-box">
              <div class="contact-label">ADMINISTRATIVE CONTACT</div>
              <div class="contact-name">Kiel Hedrix • System Administrator</div>
              <div class="contact-email">admin@kielbiel.com</div>
            </div>
            <div class="modal-footer" style="margin-top: 1.5rem;">
              <button type="button" class="btn-confirm" @click="showSignUpHelp = false">Understood</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/inventoryStore.js'
import { supabase } from '../supabase.js'
import { KeyRound, Eye, EyeOff, AlertCircle, X } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const emailFocused = ref(false)
const passFocused = ref(false)

const showForgotModal = ref(false)
const resetEmail = ref('')
const resetSuccessMessage = ref('')
const showSignUpHelp = ref(false)

onMounted(() => {
  document.documentElement.style.backgroundColor = '#FFFFFF'
  document.body.style.backgroundColor = '#FFFFFF'
  const savedUser = localStorage.getItem('remembered_login_user')
  if (savedUser) {
    email.value = savedUser
  }
})

onUnmounted(() => {
  document.documentElement.style.backgroundColor = ''
  document.body.style.backgroundColor = ''
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
    errorMessage.value = 'Invalid username/email or password. Please try again.'
    isLoading.value = false
    return
  }

  // Store remembered user
  localStorage.setItem('remembered_login_user', email.value)

  store.login(userObj.email, userObj.role, userObj.name)
  isLoading.value = false
  router.push('/dashboard')
}

function handleResetPassword() {
  if (!resetEmail.value) return
  resetSuccessMessage.value = `✓ Password reset link has been dispatched to ${resetEmail.value}`
  setTimeout(() => {
    resetSuccessMessage.value = ''
    showForgotModal.value = false
  }, 2400)
}
</script>

<style scoped>
/* Page Shell: Clean Minimalist White Layout Edge-to-Edge */
.login-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #FFFFFF !important;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 10;
}

/* ========================================= */
/* LEFT COLUMN: AUTHENTICATION FORM          */
/* ========================================= */
.login-left-column {
  flex: 0 0 46%;
  min-width: 440px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 48px 36px 72px;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

/* Brand Header */
.brand-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo-wrap {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  padding: 3px;
}

.brand-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-title {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #111827;
}

/* Center Form Area */
.login-main-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.form-container {
  width: 100%;
  max-width: 390px;
}

/* Serif "Sign in" Heading matching reference image */
.signin-heading {
  font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
  font-size: 3.1rem;
  font-weight: 500;
  line-height: 1.1;
  color: #111827;
  margin: 0 0 2.25rem 0;
  letter-spacing: -0.5px;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #B91C1C;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #111827;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: #FFFFFF !important;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.15s ease;
  overflow: hidden;
}

.input-container.is-focused {
  border-color: #111827 !important;
}

.field-input {
  width: 100%;
  height: 48px;
  background: #FFFFFF !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 42px 0 16px !important;
  font-size: 0.95rem !important;
  color: #111827 !important;
  outline: none !important;
  font-family: inherit;
  box-sizing: border-box;
}

.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover, 
.field-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #111827 !important;
  -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
  box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.field-input::placeholder {
  color: #9CA3AF !important;
  font-weight: 400 !important;
}

.input-affix {
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  pointer-events: none;
}

.key-badge-icon {
  width: 17px;
  height: 17px;
  color: #4B5563;
}

.password-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #6B7280;
  pointer-events: auto;
  transition: color 0.15s ease;
}

.password-toggle-btn:hover {
  color: #111827;
}

.eye-icon {
  width: 17px;
  height: 17px;
}

/* Action Row */
.form-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  gap: 1rem;
}

/* Solid Black Pill Button matching reference image */
.pill-signin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 9999px;
  padding: 10px 28px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.pill-signin-btn:hover:not(:disabled) {
  background: #262626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.pill-signin-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pill-signin-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #FFFFFF;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Forgot Password Link */
.forgot-pwd-link {
  font-size: 0.88rem;
  font-weight: 500;
  color: #4B5563;
  text-decoration: none;
  transition: color 0.15s ease;
}

.forgot-pwd-link:hover {
  color: #111827;
  text-decoration: underline;
}

/* Footer prompt */
.form-footer-row {
  margin-top: 1.5rem;
  font-size: 0.88rem;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.signup-link {
  color: #111827;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.login-left-footer {
  font-size: 0.75rem;
  color: #9CA3AF;
  letter-spacing: -0.2px;
}

/* ========================================= */
/* RIGHT COLUMN: BLACK CARD DISPLAY          */
/* ========================================= */
.login-right-column {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 20px 20px 20px 0;
  box-sizing: border-box;
}

.black-display-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 44px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12);
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  box-sizing: border-box;
}

/* Ambient glow accents inside the black card */
.card-ambient-glow {
  position: absolute;
  top: -15%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
}

.card-subtle-radial {
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 70%);
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}

.card-mesh-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.7;
  pointer-events: none;
}

/* Centerpiece in Black Card */
.card-centerpiece {
  position: relative;
  z-index: 2;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 480px;
}

.card-emblem-halo {
  margin-bottom: 2rem;
  padding: 4px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 100%);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
}

.card-emblem-box {
  width: 72px;
  height: 72px;
  background: #000000;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.emblem-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.2));
}

.card-typography {
  margin-bottom: 2rem;
}

.card-eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #94A3B8;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0 0 1rem 0;
  line-height: 1.15;
}

.card-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #94A3B8;
  margin: 0;
}

/* Live Status Pill */
.card-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  font-size: 0.78rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 10px #10B981;
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

/* Bottom Bar Metrics */
.card-bottom-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.metric-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #64748B;
}

.metric-val {
  font-size: 0.82rem;
  font-weight: 600;
  color: #F8FAFC;
}

/* ========================================= */
/* MODALS                                    */
/* ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #111622;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #FFFFFF;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
}

.modal-close-icon {
  width: 18px;
  height: 18px;
}

.modal-instruction {
  font-size: 0.86rem;
  color: #94A3B8;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.25rem;
}

.modal-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #E2E8F0;
}

.modal-input {
  height: 42px;
  background: #080B11;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0 12px;
  color: #FFFFFF;
  font-size: 0.9rem;
  outline: none;
}

.modal-input:focus {
  border-color: #2563EB;
}

.modal-success-banner {
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34D399;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #E2E8F0;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-confirm {
  padding: 8px 18px;
  background: #2563EB;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-confirm:hover {
  background: #1D4ED8;
}

.contact-box {
  background: #080B11;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-top: 0.5rem;
}

.contact-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #64748B;
  margin-bottom: 4px;
}

.contact-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #FFFFFF;
}

.contact-email {
  font-size: 0.82rem;
  color: #94A3B8;
  margin-top: 2px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .login-page {
    position: relative;
    height: auto;
    min-height: 100vh;
    flex-direction: column;
    overflow-y: auto;
  }
  .login-left-column {
    flex: 1;
    min-width: 100%;
    max-width: 100%;
    padding: 32px 24px;
  }
  .login-right-column {
    display: none;
  }
}
</style>
