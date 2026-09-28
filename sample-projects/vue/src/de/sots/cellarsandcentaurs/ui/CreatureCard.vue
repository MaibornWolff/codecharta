<script setup lang="ts">
import { computed } from 'vue'
import type { Creature } from '../domain/model/Creature'
import { HitPoints } from '../domain/model/HitPoints'
import { SpeedType } from '../domain/model/SpeedType'

const props = defineProps<{ creature: Creature }>()

const hitPoints = computed(() => props.creature.getHitPoints() ?? HitPoints.init(HitPoints.MAX_HIT_POINTS))
const walkingSpeed = computed(() => props.creature.getSpeeds().get(SpeedType.WALKING)?.getSpeed() ?? 0)
</script>

<template>
  <article class="creature-card">
    <h2>{{ props.creature.getId().id }}</h2>
    <CreatureBadge :label="props.creature.getType()" />
    <p>Hit points: {{ hitPoints.current }} / {{ hitPoints.max }}</p>
    <p>Walking speed: {{ walkingSpeed }}</p>
  </article>
</template>

<style scoped>
.creature-card {
  border: 1px solid #888;
  padding: 0.5rem;
}
</style>
