import type { Product } from '@/types/product'
import {
  bulkAddProductsToDatabase,
  bulkDeleteProductsFromDatabase,
  bulkUpdateStocksInDatabase,
  fetchProductsFromDatabase,
} from '@/services/productService'

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_CATEGORIES } from '@/types'
import { useFiltersStore } from '@/stores/filtersStore'

export type ProductWithPendingStatus = Product & {
  pendingStatus: 'added' | 'stockUpdated' | 'deleted' | 'unchanged'
}

export const useProductStore = defineStore('product', () => {
  // states
  const products = ref<Product[]>([])

  const pendingProductsToAdd = ref<Product[]>([])
  const pendingProductIdsToRemove = ref<Set<string>>(new Set())
  const pendingStockUpdates = ref<Record<string, number>>({})

  const isAwaitingFetch = ref(false)
  const isAwaitingSave = ref(false)

  const error = ref<string | null>(null)

  const filtersStore = useFiltersStore()

  // getters
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

  const hasUnsavedChanges = computed(() => {
    return (
      pendingAddCount.value > 0 || pendingDeleteCount.value > 0 || pendingStockUpdateCount.value > 0
    )
  })

  // actions
  function getFilteredProductList(
    normalizedSearchQuery: string,
    category: string,
    inStockOnly: boolean,
    sortDirection: string,
  ): ProductWithPendingStatus[] {
    let result = [...productsWithPendingStatus.value]

    // Filter: name
    if (normalizedSearchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(normalizedSearchQuery))
    }

    // Filter: category
    if (category !== ALL_CATEGORIES) {
      result = result.filter((p) => p.category === category)
    }

    // Filter: stock (in-stock/out-of-stock)
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    // Sort: createdat
    result.sort((a, b) => a.createdAt - b.createdAt)

    // Sort: price
    if (sortDirection === 'asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortDirection === 'desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }

  async function loadProducts() {
    isAwaitingFetch.value = true
    try {
      products.value = await fetchProductsFromDatabase()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'loadProducts: Failed to load products.'
    } finally {
      isAwaitingFetch.value = false
    }
  }

  function addProduct(newProduct: Omit<Product, 'id' | 'createdAt'>) {
    // Value validation
    const validationErrors: string[] = []

    if (!newProduct.name.trim()) {
      validationErrors.push('addProduct: Name is required.')
    }

    if (!Number.isFinite(newProduct.price) || newProduct.price <= 0) {
      validationErrors.push('addProduct: Price must be a finite number greater than 0.')
    }

    if (
      !Number.isInteger(newProduct.stock) ||
      !Number.isFinite(newProduct.stock) ||
      newProduct.stock < 0
    ) {
      validationErrors.push('addProduct: Stock must be a non-negative whole number.')
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '))
    }

    // Add the product to the pending addition list
    pendingProductsToAdd.value.push({
      ...newProduct,
      id: crypto.randomUUID(),
      name: newProduct.name.trim(),
      category: newProduct.category.trim() || 'Uncategorized',
      createdAt: Date.now(),
    })
  }

  function updateStock(productId: string, newStockValue: number) {
    // Value validation
    const validationErrors: string[] = []

    if (!Number.isInteger(newStockValue) || !Number.isFinite(newStockValue) || newStockValue < 0) {
      validationErrors.push('updateStock: stock must be a non-negative whole number.')
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '))
    }

    // 1. If the product is in the pending addition list, update its stock directly
    const newProduct = pendingProductsToAdd.value.find((p) => p.id === productId)

    if (newProduct) {
      newProduct.stock = newStockValue
      return
    }

    // 2. If the product's stock value hasn't changed, remove it from the pending update list
    const product = products.value.find((p) => p.id === productId)

    if (!product) {
      throw new Error(`updateStock: productId "${productId}" not found.`)
    }

    if (product.stock === newStockValue) {
      delete pendingStockUpdates.value[productId]
      return
    }

    // 3. If the product currently exists, add the change to the pending update list
    pendingStockUpdates.value[productId] = newStockValue
  }

  function removeProduct(productId: string) {
    // 1. If the product is in the pending addition list, remove it directly
    const newProduct = pendingProductsToAdd.value.find((p) => p.id === productId)

    if (newProduct) {
      pendingProductsToAdd.value = pendingProductsToAdd.value.filter((p) => p.id !== productId)
      return
    }

    // 2. If the product currently exists, add it to the pending removal list
    const product = products.value.find((p) => p.id === productId)

    if (!product) {
      throw new Error(`removeProduct: productId "${productId}" not found.`)
    }

    pendingProductIdsToRemove.value.add(productId)

    // 3. If the product has a pending stock update, remove that update
    const remainingStockUpdates = { ...pendingStockUpdates.value }
    delete remainingStockUpdates[productId]
    pendingStockUpdates.value = remainingStockUpdates
  }

  function clearChanges() {
    pendingProductsToAdd.value = []
    pendingProductIdsToRemove.value = new Set()
    pendingStockUpdates.value = {}
  }

  async function submitChanges() {
    if (!hasUnsavedChanges.value) {
      return
    }

    const productsToAdd = [...pendingProductsToAdd.value]
    const productIdsToRemove = Array.from(pendingProductIdsToRemove.value)
    const stockUpdates = { ...pendingStockUpdates.value }

    // Bulk perform each operation on the database
    isAwaitingSave.value = true

    try {
      if (productsToAdd.length > 0) {
        const success = await bulkAddProductsToDatabase(productsToAdd)

        if (!success) {
          throw new Error('submitChanges: adding products failed')
        }
      }

      if (Object.keys(stockUpdates).length > 0) {
        const success = await bulkUpdateStocksInDatabase(stockUpdates)

        if (!success) {
          throw new Error('submitChanges: updating product stocks failed')
        }
      }

      if (productIdsToRemove.length > 0) {
        const success = await bulkDeleteProductsFromDatabase(productIdsToRemove)

        if (!success) {
          throw new Error('submitChanges: deleting products failed')
        }
      }

      // Update the UI to reflect changes
      products.value = [
        ...products.value
          .filter((product) => !pendingProductIdsToRemove.value.has(product.id))
          .map((product) => ({
            ...product,
            stock: pendingStockUpdates.value[product.id] ?? product.stock,
          })),
        ...pendingProductsToAdd.value,
      ]

      clearChanges()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save products.'
      throw e
    } finally {
      isAwaitingSave.value = false
    }
  }

  // exports
  return {
    products,
    pendingProductsToAdd,
    pendingProductIdsToRemove,
    pendingStockUpdates,
    isAwaitingFetch,
    isAwaitingSave,
    error,
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
    clearChanges,
    submitChanges,
  }
})
