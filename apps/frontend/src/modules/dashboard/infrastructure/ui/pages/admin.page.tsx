import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/data/Repository'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'
import { formatDate } from '@/shared/application/helpers'
import { User } from '@/shared/domain/types'

// Temporary placeholder functions until covers lib is migrated
const createCoverDataUri = (_title?: string): string => {
  const text = 'LIB'.substring(0, 2).toUpperCase()
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

type TabType = 'books' | 'users' | 'loans'

interface AdminBook {
  id: number
  title: string
  author: string
  description?: string
  purchaseStock?: number
  rentalStock?: number
  price?: number
  available?: number
  categoryId?: string
}

interface AdminLoan {
  id: number
  title?: string
  author?: string
  userName?: string
  loanDate?: string
  returnDate?: string
  status?: string
}

const emptyBook: AdminBook = {
  id: 0,
  title: '',
  author: '',
  description: '',
  purchaseStock: 0,
  rentalStock: 0,
  price: 0,
  available: 1,
  categoryId: '',
}

export default function AdminPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user } = useServiceState(authService) as any
  const { success: showSuccess, error: showError } = useToast()

  const [tab, setTab] = useState<TabType>('books')
  const [books, setBooks] = useState<AdminBook[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loans, setLoans] = useState<AdminLoan[]>([])

  // Book management
  const [bookForm, setBookForm] = useState<AdminBook>(emptyBook)
  const [showBookForm, setShowBookForm] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // User management
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 2,
  })
  const [creatingUser, setCreatingUser] = useState<boolean>(false)

  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '')
      const t = sp.get('tab')
      if (t === 'books' || t === 'users' || t === 'loans') {
        setTab(t)
      }
    } catch {
      // ignore
    }
  }, [location.search])

  const loadAll = useCallback(async () => {
    try {
      // Load books
      const booksResponse = await api.get<AdminBook[]>('/admin/books')
      setBooks(booksResponse.data || [])

      // Load users
      const usersResponse = await api.get<User[]>('/admin/users')
      setUsers(usersResponse.data || [])

      // Load loans
      const loansResponse = await api.get<AdminLoan[]>('/admin/loans')
      setLoans(loansResponse.data || [])
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('admin.errorLoadingData'))
    }
  }, [showError, t])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const onCreateUser = async () => {
    const payload = {
      name: String(newUserForm.name || '').trim(),
      email: String(newUserForm.email || '').trim(),
      password: String(newUserForm.password || ''),
      roleId: Number(newUserForm.roleId),
    }

    if (!payload.name || !payload.email || !payload.password) {
      showError(t('admin.nameEmailPasswordRequired'))
      return
    }

    setCreatingUser(true)
    try {
      const response = await api.post('/admin/users', payload)

      if (response.error) {
        showError(response.error.message || t('admin.couldNotCreateUser'))
        return
      }

      showSuccess(t('admin.userCreated'))
      setNewUserForm({ name: '', email: '', password: '', roleId: 2 })
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('admin.couldNotCreateUser'))
    } finally {
      setCreatingUser(false)
    }
  }

  const onSaveBook = async () => {
    const payload = {
      title: String(bookForm.title || '').trim(),
      author: String(bookForm.author || '').trim(),
      description: String(bookForm.description || '').trim(),
      purchaseStock: Number(bookForm.purchaseStock || 0),
      rentalStock: Number(bookForm.rentalStock || 0),
      price: Number(bookForm.price || 0),
      available: Number(bookForm.available || 1),
      categoryId: String(bookForm.categoryId || ''),
    }

    if (!payload.title || !payload.author) {
      showError(t('admin.titleAuthorRequired'))
      return
    }

    setSaving(true)
    try {
      const response = bookForm.id
        ? await api.patch(`/books/${bookForm.id}`, payload)
        : await api.post('/books', payload)

      if (response.error) {
        showError(response.error.message || t('admin.couldNotSaveBook'))
        return
      }

      showSuccess(bookForm.id ? t('admin.bookUpdated') : t('admin.bookCreated'))
      setBookForm(emptyBook)
      setShowBookForm(false)
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('admin.couldNotSaveBook'))
    } finally {
      setSaving(false)
    }
  }

  const onDeleteBook = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteBook'))) return

    try {
      const response = await api.delete(`/books/${id}`)

      if (response.error) {
        showError(response.error.message || t('admin.couldNotDeleteBook'))
        return
      }

      showSuccess(t('admin.bookDeleted'))
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('admin.couldNotDeleteBook'))
    }
  }

  const onDeleteUser = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteUser'))) return

    try {
      const response = await api.delete(`/admin/users/${id}`)

      if (response.error) {
        showError(response.error.message || t('admin.couldNotDeleteUser'))
        return
      }

      showSuccess(t('admin.userDeleted'))
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || t('admin.couldNotDeleteUser'))
    }
  }

  if (!user || user.roleId !== 1) {
    return (
      <div className='text-center py-10'>
        <h1 className='text-2xl font-bold text-gray-900'>{t('admin.accessDenied')}</h1>
        <p className='text-gray-600 mt-2'>{t('admin.noPermission')}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>{t('admin.administrationPanel')}</h1>
        <p className='text-gray-600 mt-1'>{t('admin.manageDescription')}</p>
      </div>

      <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 p-2'>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setTab('books')}
            className={
              tab === 'books'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            📚 {t('admin.booksTab')}
          </button>

          <button
            type='button'
            onClick={() => setTab('users')}
            className={
              tab === 'users'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            👥 {t('admin.usersTab')}
          </button>

          <button
            type='button'
            onClick={() => setTab('loans')}
            className={
              tab === 'loans'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            📖 {t('admin.loansTab')}
          </button>
        </div>
      </div>

      {/* Books Tab */}
      {tab === 'books' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>{t('admin.bookManagement')}</h2>
            <button
              type='button'
              onClick={() => {
                setBookForm(emptyBook)
                setShowBookForm(true)
              }}
              className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
            >
              {t('admin.addBook')}
            </button>
          </div>

          {showBookForm && (
            <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
              <h3 className='text-sm font-bold text-gray-900 mb-4'>
                {bookForm.id ? t('admin.editBook') : t('admin.newBook')}
              </h3>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('books.title')}</label>
                  <input
                    type='text'
                    value={bookForm.title}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))}
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('books.author')}</label>
                  <input
                    type='text'
                    value={bookForm.author}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, author: e.target.value }))}
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('books.price')}</label>
                  <input
                    type='number'
                    value={bookForm.price || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('admin.purchaseStock')}</label>
                  <input
                    type='number'
                    value={bookForm.purchaseStock || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, purchaseStock: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('admin.rentalStock')}</label>
                  <input
                    type='number'
                    value={bookForm.rentalStock || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, rentalStock: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>{t('books.category')}</label>
                  <input
                    type='text'
                    value={bookForm.categoryId || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700'>{t('books.description')}</label>
                <textarea
                  value={bookForm.description || ''}
                  onChange={(e) =>
                    setBookForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div className='mt-4 flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setShowBookForm(false)
                    setBookForm(emptyBook)
                  }}
                  className='rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300'
                >
                  {t('common.cancel')}
                </button>
                <button
                  type='button'
                  disabled={saving}
                  onClick={onSaveBook}
                  className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
                >
                  {saving ? t('admin.saving') : t('common.save')}
                </button>
              </div>
            </div>
          )}

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('books.book')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('admin.stock')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('books.price')}
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            src={getLocalCoverUrl(book.title) || createCoverDataUri(book.title)}
                            alt=''
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{book.title}</div>
                          <div className='text-sm text-gray-500'>{book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      C: {book.purchaseStock || 0}, R: {book.rentalStock || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {book.price ? `$${book.price}` : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => {
                          setBookForm(book)
                          setShowBookForm(true)
                        }}
                        className='text-indigo-600 hover:text-indigo-900 mr-3'
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>{t('admin.userManagement')}</h2>
            <button
              type='button'
              onClick={() => setTab('users')}
              className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
            >
              {t('admin.addUser')}
            </button>
          </div>

          <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>{t('admin.newUser')}</h3>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>{t('auth.name')}</label>
                <input
                  type='text'
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>{t('auth.email')}</label>
                <input
                  type='email'
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>{t('auth.password')}</label>
                <input
                  type='password'
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>{t('admin.role')}</label>
                <select
                  value={newUserForm.roleId}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, roleId: Number(e.target.value) }))
                  }
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                >
                  <option value={2}>{t('user.roleUser')}</option>
                  <option value={1}>{t('user.roleAdmin')}</option>
                </select>
              </div>
            </div>

            <div className='mt-4 flex items-center justify-end gap-2'>
              <button
                type='button'
                disabled={creatingUser}
                onClick={onCreateUser}
                className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
              >
                {creatingUser ? t('admin.creating') : t('admin.createUser')}
              </button>
            </div>
          </div>

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('user.title')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('admin.role')}
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>{user.name}</div>
                      <div className='text-sm text-gray-500'>{user.email}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.roleId === 1 ? t('user.roleAdmin') : t('user.roleUser')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {tab === 'loans' && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900'>{t('admin.activeLoans')}</h2>

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('books.book')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('user.title')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('loans.loanDate')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('loans.returnDate')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {t('loans.status')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>{loan.title}</div>
                      <div className='text-sm text-gray-500'>{loan.author}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {loan.userName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(loan.loanDate || '')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(loan.returnDate || '')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          loan.status?.toLowerCase().includes('active')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {loan.status || t('admin.unknown')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
