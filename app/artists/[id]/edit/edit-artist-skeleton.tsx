'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EditArtistSkeleton() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-9 w-24" />
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle><Skeleton className="h-8 w-48" /></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><Skeleton className="h-8 w-64" /></CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><Skeleton className="h-8 w-64" /></CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
