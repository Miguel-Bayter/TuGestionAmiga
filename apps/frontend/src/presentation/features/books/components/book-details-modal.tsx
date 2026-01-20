/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Book } from '@/shared/types'
import { api } from '@/data/Repository'
import { useAuthStore } from '@/shared/stores'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/shared/helpers'

interface BookDetailsModalProps {
  open: boolean
  onClose?: () => void
  book: Book | null
  mode?: 'todos' | 'comprar' | 'rentable'
}

interface LoanHistoryRow {
  id_prestamo: number
  nombre?: string
  correo?: string
  usuario?: string
  nombre_usuario?: string
  nombreCliente?: string
  cliente?: string
  fecha_prestamo: string
  fecha_devolucion?: string
  fechaDevolucion?: string
  fecha_devolución?: string
  fecha_vencimiento?: string
  fechaVencimiento?: string
  fecha_fin?: string
  fechaFin?: string
  estado?: string
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

export default function BookDetailsModal({
  open,
  onClose,
  book,
  mode = 'todos',
}: BookDetailsModalProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { success, error: showError } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollYRef = useRef<number>(0)

  const [coversRev, setCoversRev] = useState<number>(0)
  const [detail, setDetail] = useState<Book | null>(null)
  const [history, setHistory] = useState<LoanHistoryRow[]>([])
  const [historyError, setHistoryError] = useState<string>('')
  const [buyQty, setBuyQty] = useState<number>(1)
  const [cartRev, setCartRev] = useState<number>(0)

  const isAdmin = user?.id_rol === 1
  const idLibro = Number(book?.id_libro)

  useEffect(() => {
    if (!open) return
    setCoversRev((v) => v + 1)
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    scrollYRef.current = window.scrollY

    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`

    const t = setTimeout(() => {
      try {
        dialogRef.current?.focus({ preventScroll: true })
      } catch {
        dialogRef.current?.focus()
      }

      try {
        window.scrollTo(0, scrollYRef.current || 0)
      } catch {
        // ignore
      }
    }, 0)

    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [open])

  useEffect(() => {
    const onUpdated = () => setCartRev((v) => v + 1)
    window.addEventListener('tga_cart_updated', onUpdated)
    return () => window.removeEventListener('tga_cart_updated', onUpdated)
  }, [])

  useEffect(() => {
    if (!open) return
    if (!Number.isFinite(idLibro)) return

    let cancelled = false

    ;(async () => {
      try {
        const response = await api.get<Book>(`/libros/${idLibro}`)
        if (!cancelled) {
          setDetail(response.data || book || null)
        }
      } catch {
        if (!cancelled) setDetail(book || null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, idLibro, book])

  useEffect(() => {
    if (!open) return
    setBuyQty(1)
  }, [open, idLibro])

  useEffect(() => {
    if (!open) return
    if (!Number.isFinite(idLibro)) return

    if (!isAdmin) {
      setHistory([])
      setHistoryError('')
      return
    }

    let cancelled = false

    ;(async () => {
      setHistoryError('')
      try {
        const response = await api.get<LoanHistoryRow[]>(`/libros/${idLibro}/historial`)
        if (!cancelled) {
          setHistory(Array.isArray(response.data) ? response.data : [])
        }
      } catch {
        if (!cancelled) {
          setHistory([])
          setHistoryError('No se pudo cargar el historial.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, idLibro, isAdmin])

  const effective = detail || book || null

  const stockCompra = Number(effective?.stock_compra)
  const stockRenta = Number(effective?.stock_renta)
  const hasSplitStock = Number.isFinite(stockCompra) || Number.isFinite(stockRenta)

  const getInCartQty = (): number => {
    try {
      const list = (window as unknown as { __tga_cart_items?: unknown }).__tga_cart_items
      const items = Array.isArray(list) ? list : []
      const id = Number(effective?.id_libro)
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
    : effective?.disponibilidad === 1
  const rentAvailable = Number.isFinite(stockRenta)
    ? stockRenta > 0
    : effective?.disponibilidad === 1
  const isAvailable = hasSplitStock
    ? buyAvailable || rentAvailable
    : effective?.disponibilidad === 1

  const coverSrc = useMemo(() => {
    return (
      (coversRev >= 0 ? getLocalCoverUrl(effective?.titulo) : null) ||
      createCoverDataUri(effective?.titulo)
    )
  }, [effective?.titulo, coversRev])

  const ensureUserOrRedirect = () => {
    if (!user?.id_usuario) {
      navigate('/login')
      return null
    }
    return user
  }

  const handleUserError = (msg: string) => {
    if (msg.toLowerCase().includes('usuario no encontrado')) {
      logout()
      showError(msg)
      navigate('/login')
      return
    }
    showError(msg)
  }

  const onBuy = async () => {
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return
    if (!effective?.id_libro) return

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
        id_libro: effective.id_libro,
        cantidad,
      })

      if (response.error) {
        handleUserError(response.error.message || 'No se pudo registrar la compra')
        return
      }

      window.dispatchEvent(new Event('tga_cart_updated'))
      window.dispatchEvent(new Event('tga_catalog_updated'))
      success('Agregado al carrito')
    } catch (e: unknown) {
      handleUserError((e as { message?: string }).message || 'No se pudo registrar la compra')
    }
  }

  const onRent = async () => {
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return
    if (!effective?.id_libro) return

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
        id_libro: effective.id_libro,
        cantidad,
      })

      if (response.error) {
        handleUserError(response.error.message || 'No se pudo registrar el préstamo')
        return
      }

      window.dispatchEvent(new Event('tga_catalog_updated'))
      window.dispatchEvent(new Event('tga_loans_updated'))
      success('Agregado a su lista de renta')
    } catch (e: unknown) {
      handleUserError((e as { message?: string }).message || 'No se pudo registrar el préstamo')
    }
  }

  const formatHistoryDate = (value: string | undefined): string => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (!open) return null

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

  const qtyDisabled =
    showBuy && !showRent
      ? !buyAvailable
      : showRent && !showBuy
        ? !rentAvailable
        : !(buyAvailable || rentAvailable)

  const modal = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className='fixed inset-0 z-70 flex items-start justify-center bg-black/50 p-4 pt-6 sm:pt-4 backdrop-blur-sm'
      role='dialog'
      aria-modal='true'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className='flex flex-col w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5'>
        <div className='flex items-start justify-between gap-3 p-5 text-white bg-linear-to-r from-indigo-600 to-sky-500'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-white/80'>Libros &gt; Detalle del Libro</p>
            <h3 className='text-xl font-extrabold tracking-tight'>Detalle del Libro</h3>
          </div>
          <button
            type='button'
            className='rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20'
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className='flex-1 overflow-y-auto bg-gray-50 p-5'>
          <div className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
            <div className='grid grid-cols-1 gap-6 p-5 md:grid-cols-[240px_1fr]'>
              <div className='flex flex-col items-center space-y-3 md:items-stretch'>
                <img
                  src={coverSrc}
                  alt='Portada del libro'
                  className='w-full max-w-[260px] rounded-2xl border border-gray-100 object-cover shadow-sm md:max-w-none aspect-3/4'
                  onError={(ev) => {
                    ev.currentTarget.onerror = null
                    ev.currentTarget.src = createCoverDataUri(effective?.titulo)
                  }}
                />
              </div>

              <div className='min-w-0 space-y-3'>
                <h4 className='text-xl md:text-2xl font-extrabold tracking-tight text-gray-900'>
                  {effective?.titulo || 'Cargando...'}
                </h4>

                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Autor:</span>
                    <span className='text-gray-700'>{effective?.autor || '-'}</span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Precio:</span>
                    <span className='text-gray-700'>
                      {effective?.valor != null && String(effective.valor) !== ''
                        ? formatCurrency(effective.valor)
                        : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Stock compra:</span>
                    <span className='text-gray-700'>
                      {Number.isFinite(stockCompra) ? stockCompra : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Stock préstamo:</span>
                    <span className='text-gray-700'>
                      {Number.isFinite(stockRenta) ? stockRenta : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Cantidad:</span>
                    {showQty ? (
                      <input
                        type='number'
                        min={1}
                        max={inputMax}
                        className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-24'
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
                          if (Number.isFinite(inputMax) && inputMax! > 0 && n > inputMax!)
                            n = inputMax!
                          setBuyQty(n)
                        }}
                        disabled={qtyDisabled}
                      />
                    ) : (
                      <span className='text-gray-700'>-</span>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Categoría:</span>
                    {effective?.nombre_categoria ? (
                      <span className='inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200'>
                        {String(effective.nombre_categoria)}
                      </span>
                    ) : (
                      <span className='text-gray-700'>-</span>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Disponibilidad:</span>
                    <span
                      className={
                        Number.isFinite(Number(effective?.disponibilidad))
                          ? isAvailable
                            ? 'inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'
                            : 'inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200'
                          : 'inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200'
                      }
                    >
                      {Number.isFinite(Number(effective?.disponibilidad))
                        ? isAvailable
                          ? 'Disponible'
                          : 'No disponible'
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className='rounded-xl border border-gray-200 bg-white p-4'>
                  <p className='text-sm font-bold text-gray-900'>Descripción</p>
                  <p className='text-sm leading-relaxed text-gray-700 whitespace-pre-line'>
                    {effective?.descripcion || 'Sin descripción.'}
                  </p>
                </div>

                <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  {showBuy ? (
                    <button
                      type='button'
                      className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 ${!buyAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      disabled={!buyAvailable}
                      onClick={onBuy}
                    >
                      Comprar
                    </button>
                  ) : (
                    <span />
                  )}

                  {showRent ? (
                    <button
                      type='button'
                      className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 ${!rentAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      disabled={!rentAvailable}
                      onClick={onRent}
                    >
                      Prestar
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type='button'
                    className='w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400'
                    onClick={onClose}
                  >
                    Regresar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className='mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm'>
              <div className='border-b border-gray-200 px-5 py-4'>
                <h5 className='text-base font-extrabold tracking-tight text-gray-900'>
                  Préstamos anteriores
                </h5>
              </div>
              <div className='p-5'>
                {historyError && <p className='text-sm text-rose-600'>{historyError}</p>}

                {!historyError && (!Array.isArray(history) || history.length === 0) && (
                  <p className='text-sm text-gray-500'>
                    Este libro todavía no tiene préstamos registrados.
                  </p>
                )}

                {Array.isArray(history) && history.length > 0 && (
                  <div>
                    <div className='space-y-3 sm:hidden'>
                      {history.map((row) => (
                        <div
                          key={row.id_prestamo}
                          className='rounded-xl border border-gray-200 bg-white p-4'
                        >
                          <p className='text-sm font-semibold text-gray-900'>
                            {row.nombre || row.correo || 'Usuario'}
                          </p>
                          <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700'>
                            <p>
                              <span className='font-semibold text-gray-900'>Préstamo:</span>{' '}
                              {formatHistoryDate(row.fecha_prestamo)}
                            </p>
                            <p>
                              <span className='font-semibold text-gray-900'>Devolución:</span>{' '}
                              {formatHistoryDate(
                                row.fecha_devolucion ||
                                  row.fechaDevolucion ||
                                  row.fecha_devolución ||
                                  row.fecha_vencimiento ||
                                  row.fechaVencimiento ||
                                  row.fecha_fin ||
                                  row.fechaFin
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='hidden sm:block overflow-hidden'>
                      <table className='w-full table-fixed divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600'>
                              Usuario
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600'>
                              Fecha de préstamo
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600'>
                              Fecha de devolución
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                          {history.map((row) => (
                            <tr key={row.id_prestamo}>
                              <td
                                title={String(row.nombre || row.correo || 'Usuario')}
                                className='px-6 py-4 text-sm text-gray-800 truncate'
                              >
                                {row.nombre || row.correo || 'Usuario'}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                {formatHistoryDate(row.fecha_prestamo)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                {formatHistoryDate(
                                  row.fecha_devolucion ||
                                    row.fechaDevolucion ||
                                    row.fecha_devolución ||
                                    row.fecha_vencimiento ||
                                    row.fechaVencimiento ||
                                    row.fecha_fin ||
                                    row.fechaFin
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
