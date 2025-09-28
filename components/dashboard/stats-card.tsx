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
      "relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
      "hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">{value}</h3>
              {change && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap",
                  changeType === 'positive' && "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
                  changeType === 'negative' && "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
                  changeType === 'neutral' && "text-muted-foreground bg-muted"
                )}>
                  {change}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <div className="p-2 sm:p-2.5 md:p-3 rounded-full bg-primary/10">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
