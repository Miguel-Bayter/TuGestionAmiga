import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from '@/presentation/features/auth/components/require-auth'
import { RequireAdmin } from '@/presentation/features/auth/components/require-admin'
import { Layout } from '@/presentation/components/Layout'
import { Toast } from '@/presentation/components/Toast'
import { ContainerProvider } from '@/shared/hooks/use-container.hook'
import { routes } from '@/data/routes'

function App() {
  return (
    <ContainerProvider>
      <Router>
      <div className='App'>
        <Routes>
          {routes.map((route) => {
            const { path, element: Component, requiresAuth, requiresAdmin } = route

            let element = <Component />

            // Wrap with admin guard if required
            if (requiresAdmin) {
              element = (
                <RequireAdmin>
                  <Component />
                </RequireAdmin>
              )
            }
            // Wrap with auth guard if required (but not admin, as admin implies auth)
            else if (requiresAuth) {
              element = (
                <RequireAuth>
                  <Component />
                </RequireAuth>
              )
            }

            // Wrap authenticated routes with Layout
            if (requiresAuth || requiresAdmin) {
              element = (
                <Layout>
                  <Suspense
                    fallback={
                      <div className='flex items-center justify-center min-h-screen'>
                        <div className='text-center'>
                          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
                          <p className='mt-4 text-gray-600'>Cargando...</p>
                        </div>
                      </div>
                    }
                  >
                    {element}
                  </Suspense>
                </Layout>
              )
            }

            return <Route key={path} path={path} element={element} />
          })}

          {/* Catch all route - redirect to home */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>

        {/* Global Toast notifications */}
        <Toast />
      </div>
    </Router>
    </ContainerProvider>
  )
}

export default App
