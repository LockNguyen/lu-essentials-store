import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useFiltersStore } from '@/stores/filtersStore'
import { ALL_CATEGORIES } from '@/types'

describe('useFiltersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --- normalizedSearchQuery tests ---

  describe('normalizedSearchQuery', () => {
    it('trims and lowercases the raw search query', () => {
      const store = useFiltersStore()
      store.searchQuery = '  LAPTOP  '

      expect(store.normalizedSearchQuery).toBe('laptop')
    })

    it('returns an empty string when the query is empty', () => {
      const store = useFiltersStore()

      expect(store.normalizedSearchQuery).toBe('')
    })

    it('reacts to changes in searchQuery', () => {
      const store = useFiltersStore()
      store.searchQuery = 'first'
      expect(store.normalizedSearchQuery).toBe('first')

      store.searchQuery = 'SECOND'
      expect(store.normalizedSearchQuery).toBe('second')
    })
  })

  // --- resetFilters tests ---

  describe('resetFilters', () => {
    it('resets all filter fields to their initial defaults', () => {
      const store = useFiltersStore()
      store.searchQuery = 'laptop'
      store.category = 'Electronics'
      store.sortDirection = 'asc'
      store.inStockOnly = true

      store.resetFilters()

      expect(store.searchQuery).toBe('')
      expect(store.category).toBe(ALL_CATEGORIES)
      expect(store.sortDirection).toBe('none')
      expect(store.inStockOnly).toBe(false)
    })

    it('also resets the normalizedSearchQuery derived value', () => {
      const store = useFiltersStore()
      store.searchQuery = 'laptop'

      store.resetFilters()

      expect(store.normalizedSearchQuery).toBe('')
    })
  })
})
