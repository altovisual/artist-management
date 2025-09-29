'use client'

import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function PageLayout({ 
  children, 
  className,
  spacing = 'normal',
  maxWidth = 'full'
}: PageLayoutProps) {
  const spacingClasses = {
    tight: 'space-y-4',
    normal: 'space-y-6', 
    loose: 'space-y-8'
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidthClasses[maxWidth],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}
