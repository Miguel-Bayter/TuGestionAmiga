/**
 * Cart Store
 * Manages shopping cart state and actions
 */

import { create } from 'zustand'
import { apiClient } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CartItem } from '@/types'

interface CartState {
  // State
  items: CartItem[]
  isLoading: boolean
  error: string | null
  total: number

  // Actions
  fetchCart: () => Promise<void>
  addToCart: (bookId: number, quantity?: number) => Promise<boolean>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>
  removeFromCart: (cartItemId: number) => Promise<boolean>
  clearCart: () => void
  calculateTotal: () => void
  clearError: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,
  total: 0,

  // Fetch cart items
  fetchCart: async () => {
    set({ isLoading: true, error: null })

    const response = await apiClient.get<CartItem[]>(API_ENDPOINTS.CART, true)

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
      })
      return
    }

    if (response.data) {
      set({
        items: response.data,
        isLoading: false,
      })
      get().calculateTotal()
    } else {
      set({ isLoading: false })
    }
  },

  // Add item to cart
  addToCart: async (bookId: number, quantity: number = 1) => {
    set({ isLoading: true, error: null })

    const response = await apiClient.post<CartItem>(
      API_ENDPOINTS.CART,
      { id_libro: bookId, cantidad: quantity },
      true
    )

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
      })
      return false
    }

    if (response.data) {
      // Check if item already exists in cart
      const existingItemIndex = get().items.findIndex((item) => item.id_libro === bookId)

      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...get().items]
        updatedItems[existingItemIndex] = response.data
        set({ items: updatedItems, isLoading: false })
      } else {
        // Add new item
        set({
          items: [...get().items, response.data],
          isLoading: false,
        })
      }

      get().calculateTotal()
      return true
    }

    set({ isLoading: false })
    return false
  },

  // Update item quantity
  updateQuantity: async (cartItemId: number, quantity: number) => {
    if (quantity < 1) {
      return get().removeFromCart(cartItemId)
    }

    set({ isLoading: true, error: null })

    const response = await apiClient.put<CartItem>(
      API_ENDPOINTS.CART_ITEM(cartItemId),
      { cantidad: quantity },
      true
    )

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
      })
      return false
    }

    if (response.data) {
      const updatedItems = get().items.map((item) =>
        item.id_carrito === cartItemId ? response.data! : item
      )

      set({
        items: updatedItems,
        isLoading: false,
      })

      get().calculateTotal()
      return true
    }

    set({ isLoading: false })
    return false
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: number) => {
    set({ isLoading: true, error: null })

    const response = await apiClient.delete(API_ENDPOINTS.CART_ITEM(cartItemId), true)

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
      })
      return false
    }

    // Remove item from state
    const updatedItems = get().items.filter((item) => item.id_carrito !== cartItemId)

    set({
      items: updatedItems,
      isLoading: false,
    })

    get().calculateTotal()
    return true
  },

  // Clear cart (local only)
  clearCart: () => {
    set({
      items: [],
      total: 0,
      error: null,
    })
  },

  // Calculate total price
  calculateTotal: () => {
    const total = get().items.reduce((sum, item) => {
      return sum + item.precio_unitario * item.cantidad
    }, 0)

    set({ total })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
