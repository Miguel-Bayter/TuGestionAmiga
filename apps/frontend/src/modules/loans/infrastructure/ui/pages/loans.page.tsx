import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/data/Repository'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'
import { formatDate } from '@/shared/application/helpers'

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
  return null
}

interface LoanRow {
  loanId: number
  title?: string
  author?: string
  status?: string
  extensions?: number
  loanDate?: string
  returnDate?: string
  actualReturnDate?: string
}

export default function LoansPage() {
  const { t } = useTranslation()
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user } = useServiceState(authService) as any
  const { error: showError, success: showSuccess } = useToast()

  const [rows, setRows] = useState<LoanRow[]>([])
  const [error, setError] = useState<string>('')

  const load = async () => {
    setError('')

    if (!user?.id) {
      setRows([])
      setError(t('loans.signInToView'))
      return
    }

    try {
      const response = await api.get<LoanRow[]>(
        `/loans?userId=${encodeURIComponent(user.id)}`
      )
      setRows(Array.isArray(response.data) ? response.data : [])
    } catch {
      setRows([])
      setError(t('loans.couldNotLoad'))
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

  const onExtend = async (loanId: number) => {
    if (!user?.id) return

    try {
      const response = await api.post(`/loans/${encodeURIComponent(loanId)}/extend`, {
        userId: user.id,
      })

      if (response.error) {
        showError(response.error.message || t('loans.couldNotExtend'))
        return
      }

      showSuccess(t('loans.loanExtended'))
      await load()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('loans.couldNotExtend'))
    }
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>{t('loans.myLoans')}</h1>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <div className='lg:hidden'>
          {error && <p className='px-4 py-4 text-sm text-gray-500'>{error}</p>}

          {!error && rows.length === 0 && (
            <p className='px-4 py-4 text-sm text-gray-500'>{t('loans.noLoans')}</p>
          )}

          {(rows || []).map((row) => {
            const status = String(row?.status || '').toLowerCase()
            const badgeClass = status.includes('active')
              ? 'bg-green-100 text-green-800'
              : status.includes('overdue')
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'

            const ext = Number(row?.extensions) || 0
            const canExtend = status.includes('active') && ext < 2

            const imgSrc = getLocalCoverUrl(row?.title) || createCoverDataUri(row?.title)

            return (
              <div key={row.loanId} className='border-t border-gray-200 p-4'>
                <div className='flex items-start gap-3'>
                  <img
                    className='h-12 w-12 rounded-xl shrink-0'
                    alt=''
                    src={imgSrc}
                    onError={(ev) => {
                      ev.currentTarget.onerror = null
                      ev.currentTarget.src = createCoverDataUri(row?.title)
                    }}
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <p
                        title={String(row?.title || t('loans.noTitle'))}
                        className='min-w-0 text-sm font-semibold text-gray-900 truncate'
                      >
                        {row?.title || t('loans.noTitle')}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${badgeClass}`}
                      >
                        {(row?.status || t('loans.unknown')) +
                          (status.includes('active') ? ` (${ext}/2)` : '')}
                      </span>
                    </div>

                    <p
                      title={String(row?.author || t('loans.unknownAuthor'))}
                      className='mt-1 text-xs text-gray-500 truncate'
                    >
                      {row?.author || t('loans.unknownAuthor')}
                    </p>

                    <div className='mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700'>
                      <p>
                        <span className='font-semibold text-gray-900'>{t('loans.loanDateLabel')}</span>{' '}
                        {formatDate(row?.loanDate || '')}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>{t('loans.returnDateLabel')}</span>{' '}
                        {formatDate(row?.returnDate || '')}
                      </p>
                    </div>

                    <div className='mt-3'>
                      {canExtend ? (
                        <button
                          type='button'
                          className='rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700'
                          onClick={() => onExtend(row.loanId)}
                        >
                          {t('loans.extendButton')}
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
                  {t('books.book')}
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {t('loans.loanDate')}
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {t('loans.returnDate')}
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {t('loans.actualReturn')}
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {t('loans.status')}
                </th>
                <th
                  scope='col'
                  className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {t('common.actions')}
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
                    {t('loans.noLoans')}
                  </td>
                </tr>
              )}

              {(rows || []).map((row) => {
                const status = String(row?.status || '').toLowerCase()
                const badgeClass = status.includes('active')
                  ? 'bg-green-100 text-green-800'
                  : status.includes('overdue')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'

                const ext = Number(row?.extensions) || 0
                const canExtend = status.includes('active') && ext < 2

                const imgSrc = getLocalCoverUrl(row?.title) || createCoverDataUri(row?.title)

                return (
                  <tr key={row.loanId}>
                    <td className='px-4 sm:px-6 py-4'>
                      <div className='flex items-center min-w-0'>
                        <div className='shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            alt=''
                            src={imgSrc}
                            onError={(ev) => {
                              ev.currentTarget.onerror = null
                              ev.currentTarget.src = createCoverDataUri(row?.title)
                            }}
                          />
                        </div>
                        <div className='ml-4 min-w-0'>
                          <div
                            title={String(row?.title || t('loans.noTitle'))}
                            className='text-sm font-medium text-gray-900 truncate'
                          >
                            {row?.title || t('loans.noTitle')}
                          </div>
                          <div
                            title={String(row?.author || t('loans.unknownAuthor'))}
                            className='text-sm text-gray-500 truncate'
                          >
                            {row?.author || t('loans.unknownAuthor')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(row?.loanDate || '')}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(row?.returnDate || '')}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {row?.actualReturnDate ? formatDate(row.actualReturnDate) : '-'}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}
                      >
                        {(row?.status || t('loans.unknown')) +
                          (status.includes('active') ? ` (${ext}/2)` : '')}
                      </span>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                      {canExtend ? (
                        <button
                          type='button'
                          className='rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700'
                          onClick={() => onExtend(row.loanId)}
                        >
                          {t('loans.extendButton')}
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
