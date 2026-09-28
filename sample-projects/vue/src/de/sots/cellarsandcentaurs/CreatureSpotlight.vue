<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const CreatureCard = defineAsyncComponent(() => import('./ui/CreatureCard.vue'))
</script>

<template>
  <section class="creature-spotlight">
    <CreatureCard v-if="$attrs.creature" :creature="$attrs.creature" />
  </section>
</template>
