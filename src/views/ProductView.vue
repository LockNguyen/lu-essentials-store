<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

import FilterBar from '@/components/FilterBar.vue'
import ProductTable from '@/components/ProductTable.vue'
import SavePanel from '@/components/uiElements/SavePanel.vue'
import ProductForm from '@/components/ProductForm.vue'
import LoadingWrapper from '@/components/uiElements/LoadingWrapper.vue'

const productStore = useProductStore()

const isProductFormOpen = ref(false)

onMounted(() => {
  // Only fetch products from database if persistedStatePlugin hasn't loaded products from localStorage already
  if (productStore.products.length === 0) {
    productStore.loadProducts()
  }
})
</script>

<template>
  <main class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold tracking-tight">Products</h1>

      <Button class="shadow-md" size="lg" type="button" @click="isProductFormOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add New
      </Button>
    </div>

    <!-- Filters -->
    <div class="mt-6 shrink-0">
      <FilterBar />
    </div>

    <!-- Scrollable table area -->
    <div class="mt-6 min-h-0 flex-1">
      <LoadingWrapper
        :is-loading="productStore.isAwaitingFetch || productStore.isAwaitingSave"
        class="flex h-full min-h-0 flex-col overflow-hidden"
      >
        <ProductTable />
      </LoadingWrapper>
    </div>

    <!-- Save panel -->
    <div class="mt-6 shrink-0">
      <LoadingWrapper :is-loading="productStore.isAwaitingSave">
        <SavePanel />
      </LoadingWrapper>
    </div>

    <ProductForm
      v-if="isProductFormOpen"
      @created="isProductFormOpen = false"
      @canceled="isProductFormOpen = false"
    />
  </main>
</template>
