'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LoadingScreen } from './loading-screen'
import { usePathname } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const pathname = usePathname()

  // Initial loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading on route change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname])

  const showLoading = () => setIsLoading(true)
  const hideLoading = () => setIsLoading(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoading, hideLoading }}>
      {(showInitialLoading || isLoading) && (
        <LoadingScreen 
          onLoadingComplete={() => {
            setShowInitialLoading(false)
            setIsLoading(false)
          }}
          duration={showInitialLoading ? 2000 : 800}
        />
      )}
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
