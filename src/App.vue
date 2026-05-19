<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavBar from './components/uiElements/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <NavBar />

    <main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
