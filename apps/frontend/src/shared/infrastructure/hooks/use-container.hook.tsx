import { useContext, createContext, type ReactNode } from 'react'
import type { AwilixContainer } from 'awilix'
import container from '@/presentation/config/container'

/**
 * Context para el contenedor de dependencias
 */
const ContainerContext = createContext<AwilixContainer | null>(null)

/**
 * Provider que envuelve la aplicación con el contenedor
 */
export function ContainerProvider({ children }: { children: ReactNode }) {
  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  )
}

/**
 * Hook para acceder al contenedor desde cualquier componente
 * @throws Error si no está dentro de ContainerProvider
 */
export function useContainer() {
  const ctx = useContext(ContainerContext)
  if (!ctx) {
    throw new Error('useContainer must be used within ContainerProvider')
  }
  return ctx
}

/**
 * Hook especializado para resolver use cases del contenedor
 * @param useCaseName - Nombre del use case registrado en el contenedor
 * @returns Instancia del use case
 */
export function useUseCase<T extends string>(useCaseName: T) {
  const container = useContainer()
  return container.cradle[useCaseName as never]
}

/**
 * Hook especializado para resolver repositorios del contenedor
 * @param repositoryName - Nombre del repositorio registrado en el contenedor
 * @returns Instancia del repositorio
 */
export function useRepository<T extends string>(repositoryName: T) {
  const container = useContainer()
  return container.cradle[repositoryName as never]
}
