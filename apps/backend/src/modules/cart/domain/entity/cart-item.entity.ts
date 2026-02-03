/**
 * Cart item entity representation
 * Used within the application for cart data
 */
export type CartItemEntity = {
  id: number;
  userId: number;
  bookId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  book?: {
    id: number;
    title: string;
    author: string;
    price: number;
    purchaseStock: number;
  };
};
