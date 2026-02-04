export type BookForPurchase = {
  id: number
  title: string
  author: string
}

export type PurchaseEntity = {
  id: number
  userId: number
  bookId: number
  price: number
  date: Date
  book?: BookForPurchase
  createdAt: Date
  updatedAt: Date
}
