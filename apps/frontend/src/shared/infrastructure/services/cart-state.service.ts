/**
 * Cart State Service
 * Manages shopping cart state without external dependencies
 */

import {
  GetCartUseCase,
  AddToCartUseCase,
  RemoveFromCartUseCase,
  CheckoutUseCase,
} from '@/modules/cart'
import type { Cart } from '@/modules/cart'

interface CartStateData {
  cart: Cart | null
  isLoading: boolean
  error: string | null
}

export class CartStateService {
  private state: CartStateData = {
    cart: null,
    isLoading: false,
    error: null,
  }

  private subscribers: Set<(state: CartStateData) => void> = new Set()

  constructor(
    private getCartUseCase: GetCartUseCase,
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private checkoutUseCase: CheckoutUseCase
  ) {}

  async getCart(): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const cart = await this.getCartUseCase.execute()
      this.state.cart = cart
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async addToCart(bookId: number, quantity: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      await this.addToCartUseCase.execute(bookId, quantity)
      // Refresh cart after adding
      const cart = await this.getCartUseCase.execute()
      this.state.cart = cart
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      await this.removeFromCartUseCase.execute(cartItemId)
      // Refresh cart after removing
      const cart = await this.getCartUseCase.execute()
      this.state.cart = cart
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from cart'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async checkout(items: Array<{ id_libro: number; cantidad: number }>): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      await this.checkoutUseCase.execute(items)
      this.state.cart = null
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  clearError(): void {
    this.state.error = null
    this.notifySubscribers()
  }

  getState(): CartStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: CartStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
