<!-- Edge cases for the three parsers: one function or block per construct. -->
<script lang="ts">
import { defineComponent } from 'vue'
import { CreatureType } from '../model/CreatureType'

/** Options API half of the component. */
export default defineComponent({
  name: 'EncounterEdgeCases',
  data() {
    return { treasureChest: 3, lairName: 'dragon lair' }
  },
  computed: {
    // computed getter as object-literal method with one ternary
    hoardSize(): number {
      return this.treasureChest > 2 ? 10 : 1
    }
  },
  watch: {
    // watcher as object-literal method with one if
    treasureChest(newAmount: number, oldAmount: number) {
      if (newAmount < oldAmount) {
        this.lairName = 'plundered lair'
      }
    }
  },
  methods: {
    // method shorthand with one ||
    isPlundered(): boolean {
      return this.treasureChest === 0 || this.lairName === ''
    },
    // property holding a function expression
    refill: function (amount: number) {
      this.treasureChest += amount
    },
    // property holding an arrow function
    monstrosityType: () => CreatureType.MONSTROSITY
  }
})
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Creature } from '../model/Creature'
import { HitPoints } from '../model/HitPoints'
import EncounterResolver from './EncounterResolver.vue'

const props = defineProps<{ creatures: Creature[]; terrain?: string }>()
const emit = defineEmits<{ (event: 'resolved', damage: number): void }>()

const dungeonDepth = ref(1)

// optional chaining and null-coalescing: no branch by the counting rule
const firstHitPoints = (creature?: Creature): number => creature?.getHitPoints()?.current ?? 0

// arrow function assigned to const, block body, one if
const isWounded = (creature: Creature): boolean => {
  if (firstHitPoints(creature) < HitPoints.MAX_HIT_POINTS) {
    return true
  }
  return false
}

// function expression assigned to const
const lairDepth = function (levels: number): number {
  return levels * 2
}

// default and rest parameters
function gatherTreasure(base: number = 1, ...hoards: number[]): number {
  return hoards.reduce((sum, hoard) => sum + hoard, base)
}

// async / await with try / catch
async function awaitEncounter(delay: number): Promise<number> {
  try {
    await new Promise((resolve) => setTimeout(resolve, delay))
    return delay
  } catch {
    return 0
  }
}

// generator with for ... of
function* wanderingCentaurs(creatures: Creature[]): Generator<Creature> {
  for (const creature of creatures) {
    yield creature
  }
}

// do ... while and a labelled break
function descend(steps: number): number {
  let depth = 0
  outer: do {
    depth += 1
    for (let step = 0; step < steps; step++) {
      if (step > depth) {
        break outer
      }
    }
  } while (depth < steps)
  return depth
}

// switch with fallthrough: two cases, one default
function terrainBonus(terrain: string): number {
  switch (terrain) {
    case 'cellar':
    case 'dungeon':
      return 2
    default:
      return 0
  }
}

// comment markers inside strings and a multi-line template literal
function stableBanner(): string {
  const url = 'https://cellars.example/stable' // real trailing comment
  const fake = '/* not a comment */'
  return `stable:
    // not a comment either
    ${url} ${fake}`
}

// logical assignment operators
function applyBonus(bonus: number | undefined, armor: number): number {
  bonus ??= 0
  armor ||= 10
  armor &&= armor + bonus
  return armor
}

// composition API callbacks
const woundedCount = computed(() => props.creatures.filter((creature) => isWounded(creature)).length)

watch(dungeonDepth, (depth) => {
  if (depth > 3) {
    emit('resolved', depth)
  }
})

const resolverComponent = EncounterResolver
</script>

<template>
  <!-- Template half: the wandering centaur guards the treasure hoard. -->
  <section class="encounter-edge-cases" :class="woundedCount > 0 ? 'wounded' : 'rested'">
    <h1>Encounter in the dragon lair</h1>
    <p v-if="props.creatures.length === 0">The cellar is empty</p>
    <p v-else-if="props.creatures.length === 1">A lonely beast roams the cellar</p>
    <p v-else>The stable is crowded</p>
    <ul>
      <li v-for="creature in props.creatures" :key="creature.getId().id">
        {{ isWounded(creature) ? 'wounded' : 'healthy' }}
        {{ creature.getArmorClass() && terrainBonus(props.terrain ?? 'cellar') }}
      </li>
    </ul>
    <p v-show="dungeonDepth > 1 || hoardSize > 1">Initiative: {{ dungeonDepth }}</p>
    <button :disabled="isPlundered() || woundedCount > 3" @click="dungeonDepth > 2 ? refill(1) : descend(dungeonDepth)">
      Roll the dice
    </button>
    <!--
      <p>commented-out markup with speed and damage</p>
    -->
    <component :is="resolverComponent" />
  </section>
</template>

<style scoped>
/* the lair is dark */
.encounter-edge-cases {
  background: url(https://cellars.example/dungeon.png);
  color: #333; /* trailing style comment */
  /*
   * a block comment over
   * several style lines
   */
  padding: 1rem;
}
.wounded {
  color: red;
}
</style>
