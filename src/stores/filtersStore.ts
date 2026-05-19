import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_CATEGORIES } from '@/types'

export const useFiltersStore = defineStore('filters', () => {
  // states
  const searchQuery = ref('')
  const category = ref<string>(ALL_CATEGORIES)
  const sortDirection = ref<'none' | 'asc' | 'desc'>('none')
  const inStockOnly = ref(false)

  // getters
  const normalizedSearchQuery = computed(() => {
    return searchQuery.value.trim().toLowerCase() ?? ''
  })

  // actions
  function resetFilters() {
    searchQuery.value = ''
    category.value = ALL_CATEGORIES
    sortDirection.value = 'none'
    inStockOnly.value = false
  }

  // exports
  return { searchQuery, category, sortDirection, inStockOnly, normalizedSearchQuery, resetFilters }
})
