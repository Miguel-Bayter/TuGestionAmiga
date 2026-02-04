/**
 * LoginPage Component
 * User login page with forgot password flow
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { ROUTES } from '@/shared/application/config'
import { useToast } from '@/shared/infrastructure/hooks/use-toast.hook'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const container = useContainer()
  const { authStateService, forgotPasswordUseCase, verifyPasswordCodeUseCase } = container.cradle
  useServiceState(authStateService)
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
      const success = await authStateService.login({ email, password })

      if (success) {
        toast.success('Welcome back')
        const redirectTo = (location.state as { from?: string })?.from || ROUTES.HOME
        navigate(redirectTo, { replace: true })
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || 'Error signing in')
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
      setFpError('Enter your email')
      return
    }

    setFpLoading(true)

    try {
      const response = await forgotPasswordUseCase.execute(fpEmail)

      setFpSuccess('If the email exists, a temporary code was generated.')

      if (response?.demo_code) {
        setFpCode(String(response.demo_code))
        setFpSuccess(`Code generated (demo): ${response.demo_code}`)
      }

      setFpStep(2)
    } catch (error: unknown) {
      setFpError((error as { message?: string }).message || 'Could not send code')
    } finally {
      setFpLoading(false)
    }
  }

  // Reset password
  const handleResetPassword = async () => {
    setFpError('')
    setFpSuccess('')

    if (!fpEmail || !fpCode || !fpNewPassword || !fpConfirmPassword) {
      setFpError('Complete all fields')
      return
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('Passwords do not match')
      return
    }

    setFpLoading(true)

    try {
      await verifyPasswordCodeUseCase.execute(fpEmail, fpCode, fpNewPassword)

      setFpSuccess('Password updated. You can now sign in.')
      setFpStep(1)
      setFpCode('')
      setFpNewPassword('')
      setFpConfirmPassword('')
    } catch (error: unknown) {
      setFpError((error as { message?: string }).message || 'Could not reset password')
    } finally {
      setFpLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <div>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <Link to={ROUTES.REGISTER} className='font-medium text-blue-600 hover:text-blue-500'>
              create a new account
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email
              </label>
              <input
                type='email'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='example@email.com'
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className='pt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
              <input
                type='password'
                required
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Password'
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
                Forgot your password?
              </button>
            </div>
          </div>

          {forgotOpen && (
            <div className='rounded-xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-4 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold text-gray-800'>Recover access</p>
                  <p className='mt-1 text-sm text-gray-600'>
                    Generate a temporary code and use it to create a new password.
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
                  Close
                </button>
              </div>

              {fpStep === 1 ? (
                <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Step 1
                  </p>
                  <p className='mt-1 text-sm text-gray-700'>
                    Enter your email and press &quot;Send code&quot;.
                  </p>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email
                    </label>
                    <input
                      type='email'
                      className='form-input'
                      placeholder='example@email.com'
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
                      {fpLoading ? 'Sending...' : 'Send code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Step 2
                  </p>
                  <p className='mt-1 text-sm text-gray-700'>
                    Enter the code and your new password.
                  </p>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Code</label>
                    <input
                      type='text'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='e.g. 123456'
                      value={fpCode}
                      onChange={(e) => setFpCode(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      New password
                    </label>
                    <input
                      type='password'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='New password'
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      disabled={fpLoading}
                    />
                  </div>

                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Confirm new password
                    </label>
                    <input
                      type='password'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                      placeholder='Confirm new password'
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
                      Back
                    </button>

                    <button
                      type='button'
                      className='rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50'
                      onClick={handleResetPassword}
                      disabled={fpLoading}
                    >
                      {fpLoading ? 'Processing...' : 'Reset'}
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
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
