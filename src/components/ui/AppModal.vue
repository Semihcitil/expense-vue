<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box" :style="{ maxWidth: width + 'px' }">
          <div v-if="title" class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('update:modelValue', false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ modelValue: Boolean, title: String, width: { default: 500 } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  width: 100%;
  background: var(--bg-card); border: 1px solid var(--border-med);
  border-radius: var(--r-xl); box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px 0;
}
.modal-title { font-size: 18px; font-weight: 700; letter-spacing: -.3px; }
.modal-close {
  width: 32px; height: 32px; border-radius: var(--r-sm);
  background: var(--bg-hover); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--t); cursor: pointer; border: 1px solid var(--border);
}
.modal-close:hover { color: var(--text-primary); border-color: var(--border-med); }
.modal-body { padding: 24px 28px 28px; }

/* Transition */
.modal-enter-active { animation: modalIn .25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { animation: modalIn .2s ease reverse; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(.94) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
