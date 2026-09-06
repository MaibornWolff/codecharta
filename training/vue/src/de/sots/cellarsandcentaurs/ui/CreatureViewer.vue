<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import CreatureList from './CreatureList.vue'

defineProps<{ creatures: unknown[] }>()

const CreatureForm = defineAsyncComponent(() => import('./CreatureForm.vue'))
</script>

<template>
  <section>
    <component :is="CreatureList" :creatures="creatures" />
    <CreatureForm />
  </section>
</template>
