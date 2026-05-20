<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

import NavBar from './components/uiElements/NavBar.vue'
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
    <NavBar class="shrink-0" />

    <main class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>

    <Toaster position="bottom-left" rich-colors class="z-100" />
  </div>
</template>
