<script setup lang="ts">
import type { Component } from 'vue'

// props
defineProps<{
  icon?: Component
  text?: string
  classNames?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button type="button" :class="classNames" @click="emit('click')">
    <component :is="icon" v-if="icon" class="btn" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
