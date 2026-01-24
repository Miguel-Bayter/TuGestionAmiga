export type BookEntity = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  categoryId: number | null;
  price: number;
  purchaseStock: number;
  rentalStock: number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookPayload = {
  title: string;
  author: string;
  description: string;
  categoryId: number;
  price: number;
  purchaseStock?: number;
  rentalStock?: number;
  available?: boolean;
}
