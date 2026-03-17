<template>
  <div class="field">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="field-wrap">
      <span v-if="prefix" class="field-prefix">{{ prefix }}</span>
      <input v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
        :class="['field-input', { 'has-prefix': prefix, 'has-suffix': suffix, 'is-error': error }]" />
      <span v-if="suffix" class="field-suffix">{{ suffix }}</span>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
defineProps({ label: String, modelValue: [String, Number], prefix: String, suffix: String, error: String, hint: String })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.field-wrap { position: relative; }
.field-input {
  width: 100%; height: 42px;
  padding: 0 14px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text-primary);
  font-size: 14px; font-family: var(--font); outline: none;
  transition: all var(--t);
}
.field-input::placeholder { color: var(--text-muted); }
.field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.field-input.is-error { border-color: var(--red); }
.field-input.has-prefix { padding-left: 38px; }
.field-input.has-suffix { padding-right: 38px; }
.field-prefix, .field-suffix {
  position: absolute; top: 50%; transform: translateY(-50%);
  font-size: 13px; color: var(--text-muted); pointer-events: none;
}
.field-prefix { left: 13px; }
.field-suffix { right: 13px; }
.field-error { font-size: 12px; color: var(--red); }
.field-hint  { font-size: 12px; color: var(--text-muted); }
</style>
