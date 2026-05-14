import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ALL_CATEGORIES } from '@/types'

export const useFiltersStore = defineStore('filters', () => {
  // states
  const searchQuery = ref('')
  const category = ref<string>(ALL_CATEGORIES)
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const inStockOnly = ref(false)

  // getters
  const normalizedSearchQuery = searchQuery.value.trim().toLowerCase()

  // actions
  function resetFilters() {
    searchQuery.value = ''
    category.value = ALL_CATEGORIES
    sortDirection.value = 'asc'
    inStockOnly.value = false
  }

  // exports
  return { searchQuery, category, sortDirection, inStockOnly, normalizedSearchQuery, resetFilters }
})