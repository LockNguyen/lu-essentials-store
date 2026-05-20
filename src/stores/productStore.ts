import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

import type { Product } from '@/types/product'
import { ALL_CATEGORIES } from '@/types'
import { useFiltersStore } from '@/stores/filtersStore'
import {
  bulkAddProductsToDatabase,
  bulkDeleteProductsFromDatabase,
  bulkUpdateStocksInDatabase,
  fetchProductsFromDatabase,
} from '@/services/productService'

// Extends Product with a UI-only field that tracks whether a row has a pending
// change staged for the next save, so the table can render status badges.
export type ProductWithPendingStatus = Product & {
  pendingStatus: 'added' | 'stockUpdated' | 'deleted' | 'unchanged'
}

export const useProductStore = defineStore('product', () => {
  // --- State ---

  const products = ref<Product[]>([])

  const pendingProductsToAdd = ref<Product[]>([])
  const pendingProductIdsToRemove = ref<Set<string>>(new Set())
  const pendingStockUpdates = ref<Record<string, number>>({})

  const isAwaitingFetch = ref(false)
  const isAwaitingSave = ref(false)

  const filtersStore = useFiltersStore()

  // --- Private Helpers ---

  // Applies the search query, category filter, in-stock toggle, and created-at sort, and
  // price sort to a product list. Extracted so that filteredProductList is decoupled and readable.
  function getFilteredProductList(
    normalizedSearchQuery: string,
    category: string,
    inStockOnly: boolean,
    sortDirection: string,
  ): ProductWithPendingStatus[] {
    let result = [...productsWithPendingStatus.value]

    if (normalizedSearchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(normalizedSearchQuery))
    }

    if (category !== ALL_CATEGORIES) {
      result = result.filter((p) => p.category === category)
    }

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    result.sort((a, b) => a.createdAt - b.createdAt)

    if (sortDirection === 'asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortDirection === 'desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }

  // --- Getters ---

  // Expand the product list to track pending changes and newly added products for additional processing and UI rendering.
  const productsWithPendingStatus = computed<ProductWithPendingStatus[]>(() => {
    const existingProducts = products.value.map((product): ProductWithPendingStatus => {
      const pendingStockValue = pendingStockUpdates.value[product.id]
      const isPendingDelete = pendingProductIdsToRemove.value.has(product.id)

      return {
        ...product,
        stock: pendingStockValue ?? product.stock,
        pendingStatus: isPendingDelete
          ? 'deleted'
          : pendingStockValue !== undefined
            ? 'stockUpdated'
            : 'unchanged',
      }
    })

    const newProducts = pendingProductsToAdd.value.map(
      (product): ProductWithPendingStatus => ({
        ...product,
        pendingStatus: 'added',
      }),
    )

    return [...existingProducts, ...newProducts]
  })

  const filteredProductList = computed<ProductWithPendingStatus[]>(() =>
    getFilteredProductList(
      filtersStore.normalizedSearchQuery,
      filtersStore.category,
      filtersStore.inStockOnly,
      filtersStore.sortDirection,
    ),
  )

  const productCategoryList = computed(() => {
    const categories = new Set((products.value ?? []).map((p) => p.category))
    const sortedCategories = Array.from(categories).sort()
    return [ALL_CATEGORIES, ...sortedCategories]
  })

  const pendingAddCount = computed(() => pendingProductsToAdd.value.length)
  const pendingDeleteCount = computed(() => pendingProductIdsToRemove.value.size)
  const pendingStockUpdateCount = computed(() => Object.keys(pendingStockUpdates.value).length)

  const hasUnsavedChanges = computed(
    () =>
      pendingAddCount.value > 0 ||
      pendingDeleteCount.value > 0 ||
      pendingStockUpdateCount.value > 0,
  )

  // --- Actions ---

  async function loadProducts() {
    isAwaitingFetch.value = true
    try {
      products.value = await fetchProductsFromDatabase()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products.')
    } finally {
      isAwaitingFetch.value = false
    }
  }

  function addProduct(newProduct: Omit<Product, 'id' | 'createdAt'>): boolean {
    try {
      if (!newProduct.name.trim()) {
        throw new Error('Product name is required.')
      }

      if (!Number.isFinite(newProduct.price) || newProduct.price <= 0) {
        throw new Error('Price must be a finite number greater than 0.')
      }

      if (
        !Number.isInteger(newProduct.stock) ||
        !Number.isFinite(newProduct.stock) ||
        newProduct.stock < 0
      ) {
        throw new Error('Stock must be a non-negative whole number.')
      }

      pendingProductsToAdd.value.push({
        ...newProduct,
        id: crypto.randomUUID(),
        name: newProduct.name.trim(),
        category: newProduct.category.trim() || 'Uncategorized',
        createdAt: Date.now(),
      })

      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create product.')
      return false
    }
  }

  function updateStock(productId: string, newStockValue: number) {
    try {
      if (
        !Number.isInteger(newStockValue) ||
        !Number.isFinite(newStockValue) ||
        newStockValue < 0
      ) {
        throw new Error('Stock must be a non-negative whole number.')
      }

      // Pending additions live entirely in pendingProductsToAdd — mutate in place.
      const pendingNewProduct = pendingProductsToAdd.value.find((p) => p.id === productId)
      if (pendingNewProduct) {
        pendingNewProduct.stock = newStockValue
        return
      }

      const product = products.value.find((p) => p.id === productId)
      if (!product) {
        throw new Error('ProductId is not found.')
      }

      // If the new value matches the committed value, remove the pending update
      // rather than recording a no-op change.
      if (product.stock === newStockValue) {
        delete pendingStockUpdates.value[productId]
        return
      }

      pendingStockUpdates.value[productId] = newStockValue
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update stock.')
    }
  }

  function removeProduct(productId: string) {
    try {
      // Pending additions can be discarded immediately without touching committed state.
      const pendingNewProduct = pendingProductsToAdd.value.find((p) => p.id === productId)
      if (pendingNewProduct) {
        pendingProductsToAdd.value = pendingProductsToAdd.value.filter((p) => p.id !== productId)
        return
      }

      const product = products.value.find((p) => p.id === productId)
      if (!product) {
        throw new Error('ProductId is not found.')
      }

      pendingProductIdsToRemove.value.add(productId)

      // Also clear any pending stock update so it isn't submitted alongside the deletion.
      const remainingStockUpdates = { ...pendingStockUpdates.value }
      delete remainingStockUpdates[productId]
      pendingStockUpdates.value = remainingStockUpdates
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove product.')
    }
  }

  function clearPendingChanges() {
    pendingProductsToAdd.value = []
    pendingProductIdsToRemove.value = new Set()
    pendingStockUpdates.value = {}
  }

  async function submitPendingChangesToDatabase() {
    if (!hasUnsavedChanges.value) return

    // Take a snapshot of pending states before any saving to the database so that any
    // mutations during database writes don't corrupt what gets committed.
    const productsToAdd = [...pendingProductsToAdd.value]
    const productIdsToRemove = Array.from(pendingProductIdsToRemove.value)
    const stockUpdates = { ...pendingStockUpdates.value }

    isAwaitingSave.value = true

    try {
      if (productsToAdd.length > 0) {
        const success = await bulkAddProductsToDatabase(productsToAdd)
        if (!success) throw new Error('Adding products failed.')
      }

      if (Object.keys(stockUpdates).length > 0) {
        const success = await bulkUpdateStocksInDatabase(stockUpdates)
        if (!success) throw new Error('Updating product stocks failed.')
      }

      if (productIdsToRemove.length > 0) {
        const success = await bulkDeleteProductsFromDatabase(productIdsToRemove)
        if (!success) throw new Error('Deleting products failed.')
      }

      // Apply committed changes to the local product list to keep the UI in sync.
      products.value = [
        ...products.value
          .filter((product) => !pendingProductIdsToRemove.value.has(product.id))
          .map((product) => ({
            ...product,
            stock: pendingStockUpdates.value[product.id] ?? product.stock,
          })),
        ...pendingProductsToAdd.value,
      ]

      clearPendingChanges()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save products.')
    } finally {
      isAwaitingSave.value = false
    }
  }

  return {
    products,
    pendingProductsToAdd,
    pendingProductIdsToRemove,
    pendingStockUpdates,
    isAwaitingFetch,
    isAwaitingSave,
    productsWithPendingStatus,
    filteredProductList,
    productCategoryList,
    pendingAddCount,
    pendingDeleteCount,
    pendingStockUpdateCount,
    hasUnsavedChanges,
    loadProducts,
    addProduct,
    updateStock,
    removeProduct,
    clearPendingChanges,
    submitPendingChangesToDatabase,
  }
})
