<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="app-main">
      <div class="page-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.app-main {
  margin-left: 260px;
  flex: 1;
  min-height: 100vh;
  background: var(--bg-base);
}
.page-content {
  padding: 40px 48px;
  max-width: 1400px;
  animation: fadeUp .4s ease;
}
</style>
