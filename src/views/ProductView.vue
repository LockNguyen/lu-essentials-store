<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

import FilterBar from '@/components/Filters.vue'
import ProductTable from '@/components/ProductTable.vue'

const productStore = useProductStore()

onMounted(() => {
  // TODO: Only fetch products from database if persistedStatePlugin hasn't loaded it from localStorage
  productStore.loadProducts()
})
</script>

<template>
  <main>
    <h1>Products</h1>
    <FilterBar />
    <ProductTable />
  </main>
</template>
