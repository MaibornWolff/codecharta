<script setup lang="ts">
import { format, item } from '../fmt'

const items = ['a', 'b']
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item">{{ format(item) }}</li>
  </ul>
</template>
