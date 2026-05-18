<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

import FilterBar from '@/components/Filters.vue'
import ProductTable from '@/components/ProductTable.vue'
import ProductForm from '@/components/ProductForm.vue'
import ButtonWithIcon from '@/components/ButtonWithIcon.vue'

// store imports
const productStore = useProductStore()

// form showing/hiding
const isProductFormOpen = ref(false)
function openProductForm() {
  isProductFormOpen.value = true
}
function closeProductForm() {
  isProductFormOpen.value = false
}

onMounted(() => {
  // TODO: Only fetch products from database if persistedStatePlugin hasn't loaded it from localStorage
  productStore.loadProducts()
})
</script>

<template>
  <main>
    <div class="page-headline">
      <h1>Products</h1>
      <ButtonWithIcon type="button" text="+ Add New" @click="openProductForm" />
    </div>
    <FilterBar />
    <ProductTable />
    <ProductForm v-if="isProductFormOpen" @created="closeProductForm" @cancel="closeProductForm" />
  </main>
</template>
