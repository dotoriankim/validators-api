<script setup lang="ts">
import { createIdenticon } from 'identicons-esm'

const { address, logo: _logo, name } = defineProps<{ logo?: string | undefined, address: string, name: string }>()
const logo = computed(() => _logo || createIdenticon(address, { format: 'image/svg+xml' }))
</script>

<template>
  <NuxtImg :src="logo" object-contain :alt="name" />
</template>
