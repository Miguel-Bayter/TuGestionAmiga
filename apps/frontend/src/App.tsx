import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { routes } from '@/shared/infrastructure/ui/react/routes'
import { Toast } from '@/shared/infrastructure/ui/react/components/Toast'
import { Layout } from '@/shared/infrastructure/ui/react/components/Layout'
import { LoadingSpinner } from '@/shared/infrastructure/ui/react/components/LoadingSpinner'
import { ContainerProvider } from '@/shared/infrastructure/hooks/use-container.hook'
import { RequireAuth } from '@/modules/auth/infrastructure/ui/components/require-auth'
import { RequireAdmin } from '@/modules/auth/infrastructure/ui/components/require-admin'

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
                    <Suspense fallback={<LoadingSpinner />}>
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
