import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { ALL_CATEGORIES } from '@/types'

export const useFiltersStore = defineStore('filters', () => {
  // --- State ---

  const searchQuery = ref('')
  const category = ref<string>(ALL_CATEGORIES)
  const sortDirection = ref<'none' | 'asc' | 'desc'>('none')
  const inStockOnly = ref(false)

  // --- Getters ---

  const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

  // --- Actions ---

  function resetFilters() {
    searchQuery.value = ''
    category.value = ALL_CATEGORIES
    sortDirection.value = 'none'
    inStockOnly.value = false
  }

  return { searchQuery, category, sortDirection, inStockOnly, normalizedSearchQuery, resetFilters }
})
