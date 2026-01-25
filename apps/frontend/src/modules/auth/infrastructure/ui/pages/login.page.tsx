/**
 * LoginPage Component
 * User login page with forgot password flow
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/infrastructure/stores'
import { ROUTES } from '@/shared/application/config'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const toast = useToast()

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forgot password flow state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [fpEmail, setFpEmail] = useState('')
  const [fpCode, setFpCode] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirmPassword, setFpConfirmPassword] = useState('')
  const [fpStep, setFpStep] = useState<1 | 2>(1)
  const [fpError, setFpError] = useState('')
  const [fpSuccess, setFpSuccess] = useState('')
  const [fpLoading, setFpLoading] = useState(false)

  // Handle login submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const success = await login({ email, password })

      if (success) {
        toast.success('Bienvenido de nuevo')
        const redirectTo = (location.state as { from?: string })?.from || ROUTES.HOME
        navigate(redirectTo, { replace: true })
      } else {
        toast.error('Credenciales inválidas')
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || 'Error al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset forgot password state
  const resetForgotState = () => {
    setFpError('')
    setFpSuccess('')
    setFpStep(1)
    setFpCode('')
    setFpNewPassword('')
    setFpConfirmPassword('')
  }

  // Send reset code
  const handleSendCode = async () => {
    setFpError('')
    setFpSuccess('')

    if (!fpEmail) {
      setFpError('Escribe tu correo')
      return
    }

    setFpLoading(true)

    try {
      const response = await apiClient.post<{ demo_code?: string }>('/api/password/forgot', {
        correo: fpEmail,
      })

      setFpSuccess('Si el correo existe, se generó un código temporal.')

      if (response.data?.demo_code) {
        setFpCode(String(response.data.demo_code))
        setFpSuccess(`Código generado (demo): ${response.data.demo_code}`)
      }

      setFpStep(2)
    } catch (error: unknown) {
      setFpError((error as { message?: string }).message || 'No se pudo enviar el código')
    } finally {
      setFpLoading(false)
    }
  }

  // Reset password
  const handleResetPassword = async () => {
    setFpError('')
    setFpSuccess('')

    if (!fpEmail || !fpCode || !fpNewPassword || !fpConfirmPassword) {
      setFpError('Completa todos los campos')
      return
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('La confirmación no coincide')
      return
    }

    setFpLoading(true)

    try {
      await apiClient.post('/api/password/reset', {
        correo: fpEmail,
        code: fpCode,
        new_password: fpNewPassword,
      })

      setFpSuccess('Contraseña actualizada. Ya puedes iniciar sesión.')
      setFpStep(1)
      setFpCode('')
      setFpNewPassword('')
      setFpConfirmPassword('')
    } catch (error: unknown) {
      setFpError((error as { message?: string }).message || 'No se pudo restablecer la contraseña')
    } finally {
      setFpLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <div>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            Inicia sesión en tu cuenta
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            O{' '}
            <Link to={ROUTES.REGISTER} className='font-medium text-blue-600 hover:text-blue-500'>
              créate una nueva cuenta
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
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
            <div className='pt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Contraseña</label>
              <input
                type='password'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Contraseña'
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='text-sm'>
              <button
                type='button'
                className='font-medium text-blue-600 hover:text-blue-500'
                onClick={() => {
                  setForgotOpen((v) => !v)
                  if (!forgotOpen) {
                    setFpEmail(fpEmail || email)
                  }
                  resetForgotState()
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {forgotOpen && (
            <div className='rounded-xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-4 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold text-gray-800'>Recuperar acceso</p>
                  <p className='mt-1 text-sm text-gray-600'>
                    Genera un código temporal y úsalo para crear una nueva contraseña.
                  </p>
                </div>
                <button
                  type='button'
                  className='rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100'
                  onClick={() => {
                    setForgotOpen(false)
                    resetForgotState()
                  }}
                >
                  Cerrar
                </button>
              </div>

              {fpStep === 1 ? (
                <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Paso 1
                  </p>
                  <p className='mt-1 text-sm text-gray-700'>
                    Escribe tu correo y presiona &quot;Enviar código&quot;.
                  </p>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Correo Electrónico
                    </label>
                    <input
                      type='email'
                      className='form-input'
                      placeholder='ejemplo@correo.com'
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3 flex items-center justify-end'>
                    <button
                      type='button'
                      className='rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
                      onClick={handleSendCode}
                      disabled={fpLoading}
                    >
                      {fpLoading ? 'Enviando...' : 'Enviar código'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Paso 2
                  </p>
                  <p className='mt-1 text-sm text-gray-700'>
                    Ingresa el código y tu nueva contraseña.
                  </p>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Código</label>
                    <input
                      type='text'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Ej: 123456'
                      value={fpCode}
                      onChange={(e) => setFpCode(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nueva contraseña
                    </label>
                    <input
                      type='password'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Nueva contraseña'
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type='password'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Confirmar nueva contraseña'
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3 flex items-center justify-end gap-2'>
                    <button
                      type='button'
                      className='rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 disabled:opacity-50'
                      onClick={() => {
                        resetForgotState()
                        setFpStep(1)
                      }}
                      disabled={fpLoading}
                    >
                      Volver
                    </button>

                    <button
                      type='button'
                      className='rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
                      onClick={handleResetPassword}
                      disabled={fpLoading}
                    >
                      {fpLoading ? 'Procesando...' : 'Restablecer'}
                    </button>
                  </div>
                </div>
              )}

              {fpError && (
                <p className='mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700'>
                  {fpError}
                </p>
              )}
              {fpSuccess && (
                <p className='mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700'>
                  {fpSuccess}
                </p>
              )}
            </div>
          )}

          <div>
            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
