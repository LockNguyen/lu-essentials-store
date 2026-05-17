<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import { useProductStore } from '@/stores/productStore'

const filtersStore = useFiltersStore()
const productStore = useProductStore()
</script>

<template>
  <section class="filter-bar">
    <div class="filter-group">
      <label for="search-input" class="filter-label">Search</label>
      <input
        id="search-input"
        class="input"
        type="search"
        v-model="filtersStore.searchQuery"
        placeholder="Filter by product name…"
      />
    </div>

    <div class="filter-group">
      <label for="category-select" class="filter-label">Category</label>
      <select id="category-select" class="input" v-model="filtersStore.category">
        <option
          v-for="category in productStore.productCategoryList"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="sort-select" class="filter-label">Sort by price</label>
      <select id="sort-select" class="input" v-model="filtersStore.sortDirection">
        <option value="asc">Price: Low → High</option>
        <option value="desc">Price: High → Low</option>
      </select>
    </div>

    <div class="filter-group filter-group--checkbox">
      <input
        id="in-stock-toggle"
        class="checkbox"
        type="checkbox"
        v-model="filtersStore.inStockOnly"
      />
      <label for="in-stock-toggle" class="filter-label filter-label--inline">In-stock only</label>
      <span id="in-stock-description" class="sr-only">
        When checked, only products with more than 0 units in stock are shown.
      </span>
    </div>

    <button class="btn btn--ghost" type="button" @click="filtersStore.resetFilters()">
      Reset filters
    </button>
  </section>
</template>
