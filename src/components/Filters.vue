<script setup>
import { useFiltersStore } from '@/stores/filtersStore'
import { useProductStore } from '@/stores/productStore'
import { storeToRefs } from 'pinia'

const filtersStore = useFiltersStore()
const productStore = useProductStore()

// storeToRefs preserves reactivity when destructuring Pinia store state.
const { searchQuery, category, sortDirection, inStockOnly } = storeToRefs(filtersStore)
const { productCategoryList } = storeToRefs(productStore)
</script>

<template>
  <section class="filter-bar" aria-label="Product filters">
    <div class="filter-group">
      <label for="search-input" class="filter-label">Search</label>
      <input
        id="search-input"
        v-model="searchQuery"
        type="search"
        class="input"
        placeholder="Filter by product name…"
      />
    </div>

    <div class="filter-group">
      <label for="category-select" class="filter-label">Category</label>
      <select
        id="category-select"
        v-model="category"
        class="input"
      >
        <option v-for="category in productCategoryList" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="sort-select" class="filter-label">Sort by price</label>
      <select
        id="sort-select"
        v-model="sortDirection"
        class="input"
      >
        <option value="asc">Price: Low → High</option>
        <option value="desc">Price: High → Low</option>
      </select>
    </div>

    <div class="filter-group filter-group--checkbox">
      <input
        id="in-stock-toggle"
        v-model="inStockOnly"
        type="checkbox"
        class="checkbox"
        aria-describedby="in-stock-description"
      />
      <label for="in-stock-toggle" class="filter-label filter-label--inline">
        In-stock only
      </label>
      <span id="in-stock-description" class="sr-only">
        When checked, only products with more than 0 units in stock are shown.
      </span>
    </div>

    <button class="btn btn--ghost" type="button" @click="filtersStore.resetFilters()">
      Reset filters
    </button>
  </section>
</template>

<style scoped>
</style>