/**
 * Loan Entity
 * Domain model for book loan
 */

import type { Book } from './book.entity'

export interface Loan {
  id: number
  id_usuario: number
  id_libro: number
  fecha_prestamo: string
  fecha_vencimiento: string
  devuelto: boolean
  libro?: Book
}
