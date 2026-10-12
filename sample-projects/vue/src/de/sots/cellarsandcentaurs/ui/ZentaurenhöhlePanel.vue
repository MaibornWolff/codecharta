<script setup lang="ts">
import { Zentaurenhöhle } from '../domain/model/Zentaurenhöhle'

const lair = new Zentaurenhöhle(12)
</script>

<template>
  <section class="lair-panel" title="Größe der Höhle">
    <p>Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.</p>
    <p v-if="lair.istGepanzert()">gepanzert</p>
  </section>
</template>
