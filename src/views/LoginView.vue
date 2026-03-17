<template>
  <div class="auth-page">
    <!-- Background glow -->
    <div class="bg-glow"></div>

    <div class="auth-container">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="logo-name">Finans</div>
          <div class="logo-sub">Akıllı Gider Takibi</div>
        </div>
      </div>

      <!-- Card -->
      <div class="auth-card">
        <div class="auth-card-header">
          <h1 class="auth-title">Hoş geldiniz</h1>
          <p class="auth-desc">Hesabınıza giriş yapın</p>
        </div>

        <div v-if="error" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <AppInput v-model="form.email" label="E-posta" type="email"
            placeholder="ornek@email.com" required />
          <AppInput v-model="form.password" label="Şifre" type="password"
            placeholder="••••••••" required />
          <AppButton type="submit" :loading="loading" full size="lg">
            Giriş Yap →
          </AppButton>
        </form>

        <div class="auth-footer">
          Hesabınız yok mu?
          <RouterLink to="/register" class="auth-link">Kayıt olun</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Giriş başarısız. Bilgilerinizi kontrol edin.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-base); padding: 24px;
  position: relative; overflow: hidden;
}

.bg-glow {
  position: absolute;
  top: -200px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%);
  pointer-events: none;
}

.auth-container {
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column;
  align-items: center; gap: 32px;
  animation: fadeUp .5s ease;
}

.auth-logo {
  display: flex; align-items: center; gap: 14px;
}
.logo-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 40px var(--accent-glow);
}
.logo-name { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.logo-sub  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

.auth-card {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-med);
  border-radius: var(--r-xl);
  padding: 36px;
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.05);
}

.auth-card-header { margin-bottom: 28px; }
.auth-title { font-size: 26px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 6px; }
.auth-desc  { font-size: 14px; color: var(--text-secondary); }

.error-banner {
  display: flex; align-items: center; gap: 8px;
  background: var(--red-dim); border: 1px solid rgba(248,113,113,.25);
  border-radius: var(--r-sm); padding: 12px 14px;
  font-size: 13px; color: var(--red); margin-bottom: 20px;
}

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.auth-footer {
  text-align: center; margin-top: 24px;
  font-size: 14px; color: var(--text-secondary);
}
.auth-link {
  color: var(--accent-light); font-weight: 600; margin-left: 4px;
  transition: color var(--t);
}
.auth-link:hover { color: white; }
</style>
