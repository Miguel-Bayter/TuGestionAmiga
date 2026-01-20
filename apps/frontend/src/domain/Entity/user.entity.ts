/**
 * User Entity
 * Domain model for user
 */

export interface User {
  id: number
  nombre: string
  email: string
  id_rol: number
  createdAt?: string
  updatedAt?: string
}
