// Singleton instance avoids re-allocating the formatter on every render cycle.
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Formats a numeric price as a USD currency string (e.g. `29.99` → `"$29.99"`). */
export function formatPrice(price: number): string {
  return priceFormatter.format(price)
}
