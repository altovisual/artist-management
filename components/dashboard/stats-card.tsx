'use client'

import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  description,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden bg-card border shadow-sm",
      "hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {change && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              changeType === 'positive' && "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
              changeType === 'negative' && "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
              changeType === 'neutral' && "text-muted-foreground bg-muted"
            )}>
              {change}
            </span>
          )}
        </div>
        
        {/* Main Value */}
        <div className="mb-2">
          <div className="text-3xl font-bold text-foreground mb-1">
            {value}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
