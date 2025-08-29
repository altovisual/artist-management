import { Suspense } from 'react'
import Dashboard from './dashboard'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </DashboardLayout>
  )
}