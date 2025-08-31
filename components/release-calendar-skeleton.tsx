'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReleaseCalendarSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="h-[600px] overflow-y-auto border rounded-lg p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </main>
    </div>
  )
}
