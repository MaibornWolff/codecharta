<template>
  <span :title="defaults.size">{{ format(date) }}</span>
</template>

<script setup lang="ts">
import { defaults, format, unused } from '../fmt'

const date = new Date()
</script>
