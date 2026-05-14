export interface Product {
  id: string // use uuid, not a sequential int - avoids stale Local Storage records
  name: string // required
  category: string
  price: number // must be positive; USD with 2 decimal places ("6.07")
  stock: number // must be zero or positive; whole numbers only
  createdAt: number // epoch timestamp - products are sorted by this by default to be logical
}