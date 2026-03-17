<template>
  <AppLayout>
    <div class="expenses-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Giderler</h1>
          <p class="page-sub">Tüm harcamalarınızı yönetin</p>
        </div>
        <AppButton @click="openAdd">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          Yeni Gider
        </AppButton>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input v-model="filters.search" placeholder="Gider ara..." class="search-input" @input="debouncedFetch" />
        </div>
        <select v-model="filters.category" @change="fetchExpenses" class="filter-select">
          <option value="">Tüm kategoriler</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
        </select>
        <input v-model="filters.startDate" @change="fetchExpenses" type="date" class="filter-select" />
        <input v-model="filters.endDate" @change="fetchExpenses" type="date" class="filter-select" />
        <button v-if="hasFilters" @click="clearFilters" class="clear-filters">✕ Temizle</button>
      </div>

      <!-- Summary Strip -->
      <div v-if="meta.total" class="summary-strip">
        <span>{{ meta.total }} gider</span>
        <span class="strip-sep">·</span>
        <span class="strip-total">{{ formatCurrency(pageTotal) }}</span>
        <span class="strip-sep">·</span>
        <span>Bu sayfada {{ expenses.length }} kayıt</span>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-head">
          <span>İşlem</span>
          <span>Kategori</span>
          <span>Tarih</span>
          <span class="align-right">Tutar</span>
          <span></span>
        </div>

        <!-- Loading -->
        <div v-if="loading">
          <div v-for="i in 6" :key="i" class="table-skeleton">
            <div style="display:flex;align-items:center;gap:12px">
              <div class="skeleton" style="width:42px;height:42px;border-radius:10px;flex-shrink:0;"></div>
              <div style="display:flex;flex-direction:column;gap:6px">
                <div class="skeleton" style="height:13px;width:160px;"></div>
                <div class="skeleton" style="height:11px;width:100px;"></div>
              </div>
            </div>
            <div class="skeleton" style="height:24px;width:90px;border-radius:99px;"></div>
            <div class="skeleton" style="height:13px;width:80px;"></div>
            <div class="skeleton" style="height:16px;width:90px;margin-left:auto;"></div>
            <div></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="expenses.length === 0" class="table-empty">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">Gider bulunamadı</div>
          <div class="empty-sub">Farklı filtreler deneyin veya yeni gider ekleyin</div>
        </div>

        <!-- Rows -->
        <TransitionGroup v-else name="row" tag="div">
          <div v-for="(exp, i) in expenses" :key="exp._id" class="table-row"
            :style="{ animationDelay: i * 0.04 + 's' }">

            <!-- Title + Brand -->
            <div class="row-title-cell">
              <div class="row-icon" :style="getBrandStyle(exp)">
                <img v-if="exp.brand?.domain" :src="getLogoUrl(exp.brand.domain)"
                  @error="e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }"
                  class="row-brand-logo" />
                <span :style="{ display: exp.brand?.domain ? 'none' : 'block' }">{{ exp.category?.icon || '📦' }}</span>
              </div>
              <div>
                <div class="row-title">{{ exp.title }}</div>
                <div v-if="exp.brand?.name" class="row-brand-name">{{ exp.brand.name }}</div>
                <div v-else-if="exp.note" class="row-note">{{ exp.note }}</div>
              </div>
            </div>

            <!-- Category -->
            <div>
              <span class="category-chip" :style="{ background: exp.category?.color + '18', color: exp.category?.color || 'var(--text-secondary)', border: '1px solid ' + (exp.category?.color || '#fff') + '25' }">
                {{ exp.category?.icon }} {{ exp.category?.name || 'Kategorisiz' }}
              </span>
            </div>

            <!-- Date -->
            <div class="row-date">{{ formatDateShort(exp.date) }}</div>

            <!-- Amount -->
            <div class="row-amount">{{ formatCurrency(exp.amount, exp.currency) }}</div>

            <!-- Actions -->
            <div class="row-actions">
              <button class="action-btn edit" @click="openEdit(exp)" title="Düzenle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="action-btn delete" @click="confirmDelete(exp)" title="Sil">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="pagination">
          <span class="page-info">Sayfa {{ page }} / {{ meta.totalPages }}</span>
          <div class="page-btns">
            <AppButton variant="secondary" size="sm" :disabled="page === 1" @click="page--; fetchExpenses()">← Önceki</AppButton>
            <AppButton variant="secondary" size="sm" :disabled="page === meta.totalPages" @click="page++; fetchExpenses()">Sonraki →</AppButton>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <AppModal v-model="modalOpen" :title="editItem ? 'Gider Düzenle' : 'Yeni Gider'" :width="560">
        <ExpenseForm :initial="editItem" :categories="categories" @saved="onSaved" @cancel="modalOpen = false" />
      </AppModal>

      <!-- Delete Confirm -->
      <AppModal v-model="deleteModal" title="Gideri Sil" :width="400">
        <div class="delete-body">
          <div class="delete-icon">🗑️</div>
          <p class="delete-text">
            <strong>{{ deleteTarget?.title }}</strong> giderini silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </p>
          <div class="delete-actions">
            <AppButton variant="secondary" full @click="deleteModal = false">Vazgeç</AppButton>
            <AppButton variant="danger" full :loading="deleting" @click="deleteExpense">Evet, Sil</AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ExpenseForm from '@/components/ui/ExpenseForm.vue'
import { formatCurrency, formatDateShort } from '@/utils/formatters'
import { getLogoUrl } from '@/utils/brands'
import api from '@/services/api'

const expenses = ref([])
const categories = ref([])
const loading = ref(true)
const page = ref(1)
const meta = ref({})
const filters = ref({ search: '', category: '', startDate: '', endDate: '' })
const modalOpen = ref(false)
const deleteModal = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

const hasFilters = computed(() => Object.values(filters.value).some(v => v))
const pageTotal = computed(() => expenses.value.reduce((s, e) => s + e.amount, 0))

let debounceTimer = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchExpenses, 350)
}

const fetchExpenses = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 10 })
    if (filters.value.search) params.set('search', filters.value.search)
    if (filters.value.category) params.set('category', filters.value.category)
    if (filters.value.startDate) params.set('startDate', filters.value.startDate)
    if (filters.value.endDate) params.set('endDate', filters.value.endDate)
    const res = await api.get(`/expenses?${params}`)
    expenses.value = res.data.data
    meta.value = res.data.meta || {}
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const clearFilters = () => {
  filters.value = { search: '', category: '', startDate: '', endDate: '' }
  page.value = 1
  fetchExpenses()
}

const getBrandStyle = (exp) => {
  if (exp.brand?.domain) return { background: 'white', padding: '4px' }
  return { background: (exp.category?.color || '#6366f1') + '20' }
}

const openAdd = () => { editItem.value = null; modalOpen.value = true }
const openEdit = (exp) => { editItem.value = exp; modalOpen.value = true }
const confirmDelete = (exp) => { deleteTarget.value = exp; deleteModal.value = true }

const deleteExpense = async () => {
  deleting.value = true
  try {
    await api.delete(`/expenses/${deleteTarget.value._id}`)
    deleteModal.value = false
    fetchExpenses()
  } catch (e) { console.error(e) }
  finally { deleting.value = false }
}

const onSaved = () => { modalOpen.value = false; fetchExpenses() }

onMounted(async () => {
  await fetchExpenses()
  const catRes = await api.get('/categories')
  categories.value = catRes.data.data
})
</script>

<style scoped>
.expenses-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; animation: fadeUp .4s ease; }
.page-title { font-size: 30px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: var(--text-secondary); }

.filters-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  animation: fadeUp .4s ease .05s both;
}
.search-box {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 0 14px; height: 40px;
  flex: 1; min-width: 200px; transition: border-color var(--t);
  color: var(--text-muted);
}
.search-box:focus-within { border-color: var(--accent); color: var(--accent); }
.search-input { background: none; border: none; outline: none; font-size: 14px; color: var(--text-primary); font-family: var(--font); width: 100%; }
.search-input::placeholder { color: var(--text-muted); }
.filter-select {
  height: 40px; padding: 0 14px; font-size: 13px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text-primary);
  font-family: var(--font); outline: none; cursor: pointer;
  transition: border-color var(--t);
}
.filter-select:focus { border-color: var(--accent); }
.clear-filters {
  font-size: 13px; color: var(--text-muted); padding: 0 12px; height: 40px;
  border-radius: var(--r-sm); border: 1px solid var(--border);
  background: transparent; cursor: pointer; transition: all var(--t);
}
.clear-filters:hover { color: var(--red); border-color: rgba(248,113,113,.3); }

.summary-strip {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--text-muted);
  padding: 10px 16px; background: var(--bg-elevated);
  border: 1px solid var(--border); border-radius: var(--r-sm);
}
.strip-sep   { opacity: .3; }
.strip-total { font-weight: 700; font-family: var(--mono); color: var(--text-primary); }

.table-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); overflow: hidden;
  animation: fadeUp .4s ease .1s both;
}
.table-head {
  display: grid; grid-template-columns: 1fr 160px 110px 130px 80px;
  padding: 12px 20px; border-bottom: 1px solid var(--border);
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  letter-spacing: 1px; text-transform: uppercase;
}
.align-right { text-align: right; }

.table-row {
  display: grid; grid-template-columns: 1fr 160px 110px 130px 80px;
  padding: 14px 20px; align-items: center;
  border-bottom: 1px solid var(--border); transition: background var(--t);
  animation: fadeUp .3s ease both;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg-hover); }
.table-skeleton { display: grid; grid-template-columns: 1fr 160px 110px 130px 80px; padding: 14px 20px; align-items: center; border-bottom: 1px solid var(--border); }

.row-title-cell { display: flex; align-items: center; gap: 12px; }
.row-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0; overflow: hidden;
}
.row-brand-logo { width: 34px; height: 34px; object-fit: contain; }
.row-title { font-size: 14px; font-weight: 600; }
.row-brand-name { font-size: 12px; color: var(--accent-light); margin-top: 2px; }
.row-note  { font-size: 12px; color: var(--text-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }

.category-chip {
  font-size: 12px; font-weight: 600; padding: 4px 10px;
  border-radius: 99px; white-space: nowrap;
}
.row-date   { font-size: 13px; color: var(--text-secondary); font-family: var(--mono); }
.row-amount { font-size: 15px; font-weight: 700; font-family: var(--mono); color: var(--text-primary); text-align: right; }
.row-actions { display: flex; justify-content: flex-end; gap: 6px; }

.action-btn {
  width: 30px; height: 30px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--t); border: 1px solid var(--border);
}
.action-btn.edit { background: var(--bg-hover); color: var(--text-secondary); }
.action-btn.edit:hover { color: var(--accent-light); border-color: rgba(99,102,241,.3); background: var(--accent-dim); }
.action-btn.delete { background: transparent; color: var(--text-muted); }
.action-btn.delete:hover { color: var(--red); border-color: rgba(248,113,113,.3); background: var(--red-dim); }

.pagination {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; border-top: 1px solid var(--border);
}
.page-info { font-size: 13px; color: var(--text-muted); }
.page-btns { display: flex; gap: 8px; }

.table-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 60px; color: var(--text-muted);
}
.empty-icon  { font-size: 40px; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text-secondary); }
.empty-sub   { font-size: 13px; }

.delete-body { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.delete-icon { font-size: 48px; }
.delete-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.delete-actions { display: flex; gap: 10px; width: 100%; margin-top: 8px; }

/* Row transition */
.row-enter-active, .row-leave-active { transition: all .25s ease; }
.row-enter-from { opacity: 0; transform: translateY(-8px); }
.row-leave-to   { opacity: 0; transform: translateX(20px); }
</style>
