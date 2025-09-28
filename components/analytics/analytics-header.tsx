'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedTitle } from '@/components/animated-title'
import { BarChart3, Download, RefreshCw, Calendar } from 'lucide-react'

interface AnalyticsHeaderProps {
  userRole?: string
  totalArtists: number
  totalRevenue: number
  isLoading?: boolean
  onRefresh?: () => void
}

export function AnalyticsHeader({ 
  userRole, 
  totalArtists, 
  totalRevenue, 
  isLoading = false,
  onRefresh 
}: AnalyticsHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          {/* Left Section - Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <AnimatedTitle 
                  text="Analytics" 
                  level={1} 
                  className="text-2xl sm:text-3xl font-bold tracking-tight" 
                />
                {userRole === 'admin' && (
                  <Badge variant="secondary" className="text-xs">
                    Admin View
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-muted-foreground">
              {userRole === 'admin' 
                ? `Managing ${totalArtists} artists across the platform` 
                : `Performance insights for ${totalArtists} artists`}
            </p>
          </div>

          {/* Right Section - Quick Stats and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Quick Stats */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold">{totalArtists}</p>
                <p className="text-xs text-muted-foreground">Artists</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Period</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
