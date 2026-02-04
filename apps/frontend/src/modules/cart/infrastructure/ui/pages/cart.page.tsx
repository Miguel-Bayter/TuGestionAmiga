import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/data/Repository'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'
import { formatCurrency } from '@/shared/application/helpers'

interface CartItemData {
  bookId: number
  title?: string
  author?: string
  quantity?: number
  price?: number
}

export default function CartPage() {
  const container = useContainer()
  const { authService } = container.cradle
  const { user } = useServiceState(authService)
  const { success: showSuccess, error: showError } = useToast()

  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingOut, setCheckingOut] = useState<boolean>(false)

  const load = useCallback(async () => {
    if (!user?.id) {
      setItems([])
      showError('Sign in to view your cart.')
      return
    }

    setLoading(true)
    try {
      const response = await api.get<CartItemData[]>(
        `/cart?userId=${encodeURIComponent(user.id)}`
      )
      setItems(Array.isArray(response.data) ? response.data : [])
    } catch (e: unknown) {
      setItems([])
      showError((e as { message?: string }).message || 'Could not load cart.')
    } finally {
      setLoading(false)
    }
  }, [showError, user?.id])

  useEffect(() => {
    load()
  }, [load])

  const total = useMemo(() => {
    let sum = 0
    for (const it of items || []) {
      const qty = Number(it?.quantity) || 0
      const price = Number(it?.price)
      if (qty > 0 && Number.isFinite(price)) sum += qty * price
    }
    return sum
  }, [items])

  const onRemove = async (bookId: number) => {
    if (!user?.id) return

    try {
      const response = await api.delete(
        `/cart/${encodeURIComponent(bookId)}?userId=${encodeURIComponent(user.id)}`
      )

      if (response.error) {
        showError(response.error.message || 'Could not remove item.')
        return
      }

      showSuccess('Item removed from cart.')
      window.dispatchEvent(new Event('tga_cart_updated'))
      await load()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'Could not remove item.')
    }
  }

  const onCheckout = async () => {
    if (!user?.id) return

    const totalLabel = formatCurrency(total)

    setCheckingOut(true)
    try {
      const response = await api.post('/cart/checkout', {
        userId: user.id,
      })

      if (response.error) {
        showError(response.error.message || 'Could not complete purchase.')
        return
      }

      showSuccess('Purchase completed.')
      window.dispatchEvent(new Event('tga_cart_updated'))
      window.dispatchEvent(new Event('tga_catalog_updated'))
      window.dispatchEvent(
        new CustomEvent('tga_toast', {
          detail: { message: `Purchase successful! Total: ${totalLabel}. Thank you for your purchase.` },
        })
      )
      await load()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'Could not complete purchase.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Cart</h1>
        <p className='text-gray-600 mt-1'>Review your books before purchasing.</p>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <div className='px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>My items</h2>
          <button
            type='button'
            className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 active:translate-y-px disabled:opacity-50 w-full sm:w-auto'
            disabled={checkingOut || loading || (items || []).length === 0}
            onClick={onCheckout}
          >
            Buy ({formatCurrency(total)})
          </button>
        </div>

        <div className='lg:hidden'>
          {loading && <p className='px-4 py-4 text-sm text-gray-500'>Loading...</p>}

          {!loading && (!items || items.length === 0) && (
            <p className='px-4 py-4 text-sm text-gray-500'>Your cart is empty.</p>
          )}

          {(items || []).map((it) => {
            const qty = Number(it?.quantity) || 0
            const price = Number(it?.price)
            const subtotal = Number.isFinite(price) ? qty * price : null

            return (
              <div key={it.bookId} className='border-t border-gray-200 p-4'>
                <div className='min-w-0'>
                  <p
                    title={String(it?.title || '-')}
                    className='text-sm font-semibold text-gray-900 truncate'
                  >
                    {it?.title || '-'}
                  </p>
                  <p
                    title={String(it?.author || '-')}
                    className='mt-1 text-xs text-gray-500 truncate'
                  >
                    {it?.author || '-'}
                  </p>

                  <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
                    <p className='text-gray-600'>
                      <span className='font-semibold text-gray-900'>Quantity:</span> {qty}
                    </p>
                    <p className='text-gray-600'>
                      <span className='font-semibold text-gray-900'>Price:</span>{' '}
                      {Number.isFinite(price) ? formatCurrency(price) : '-'}
                    </p>
                    <p className='col-span-2 text-gray-600'>
                      <span className='font-semibold text-gray-900'>Subtotal:</span>{' '}
                      {subtotal == null ? '-' : formatCurrency(subtotal)}
                    </p>
                  </div>

                  <div className='mt-3 flex justify-end'>
                    <button
                      type='button'
                      className='rounded-lg bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 active:translate-y-px'
                      onClick={() => onRemove(it.bookId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className='hidden lg:block overflow-hidden'>
          <table className='w-full table-fixed divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Book
                </th>
                <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Subtotal
                </th>
                <th className='px-4 sm:px-6 py-3' />
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading && (
                <tr>
                  <td colSpan={5} className='px-4 sm:px-6 py-4 text-sm text-gray-500'>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && (!items || items.length === 0) && (
                <tr>
                  <td colSpan={5} className='px-4 sm:px-6 py-4 text-sm text-gray-500'>
                    Your cart is empty.
                  </td>
                </tr>
              )}

              {(items || []).map((it) => {
                const qty = Number(it?.quantity) || 0
                const price = Number(it?.price)
                const subtotal = Number.isFinite(price) ? qty * price : null

                return (
                  <tr key={it.bookId}>
                    <td className='px-4 sm:px-6 py-4'>
                      <div
                        title={String(it?.title || '-')}
                        className='text-sm font-medium text-gray-900 truncate'
                      >
                        {it?.title || '-'}
                      </div>
                      <div
                        title={String(it?.author || '-')}
                        className='text-sm text-gray-500 truncate'
                      >
                        {it?.author || '-'}
                      </div>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {qty}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {Number.isFinite(price) ? formatCurrency(price) : '-'}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {subtotal == null ? '-' : formatCurrency(subtotal)}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-right'>
                      <button
                        type='button'
                        className='rounded-lg bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 active:translate-y-px'
                        onClick={() => onRemove(it.bookId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
