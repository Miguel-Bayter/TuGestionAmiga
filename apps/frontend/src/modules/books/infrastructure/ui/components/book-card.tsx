import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Book } from '@/shared/types'
import { api } from '@/data/Repository'
import { useAuthStore } from '@/shared/stores'
import { useToast } from '@/shared/hooks/use-toast.hook'

interface BookCardProps {
  book: Book
  onOpenDetails?: (book: Book) => void
  mode?: 'todos' | 'comprar' | 'rentable'
}

// Temporary placeholder functions until covers lib is migrated
const createCoverDataUri = (title?: string): string => {
  const text = (title || 'Libro').substring(0, 2).toUpperCase()
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="300" fill="${color}"/>
      <text x="50%" y="50%" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">${text}</text>
    </svg>
  `)}`
}

const getLocalCoverUrl = (_title?: string): string | null => {
  // TODO: Implement local cover URL logic when covers lib is migrated
  return null
}

export default function BookCard({ book, onOpenDetails, mode = 'todos' }: BookCardProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { success, error: showError } = useToast()

  const [buyQty, setBuyQty] = useState<number>(1)
  const [cartRev, setCartRev] = useState<number>(0)
  const [coversRev, setCoversRev] = useState<number>(0)

  useEffect(() => {
    const onUpdated = () => setCartRev((v) => v + 1)
    window.addEventListener('tga_cart_updated', onUpdated)
    return () => window.removeEventListener('tga_cart_updated', onUpdated)
  }, [])

  useEffect(() => {
    // Trigger cover reload
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoversRev((v) => v + 1)
  }, [])

  // Stock calculations
  const stockCompra = Number(book.stock_compra)
  const stockRenta = Number(book.stock_renta)
  const hasSplitStock = Number.isFinite(stockCompra) || Number.isFinite(stockRenta)

  const getInCartQty = (): number => {
    try {
      const list = (window as unknown as { __tga_cart_items?: unknown }).__tga_cart_items
      const items = Array.isArray(list) ? list : []
      const id = Number(book.id_libro)
      if (!Number.isFinite(id)) return 0
      const found = items.find(
        (it: unknown) => Number((it as { id_libro?: unknown })?.id_libro) === id
      )
      const n = Number((found as { cantidad?: unknown })?.cantidad)
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0
    } catch {
      return 0
    }
  }

  const inCartQty = cartRev >= 0 ? getInCartQty() : 0
  const buyRemaining = Number.isFinite(stockCompra)
    ? Math.max(Math.trunc(stockCompra) - inCartQty, 0)
    : undefined

  const buyAvailable = Number.isFinite(stockCompra)
    ? (buyRemaining ?? 0) > 0
    : book.disponibilidad === 1
  const rentAvailable = Number.isFinite(stockRenta) ? stockRenta > 0 : book.disponibilidad === 1
  const isAvailable = hasSplitStock ? buyAvailable || rentAvailable : book.disponibilidad === 1

  const statusText = isAvailable ? 'En stock' : 'No disponible'

  const stockValue = hasSplitStock
    ? (Number.isFinite(stockCompra) ? stockCompra : 0) +
      (Number.isFinite(stockRenta) ? stockRenta : 0)
    : typeof book.stock === 'number' || Number.isFinite(Number(book.stock))
      ? Number(book.stock)
      : isAvailable
        ? 1
        : 0

  const coverSrc =
    (coversRev >= 0 ? getLocalCoverUrl(book.titulo) : null) || createCoverDataUri(book.titulo)

  const ensureUserOrRedirect = () => {
    if (!user?.id_usuario) {
      navigate('/login')
      return null
    }
    return user
  }

  const handleCompraError = (msg: string) => {
    if (msg.toLowerCase().includes('usuario no encontrado')) {
      logout()
      showError(msg)
      navigate('/login')
      return
    }
    showError(msg)
  }

  const onBuy = async () => {
    if (!book.id_libro) return
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return

    const cantidad = Number(buyQty)
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      showError('Cantidad inválida')
      return
    }

    const cartQty = getInCartQty()
    const remaining = Number.isFinite(stockCompra)
      ? Math.max(Math.trunc(stockCompra) - cartQty, 0)
      : undefined

    if (Number.isFinite(remaining) && cantidad > remaining!) {
      showError(
        remaining! <= 0
          ? 'Ya tienes el stock máximo de este libro en tu carrito.'
          : 'No hay stock suficiente para esa cantidad'
      )
      return
    }

    try {
      const response = await api.post('/carrito', {
        id_usuario: currentUser.id_usuario,
        id_libro: book.id_libro,
        cantidad,
      })

      if (response.error) {
        handleCompraError(response.error.message || 'No se pudo registrar la compra')
        return
      }

      window.dispatchEvent(new Event('tga_cart_updated'))
      window.dispatchEvent(new Event('tga_catalog_updated'))
      success('Agregado al carrito')
    } catch (e: unknown) {
      handleCompraError((e as { message?: string }).message || 'No se pudo registrar la compra')
    }
  }

  const onRent = async () => {
    if (!book.id_libro) return
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return

    const cantidad = Number(buyQty)
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      showError('Cantidad inválida')
      return
    }

    if (Number.isFinite(stockRenta) && cantidad > stockRenta) {
      showError('No hay stock suficiente para esa cantidad')
      return
    }

    try {
      const response = await api.post('/prestamos', {
        id_usuario: currentUser.id_usuario,
        id_libro: book.id_libro,
        cantidad,
      })

      if (response.error) {
        handleCompraError(response.error.message || 'No se pudo registrar el préstamo')
        return
      }

      window.dispatchEvent(new Event('tga_catalog_updated'))
      window.dispatchEvent(new Event('tga_loans_updated'))
      success('Agregado a su lista de renta')
    } catch (e: unknown) {
      handleCompraError((e as { message?: string }).message || 'No se pudo registrar el préstamo')
    }
  }

  const showRent = mode !== 'comprar'
  const showBuy = mode !== 'rentable'
  const showQty = showBuy || showRent

  const qtyMax =
    showBuy && !showRent && Number.isFinite(stockCompra)
      ? buyRemaining
      : showRent && !showBuy && Number.isFinite(stockRenta)
        ? stockRenta
        : undefined

  const inputMax =
    Number.isFinite(qtyMax) && qtyMax! > 0
      ? qtyMax
      : Number.isFinite(stockCompra) && Number.isFinite(stockRenta)
        ? Math.max(buyRemaining ?? 0, stockRenta)
        : Number.isFinite(stockCompra)
          ? (buyRemaining ?? undefined)
          : Number.isFinite(stockRenta)
            ? stockRenta
            : undefined

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg'>
      <div className='p-4 flex flex-col sm:flex-row gap-4 items-start'>
        <img
          src={coverSrc}
          alt={`Portada del libro ${book.titulo || ''}`.trim()}
          className='w-20 sm:w-24 md:w-28 object-cover rounded-md border border-gray-200 shrink-0 bg-gray-50'
          onError={(ev) => {
            ev.currentTarget.onerror = null
            ev.currentTarget.src = createCoverDataUri(book.titulo)
          }}
        />

        <div className='flex-1'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>{book.titulo || 'Sin título'}</h3>
              <p className='text-sm text-gray-600 mt-1'>
                {(book.autor || 'Autor desconocido') +
                  (book.nombre_categoria ? ` · ${book.nombre_categoria}` : '')}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
            >
              {statusText}
            </span>
          </div>

          <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
            {hasSplitStock ? (
              <>
                <span>Stock compra: {Number.isFinite(stockCompra) ? stockCompra : 0}</span>
                <span>Stock préstamo: {Number.isFinite(stockRenta) ? stockRenta : 0}</span>
              </>
            ) : (
              <span>Stock: {stockValue}</span>
            )}

            {showQty && (
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-700'>Cantidad</span>
                <input
                  type='number'
                  min={1}
                  max={inputMax}
                  className='rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-16'
                  value={buyQty}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setBuyQty(1)
                      return
                    }
                    let n = Number(raw)
                    if (!Number.isFinite(n)) return
                    n = Math.trunc(n)
                    if (n < 1) n = 1
                    if (Number.isFinite(inputMax) && inputMax! > 0 && n > inputMax!) n = inputMax!
                    setBuyQty(n)
                  }}
                  disabled={
                    showBuy && !showRent
                      ? !buyAvailable
                      : showRent && !showBuy
                        ? !rentAvailable
                        : !(buyAvailable || rentAvailable)
                  }
                />
              </div>
            )}
          </div>

          <div
            className={
              mode !== 'todos'
                ? 'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2'
                : 'mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2'
            }
          >
            <button
              type='button'
              className='w-full px-3 py-2 text-xs font-semibold rounded-md bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500'
              onClick={() => onOpenDetails?.(book)}
            >
              Ver detalles
            </button>

            {showBuy && (
              <button
                type='button'
                className={`w-full px-3 py-2 text-xs font-semibold rounded-md bg-amber-600 text-white shadow-sm hover:bg-amber-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 ${!buyAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                disabled={!buyAvailable}
                onClick={onBuy}
              >
                Comprar
              </button>
            )}

            {showRent && (
              <button
                type='button'
                className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500 rent-action ${!rentAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                disabled={!rentAvailable}
                onClick={onRent}
              >
                Rentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
