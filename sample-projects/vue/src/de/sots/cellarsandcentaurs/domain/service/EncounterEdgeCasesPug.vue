<script setup lang="ts">
import { ref } from 'vue'
import { SpeedType } from '../model/SpeedType'
import CreatureBadge from '../../ui/CreatureBadge.vue'

const burrowingSpeed = ref(SpeedType.BURROWING)
</script>

<template lang="pug">
//- pug comment: the burrowing beast digs a lair
section.pug-lair
  h1 Burrowing beast
  p(v-if="burrowingSpeed === 'burrowing'") Digging towards the hoard
  p(v-else) Resting in the stable
  CreatureBadge(:label="burrowingSpeed ? 'fast' : 'slow'")
</template>
