/**
 * API Types
 * Domain models for Books, Cart, Loans, and API Errors
 */

/**
 * Book entity from backend
 */
export interface Book {
  id_libro: number
  titulo: string
  autor: string
  descripcion?: string
  valor?: number // precio field from DB
  disponibilidad?: number // 0 or 1
  stock?: number
  stock_compra?: number
  stock_renta?: number
  nombre_categoria?: string
  portada_url?: string
}

/**
 * Cart item entity
 */
export interface CartItem {
  id_carrito: number
  id_usuario: number
  id_libro: number
  cantidad: number
  precio_unitario: number
  libro?: Book
}

/**
 * Loan entity
 */
export interface Loan {
  id_prestamo: number
  id_usuario: number
  id_libro: number
  fecha_prestamo: string
  fecha_vencimiento: string
  devuelto: boolean
  libro?: Book
}

/**
 * Standardized API error response
 */
export interface ApiError {
  status: number
  message: string
  code?: string
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Generic paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
