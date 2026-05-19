<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'

const { isLoading = false, class: className = 'w-full' } = defineProps({
  isLoading: Boolean,
  class: String,
})
</script>

<template>
  <div class="relative" :class="className">
    <slot />

    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex min-h-full w-full items-center justify-center rounded-md bg-background/65 backdrop-blur-[1px]"
      role="status"
      aria-label="Loading"
    >
      <LoaderCircle class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  </div>
</template>
