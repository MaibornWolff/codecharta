<script lang="js">
import { SpeedType } from '../domain/model/SpeedType'

export default {
  name: 'CreatureNote',
  data() {
    return { noteSpeedType: SpeedType.FLYING }
  }
}
</script>

<template>
  <p>Fastest when {{ noteSpeedType }}</p>
</template>
