<script lang="ts">
import { format, label } from '../fmt'

export default {
  methods: { format }
}
</script>

<template>
  <span>{{ format(label) }}</span>
</template>
