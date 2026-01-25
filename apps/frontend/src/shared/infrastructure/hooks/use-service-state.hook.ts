import { useEffect, useState } from 'react'

interface IService<T> {
  getState(): T
  subscribe(listener: (state: T) => void): () => void
}

export function useServiceState<T>(service: IService<T>): T {
  const [state, setState] = useState<T>(() => service.getState())

  useEffect(() => {
    const unsubscribe = service.subscribe((newState: T) => {
      setState(newState)
    })
    return () => unsubscribe()
  }, [service])

  return state
}
