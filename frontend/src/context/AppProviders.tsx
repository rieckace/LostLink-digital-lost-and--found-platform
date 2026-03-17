import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateToDom = useThemeStore((s) => s.hydrateToDom)

  useEffect(() => {
    hydrateToDom()
  }, [hydrateToDom])

  return <>{children}</>
}
