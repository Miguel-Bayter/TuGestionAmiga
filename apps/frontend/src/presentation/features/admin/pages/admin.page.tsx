import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '@/data/Repository'
import { useAuthStore } from '@/shared/stores'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/shared/helpers'
import { User } from '@/shared/types'

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

type TabType = 'libros' | 'usuarios' | 'prestamos'

interface AdminBook {
  id_libro: number
  titulo: string
  autor: string
  descripcion?: string
  stock_compra?: number
  stock_renta?: number
  valor?: number
  disponibilidad?: number
  id_categoria?: string
}

interface AdminLoan {
  id_prestamo: number
  titulo?: string
  autor?: string
  nombre_usuario?: string
  fecha_prestamo?: string
  fecha_devolucion?: string
  estado?: string
}

const emptyBook: AdminBook = {
  id_libro: 0,
  titulo: '',
  autor: '',
  descripcion: '',
  stock_compra: 0,
  stock_renta: 0,
  valor: 0,
  disponibilidad: 1,
  id_categoria: '',
}

export default function AdminPage() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { success: showSuccess, error: showError } = useToast()

  const [tab, setTab] = useState<TabType>('libros')
  const [books, setBooks] = useState<AdminBook[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loans, setLoans] = useState<AdminLoan[]>([])

  // Book management
  const [bookForm, setBookForm] = useState<AdminBook>(emptyBook)
  const [showBookForm, setShowBookForm] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // User management
  const [newUserForm, setNewUserForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    id_rol: 2,
  })
  const [creatingUser, setCreatingUser] = useState<boolean>(false)

  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search || '')
      const t = sp.get('tab')
      if (t === 'libros' || t === 'usuarios' || t === 'prestamos') {
        setTab(t)
      }
    } catch {
      // ignore
    }
  }, [location.search])

  const loadAll = useCallback(async () => {
    try {
      // Load books
      const booksResponse = await api.get<AdminBook[]>('/libros')
      setBooks(booksResponse.data || [])

      // Load users
      const usersResponse = await api.get<User[]>('/admin/usuarios')
      setUsers(usersResponse.data || [])

      // Load loans
      const loansResponse = await api.get<AdminLoan[]>('/admin/prestamos')
      setLoans(loansResponse.data || [])
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'Error loading data')
    }
  }, [showError])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const onCreateUser = async () => {
    const payload = {
      nombre: String(newUserForm.nombre || '').trim(),
      correo: String(newUserForm.correo || '').trim(),
      password: String(newUserForm.password || ''),
      id_rol: Number(newUserForm.id_rol),
    }

    if (!payload.nombre || !payload.correo || !payload.password) {
      showError('Nombre, correo y contraseña son obligatorios.')
      return
    }

    setCreatingUser(true)
    try {
      const response = await api.post('/admin/usuarios', payload)

      if (response.error) {
        showError(response.error.message || 'No se pudo crear el usuario.')
        return
      }

      showSuccess('Usuario creado.')
      setNewUserForm({ nombre: '', correo: '', password: '', id_rol: 2 })
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'No se pudo crear el usuario.')
    } finally {
      setCreatingUser(false)
    }
  }

  const onSaveBook = async () => {
    const payload = {
      titulo: String(bookForm.titulo || '').trim(),
      autor: String(bookForm.autor || '').trim(),
      descripcion: String(bookForm.descripcion || '').trim(),
      stock_compra: Number(bookForm.stock_compra || 0),
      stock_renta: Number(bookForm.stock_renta || 0),
      valor: Number(bookForm.valor || 0),
      disponibilidad: Number(bookForm.disponibilidad || 1),
      id_categoria: String(bookForm.id_categoria || ''),
    }

    if (!payload.titulo || !payload.autor) {
      showError('Título y autor son obligatorios.')
      return
    }

    setSaving(true)
    try {
      const response = bookForm.id_libro
        ? await api.patch(`/libros/${bookForm.id_libro}`, payload)
        : await api.post('/libros', payload)

      if (response.error) {
        showError(response.error.message || 'No se pudo guardar el libro.')
        return
      }

      showSuccess(bookForm.id_libro ? 'Libro actualizado.' : 'Libro creado.')
      setBookForm(emptyBook)
      setShowBookForm(false)
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'No se pudo guardar el libro.')
    } finally {
      setSaving(false)
    }
  }

  const onDeleteBook = async (id_libro: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) return

    try {
      const response = await api.delete(`/libros/${id_libro}`)

      if (response.error) {
        showError(response.error.message || 'No se pudo eliminar el libro.')
        return
      }

      showSuccess('Libro eliminado.')
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'No se pudo eliminar el libro.')
    }
  }

  const onDeleteUser = async (id_usuario: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      const response = await api.delete(`/admin/usuarios/${id_usuario}`)

      if (response.error) {
        showError(response.error.message || 'No se pudo eliminar el usuario.')
        return
      }

      showSuccess('Usuario eliminado.')
      await loadAll()
    } catch (e: unknown) {
      showError((e as { message?: string }).message || 'No se pudo eliminar el usuario.')
    }
  }

  if (!user || user.id_rol !== 1) {
    return (
      <div className='text-center py-10'>
        <h1 className='text-2xl font-bold text-gray-900'>Acceso Denegado</h1>
        <p className='text-gray-600 mt-2'>No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Panel de Administración</h1>
        <p className='text-gray-600 mt-1'>Gestiona libros, usuarios y préstamos del sistema.</p>
      </div>

      <div className='rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 p-2'>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setTab('libros')}
            className={
              tab === 'libros'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            📚 Libros
          </button>

          <button
            type='button'
            onClick={() => setTab('usuarios')}
            className={
              tab === 'usuarios'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            👥 Usuarios
          </button>

          <button
            type='button'
            onClick={() => setTab('prestamos')}
            className={
              tab === 'prestamos'
                ? 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }
          >
            📖 Préstamos
          </button>
        </div>
      </div>

      {/* Books Tab */}
      {tab === 'libros' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>Gestión de Libros</h2>
            <button
              type='button'
              onClick={() => {
                setBookForm(emptyBook)
                setShowBookForm(true)
              }}
              className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
            >
              Agregar Libro
            </button>
          </div>

          {showBookForm && (
            <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
              <h3 className='text-sm font-bold text-gray-900 mb-4'>
                {bookForm.id_libro ? 'Editar Libro' : 'Nuevo Libro'}
              </h3>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Título</label>
                  <input
                    type='text'
                    value={bookForm.titulo}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, titulo: e.target.value }))}
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Autor</label>
                  <input
                    type='text'
                    value={bookForm.autor}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, autor: e.target.value }))}
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Precio</label>
                  <input
                    type='number'
                    value={bookForm.valor || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, valor: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Stock Compra</label>
                  <input
                    type='number'
                    value={bookForm.stock_compra || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, stock_compra: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Stock Renta</label>
                  <input
                    type='number'
                    value={bookForm.stock_renta || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, stock_renta: Number(e.target.value) }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Categoría</label>
                  <input
                    type='text'
                    value={bookForm.id_categoria || ''}
                    onChange={(e) =>
                      setBookForm((prev) => ({ ...prev, id_categoria: e.target.value }))
                    }
                    className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700'>Descripción</label>
                <textarea
                  value={bookForm.descripcion || ''}
                  onChange={(e) =>
                    setBookForm((prev) => ({ ...prev, descripcion: e.target.value }))
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
                  Cancelar
                </button>
                <button
                  type='button'
                  disabled={saving}
                  onClick={onSaveBook}
                  className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Libro
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Stock
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Precio
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {books.map((book) => (
                  <tr key={book.id_libro}>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            src={getLocalCoverUrl(book.titulo) || createCoverDataUri(book.titulo)}
                            alt=''
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{book.titulo}</div>
                          <div className='text-sm text-gray-500'>{book.autor}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      C: {book.stock_compra || 0}, R: {book.stock_renta || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {book.valor ? `$${book.valor}` : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => {
                          setBookForm(book)
                          setShowBookForm(true)
                        }}
                        className='text-indigo-600 hover:text-indigo-900 mr-3'
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id_libro)}
                        className='text-red-600 hover:text-red-900'
                      >
                        Eliminar
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
      {tab === 'usuarios' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900'>Gestión de Usuarios</h2>
            <button
              type='button'
              onClick={() => setTab('usuarios')}
              className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
            >
              Agregar Usuario
            </button>
          </div>

          <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>Nuevo Usuario</h3>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Nombre</label>
                <input
                  type='text'
                  value={newUserForm.nombre}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Correo</label>
                <input
                  type='email'
                  value={newUserForm.correo}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, correo: e.target.value }))}
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Contraseña</label>
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
                <label className='block text-sm font-medium text-gray-700'>Rol</label>
                <select
                  value={newUserForm.id_rol}
                  onChange={(e) =>
                    setNewUserForm((prev) => ({ ...prev, id_rol: Number(e.target.value) }))
                  }
                  className='mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm'
                >
                  <option value={2}>Usuario</option>
                  <option value={1}>Administrador</option>
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
                {creatingUser ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Rol
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {users.map((user) => (
                  <tr key={user.id_usuario}>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>{user.nombre}</div>
                      <div className='text-sm text-gray-500'>{user.correo || user.email}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.id_rol === 1 ? 'Administrador' : 'Usuario'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => onDeleteUser(user.id_usuario)}
                        className='text-red-600 hover:text-red-900'
                      >
                        Eliminar
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
      {tab === 'prestamos' && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900'>Préstamos Activos</h2>

          <div className='bg-white shadow rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Libro
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Fecha Préstamo
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Fecha Devolución
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loans.map((loan) => (
                  <tr key={loan.id_prestamo}>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>{loan.titulo}</div>
                      <div className='text-sm text-gray-500'>{loan.autor}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {loan.nombre_usuario}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(loan.fecha_prestamo || '')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(loan.fecha_devolucion || '')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          loan.estado?.toLowerCase().includes('activo')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {loan.estado || 'Desconocido'}
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
