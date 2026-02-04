/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Book } from '@/shared/domain/types'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'
import { formatCurrency } from '@/shared/application/helpers'

interface BookDetailsModalProps {
  open: boolean
  onClose?: () => void
  book: Book | null
  mode?: 'all' | 'buy' | 'rental'
}

interface LoanHistoryRow {
  id: number
  name?: string
  email?: string
  user?: string
  userName?: string
  clientName?: string
  client?: string
  loanDate: string
  returnDate?: string
  dueDate?: string
  endDate?: string
  status?: string
}

// Temporary placeholder functions until covers lib is migrated
const createCoverDataUri = (title?: string): string => {
  const text = (title || 'Book').substring(0, 2).toUpperCase()
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
  mode = 'all',
}: BookDetailsModalProps) {
  const navigate = useNavigate()
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user } = useServiceState(authService) as any
  const { success, error: showError } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollYRef = useRef<number>(0)

  const [coversRev, setCoversRev] = useState<number>(0)
  const [detail, setDetail] = useState<Book | null>(null)
  const [history, setHistory] = useState<LoanHistoryRow[]>([])
  const [historyError, setHistoryError] = useState<string>('')
  const [buyQty, setBuyQty] = useState<number>(1)
  const [cartRev, setCartRev] = useState<number>(0)

  const isAdmin = user?.id === 1
  const bookId = Number(book?.id)

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
    if (!Number.isFinite(bookId)) return

    let cancelled = false

    ;(async () => {
      try {
        const response = await api.get<Book>(`/libros/${bookId}`)
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
  }, [open, bookId, book])

  useEffect(() => {
    if (!open) return
    setBuyQty(1)
  }, [open, bookId])

  useEffect(() => {
    if (!open) return
    if (!Number.isFinite(bookId)) return

    if (!isAdmin) {
      setHistory([])
      setHistoryError('')
      return
    }

    let cancelled = false

    ;(async () => {
      setHistoryError('')
      try {
        const response = await api.get<LoanHistoryRow[]>(`/libros/${bookId}/historial`)
        if (!cancelled) {
          setHistory(Array.isArray(response.data) ? response.data : [])
        }
      } catch {
        if (!cancelled) {
          setHistory([])
          setHistoryError('Could not load history.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, bookId, isAdmin])

  const effective = detail || book || null

  const purchaseStock = Number(effective?.stock)
  const rentalStock = Number(effective?.rentalStock)
  const hasSplitStock = Number.isFinite(purchaseStock) || Number.isFinite(rentalStock)

  const getInCartQty = (): number => {
    try {
      const list = (window as unknown as { __tga_cart_items?: unknown }).__tga_cart_items
      const items = Array.isArray(list) ? list : []
      const id = Number(effective?.id)
      if (!Number.isFinite(id)) return 0
      const found = items.find((it: unknown) => Number((it as { id?: unknown })?.id) === id)
      const n = Number((found as { quantity?: unknown })?.quantity)
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0
    } catch {
      return 0
    }
  }

  const inCartQty = cartRev >= 0 ? getInCartQty() : 0
  const buyRemaining = Number.isFinite(purchaseStock)
    ? Math.max(Math.trunc(purchaseStock) - inCartQty, 0)
    : undefined

  const buyAvailable = Number.isFinite(purchaseStock)
    ? (buyRemaining ?? 0) > 0
    : effective?.availability === true
  const rentAvailable = Number.isFinite(rentalStock)
    ? rentalStock > 0
    : effective?.availability === true
  const isAvailable = hasSplitStock
    ? buyAvailable || rentAvailable
    : effective?.availability === true

  const coverSrc = useMemo(() => {
    return (
      (coversRev >= 0 ? getLocalCoverUrl(effective?.title) : null) ||
      createCoverDataUri(effective?.title)
    )
  }, [effective?.title, coversRev])

  const ensureUserOrRedirect = () => {
    if (!user?.id) {
      navigate('/login')
      return null
    }
    return user
  }

  const handleUserError = (msg: string) => {
    if (msg.toLowerCase().includes('user not found')) {
      authService.logout()
      showError(msg)
      navigate('/login')
      return
    }
    showError(msg)
  }

  const onBuy = async () => {
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return
    if (!effective?.id) return

    const quantity = Number(buyQty)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      showError('Invalid quantity')
      return
    }

    const cartQty = getInCartQty()
    const remaining = Number.isFinite(purchaseStock)
      ? Math.max(Math.trunc(purchaseStock) - cartQty, 0)
      : undefined

    if (Number.isFinite(remaining) && quantity > remaining!) {
      showError(
        remaining! <= 0
          ? 'You already have the maximum stock of this book in your cart'
          : 'Not enough stock for that quantity'
      )
      return
    }

    try {
      const response = await api.post('/cart', {
        userId: currentUser.id,
        bookId: effective.id,
        quantity,
      })

      if (response.error) {
        handleUserError(response.error.message || 'Could not register purchase')
        return
      }

      window.dispatchEvent(new Event('tga_cart_updated'))
      window.dispatchEvent(new Event('tga_catalog_updated'))
      success('Added to cart')
    } catch (e: unknown) {
      handleUserError((e as { message?: string }).message || 'Could not register purchase')
    }
  }

  const onRent = async () => {
    const currentUser = ensureUserOrRedirect()
    if (!currentUser) return
    if (!effective?.id) return

    const quantity = Number(buyQty)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      showError('Invalid quantity')
      return
    }

    if (Number.isFinite(rentalStock) && quantity > rentalStock) {
      showError('Not enough stock for that quantity')
      return
    }

    try {
      const response = await api.post('/loans', {
        userId: currentUser.id,
        bookId: effective.id,
        quantity,
      })

      if (response.error) {
        handleUserError(response.error.message || 'Could not register loan')
        return
      }

      window.dispatchEvent(new Event('tga_catalog_updated'))
      window.dispatchEvent(new Event('tga_loans_updated'))
      success('Added to your rental list')
    } catch (e: unknown) {
      handleUserError((e as { message?: string }).message || 'Could not register loan')
    }
  }

  const formatHistoryDate = (value: string | undefined): string => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (!open) return null

  const showRent = mode !== 'buy'
  const showBuy = mode !== 'rental'
  const showQty = showBuy || showRent

  const qtyMax =
    showBuy && !showRent && Number.isFinite(purchaseStock)
      ? buyRemaining
      : showRent && !showBuy && Number.isFinite(rentalStock)
        ? rentalStock
        : undefined

  const inputMax =
    Number.isFinite(qtyMax) && qtyMax! > 0
      ? qtyMax
      : Number.isFinite(purchaseStock) && Number.isFinite(rentalStock)
        ? Math.max(buyRemaining ?? 0, rentalStock)
        : Number.isFinite(purchaseStock)
          ? (buyRemaining ?? undefined)
          : Number.isFinite(rentalStock)
            ? rentalStock
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
            <p className='text-xs font-medium text-white/80'>Books &gt; Book Details</p>
            <h3 className='text-xl font-extrabold tracking-tight'>Book Details</h3>
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
                  alt='Book cover'
                  className='w-full max-w-[260px] rounded-2xl border border-gray-100 object-cover shadow-sm md:max-w-none aspect-3/4'
                  onError={(ev) => {
                    ev.currentTarget.onerror = null
                    ev.currentTarget.src = createCoverDataUri(effective?.title)
                  }}
                />
              </div>

              <div className='min-w-0 space-y-3'>
                <h4 className='text-xl md:text-2xl font-extrabold tracking-tight text-gray-900'>
                  {effective?.title || 'Loading...'}
                </h4>

                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Author:</span>
                    <span className='text-gray-700'>{effective?.author || '-'}</span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Price:</span>
                    <span className='text-gray-700'>
                      {effective?.price != null && String(effective.price) !== ''
                        ? formatCurrency(effective.price)
                        : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Purchase stock:</span>
                    <span className='text-gray-700'>
                      {Number.isFinite(purchaseStock) ? purchaseStock : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Rental stock:</span>
                    <span className='text-gray-700'>
                      {Number.isFinite(rentalStock) ? rentalStock : '-'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Quantity:</span>
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
                    <span className='font-semibold text-gray-900'>Category:</span>
                    {effective?.categoryName ? (
                      <span className='inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200'>
                        {String(effective.categoryName)}
                      </span>
                    ) : (
                      <span className='text-gray-700'>-</span>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-700'>
                    <span className='font-semibold text-gray-900'>Availability:</span>
                    <span
                      className={
                        typeof effective?.availability === 'boolean'
                          ? isAvailable
                            ? 'inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'
                            : 'inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200'
                          : 'inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200'
                      }
                    >
                      {typeof effective?.availability === 'boolean'
                        ? isAvailable
                          ? 'Available'
                          : 'Not available'
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className='rounded-xl border border-gray-200 bg-white p-4'>
                  <p className='text-sm font-bold text-gray-900'>Description</p>
                  <p className='text-sm leading-relaxed text-gray-700 whitespace-pre-line'>
                    {effective?.description || 'No description available.'}
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
                      Buy
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
                      Rent
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type='button'
                    className='w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400'
                    onClick={onClose}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className='mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm'>
              <div className='border-b border-gray-200 px-5 py-4'>
                <h5 className='text-base font-extrabold tracking-tight text-gray-900'>
                  Previous loans
                </h5>
              </div>
              <div className='p-5'>
                {historyError && <p className='text-sm text-rose-600'>{historyError}</p>}

                {!historyError && (!Array.isArray(history) || history.length === 0) && (
                  <p className='text-sm text-gray-500'>
                    This book has no registered loans yet.
                  </p>
                )}

                {Array.isArray(history) && history.length > 0 && (
                  <div>
                    <div className='space-y-3 sm:hidden'>
                      {history.map((row) => (
                        <div
                          key={row.id}
                          className='rounded-xl border border-gray-200 bg-white p-4'
                        >
                          <p className='text-sm font-semibold text-gray-900'>
                            {row.name || row.email || 'User'}
                          </p>
                          <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700'>
                            <p>
                              <span className='font-semibold text-gray-900'>Loan:</span>{' '}
                              {formatHistoryDate(row.loanDate)}
                            </p>
                            <p>
                              <span className='font-semibold text-gray-900'>Return:</span>{' '}
                              {formatHistoryDate(
                                row.returnDate ||
                                  row.dueDate ||
                                  row.endDate ||
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
                              User
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600'>
                              Loan date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600'>
                              Return date
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200 bg-white'>
                          {history.map((row) => (
                            <tr key={row.id}>
                              <td
                                title={String(row.name || row.email || 'User')}
                                className='px-6 py-4 text-sm text-gray-800 truncate'
                              >
                                {row.name || row.email || 'User'}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                {formatHistoryDate(row.loanDate)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                {formatHistoryDate(
                                  row.returnDate ||
                                    row.dueDate ||
                                    row.endDate ||
                                    ''
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
