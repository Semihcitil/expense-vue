<template>
  <AppLayout>
    <div class="categories-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kategoriler</h1>
          <p class="page-sub">Gider kategorilerinizi özelleştirin</p>
        </div>
        <AppButton @click="openAdd">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          Yeni Kategori
        </AppButton>
      </div>

      <div v-if="loading" class="cats-grid">
        <div v-for="i in 8" :key="i" class="cat-skeleton">
          <div class="skeleton" style="width:52px;height:52px;border-radius:14px;"></div>
          <div style="display:flex;flex-direction:column;gap:6px;flex:1">
            <div class="skeleton" style="height:14px;width:60%;"></div>
            <div class="skeleton" style="height:11px;width:40%;"></div>
          </div>
        </div>
      </div>

      <div v-else class="cats-grid">
        <div v-for="(cat, i) in categories" :key="cat._id"
          class="cat-card" :style="{ animationDelay: i * 0.05 + 's' }">
          <div class="cat-color-bar" :style="{ background: cat.color }"></div>
          <div class="cat-icon-wrap" :style="{ background: cat.color + '20', border: '1px solid ' + cat.color + '30' }">
            <span class="cat-emoji">{{ cat.icon }}</span>
          </div>
          <div class="cat-info">
            <div class="cat-name">{{ cat.name }}</div>
            <div class="cat-badge" :class="cat.isDefault ? 'default' : 'custom'">
              {{ cat.isDefault ? 'Varsayılan' : 'Özel' }}
            </div>
          </div>
          <div class="cat-actions">
            <button class="cat-btn edit" @click="openEdit(cat)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button v-if="!cat.isDefault" class="cat-btn delete" @click="confirmDelete(cat)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add card -->
        <div class="cat-add-card" @click="openAdd">
          <div class="add-icon">+</div>
          <div class="add-label">Yeni Kategori</div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <AppModal v-model="modalOpen" :title="editItem ? 'Kategori Düzenle' : 'Yeni Kategori'" :width="460">
        <CategoryForm :initial="editItem" @saved="onSaved" @cancel="modalOpen = false" />
      </AppModal>

      <!-- Delete Modal -->
      <AppModal v-model="deleteModal" title="Kategoriyi Sil" :width="400}>
        <div class="delete-body">
          <div class="delete-icon">{{ deleteTarget?.icon }}</div>
          <p class="delete-text">
            <strong>{{ deleteTarget?.name }}</strong> kategorisini silmek istediğinizden emin misiniz?
            Bağlı giderler "Diğer" kategorisine taşınacak.
          </p>
          <div class="delete-actions">
            <AppButton variant="secondary" full @click="deleteModal = false">Vazgeç</AppButton>
            <AppButton variant="danger" full :loading="deleting" @click="deleteCategory">Evet, Sil</AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import CategoryForm from '@/components/ui/CategoryForm.vue'
import api from '@/services/api'

const categories = ref([])
const loading = ref(true)
const modalOpen = ref(false)
const deleteModal = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data
  } finally { loading.value = false }
}

const openAdd  = () => { editItem.value = null; modalOpen.value = true }
const openEdit = (c) => { editItem.value = c; modalOpen.value = true }
const confirmDelete = (c) => { deleteTarget.value = c; deleteModal.value = true }

const deleteCategory = async () => {
  deleting.value = true
  try {
    await api.delete(`/categories/${deleteTarget.value._id}`)
    deleteModal.value = false
    fetchCategories()
  } finally { deleting.value = false }
}

const onSaved = () => { modalOpen.value = false; fetchCategories() }
onMounted(fetchCategories)
</script>

<style scoped>
.categories-page { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; animation: fadeUp .4s ease; }
.page-title { font-size: 30px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.page-sub { font-size: 14px; color: var(--text-secondary); }

.cats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }

.cat-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 20px;
  display: flex; align-items: center; gap: 14px;
  position: relative; overflow: hidden;
  transition: all var(--t); animation: fadeUp .4s ease both;
}
.cat-card:hover { border-color: var(--border-med); transform: translateY(-2px); box-shadow: var(--shadow); }

.cat-color-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }

.cat-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cat-emoji { font-size: 24px; }
.cat-info  { flex: 1; min-width: 0; }
.cat-name  { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.cat-badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border-radius: 99px; display: inline-block;
}
.cat-badge.default { background: var(--accent-dim); color: var(--accent-light); }
.cat-badge.custom  { background: var(--green-dim); color: var(--green); }

.cat-actions { display: flex; gap: 6px; }
.cat-btn {
  width: 30px; height: 30px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--t); border: 1px solid var(--border);
}
.cat-btn.edit { background: var(--bg-hover); color: var(--text-secondary); }
.cat-btn.edit:hover { color: var(--accent-light); border-color: rgba(99,102,241,.3); background: var(--accent-dim); }
.cat-btn.delete { background: transparent; color: var(--text-muted); }
.cat-btn.delete:hover { color: var(--red); border-color: rgba(248,113,113,.3); background: var(--red-dim); }

.cat-skeleton {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 20px;
  display: flex; align-items: center; gap: 14px;
}

.cat-add-card {
  background: transparent; border: 2px dashed var(--border);
  border-radius: var(--r-lg); padding: 20px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer; transition: all var(--t); min-height: 100px;
  color: var(--text-muted);
}
.cat-add-card:hover { border-color: var(--accent); color: var(--accent-light); }
.add-icon  { font-size: 28px; line-height: 1; }
.add-label { font-size: 13px; font-weight: 600; }

.delete-body { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.delete-icon { font-size: 48px; }
.delete-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.delete-actions { display: flex; gap: 10px; width: 100%; margin-top: 8px; }
</style>
