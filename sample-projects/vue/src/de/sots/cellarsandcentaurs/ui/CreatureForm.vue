<script setup lang="ts">
import { ref } from 'vue'
import { CreatureType } from '@/de/sots/cellarsandcentaurs/domain/model/CreatureType'
import { Speed } from '@/de/sots/cellarsandcentaurs/domain/model/Speed'

const emit = defineEmits<{ create: [type: CreatureType, walkingSpeed: Speed] }>()

const selectedType = ref<CreatureType>(CreatureType.BEAST)
const walkingSpeed = ref(30)
const creatureTypes = Object.values(CreatureType)

function submit(): void {
  emit('create', selectedType.value, new Speed(walkingSpeed.value))
}
</script>

<template>
  <form @submit.prevent="submit">
    <label>
      Type
      <select v-model="selectedType">
        <option v-for="creatureType in creatureTypes" :key="creatureType" :value="creatureType">
          {{ creatureType }}
        </option>
      </select>
    </label>
    <label>
      Walking speed
      <input v-model.number="walkingSpeed" type="number" />
    </label>
    <button type="submit">Add to the stable</button>
  </form>
</template>
