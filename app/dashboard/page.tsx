import { Suspense } from 'react'
import Dashboard from './dashboard'
import { DashboardSkeleton } from './dashboard-skeleton'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}