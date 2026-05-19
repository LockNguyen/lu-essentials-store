<script setup lang="ts">
import { RouterLink } from 'vue-router'

import Sparky from '@/assets/sparky.jpeg'
</script>

<template>
  <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
    <div
      class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <RouterLink to="/" class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg border bg-card overflow-hidden transition-transform rotate-0 hover:rotate-12"
        >
          <img :src="Sparky" />
        </div>

        <p class="text-lg font-semibold">LU Essentials Store</p>
      </RouterLink>
    </div>
  </header>
</template>
