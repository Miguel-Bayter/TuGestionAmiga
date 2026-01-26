/**
 * Auth Domain Entities
 * User and Role types from Prisma schema
 */

export interface Role {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: number
  email: string
  name: string
  roleId: number
  createdAt: Date
  updatedAt: Date
  role?: Role
}
