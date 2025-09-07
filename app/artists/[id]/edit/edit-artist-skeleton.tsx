'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SkeletonAccountCard = () => (
  <div className="p-4 border rounded-lg space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32 animate-pulse" />
      <Skeleton className="h-8 w-24 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 animate-pulse" />
        <Skeleton className="h-10 w-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 animate-pulse" />
        <Skeleton className="h-10 w-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 animate-pulse" />
        <Skeleton className="h-10 w-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 animate-pulse" />
        <Skeleton className="h-10 w-full animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
        <Skeleton className="h-4 w-24 animate-pulse" />
        <Skeleton className="h-10 w-full animate-pulse" />
    </div>
  </div>
);

export function EditArtistSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-9 w-24 animate-pulse" />
        <div>
          <Skeleton className="h-7 w-40 animate-pulse" />
          <Skeleton className="h-4 w-32 mt-2 animate-pulse" />
        </div>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-48 animate-pulse" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 animate-pulse" />
            <Skeleton className="h-24 w-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 animate-pulse" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-full animate-pulse" />
                <Skeleton className="h-4 w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Accounts Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64 animate-pulse" />
            <Skeleton className="h-10 w-32 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonAccountCard />
          <SkeletonAccountCard />
        </CardContent>
      </Card>

      {/* Distribution Accounts Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64 animate-pulse" />
            <Skeleton className="h-10 w-32 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonAccountCard />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Skeleton className="h-10 w-24 animate-pulse" />
        <Skeleton className="h-10 w-32 animate-pulse" />
      </div>
    </div>
  )
}
