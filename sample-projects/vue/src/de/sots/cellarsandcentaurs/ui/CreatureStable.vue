<script setup lang="ts">
import { ref } from 'vue'
import { CreatureFacade, CreatureUtil } from '../application'
import { CreatureService } from '../domain/service/CreatureService'
import { PersistedCreatures } from '../adapter/persistence/PersistedCreatures'
import { CreatureRepository } from '../adapter/persistence/CreatureRepository'
import { ArmorClass } from '../domain/model/ArmorClass'
import { Speed } from '../domain/model/Speed'
import type { Creature } from '../domain/model/Creature'
import type { CreatureType } from '../domain/model/CreatureType'
import CreatureList from './CreatureList.vue'
import CreatureForm from './CreatureForm.vue'

const facade = new CreatureFacade(new CreatureService(new PersistedCreatures(new CreatureRepository())))
const creatures = ref<Creature[]>([])
const stableName = CreatureFacade.STABLE_NAME

function onCreate(type: CreatureType, walkingSpeed: Speed): void {
  const creature = facade.create(type, walkingSpeed, new Speed(0), new Speed(0), new Speed(0), new Speed(0), new ArmorClass(10, 2), 25)
  creatures.value.push(creature)
}

function hoardOf(creature: Creature): number {
  return CreatureUtil.countHoard(creature)
}
</script>

<template>
  <section>
    <h2>{{ stableName }}</h2>
    <creature-form @create="onCreate" />
    <CreatureList :creatures="creatures" />
    <p v-for="creature in creatures" :key="creature.getId().id">Hoard: {{ hoardOf(creature) }}</p>
  </section>
</template>
