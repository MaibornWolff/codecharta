<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="creature-badge">{{ label }}</span>
</template>
