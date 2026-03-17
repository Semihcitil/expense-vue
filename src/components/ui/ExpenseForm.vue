<template>
  <form @submit.prevent="handleSubmit" class="expense-form">
    <div v-if="error" class="form-error">{{ error }}</div>

    <!-- Brand Picker -->
    <div class="form-field">
      <label class="field-label">Marka / Firma</label>
      <BrandPicker v-model="form.brand" />
    </div>

    <!-- Auto-fill hint -->
    <Transition name="hint">
      <div v-if="form.brand" class="brand-hint">
        <img :src="getLogoUrl(form.brand.domain)" class="hint-logo"
          @error="e => e.target.style.display='none'" />
        <span>{{ form.brand.name }} seçildi</span>
        <span class="hint-cat">· {{ form.brand.category }}</span>
      </div>
    </Transition>

    <!-- Title -->
    <AppInput v-model="form.title" label="Başlık" placeholder="örn: Aylık Spotify aboneliği" required />

    <!-- Amount + Currency -->
    <div class="row-2">
      <AppInput v-model="form.amount" label="Tutar" type="number" step="0.01" min="0.01" placeholder="0.00" required />
      <div class="form-field">
        <label class="field-label">Para Birimi</label>
        <select v-model="form.currency" class="styled-select">
          <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Category + Date -->
    <div class="row-2">
      <div class="form-field">
        <label class="field-label">Kategori</label>
        <select v-model="form.category" class="styled-select" required>
          <option value="">Seçin...</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
        </select>
      </div>
      <AppInput v-model="form.date" label="Tarih" type="date" required />
    </div>

    <!-- Note -->
    <div class="form-field">
      <label class="field-label">Not <span class="optional">(opsiyonel)</span></label>
      <textarea v-model="form.note" placeholder="Açıklama..." class="styled-textarea" rows="2"></textarea>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <AppButton type="button" variant="secondary" full @click="$emit('cancel')">İptal</AppButton>
      <AppButton type="submit" full :loading="loading">
        {{ initial?._id ? 'Güncelle' : 'Gider Ekle' }}
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'
import BrandPicker from './BrandPicker.vue'
import { getLogoUrl } from '@/utils/brands'
import api from '@/services/api'

const props = defineProps({ initial: Object, categories: Array })
const emit = defineEmits(['saved', 'cancel'])

const currencies = ['TRY', 'USD', 'EUR', 'GBP']
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '', amount: '', currency: 'TRY',
  category: '', date: new Date().toISOString().split('T')[0],
  note: '', brand: null,
})

// If editing, populate form
watch(() => props.initial, (v) => {
  if (v) {
    form.value = {
      title: v.title || '',
      amount: v.amount || '',
      currency: v.currency || 'TRY',
      category: v.category?._id || v.category || '',
      date: v.date ? v.date.split('T')[0] : new Date().toISOString().split('T')[0],
      note: v.note || '',
      brand: v.brand || null,
    }
  } else {
    form.value = { title: '', amount: '', currency: 'TRY', category: '', date: new Date().toISOString().split('T')[0], note: '', brand: null }
  }
}, { immediate: true })

// Auto-fill title from brand
watch(() => form.value.brand, (brand) => {
  if (brand && !form.value.title) {
    form.value.title = brand.name
  }
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    const payload = { ...form.value }
    if (props.initial?._id) {
      await api.put(`/expenses/${props.initial._id}`, payload)
    } else {
      await api.post('/expenses', payload)
    }
    emit('saved')
  } catch (err) {
    error.value = err.response?.data?.error || 'Bir hata oluştu'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.expense-form { display: flex; flex-direction: column; gap: 16px; }

.form-error {
  background: var(--red-dim); border: 1px solid rgba(248,113,113,.25);
  border-radius: var(--r-sm); padding: 10px 14px;
  font-size: 13px; color: var(--red);
}

.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.optional { color: var(--text-muted); font-weight: 400; }

.brand-hint {
  display: flex; align-items: center; gap: 8px;
  background: var(--accent-dim); border: 1px solid rgba(99,102,241,.2);
  border-radius: var(--r-sm); padding: 8px 12px; font-size: 13px;
}
.hint-logo { width: 20px; height: 20px; object-fit: contain; border-radius: 4px; }
.hint-cat  { color: var(--text-muted); }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.styled-select {
  height: 42px; padding: 0 14px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text-primary);
  font-size: 14px; font-family: var(--font); outline: none;
  transition: all var(--t); cursor: pointer;
}
.styled-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }

.styled-textarea {
  width: 100%; padding: 10px 14px; resize: vertical; min-height: 72px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text-primary);
  font-size: 14px; font-family: var(--font); outline: none;
  transition: all var(--t); line-height: 1.6;
}
.styled-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.styled-textarea::placeholder { color: var(--text-muted); }

.form-actions { display: flex; gap: 10px; margin-top: 4px; }

.hint-enter-active, .hint-leave-active { transition: all .2s ease; }
.hint-enter-from, .hint-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
