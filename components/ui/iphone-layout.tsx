'use client'

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface iPhoneLayoutProps {
  children: ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
}

export function iPhoneLayout({ children, className, spacing = 'normal' }: iPhoneLayoutProps) {
  const spacingClasses = {
    tight: 'space-y-3',
    normal: 'space-y-4',
    loose: 'space-y-6'
  }

  return (
    <div className={cn(
      "min-h-screen bg-background",
      "px-4 py-6", // iPhone native padding
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}

interface iPhoneCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function iPhoneCard({ children, className, padding = 'md' }: iPhoneCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div className={cn(
      "bg-card border rounded-xl shadow-sm",
      "backdrop-blur-sm",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

interface iPhoneGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function iPhoneGrid({ children, columns = 2, className }: iPhoneGridProps) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3', // 2 on mobile, 3 on larger screens
    4: 'grid-cols-2 sm:grid-cols-4'  // 2 on mobile, 4 on larger screens
  }

  return (
    <div className={cn(
      "grid gap-3",
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

interface iPhoneSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function iPhoneSection({ title, subtitle, children, className, action }: iPhoneSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

interface iPhoneHeaderProps {
  title: string
  subtitle?: string
  avatar?: ReactNode
  badge?: ReactNode
  actions?: ReactNode[]
  className?: string
}

export function iPhoneHeader({ title, subtitle, avatar, badge, actions, className }: iPhoneHeaderProps) {
  return (
    <div className={cn(
      "bg-card border rounded-xl shadow-sm backdrop-blur-sm p-4 relative overflow-hidden",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
      
      <div className="relative space-y-4">
        {/* Header info */}
        <div className="flex items-start gap-3">
          {avatar && (
            <div className="flex-shrink-0">
              {avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground truncate">
                {title}
              </h1>
              {badge && badge}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actions.map((action, index) => (
              <div key={index} className="flex-1">
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
