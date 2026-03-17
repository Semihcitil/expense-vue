<template>
  <AppLayout>
    <div class="reports-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Raporlar</h1>
          <p class="page-sub">Harcama analizinizi keşfedin</p>
        </div>
        <div class="date-controls">
          <select v-model="selectedMonth" @change="fetchData" class="date-select">
            <option v-for="(m, i) in months" :key="i" :value="i+1">{{ m }}</option>
          </select>
          <select v-model="selectedYear" @change="fetchData" class="date-select">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid" v-if="!loading">
        <div class="summary-card accent">
          <div class="sc-label">{{ months[selectedMonth-1] }} {{ selectedYear }}</div>
          <div class="sc-value">{{ formatCurrency(monthly?.totalSpent) }}</div>
          <div class="sc-sub">{{ monthly?.expenseCount || 0 }} işlem</div>
        </div>
        <div class="summary-card">
          <div class="sc-label">{{ selectedYear }} Yıllık Toplam</div>
          <div class="sc-value">{{ formatCurrency(yearly?.yearTotal) }}</div>
          <div class="sc-sub">Tüm yıl</div>
        </div>
        <div class="summary-card">
          <div class="sc-label">Aylık Ortalama</div>
          <div class="sc-value">{{ formatCurrency(yearly?.avgMonthly) }}</div>
          <div class="sc-sub">{{ selectedYear }} yılı</div>
        </div>
      </div>
      <div v-else class="summary-grid">
        <div v-for="i in 3" :key="i" class="summary-card">
          <div class="skeleton" style="height:12px;width:60%;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:28px;width:80%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:11px;width:40%;"></div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Bar Chart - Monthly spending -->
        <div class="report-card wide">
          <div class="rc-header">
            <div class="rc-title">{{ selectedYear }} — Aylık Harcama</div>
            <div class="rc-sub">Her ayın toplam gideri</div>
          </div>
          <div class="bar-chart" v-if="yearly">
            <div class="bars-wrap">
              <div v-for="m in yearly.months" :key="m.month" class="bar-col">
                <div class="bar-value-label" v-if="m.total > 0">
                  {{ formatCompact(m.total) }}
                </div>
                <div class="bar-track">
                  <div class="bar-fill"
                    :class="{ active: m.month === selectedMonth }"
                    :style="{ height: getBarHeight(m.total) + '%' }">
                  </div>
                </div>
                <div class="bar-label" :class="{ active: m.month === selectedMonth }">{{ m.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie - Category breakdown -->
        <div class="report-card narrow">
          <div class="rc-header">
            <div class="rc-title">Kategori Dağılımı</div>
            <div class="rc-sub">{{ months[selectedMonth-1] }} {{ selectedYear }}</div>
          </div>
          <div v-if="monthly?.byCategory?.length" class="pie-wrap">
            <div class="pie-chart">
              <svg viewBox="0 0 100 100" class="pie-svg">
                <circle cx="50" cy="50" r="35" fill="none" stroke="var(--bg-hover)" stroke-width="14"/>
                <circle v-for="(seg, i) in pieSegments" :key="i"
                  cx="50" cy="50" r="35" fill="none"
                  :stroke="CHART_COLORS[i % CHART_COLORS.length]"
                  stroke-width="14" stroke-linecap="round"
                  :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                  :stroke-dashoffset="seg.offset"
                  style="transition: stroke-dasharray .6s ease"
                />
              </svg>
              <div class="pie-center">
                <div class="pie-total">{{ formatCompact(monthly.totalSpent) }}</div>
                <div class="pie-label">toplam</div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">Bu ay için veri yok</div>
        </div>
      </div>

      <!-- Category Detail Table -->
      <div class="report-card">
        <div class="rc-header">
          <div class="rc-title">Kategori Detayı</div>
          <div class="rc-sub">{{ months[selectedMonth-1] }} {{ selectedYear }} harcama dağılımı</div>
        </div>

        <div v-if="!monthly?.byCategory?.length" class="no-data-center">
          Seçilen ay için veri bulunamadı
        </div>

        <div v-else class="cat-table">
          <div v-for="(cat, i) in monthly.byCategory" :key="i" class="cat-row">
            <div class="cat-rank">#{{ i + 1 }}</div>
            <div class="cat-row-icon" :style="{ background: CHART_COLORS[i % CHART_COLORS.length] + '20' }">
              {{ cat.icon }}
            </div>
            <div class="cat-row-body">
              <div class="cat-row-name">{{ cat.category }}</div>
              <div class="cat-progress-track">
                <div class="cat-progress-fill"
                  :style="{ width: cat.percentage + '%', background: CHART_COLORS[i % CHART_COLORS.length] }">
                </div>
              </div>
            </div>
            <div class="cat-row-count">{{ cat.count }} işlem</div>
            <div class="cat-row-pct" :style="{ color: CHART_COLORS[i % CHART_COLORS.length] }">
              %{{ cat.percentage }}
            </div>
            <div class="cat-row-amount">{{ formatCurrency(cat.total) }}</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { formatCurrency, formatCompact } from '@/utils/formatters'
import api from '@/services/api'

const CHART_COLORS = ['#6366f1','#34d399','#f87171','#60a5fa','#fbbf24','#a78bfa','#f472b6','#22d3ee']

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear  = ref(now.getFullYear())
const loading = ref(true)
const monthly = ref(null)
const yearly  = ref(null)

const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
const years  = [now.getFullYear(), now.getFullYear()-1, now.getFullYear()-2]

const maxMonthly = computed(() => Math.max(...(yearly.value?.months?.map(m => m.total) || [1])))

const getBarHeight = (val) => {
  if (!maxMonthly.value) return 0
  return Math.max(4, (val / maxMonthly.value) * 100)
}

const pieSegments = computed(() => {
  if (!monthly.value?.byCategory?.length) return []
  const total = monthly.value.totalSpent
  const circumference = 2 * Math.PI * 35
  let offset = circumference * 0.25 // start from top

  return monthly.value.byCategory.slice(0, 6).map((cat, i) => {
    const pct = cat.total / total
    const dash = pct * circumference
    const gap  = circumference - dash
    const seg  = { dash, gap, offset }
    offset -= dash
    return seg
  })
})

const fetchData = async () => {
  loading.value = true
  try {
    const [mRes, yRes] = await Promise.all([
      api.get(`/reports/monthly?year=${selectedYear.value}&month=${selectedMonth.value}`),
      api.get(`/reports/yearly?year=${selectedYear.value}`),
    ])
    monthly.value = mRes.data.data
    yearly.value  = yRes.data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(fetchData)
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; animation: fadeUp .4s ease; }
.page-title { font-size: 30px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: var(--text-secondary); }

.date-controls { display: flex; gap: 10px; }
.date-select {
  height: 40px; padding: 0 14px; font-size: 13px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text-primary);
  font-family: var(--font); outline: none; cursor: pointer;
}

.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.summary-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 22px;
  animation: fadeUp .4s ease both;
}
.summary-card.accent { border-color: rgba(99,102,241,.3); background: var(--accent-dim); }
.sc-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .8px; font-weight: 600; margin-bottom: 8px; }
.sc-value { font-size: 26px; font-weight: 800; font-family: var(--mono); letter-spacing: -.5px; margin-bottom: 4px; }
.sc-sub   { font-size: 12px; color: var(--text-muted); }

.charts-row { display: grid; grid-template-columns: 1fr 280px; gap: 14px; }
.report-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 24px;
  animation: fadeUp .4s ease .1s both;
}
.rc-header { margin-bottom: 20px; }
.rc-title { font-size: 16px; font-weight: 700; letter-spacing: -.2px; margin-bottom: 3px; }
.rc-sub   { font-size: 12px; color: var(--text-muted); }

/* Bar Chart */
.bar-chart { padding-top: 8px; }
.bars-wrap { display: flex; align-items: flex-end; gap: 6px; height: 180px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.bar-value-label { font-size: 10px; color: var(--text-muted); font-family: var(--mono); }
.bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.bar-fill {
  width: 100%; border-radius: 4px 4px 0 0;
  background: var(--bg-hover); transition: height .6s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 4px;
}
.bar-fill.active { background: var(--accent); box-shadow: 0 0 12px var(--accent-glow); }
.bar-label { font-size: 10px; color: var(--text-muted); }
.bar-label.active { color: var(--accent-light); font-weight: 700; }

/* Pie */
.pie-wrap { display: flex; justify-content: center; align-items: center; padding: 16px 0; }
.pie-chart { position: relative; width: 160px; height: 160px; }
.pie-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.pie-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.pie-total { font-size: 18px; font-weight: 800; font-family: var(--mono); }
.pie-label { font-size: 11px; color: var(--text-muted); }
.no-data { padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px; }

/* Category Table */
.cat-table { display: flex; flex-direction: column; gap: 2px; }
.cat-row {
  display: grid; grid-template-columns: 32px 40px 1fr 80px 60px 140px;
  align-items: center; gap: 12px; padding: 12px 8px;
  border-radius: var(--r-sm); transition: background var(--t);
}
.cat-row:hover { background: var(--bg-hover); }
.cat-rank { font-size: 12px; color: var(--text-muted); font-family: var(--mono); text-align: center; }
.cat-row-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.cat-row-body { display: flex; flex-direction: column; gap: 6px; }
.cat-row-name { font-size: 14px; font-weight: 600; }
.cat-progress-track { height: 4px; background: var(--bg-hover); border-radius: 99px; overflow: hidden; }
.cat-progress-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
.cat-row-count { font-size: 12px; color: var(--text-muted); text-align: center; }
.cat-row-pct   { font-size: 13px; font-weight: 700; font-family: var(--mono); text-align: center; }
.cat-row-amount { font-size: 15px; font-weight: 700; font-family: var(--mono); text-align: right; }
.no-data-center { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }
</style>
