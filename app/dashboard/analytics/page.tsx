'use client'

import React, { Suspense } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnalyticsContent } from '@/components/analytics-content'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsContent />
      </Suspense>
    </DashboardLayout>
  )
}