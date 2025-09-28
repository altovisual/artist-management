'use client'

import { StatsCard } from "./stats-card"
import { Users, Music, TrendingUp, DollarSign, Calendar, Award } from "lucide-react"

interface MetricsData {
  totalArtists: number
  activeProjects: number
  monthlyRevenue: number
  growthRate: number
  upcomingReleases: number
  totalContracts: number
}

interface MetricsGridProps {
  data: MetricsData
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <StatsCard
        title="Artists"
        value={data.totalArtists}
        icon={Users}
        description="Active profiles"
        className="col-span-1"
      />
      
      <StatsCard
        title="Projects"
        value={data.activeProjects}
        icon={Music}
        description="In development"
        className="col-span-1"
      />
      
      <StatsCard
        title="Revenue"
        value={formatCurrency(data.monthlyRevenue)}
        change={formatPercentage(data.growthRate)}
        changeType={data.growthRate > 0 ? 'positive' : data.growthRate < 0 ? 'negative' : 'neutral'}
        icon={DollarSign}
        description="This month"
        className="col-span-2 md:col-span-2 lg:col-span-2"
      />
      
      <StatsCard
        title="Growth"
        value={formatPercentage(data.growthRate)}
        changeType={data.growthRate > 0 ? 'positive' : 'negative'}
        icon={TrendingUp}
        description="vs last month"
        className="col-span-1"
      />
      
      <StatsCard
        title="Releases"
        value={data.upcomingReleases}
        icon={Calendar}
        description="Next 30 days"
        className="col-span-1"
      />
    </div>
  )
}
