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
  <main class="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold tracking-tight text-primary">Products</h1>

      <Button class="shadow-md" size="lg" type="button" @click="isProductFormOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add New
      </Button>
    </div>

    <!-- Filters -->
    <FilterBar />

    <!-- Scrollable table area -->
    <div class="flex min-h-0 flex-col">
      <LoadingWrapper
        :is-loading="productStore.isAwaitingFetch || productStore.isAwaitingSave"
        class="flex h-fit min-h-0 flex-col"
      >
        <ProductTable />
      </LoadingWrapper>
    </div>

    <!-- Save panel -->
    <LoadingWrapper :is-loading="productStore.isAwaitingSave">
      <SavePanel />
    </LoadingWrapper>

    <ProductForm
      v-if="isProductFormOpen"
      @created="isProductFormOpen = false"
      @canceled="isProductFormOpen = false"
    />
  </main>
</template>
