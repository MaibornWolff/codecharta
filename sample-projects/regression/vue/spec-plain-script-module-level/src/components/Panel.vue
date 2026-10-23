<script lang="ts">
import { register } from '../registry'

const size = 3

register('panel')

export default {
  data() {
    return { size }
  }
}
</script>

<template>
  <div>panel</div>
</template>
