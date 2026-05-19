<script setup lang="ts">
import type { Component } from 'vue'

// props
const props = defineProps<{
  icon?: Component
  text?: string
  type?: 'button' | 'reset' // submit will cause page refresh and should be handled explicitly
  classNames?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button :type="type" :class="classNames" @click="emit('click')">
    <component :is="icon" v-if="icon" class="btn" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
