import type { Product } from '@/types/product'

/**
 * Fetches product from the database.
 * Note: Mock database here can be easily swapped out for real database.
 * @returns {Promise<Product[]>} The fetched products list.
 */
export async function fetchProductsFromDatabase(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: crypto.randomUUID(),
          name: 'iPhone Charger',
          category: 'Electronics',
          price: 29.99,
          stock: 45,
          createdAt: Date.now() - 10000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Headphones',
          category: 'Electronics',
          price: 49.99,
          stock: 3, // should show as low-stock
          createdAt: Date.now() - 9000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Comforter',
          category: 'Dorm Items',
          price: 89.99,
          stock: 0, // should show as out-of-stock
          createdAt: Date.now() - 8000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Heater',
          category: 'Electronics',
          price: 129.99,
          stock: 12,
          createdAt: Date.now() - 7000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Blue Light Glasses',
          category: 'Accessories',
          price: 59.99,
          stock: 2, // should show as low-stock
          createdAt: Date.now() - 6000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Ergonomic Desk Chair',
          category: 'Furniture',
          price: 199.99,
          stock: 8,
          createdAt: Date.now() - 5000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Wireless Mouse',
          category: 'Electronics',
          price: 24.99,
          stock: 0, // should show as out-of-stock
          createdAt: Date.now() - 4000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Desk Organizer',
          category: 'Dorm Items',
          price: 15.49,
          stock: 50,
          createdAt: Date.now() - 3000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Water Flask (32oz)',
          category: 'Accessories',
          price: 34.99,
          stock: 4, // should show as low-stock
          createdAt: Date.now() - 2000,
        },
        {
          id: crypto.randomUUID(),
          name: 'LED Strip Lights',
          category: 'Dorm Items',
          price: 19.99,
          stock: 120,
          createdAt: Date.now() - 1000,
        },
      ])
    }, 4000) // simulate network latency
  })
}

/**
 * Bulk add products to the database.
 * @returns {Promise<boolean>} The success state of the add operation.
 */
export async function bulkAddProductsToDatabase(products: Product[]): Promise<boolean> {
  return new Promise((resolve) => {
    console.log("productService: I'm trying to bulk add products")
    console.log(products)

    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

/**
 * Bulk update product stocks in the database.
 * @returns {Promise<boolean>} The success state of the update operation.
 */
export async function bulkUpdateStocksInDatabase(
  stockUpdates: Record<string, number>,
): Promise<boolean> {
  return new Promise((resolve) => {
    console.log("productService: I'm trying to bulk update product stocks")
    console.log(stockUpdates)

    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

/**
 * Bulk delete products from the database.
 * @returns {Promise<boolean>} The success state of the delete operation.
 */
export async function bulkDeleteProductsFromDatabase(productIds: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    console.log("productService: I'm trying to bulk delete products")
    console.log(productIds)

    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}
