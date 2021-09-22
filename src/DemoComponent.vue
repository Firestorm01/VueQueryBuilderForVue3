<template>
  <input v-model="value" />
</template>

<script lang="ts" setup>
defineProps({
  value: String
})
</script>