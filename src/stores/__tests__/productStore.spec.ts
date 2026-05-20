import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useProductStore } from '@/stores/productStore'
import { useFiltersStore } from '@/stores/filtersStore'
import type { Product } from '@/types/product'
import { ALL_CATEGORIES } from '@/types'

// Prevent toast from trying to render into a missing Sonner DOM portal.
vi.mock('vue-sonner', () => ({
  toast: { error: vi.fn<(message: string) => void>(), success: vi.fn<(message: string) => void>() },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0

/** Creates a committed product with sensible defaults and a unique id. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `prod-${++_idCounter}`,
    name: 'Test Product',
    category: 'Electronics',
    price: 10.0,
    stock: 5,
    createdAt: _idCounter * 1000,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProductStore', () => {
  beforeEach(() => {
    _idCounter = 0
    setActivePinia(createPinia())
  })

  // --- addProduct tests ---

  describe('addProduct', () => {
    it('returns true and stages the product when all fields are valid', () => {
      const store = useProductStore()

      const result = store.addProduct({
        name: 'Chair',
        category: 'Furniture',
        price: 99.99,
        stock: 10,
      })

      expect(result).toBe(true)
      expect(store.pendingProductsToAdd).toHaveLength(1)
      expect(store.pendingProductsToAdd[0]).toMatchObject({
        name: 'Chair',
        category: 'Furniture',
        price: 99.99,
        stock: 10,
      })
    })

    it('trims the name and defaults an empty category to Uncategorized', () => {
      const store = useProductStore()
      store.addProduct({ name: '  Chair  ', category: '', price: 10, stock: 0 })

      expect(store.pendingProductsToAdd[0].name).toBe('Chair')
      expect(store.pendingProductsToAdd[0].category).toBe('Uncategorized')
    })

    it('returns false and does not stage when name is blank', () => {
      const store = useProductStore()
      const result = store.addProduct({ name: '   ', category: 'A', price: 10, stock: 0 })

      expect(result).toBe(false)
      expect(store.pendingProductsToAdd).toHaveLength(0)
    })

    it('returns false when price is zero', () => {
      const store = useProductStore()
      expect(store.addProduct({ name: 'A', category: '', price: 0, stock: 0 })).toBe(false)
    })

    it('returns false when price is negative', () => {
      const store = useProductStore()
      expect(store.addProduct({ name: 'A', category: '', price: -5, stock: 0 })).toBe(false)
    })

    it('returns false when stock is negative', () => {
      const store = useProductStore()
      expect(store.addProduct({ name: 'A', category: '', price: 10, stock: -1 })).toBe(false)
    })

    it('returns false when stock is a decimal (non-integer)', () => {
      const store = useProductStore()
      expect(store.addProduct({ name: 'A', category: '', price: 10, stock: 1.5 })).toBe(false)
    })
  })

  // --- updateStock tests ---

  describe('updateStock', () => {
    it('mutates stock in-place for a pending new product without creating a pendingStockUpdate', () => {
      const store = useProductStore()
      store.addProduct({ name: 'Chair', category: 'Furniture', price: 99.99, stock: 10 })
      const { id } = store.pendingProductsToAdd[0]

      store.updateStock(id, 25)

      expect(store.pendingProductsToAdd[0].stock).toBe(25)
      expect(store.pendingStockUpdates[id]).toBeUndefined()
    })

    it('stages a stock update for an existing committed product', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })

      store.updateStock('prod-x', 15)

      expect(store.pendingStockUpdates['prod-x']).toBe(15)
    })

    it('removes the pending update when the new value matches the committed stock (no-op)', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })
      store.updateStock('prod-x', 20) // stage a change

      store.updateStock('prod-x', 5) // revert to original

      expect(store.pendingStockUpdates['prod-x']).toBeUndefined()
    })

    it('does not stage anything when stock is negative', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })

      store.updateStock('prod-x', -1)

      expect(store.pendingStockUpdates['prod-x']).toBeUndefined()
    })

    it('does not stage anything when stock is a decimal', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })

      store.updateStock('prod-x', 2.5)

      expect(store.pendingStockUpdates['prod-x']).toBeUndefined()
    })
  })

  // --- removeProduct tests ---

  describe('removeProduct', () => {
    it('removes a pending new product directly from the staging list', () => {
      const store = useProductStore()
      store.addProduct({ name: 'Chair', category: 'Furniture', price: 99.99, stock: 10 })
      const { id } = store.pendingProductsToAdd[0]

      store.removeProduct(id)

      expect(store.pendingProductsToAdd).toHaveLength(0)
    })

    it('marks an existing committed product as pending delete', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x' })] })

      store.removeProduct('prod-x')

      expect(store.pendingProductIdsToRemove.has('prod-x')).toBe(true)
    })

    it('clears any staged stock update when the product is marked for deletion', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })
      store.updateStock('prod-x', 99)

      store.removeProduct('prod-x')

      expect(store.pendingStockUpdates['prod-x']).toBeUndefined()
    })
  })

  // --- clearPendingChanges tests ---

  describe('clearPendingChanges', () => {
    it('resets all three pending collections to empty', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x' })] })
      store.addProduct({ name: 'Chair', category: 'Furniture', price: 10, stock: 0 })
      store.updateStock('prod-x', 99)
      store.removeProduct('prod-x')

      store.clearPendingChanges()

      expect(store.pendingProductsToAdd).toHaveLength(0)
      expect(store.pendingProductIdsToRemove.size).toBe(0)
      expect(Object.keys(store.pendingStockUpdates)).toHaveLength(0)
    })
  })

  // --- hasUnsavedChanges tests ---

  describe('hasUnsavedChanges', () => {
    it('is false when there are no pending changes', () => {
      const store = useProductStore()
      expect(store.hasUnsavedChanges).toBe(false)
    })

    it('is true after a product is staged for addition', () => {
      const store = useProductStore()
      store.addProduct({ name: 'Chair', category: 'Furniture', price: 10, stock: 0 })
      expect(store.hasUnsavedChanges).toBe(true)
    })

    it('is true after a stock update is staged', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x', stock: 5 })] })
      store.updateStock('prod-x', 20)
      expect(store.hasUnsavedChanges).toBe(true)
    })

    it('is true after a product is staged for deletion', () => {
      const store = useProductStore()
      store.$patch({ products: [makeProduct({ id: 'prod-x' })] })
      store.removeProduct('prod-x')
      expect(store.hasUnsavedChanges).toBe(true)
    })

    it('returns to false after clearPendingChanges', () => {
      const store = useProductStore()
      store.addProduct({ name: 'Chair', category: 'Furniture', price: 10, stock: 0 })

      store.clearPendingChanges()

      expect(store.hasUnsavedChanges).toBe(false)
    })
  })

  // --- filteredProductList tests ---

  describe('filteredProductList', () => {
    function setup() {
      const productStore = useProductStore()
      const filtersStore = useFiltersStore()

      productStore.$patch({
        products: [
          makeProduct({
            id: 'p1',
            name: 'iPhone Charger',
            category: 'Electronics',
            price: 29.99,
            stock: 10,
            createdAt: 1000,
          }),
          makeProduct({
            id: 'p2',
            name: 'Comforter',
            category: 'Dorm Items',
            price: 89.99,
            stock: 0,
            createdAt: 2000,
          }),
          makeProduct({
            id: 'p3',
            name: 'Headphones',
            category: 'Electronics',
            price: 49.99,
            stock: 3,
            createdAt: 3000,
          }),
        ],
      })

      return { productStore, filtersStore }
    }

    it('returns all products when no filters are active', () => {
      const { productStore } = setup()
      expect(productStore.filteredProductList).toHaveLength(3)
    })

    it('filters by search query (case-insensitive, partial match)', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.searchQuery = 'IPHONE'

      const result = productStore.filteredProductList

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('p1')
    })

    it('returns no results when the search query matches nothing', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.searchQuery = 'zzznomatch'

      expect(productStore.filteredProductList).toHaveLength(0)
    })

    it('filters by category', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.category = 'Dorm Items'

      const result = productStore.filteredProductList

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('p2')
    })

    it('returns all products when category is ALL_CATEGORIES', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.category = ALL_CATEGORIES

      expect(productStore.filteredProductList).toHaveLength(3)
    })

    it('excludes out-of-stock products when inStockOnly is true', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.inStockOnly = true

      const result = productStore.filteredProductList

      expect(result.every((p) => p.stock > 0)).toBe(true)
      expect(result.find((p) => p.id === 'p2')).toBeUndefined()
    })

    it('sorts by price ascending', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.sortDirection = 'asc'

      const prices = productStore.filteredProductList.map((p) => p.price)

      expect(prices).toEqual([29.99, 49.99, 89.99])
    })

    it('sorts by price descending', () => {
      const { productStore, filtersStore } = setup()
      filtersStore.sortDirection = 'desc'

      const prices = productStore.filteredProductList.map((p) => p.price)

      expect(prices).toEqual([89.99, 49.99, 29.99])
    })

    it('defaults to insertion order (createdAt asc) when no sort is selected', () => {
      const { productStore } = setup()

      const ids = productStore.filteredProductList.map((p) => p.id)

      expect(ids).toEqual(['p1', 'p2', 'p3'])
    })

    it('includes pending new products in the result', () => {
      const { productStore } = setup()
      productStore.addProduct({ name: 'New Lamp', category: 'Dorm Items', price: 15, stock: 5 })

      const result = productStore.filteredProductList

      expect(result).toHaveLength(4)
      expect(result.some((p) => p.pendingStatus === 'added')).toBe(true)
    })

    it('reflects pending stock updates in the displayed stock value', () => {
      const { productStore } = setup()
      productStore.updateStock('p1', 999)

      const p1 = productStore.filteredProductList.find((p) => p.id === 'p1')

      expect(p1?.stock).toBe(999)
      expect(p1?.pendingStatus).toBe('stockUpdated')
    })

    it('marks products pending deletion with deleted status', () => {
      const { productStore } = setup()
      productStore.removeProduct('p3')

      const p3 = productStore.filteredProductList.find((p) => p.id === 'p3')

      expect(p3?.pendingStatus).toBe('deleted')
    })
  })

  // --- productCategoryList tests ---

  describe('productCategoryList', () => {
    it('returns ALL_CATEGORIES first followed by sorted unique categories', () => {
      const store = useProductStore()
      store.$patch({
        products: [
          makeProduct({ category: 'Electronics' }),
          makeProduct({ category: 'Dorm Items' }),
          makeProduct({ category: 'Electronics' }), // duplicate — should be de-duped
        ],
      })

      expect(store.productCategoryList).toEqual([ALL_CATEGORIES, 'Dorm Items', 'Electronics'])
    })

    it('returns only ALL_CATEGORIES when the product list is empty', () => {
      const store = useProductStore()
      expect(store.productCategoryList).toEqual([ALL_CATEGORIES])
    })
  })
})
