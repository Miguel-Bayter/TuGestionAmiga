/**
 * Cart Store
 * Manages shopping cart state and actions using Zustand
 */

import { create } from 'zustand'
import {
  GetCartUseCase,
  AddToCartUseCase,
  RemoveFromCartUseCase,
  CheckoutUseCase,
} from '@/domain/UseCase/cart'
import { cartRepository } from '@/data/Repository/cart.repository-impl'
import type { Cart } from '@/domain/Entity/cart.entity'

interface CartState {
  // State
  cart: Cart | null
  isLoading: boolean
  error: string | null

  // Actions
  getCart: () => Promise<void>
  addToCart: (bookId: number, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  checkout: (items: Array<{ id_libro: number; cantidad: number }>) => Promise<void>
  clearError: () => void
}

// Initialize use cases
const getCartUseCase = new GetCartUseCase(cartRepository)
const addToCartUseCase = new AddToCartUseCase(cartRepository)
const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository)
const checkoutUseCase = new CheckoutUseCase(cartRepository)

export const useCartStore = create<CartState>((set) => ({
  // Initial state
  cart: null,
  isLoading: false,
  error: null,

  // Get cart
  getCart: async () => {
    set({ isLoading: true, error: null })

    try {
      const cart = await getCartUseCase.execute()
      set({
        cart,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Add to cart
  addToCart: async (bookId: number, quantity: number) => {
    set({ isLoading: true, error: null })

    try {
      await addToCartUseCase.execute(bookId, quantity)
      // Refresh cart after adding
      const cart = await getCartUseCase.execute()
      set({
        cart,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Remove from cart
  removeFromCart: async (cartItemId: number) => {
    set({ isLoading: true, error: null })

    try {
      await removeFromCartUseCase.execute(cartItemId)
      // Refresh cart after removing
      const cart = await getCartUseCase.execute()
      set({
        cart,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from cart'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Checkout
  checkout: async (items: Array<{ id_libro: number; cantidad: number }>) => {
    set({ isLoading: true, error: null })

    try {
      await checkoutUseCase.execute(items)
      set({
        cart: null,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
