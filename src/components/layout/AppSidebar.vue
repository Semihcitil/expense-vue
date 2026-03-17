<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-name">Finans</span>
        <span class="logo-sub">Gider Takip</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="nav-label">ANA MENÜ</div>
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item" :class="{ active: isActive(item.to) }">
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label-text">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom -->
    <div class="sidebar-bottom">
      <!-- Stats mini -->
      <div class="sidebar-stat">
        <div class="stat-label">Bu Ay</div>
        <div class="stat-value">{{ formatCurrency(monthlyTotal) }}</div>
      </div>

      <!-- User -->
      <div class="sidebar-user">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <div class="user-name">{{ auth.user?.name }}</div>
          <div class="user-email">{{ auth.user?.email }}</div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Çıkış">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils/formatters'
import api from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const monthlyTotal = ref(0)

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || 'U')

const isActive = (to) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/></svg>`
  },
  {
    to: '/expenses',
    label: 'Giderler',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    to: '/categories',
    label: 'Kategoriler',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    to: '/reports',
    label: 'Raporlar',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  },
]

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const res = await api.get('/reports/summary')
    monthlyTotal.value = res.data.data?.thisMonth || 0
  } catch {}
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.logo-icon {
  width: 36px; height: 36px;
  background: var(--accent);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 0 20px var(--accent-glow);
  flex-shrink: 0;
}

.logo-name { display: block; font-size: 16px; font-weight: 700; letter-spacing: -.3px; }
.logo-sub  { display: block; font-size: 11px; color: var(--text-secondary); margin-top: 1px; }

.sidebar-nav {
  padding: 20px 12px;
  flex: 1;
  overflow-y: auto;
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-muted);
  padding: 0 8px 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--t);
  margin-bottom: 2px;
  position: relative;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-item.active {
  color: var(--text-primary);
  background: var(--accent-dim);
  border: 1px solid rgba(99,102,241,.2);
}

.nav-item.active .nav-icon { color: var(--accent-light); }

.nav-icon { flex-shrink: 0; display: flex; }
.nav-label-text { flex: 1; }
.nav-badge {
  font-size: 11px; font-weight: 600;
  background: var(--accent); color: white;
  padding: 1px 6px; border-radius: 99px;
}

.sidebar-bottom {
  padding: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-stat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 12px 14px;
}
.stat-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; letter-spacing: .5px; text-transform: uppercase; }
.stat-value { font-size: 18px; font-weight: 700; font-family: var(--mono); color: var(--accent-light); }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
}
.user-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  flex-shrink: 0;
}
.user-info { flex: 1; min-width: 0; }
.user-name  { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-email { font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.logout-btn {
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  transition: all var(--t);
  display: flex;
}
.logout-btn:hover { color: var(--red); background: var(--red-dim); }
</style>
