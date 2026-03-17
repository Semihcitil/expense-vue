<template>
  <form @submit.prevent="handleSubmit" class="cat-form">
    <div v-if="error" class="form-error">{{ error }}</div>

    <!-- Preview -->
    <div class="preview-wrap">
      <div class="preview-icon" :style="{ background: form.color + '22', border: '2px solid ' + form.color + '44' }">
        {{ form.icon }}
      </div>
      <div class="preview-name">{{ form.name || 'Kategori Adı' }}</div>
    </div>

    <AppInput v-model="form.name" label="Kategori Adı" placeholder="örn: Spor & Fitness" required />

    <!-- Icon Grid -->
    <div class="form-field">
      <label class="field-label">İkon</label>
      <div class="icon-grid">
        <button v-for="icon in icons" :key="icon" type="button"
          class="icon-btn" :class="{ active: form.icon === icon }"
          @click="form.icon = icon">{{ icon }}</button>
      </div>
    </div>

    <!-- Color Palette -->
    <div class="form-field">
      <label class="field-label">Renk</label>
      <div class="color-grid">
        <button v-for="color in colors" :key="color" type="button"
          class="color-btn" :class="{ active: form.color === color }"
          :style="{ background: color }"
          @click="form.color = color">
          <svg v-if="form.color === color" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M20 6 9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="form-actions">
      <AppButton type="button" variant="secondary" full @click="$emit('cancel')">İptal</AppButton>
      <AppButton type="submit" full :loading="loading">
        {{ initial?._id ? 'Güncelle' : 'Oluştur' }}
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'
import api from '@/services/api'

const props = defineProps({ initial: Object })
const emit = defineEmits(['saved', 'cancel'])

const icons = ['🛒','🚌','💡','💊','🎬','👗','📚','📦','🏠','✈️','🍔','☕','🎮','💰','🐾','🎵','💪','🔧','🎓','🏥','🛵','🌐','📱','🎁','🏋️','🎯','🌮','🚗']
const colors = ['#6366f1','#34d399','#f87171','#60a5fa','#fbbf24','#a78bfa','#f472b6','#34d399','#fb923c','#22d3ee','#4ade80','#e879f9']

const loading = ref(false)
const error   = ref('')
const form    = ref({ name: '', icon: '📦', color: '#6366f1' })

watch(() => props.initial, v => {
  if (v) form.value = { name: v.name, icon: v.icon || '📦', color: v.color || '#6366f1' }
  else   form.value = { name: '', icon: '📦', color: '#6366f1' }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (props.initial?._id) await api.put(`/categories/${props.initial._id}`, form.value)
    else                     await api.post('/categories', form.value)
    emit('saved')
  } catch (err) {
    error.value = err.response?.data?.error || 'Bir hata oluştu'
  } finally { loading.value = false }
}
</script>

<style scoped>
.cat-form { display: flex; flex-direction: column; gap: 18px; }
.form-error { background: var(--red-dim); border: 1px solid rgba(248,113,113,.25); border-radius: var(--r-sm); padding: 10px 14px; font-size: 13px; color: var(--red); }
.form-field { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }

.preview-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px; background: var(--bg-input); border-radius: var(--r-lg);
  border: 1px solid var(--border);
}
.preview-icon {
  width: 72px; height: 72px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; transition: all var(--t);
}
.preview-name { font-size: 16px; font-weight: 700; color: var(--text-primary); }

.icon-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.icon-btn {
  width: 40px; height: 40px; border-radius: var(--r-sm); font-size: 20px;
  background: var(--bg-input); border: 1px solid var(--border);
  cursor: pointer; transition: all var(--t);
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { border-color: var(--border-med); background: var(--bg-hover); }
.icon-btn.active { border-color: var(--accent); background: var(--accent-dim); }

.color-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.color-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: all var(--t);
  display: flex; align-items: center; justify-content: center;
}
.color-btn:hover { transform: scale(1.15); }
.color-btn.active { border-color: white; box-shadow: 0 0 0 2px rgba(255,255,255,.3); }

.form-actions { display: flex; gap: 10px; margin-top: 4px; }
</style>
