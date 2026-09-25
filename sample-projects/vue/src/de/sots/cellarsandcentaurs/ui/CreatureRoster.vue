<script lang="ts">
import { CreatureType } from '../domain/model/CreatureType'

export const ROSTER_TYPES = Object.values(CreatureType)
</script>

<script setup lang="ts">
import { HitPoints } from '../domain/model/HitPoints'

const fullHitPoints = HitPoints.init(HitPoints.MAX_HIT_POINTS)
</script>

<template>
  <ul>
    <li v-for="rosterType in ROSTER_TYPES" :key="rosterType">{{ rosterType }} ({{ fullHitPoints.max }})</li>
  </ul>
</template>
