'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormLayoutProps {
  children: ReactNode
  className?: string
}

export function FormLayout({ children, className }: FormLayoutProps) {
  return (
    <div className={cn("max-w-5xl mx-auto space-y-6 sm:space-y-8", className)}>
      {children}
    </div>
  )
}
