<template>
  <div class="brand-picker">
    <!-- Selected Brand Display -->
    <div class="selected-brand" @click="open = !open">
      <div class="brand-preview">
        <img v-if="selected?.domain" :src="getLogoUrl(selected.domain)"
          @error="e => e.target.style.display='none'"
          class="brand-logo" />
        <div v-else class="brand-placeholder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <span class="selected-name">{{ selected?.name || 'Marka seçin (opsiyonel)' }}</span>
      <svg class="chevron" :class="{ rotated: open }" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="open" class="brand-dropdown" ref="dropdownRef">
        <!-- Search -->
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="search-icon">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input v-model="query" ref="searchInput" placeholder="Marka ara..." class="search-input" @click.stop />
        </div>

        <!-- Clear option -->
        <div class="brand-option clear-option" @click="selectBrand(null)">
          <div class="option-icon">✕</div>
          <span>Markasız</span>
        </div>

        <!-- Results -->
        <div class="brands-grid">
          <div v-for="brand in filteredBrands" :key="brand.domain"
            class="brand-option" :class="{ active: selected?.domain === brand.domain }"
            @click="selectBrand(brand)">
            <div class="option-logo-wrap" :style="{ '--brand-color': brand.color }">
              <img :src="getLogoUrl(brand.domain)"
                @error="e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }"
                class="option-logo" />
              <div class="option-logo-fallback" :style="{ background: brand.color + '22', color: brand.color }">
                {{ brand.name[0] }}
              </div>
            </div>
            <span class="option-name">{{ brand.name }}</span>
          </div>
        </div>

        <!-- No results -->
        <div v-if="filteredBrands.length === 0" class="no-results">
          Marka bulunamadı
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BRANDS, getLogoUrl, searchBrands } from '@/utils/brands'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const selected = ref(props.modelValue || null)
const searchInput = ref(null)
const dropdownRef = ref(null)

const filteredBrands = computed(() => searchBrands(query.value))

const selectBrand = (brand) => {
  selected.value = brand
  emit('update:modelValue', brand)
  open.value = false
  query.value = ''
}

watch(() => props.modelValue, v => { selected.value = v })

watch(open, async (v) => {
  if (v) {
    await nextTick()
    searchInput.value?.focus()
  }
})

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) &&
      !e.target.closest('.selected-brand')) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.brand-picker { position: relative; }

.selected-brand {
  display: flex; align-items: center; gap: 10px;
  height: 42px; padding: 0 14px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--r-sm); cursor: pointer;
  transition: all var(--t);
}
.selected-brand:hover { border-color: var(--border-med); }

.brand-preview {
  width: 24px; height: 24px;
  border-radius: 6px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-hover); flex-shrink: 0;
}
.brand-logo { width: 24px; height: 24px; object-fit: contain; }
.brand-placeholder { color: var(--text-muted); display: flex; }
.selected-name { flex: 1; font-size: 14px; color: var(--text-secondary); }

.chevron { color: var(--text-muted); transition: transform var(--t); flex-shrink: 0; }
.chevron.rotated { transform: rotate(180deg); }

.brand-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  background: var(--bg-card); border: 1px solid var(--border-med);
  border-radius: var(--r); box-shadow: var(--shadow-lg);
  z-index: 200; overflow: hidden;
  max-height: 360px; display: flex; flex-direction: column;
}

.search-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.search-icon { color: var(--text-muted); flex-shrink: 0; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 13px; color: var(--text-primary); font-family: var(--font);
}
.search-input::placeholder { color: var(--text-muted); }

.clear-option {
  padding: 8px 14px; border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.brands-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 4px; padding: 8px; overflow-y: auto;
}

.brand-option {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: var(--r-sm);
  cursor: pointer; transition: all var(--t);
  font-size: 13px; color: var(--text-secondary);
}
.brand-option:hover { background: var(--bg-hover); color: var(--text-primary); }
.brand-option.active { background: var(--accent-dim); color: var(--text-primary); }
.brand-option.clear-option { grid-column: 1/-1; }

.option-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--bg-hover); display: flex; align-items: center;
  justify-content: center; font-size: 12px; color: var(--text-muted);
  flex-shrink: 0;
}

.option-logo-wrap {
  width: 28px; height: 28px; border-radius: 6px;
  overflow: hidden; position: relative; flex-shrink: 0;
  background: white;
}
.option-logo { width: 28px; height: 28px; object-fit: contain; }
.option-logo-fallback {
  width: 28px; height: 28px; border-radius: 6px;
  display: none; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  position: absolute; top: 0; left: 0;
}
.option-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.no-results { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }

/* Dropdown animation */
.dropdown-enter-active, .dropdown-leave-active { transition: all .2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
