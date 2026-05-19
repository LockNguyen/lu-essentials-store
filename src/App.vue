<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <!-- TODO: Add banner -->

      <nav>
        <RouterLink to="/">Products</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>
