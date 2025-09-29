'use client'

import { StatsCard } from "@/components/dashboard/stats-card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatItem {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  description?: string
  colSpan?: number
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 6
  className?: string
}

export function StatsGrid({ 
  stats, 
  columns = 4,
  className 
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  }

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 md:gap-6",
      gridCols[columns],
      className
    )}>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          description={stat.description}
          className={stat.colSpan ? `col-span-${stat.colSpan}` : "col-span-1"}
        />
      ))}
    </div>
  )
}
