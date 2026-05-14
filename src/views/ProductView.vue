<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import FilterBar from '@/components/Filters.vue'
import ProductTable from '@/components/ProductTable.vue'
</script>

<template>
  <main>
    <h1>Products</h1>
    <FilterBar />
    <ProductTable />
  </main>
</template>

<style scoped>
</style>