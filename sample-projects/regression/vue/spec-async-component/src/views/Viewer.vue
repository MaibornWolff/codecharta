<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const LazyForm = defineAsyncComponent(() => import('../components/Form.vue'))
</script>

<template>
  <LazyForm />
</template>
