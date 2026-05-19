import type { Product } from '@/types/product'
import { fetchProducts } from '@/services/productService'
import { useFiltersStore } from '@/stores/filtersStore'

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_CATEGORIES } from '@/types'

export const useProductStore = defineStore('product', () => {
  // states
  const products = ref<Product[]>([])
  const error = ref<string | null>(null)

  // dependencies
  const filtersStore = useFiltersStore()

  // getters
  const filteredProductList = computed(() => {
    let result = [...products.value]

    // Filter: name
    if (filtersStore.normalizedSearchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filtersStore.normalizedSearchQuery),
      )
    }

    // Filter: category
    if (filtersStore.category !== ALL_CATEGORIES) {
      result = result.filter((p) => p.category === filtersStore.category)
    }

    // Filter: stock (in-stock/out-of-stock)
    if (filtersStore.inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    // Sort: createdat
    result.sort((a, b) => a.createdAt - b.createdAt)

    // Sort: price
    if (filtersStore.sortDirection === 'asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (filtersStore.sortDirection === 'desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  })

  const productCategoryList = computed(() => {
    const categories = new Set(products.value.map((p) => p.category))
    const sortedCategories = Array.from(categories).sort()
    return [ALL_CATEGORIES, ...sortedCategories]
  })

  // actions
  async function loadProducts() {
    try {
      products.value = await fetchProducts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load products.'
    }
  }

  function addProduct(newProduct: Omit<Product, 'id' | 'createdAt'>) {
    const validationErrors: string[] = []

    if (!newProduct.name.trim()) {
      validationErrors.push('Name is required.')
    }

    if (!Number.isFinite(newProduct.stock) || newProduct.price <= 0) {
      validationErrors.push('Price must be a finite number greater than 0.')
    }

    if (
      !Number.isInteger(newProduct.stock) ||
      !Number.isFinite(newProduct.stock) ||
      newProduct.stock < 0
    ) {
      validationErrors.push('Stock must be a non-negative whole number.')
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '))
    }

    products.value.push({
      ...newProduct,
      id: crypto.randomUUID(),
      name: newProduct.name.trim(),
      category: newProduct.category.trim() || 'Uncategorized',
      createdAt: Date.now(),
    })
  }

  function updateStock(productId: string, newStockValue: number) {
    const validationErrors: string[] = []
    const product = products.value.find((p) => p.id === productId)

    if (!product) {
      validationErrors.push(`updateStock: productId "${productId} not found.`)
    }

    if (!Number.isInteger(newStockValue) || !Number.isFinite(newStockValue) || newStockValue < 0) {
      validationErrors.push('updateStock: stock must be a non-negative whole number.')
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '))
    }

    product!.stock = newStockValue
  }

  function removeProduct(productId: string) {
    const validationErrors: string[] = []
    const productIndex = products.value.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      validationErrors.push(`removeProduct: productId "${productId} not found.`)
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '))
    }

    products.value.splice(productIndex, 1)
  }

  // exports
  return {
    products,
    filteredProductList,
    productCategoryList,
    loadProducts,
    addProduct,
    updateStock,
    removeProduct,
  }
})
