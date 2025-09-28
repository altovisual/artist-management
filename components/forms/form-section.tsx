'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function FormSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className,
  headerAction 
}: FormSectionProps) {
  return (
    <Card className={cn("border-0 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}
