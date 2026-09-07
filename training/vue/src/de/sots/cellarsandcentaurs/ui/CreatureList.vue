<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import CreatureCard from './CreatureCard.vue'
import { Creature } from '../domain/model/Creature'

export default defineComponent({
  name: 'CreatureList',
  components: { CreatureCard },
  props: {
    creatures: {
      type: Array as PropType<Creature[]>,
      required: true
    }
  },
  computed: {
    lairCount(): number {
      return this.creatures.length
    }
  }
})
</script>

<template>
  <section>
    <p>{{ lairCount }} creatures in the lair</p>
    <ul>
      <li v-for="creature in creatures" :key="creature.getId().id">
        <CreatureCard :creature="creature" />
      </li>
    </ul>
  </section>
</template>
