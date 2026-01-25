/**
 * RegisterPage Component
 * User registration page
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'
import { ROUTES } from '@/shared/application/config'

export function RegisterPage() {
  const navigate = useNavigate()
  const container = useContainer()
  const { authService } = container.cradle
  useServiceState(authService)
  const toast = useToast()

  // Form state
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error('La confirmación no coincide')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      const success = await authService.register({ nombre, email, password })

      if (success) {
        toast.success('Cuenta creada exitosamente')
        navigate(ROUTES.HOME, { replace: true })
      } else {
        toast.error('No se pudo crear la cuenta')
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || 'Error al registrar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-gray-100'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Crea una nueva cuenta
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          O{' '}
          <Link to={ROUTES.LOGIN} className='font-medium text-blue-600 hover:text-blue-500'>
            inicia sesión si ya tienes una
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nombre Completo
              </label>
              <input
                type='text'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Miguel Bayter'
                value={nombre}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                disabled={isSubmitting}
                minLength={3}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Correo Electrónico
              </label>
              <input
                type='email'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='ejemplo@correo.com'
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Contraseña</label>
              <input
                type='password'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Crea una contraseña'
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirmar Contraseña
              </label>
              <input
                type='password'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Confirma tu contraseña'
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
              />
            </div>

            <div>
              <button
                type='submit'
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
