import { useEffect, useState } from 'react'
import { api } from '@/data/Repository'
import { useAuthStore } from '@/shared/stores'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/shared/helpers'

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
  return null
}

interface LoanRow {
  id_prestamo: number
  titulo?: string
  autor?: string
  estado?: string
  extensiones?: number
  fecha_prestamo?: string
  fecha_devolucion?: string
  fecha_devolucion_real?: string
}

export default function LoansPage() {
  const { user } = useAuthStore()
  const { error: showError, success: showSuccess } = useToast()

  const [rows, setRows] = useState<LoanRow[]>([])
  const [error, setError] = useState<string>('')

  const load = async () => {
    setError('')

    if (!user?.id_usuario) {
      setRows([])
      setError('Inicia sesión para ver tus préstamos.')
      return
    }

    try {
      const response = await api.get<LoanRow[]>(
        `/prestamos?id_usuario=${encodeURIComponent(user.id_usuario)}`
      )
      setRows(Array.isArray(response.data) ? response.data : [])
    } catch {
      setRows([])
      setError('No se pudieron cargar los préstamos.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onUpdated = () => load()
    window.addEventListener('tga_loans_updated', onUpdated)
    return () => window.removeEventListener('tga_loans_updated', onUpdated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onExtender = async (id_prestamo: number) => {
    if (!user?.id_usuario) return

    try {
      const response = await api.post(`/prestamos/${encodeURIComponent(id_prestamo)}/extender`, {
        id_usuario: user.id_usuario,
      })

      if (response.error) {
        showError(response.error.message || 'No se pudo extender el préstamo')
        return
      }

      showSuccess('Préstamo extendido (+5 días)')
      await load()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'No se pudo extender el préstamo')
    }
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>Mis Préstamos</h1>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <div className='lg:hidden'>
          {error && <p className='px-4 py-4 text-sm text-gray-500'>{error}</p>}

          {!error && rows.length === 0 && (
            <p className='px-4 py-4 text-sm text-gray-500'>No tienes préstamos todavía.</p>
          )}

          {(rows || []).map((row) => {
            const estado = String(row?.estado || '').toLowerCase()
            const badgeClass = estado.includes('activo')
              ? 'bg-green-100 text-green-800'
              : estado.includes('venc')
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'

            const ext = Number(row?.extensiones) || 0
            const canExtend = estado.includes('activo') && ext < 2

            const imgSrc = getLocalCoverUrl(row?.titulo) || createCoverDataUri(row?.titulo)

            return (
              <div key={row.id_prestamo} className='border-t border-gray-200 p-4'>
                <div className='flex items-start gap-3'>
                  <img
                    className='h-12 w-12 rounded-xl shrink-0'
                    alt=''
                    src={imgSrc}
                    onError={(ev) => {
                      ev.currentTarget.onerror = null
                      ev.currentTarget.src = createCoverDataUri(row?.titulo)
                    }}
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <p
                        title={String(row?.titulo || 'Sin título')}
                        className='min-w-0 text-sm font-semibold text-gray-900 truncate'
                      >
                        {row?.titulo || 'Sin título'}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${badgeClass}`}
                      >
                        {(row?.estado || 'Desconocido') +
                          (estado.includes('activo') ? ` (${ext}/2)` : '')}
                      </span>
                    </div>

                    <p
                      title={String(row?.autor || 'Autor desconocido')}
                      className='mt-1 text-xs text-gray-500 truncate'
                    >
                      {row?.autor || 'Autor desconocido'}
                    </p>

                    <div className='mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700'>
                      <p>
                        <span className='font-semibold text-gray-900'>Préstamo:</span>{' '}
                        {formatDate(row?.fecha_prestamo || '')}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>Devolución:</span>{' '}
                        {formatDate(row?.fecha_devolucion || '')}
                      </p>
                    </div>

                    <div className='mt-3'>
                      {canExtend ? (
                        <button
                          type='button'
                          className='rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700'
                          onClick={() => onExtender(row.id_prestamo)}
                        >
                          Extender
                        </button>
                      ) : (
                        <span className='text-xs text-gray-500'>-</span>
                      )}
                    </div>
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
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Libro
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Fecha de Préstamo
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Fecha de Devolución
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Devolución efectiva
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Estado
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {error && (
                <tr>
                  <td colSpan={6} className='px-4 sm:px-6 py-4 text-sm text-gray-500'>
                    {error}
                  </td>
                </tr>
              )}

              {!error && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-4 sm:px-6 py-4 text-sm text-gray-500'>
                    No tienes préstamos todavía.
                  </td>
                </tr>
              )}

              {(rows || []).map((row) => {
                const estado = String(row?.estado || '').toLowerCase()
                const badgeClass = estado.includes('activo')
                  ? 'bg-green-100 text-green-800'
                  : estado.includes('venc')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'

                const ext = Number(row?.extensiones) || 0
                const canExtend = estado.includes('activo') && ext < 2

                const imgSrc = getLocalCoverUrl(row?.titulo) || createCoverDataUri(row?.titulo)

                return (
                  <tr key={row.id_prestamo}>
                    <td className='px-4 sm:px-6 py-4'>
                      <div className='flex items-center min-w-0'>
                        <div className='shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            alt=''
                            src={imgSrc}
                            onError={(ev) => {
                              ev.currentTarget.onerror = null
                              ev.currentTarget.src = createCoverDataUri(row?.titulo)
                            }}
                          />
                        </div>
                        <div className='ml-4 min-w-0'>
                          <div
                            title={String(row?.titulo || 'Sin título')}
                            className='text-sm font-medium text-gray-900 truncate'
                          >
                            {row?.titulo || 'Sin título'}
                          </div>
                          <div
                            title={String(row?.autor || 'Autor desconocido')}
                            className='text-sm text-gray-500 truncate'
                          >
                            {row?.autor || 'Autor desconocido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(row?.fecha_prestamo || '')}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(row?.fecha_devolucion || '')}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {row?.fecha_devolucion_real ? formatDate(row.fecha_devolucion_real) : '-'}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}
                      >
                        {(row?.estado || 'Desconocido') +
                          (estado.includes('activo') ? ` (${ext}/2)` : '')}
                      </span>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                      {canExtend ? (
                        <button
                          type='button'
                          className='rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700'
                          onClick={() => onExtender(row.id_prestamo)}
                        >
                          Extender
                        </button>
                      ) : (
                        <span className='text-xs text-gray-500'>-</span>
                      )}
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
