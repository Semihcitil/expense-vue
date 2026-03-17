<template>
  <button :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-full': full, 'btn-loading': loading }]"
    :disabled="disabled || loading" v-bind="$attrs" @click="$emit('click', $event)">
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  loading: Boolean,
  disabled: Boolean,
  full:    Boolean,
})
defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; font-family: var(--font); font-weight: 600;
  border-radius: var(--r-sm); border: 1px solid transparent;
  cursor: pointer; transition: all var(--t); white-space: nowrap;
  letter-spacing: -.1px;
}
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn-full { width: 100%; }

/* Sizes */
.btn-sm { font-size: 12px; padding: 6px 14px; height: 32px; }
.btn-md { font-size: 14px; padding: 0 18px; height: 40px; }
.btn-lg { font-size: 15px; padding: 0 24px; height: 48px; }

/* Variants */
.btn-primary {
  background: var(--accent); color: white;
  box-shadow: 0 0 0 0 var(--accent-glow);
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-light);
  box-shadow: 0 0 20px var(--accent-glow);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: var(--bg-hover); color: var(--text-primary);
  border-color: var(--border);
}
.btn-secondary:hover:not(:disabled) { border-color: var(--border-med); background: var(--bg-card); }

.btn-ghost {
  background: transparent; color: var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover:not(:disabled) { color: var(--text-primary); background: var(--bg-hover); }

.btn-danger {
  background: var(--red-dim); color: var(--red);
  border-color: rgba(248,113,113,.2);
}
.btn-danger:hover:not(:disabled) { background: rgba(248,113,113,.2); }

/* Spinner */
.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
</style>
