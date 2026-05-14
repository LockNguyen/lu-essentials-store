import type { Product } from '@/types/product'

/**
 * Fetches product from the database.
 * Note: Mock database here can be easily swapped out for real database.
 * @returns {Promise<Product[]>} The fetched products list.
 */
export async function fetchProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: crypto.randomUUID(),
          name: 'iPhone Charger',
          category: 'Electronics',
          price: 29.99,
          stock: 45,
          createdAt: Date.now() - 5000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Headphones',
          category: 'Electronics',
          price: 49.99,
          stock: 3,   // should show as low-stock
          createdAt: Date.now() - 4000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Comforter',
          category: 'Dorm Items',
          price: 89.99,
          stock: 0,   // should show as out-of-stock
          createdAt: Date.now() - 3000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Heater',
          category: 'Electronics',
          price: 129.99,
          stock: 12,
          createdAt: Date.now() - 2000,
        },
        {
          id: crypto.randomUUID(),
          name: 'Blue Light Glasses',
          category: 'Accessories',
          price: 59.99,
          stock: 2,   // should show as low-stock
          createdAt: Date.now() - 1000,
        },
      ])
    }, 800) // simulate network latency
  })
}