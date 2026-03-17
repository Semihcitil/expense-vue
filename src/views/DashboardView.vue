<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Merhaba, {{ firstName }} 👋</h1>
          <p class="page-sub">{{ today }} · İşte finansal özetiniz</p>
        </div>
        <RouterLink to="/expenses">
          <AppButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            Gider Ekle
          </AppButton>
        </RouterLink>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid" v-if="!loading">
        <div v-for="(stat, i) in stats" :key="i" class="stat-card" :style="{ animationDelay: i * 0.07 + 's' }">
          <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
            <span v-html="stat.icon"></span>
          </div>
          <div class="stat-body">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div v-if="stat.change !== undefined" class="stat-change" :class="stat.change > 0 ? 'up' : 'down'">
              {{ stat.change > 0 ? '↑' : '↓' }} %{{ Math.abs(stat.change) }} geçen aya göre
            </div>
            <div v-else-if="stat.sub" class="stat-sub">{{ stat.sub }}</div>
          </div>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-else class="stats-grid">
        <div v-for="i in 4" :key="i" class="stat-card">
          <div class="skeleton" style="width:44px;height:44px;border-radius:12px;"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <div class="skeleton" style="height:12px;width:60%;"></div>
            <div class="skeleton" style="height:24px;width:80%;"></div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Area Chart -->
        <div class="chart-card wide">
          <div class="chart-header">
            <div>
              <div class="chart-title">Yıllık Harcama Trendi</div>
              <div class="chart-sub">{{ currentYear }} — aylık dağılım</div>
            </div>
            <div class="chart-total">{{ formatCurrency(yearlyTotal) }}</div>
          </div>
          <div class="chart-area" ref="areaChartRef"></div>
        </div>

        <!-- Top Category -->
        <div class="chart-card narrow">
          <div class="chart-header">
            <div class="chart-title">En Çok Harcama</div>
            <div class="chart-sub">Bu ay · Kategori</div>
          </div>
          <div class="top-category">
            <div v-if="summary?.topCategory" class="top-cat-name">
              <div class="top-cat-icon">📊</div>
              <div>
                <div class="top-cat-label">{{ summary.topCategory }}</div>
                <div class="top-cat-sub">Bu ayın lideri</div>
              </div>
            </div>
            <div v-else class="no-data">Henüz veri yok</div>
          </div>

          <!-- Change indicator -->
          <div v-if="summary?.changePercent !== null && summary?.changePercent !== undefined" class="change-indicator" :class="summary.changePercent > 0 ? 'negative' : 'positive'">
            <div class="change-icon">{{ summary.changePercent > 0 ? '📈' : '📉' }}</div>
            <div>
              <div class="change-value">{{ summary.changePercent > 0 ? '+' : '' }}%{{ summary.changePercent }}</div>
              <div class="change-label">Geçen aya göre</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="recent-card">
        <div class="recent-header">
          <div>
            <div class="chart-title">Son İşlemler</div>
            <div class="chart-sub">En son eklenen giderler</div>
          </div>
          <RouterLink to="/expenses" class="see-all">Tümünü gör →</RouterLink>
        </div>

        <div v-if="loading" class="transactions-list">
          <div v-for="i in 4" :key="i" class="transaction-skeleton">
            <div class="skeleton" style="width:42px;height:42px;border-radius:10px;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px">
              <div class="skeleton" style="height:13px;width:40%;"></div>
              <div class="skeleton" style="height:11px;width:25%;"></div>
            </div>
            <div class="skeleton" style="height:16px;width:80px;"></div>
          </div>
        </div>

        <div v-else-if="recentExpenses.length === 0" class="empty-state">
          <div class="empty-icon">💸</div>
          <div class="empty-text">Henüz gider eklenmemiş</div>
          <RouterLink to="/expenses">
            <AppButton size="sm">İlk gideri ekle</AppButton>
          </RouterLink>
        </div>

        <div v-else class="transactions-list">
          <div v-for="(exp, i) in recentExpenses" :key="exp._id"
            class="transaction-row" :style="{ animationDelay: i * 0.05 + 's' }">
            <!-- Brand logo or category icon -->
            <div class="tx-icon" :style="exp.brand ? { background: 'white', padding: '4px' } : { background: exp.category?.color + '22' }">
              <img v-if="exp.brand?.domain" :src="getLogoUrl(exp.brand.domain)"
                @error="e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }"
                class="tx-brand-logo" />
              <span :style="{ display: exp.brand?.domain ? 'none' : 'block' }">{{ exp.category?.icon || '📦' }}</span>
            </div>
            <div class="tx-body">
              <div class="tx-title">{{ exp.title }}</div>
              <div class="tx-meta">
                <span class="tx-category">{{ exp.category?.name || 'Kategorisiz' }}</span>
                <span class="tx-dot">·</span>
                <span class="tx-date">{{ formatRelativeDate(exp.date) }}</span>
              </div>
            </div>
            <div class="tx-amount">-{{ formatCurrency(exp.amount, exp.currency) }}</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatRelativeDate } from '@/utils/formatters'
import { getLogoUrl } from '@/utils/brands'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import api from '@/services/api'

const auth = useAuthStore()
const loading = ref(true)
const summary = ref(null)
const yearly = ref(null)
const recentExpenses = ref([])

const currentYear = new Date().getFullYear()
const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
const firstName = computed(() => auth.user?.name?.split(' ')[0] || '')
const yearlyTotal = computed(() => yearly.value?.yearTotal || 0)

const stats = computed(() => {
  if (!summary.value) return []
  return [
    {
      label: 'Bu Ay',
      value: formatCurrency(summary.value.thisMonth),
      sub: `${summary.value.thisMonthCount} işlem`,
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      iconBg: 'rgba(99,102,241,.15)', iconColor: 'var(--accent-light)',
      change: summary.value.changePercent
    },
    {
      label: 'Geçen Ay',
      value: formatCurrency(summary.value.lastMonth),
      sub: 'Karşılaştırma',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m19 9-5 5-4-4-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      iconBg: 'rgba(96,165,250,.15)', iconColor: 'var(--blue)',
    },
    {
      label: 'Toplam İşlem',
      value: summary.value.totalExpenseCount,
      sub: 'Tüm zamanlar',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      iconBg: 'rgba(251,191,36,.15)', iconColor: 'var(--yellow)',
    },
    {
      label: 'Tüm Zamanlar',
      value: formatCurrency(summary.value.totalAllTime),
      sub: 'Toplam harcama',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      iconBg: 'rgba(52,211,153,.15)', iconColor: 'var(--green)',
    },
  ]
})

onMounted(async () => {
  try {
    const [sumRes, yearRes, expRes] = await Promise.all([
      api.get('/reports/summary'),
      api.get(`/reports/yearly?year=${currentYear}`),
      api.get('/expenses?limit=6&sortBy=date&order=desc'),
    ])
    summary.value = sumRes.data.data
    yearly.value = yearRes.data.data
    recentExpenses.value = expRes.data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  animation: fadeUp .4s ease;
}
.page-title { font-size: 30px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.page-sub   { font-size: 14px; color: var(--text-secondary); }

/* Stat Cards */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.stat-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 20px;
  display: flex; align-items: flex-start; gap: 16px;
  animation: fadeUp .4s ease both;
  transition: all var(--t);
}
.stat-card:hover {
  border-color: var(--border-med);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.stat-body { flex: 1; min-width: 0; }
.stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .8px; font-weight: 600; margin-bottom: 6px; }
.stat-value { font-size: 22px; font-weight: 800; letter-spacing: -.5px; font-family: var(--mono); }
.stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.stat-change { font-size: 12px; margin-top: 4px; }
.stat-change.up   { color: var(--red); }
.stat-change.down { color: var(--green); }

/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }

.chart-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 24px;
  animation: fadeUp .4s ease .1s both;
  min-width: 0; /* İçeriğin taşmasını önler */
}

.chart-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px;
}
.chart-title { font-size: 16px; font-weight: 700; letter-spacing: -.2px; }
.chart-sub   { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
.chart-total { font-size: 20px; font-weight: 800; font-family: var(--mono); color: var(--accent-light); }
.chart-area  { height: 200px; width: 100%; position: relative; }

/* En Çok Harcama Kartı Detayları */
.top-category { display: flex; flex-direction: column; gap: 20px; margin-top: 8px; }
.top-cat-name { display: flex; align-items: center; gap: 14px; }
.top-cat-icon { font-size: 40px; }
.top-cat-label { font-size: 18px; font-weight: 700; }
.top-cat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.change-indicator {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; border-radius: var(--r-sm);
  border: 1px solid;
}
.change-indicator.positive { background: var(--green-dim); border-color: rgba(52,211,153,.2); }
.change-indicator.negative { background: var(--red-dim);   border-color: rgba(248,113,113,.2); }
.change-icon  { font-size: 24px; }
.change-value { font-size: 20px; font-weight: 800; font-family: var(--mono); }
.change-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.no-data { color: var(--text-muted); font-size: 14px; padding: 20px 0; text-align: center; }

/* Recent */
.recent-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); overflow: hidden;
  animation: fadeUp .4s ease .15s both;
}
.recent-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.see-all { font-size: 13px; color: var(--accent-light); font-weight: 600; transition: color var(--t); }
.see-all:hover { color: white; }

.transactions-list { display: flex; flex-direction: column; }
.transaction-row {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  transition: background var(--t);
  animation: fadeUp .3s ease both;
}
.transaction-row:last-child { border-bottom: none; }
.transaction-row:hover { background: var(--bg-hover); }

/* Transaction Details */
.tx-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0; overflow: hidden;
}
.tx-brand-logo { width: 34px; height: 34px; object-fit: contain; }
.tx-body { flex: 1; min-width: 0; }
.tx-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-meta  { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
.tx-amount { font-size: 15px; font-weight: 700; font-family: var(--mono); color: var(--red); flex-shrink: 0; }

/* ── RESPONSIVE DÜZENLEMELERİ ── */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .page-title { font-size: 24px; }
  
  .stats-grid { grid-template-columns: 1fr; }
  
  .chart-card { padding: 16px; }
  .chart-header { flex-direction: column; gap: 8px; }
  .chart-total { font-size: 18px; }

  .transaction-row { padding: 12px 16px; }
  .tx-amount { font-size: 14px; }
}
</style>