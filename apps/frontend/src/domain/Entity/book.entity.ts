/**
 * Book Entity
 * Domain model for book
 */

export interface Book {
  id: number
  titulo: string
  autor: string
  descripcion?: string
  valor?: number
  disponibilidad: boolean
  stock?: number
  stock_compra?: number
  stock_renta?: number
  nombre_categoria?: string
  portada_url?: string
}
