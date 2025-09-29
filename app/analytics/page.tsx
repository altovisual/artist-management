'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from "@/components/dashboard-layout"
import { 
  PageHeader, 
  StatsGrid, 
  ContentSection, 
  PageLayout,
  DataTable 
} from "@/components/ui/design-system"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StreamingAnalytics from './streaming-analytics'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Music, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Edit,
  Headphones,
  Star
} from 'lucide-react'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [artists, setArtists] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [userRole, setUserRole] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let isAdmin = false
      if (user && user.app_metadata?.role === 'admin') {
        isAdmin = true
        setUserRole('admin')
      }

      // Fetch data in parallel
      const promises = []

      // Artists
      let artistQuery = supabase.from('artists').select('*, social_accounts(id), distribution_accounts(id), projects(*)')
      if (!isAdmin && user) {
        artistQuery = artistQuery.eq('user_id', user.id)
      }
      promises.push(artistQuery)

      // Transactions
      let transactionQuery = supabase.from('transactions').select('*')
      if (!isAdmin && user) {
        transactionQuery = transactionQuery.eq('user_id', user.id)
      }
      promises.push(transactionQuery)

      // Projects
      let projectQuery = supabase.from('projects').select('*, artists(name)')
      if (!isAdmin && user) {
        projectQuery = projectQuery.eq('user_id', user.id)
      }
      promises.push(projectQuery)

      const [artistsRes, transactionsRes, projectsRes] = await Promise.all(promises)

      setArtists(artistsRes.data || [])
      setTransactions(transactionsRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  // Calculate metrics
  const totalRevenue = transactions.reduce((acc, t) => 
    acc + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0
  )

  const totalExpenses = transactions.reduce((acc, t) => 
    acc + (t.type === 'expense' ? parseFloat(t.amount) : 0), 0
  )

  const netProfit = totalRevenue - totalExpenses
  const avgRevenuePerArtist = artists.length > 0 ? totalRevenue / artists.length : 0

  // Stats data
  const statsData = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: "+12%",
      changeType: 'positive' as const,
      icon: DollarSign,
      description: "All time earnings",
      colSpan: 2
    },
    {
      title: "Net Profit",
      value: formatCurrency(netProfit),
      changeType: netProfit > 0 ? 'positive' as const : netProfit < 0 ? 'negative' as const : 'neutral' as const,
      icon: BarChart3,
      description: "Revenue - Expenses"
    },
    {
      title: "Active Artists",
      value: artists.length,
      icon: Users,
      description: "Total managed artists"
    },
    {
      title: "Total Projects",
      value: projects.length,
      change: "+8%",
      changeType: 'positive' as const,
      icon: Music,
      description: "All projects"
    },
    {
      title: "Avg Revenue/Artist",
      value: formatCurrency(avgRevenuePerArtist),
      icon: TrendingUp,
      description: "Performance metric"
    }
  ]

  // Top artists data
  const topArtists = artists
    .map(artist => ({
      ...artist,
      projectCount: artist.projects?.length || 0,
      socialCount: artist.social_accounts?.length || 0,
      distributionCount: artist.distribution_accounts?.length || 0
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 10)

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 10)

  // Table columns
  const artistColumns = [
    { 
      key: 'name', 
      label: 'Artist Name',
      render: (value: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {value?.[0] || '?'}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: 'genre', label: 'Genre' },
    { 
      key: 'projectCount', 
      label: 'Projects',
      render: (value: number) => (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          {value}
        </span>
      )
    },
    { 
      key: 'socialCount', 
      label: 'Social',
      render: (value: number) => (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          {value}
        </span>
      )
    }
  ]

  const transactionColumns = [
    { 
      key: 'type', 
      label: 'Type',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: string) => formatCurrency(parseFloat(value))
    },
    { 
      key: 'transaction_date', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ]

  // Table actions
  const artistActions = [
    {
      label: 'View Details',
      onClick: (item: any) => window.location.href = `/artists/${item.id}`,
      icon: Eye
    },
    {
      label: 'Edit',
      onClick: (item: any) => window.location.href = `/artists/${item.id}/edit`,
      icon: Edit
    }
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageLayout spacing="normal">
        {/* Page Header */}
        <PageHeader
          title="Analytics Hub"
          subtitle="Complete Performance Overview"
          description={`Comprehensive analytics dashboard with business metrics, streaming data, and industry insights for ${artists.length} artists and ${projects.length} projects.`}
          badge={{
            text: userRole === 'admin' ? "Admin Analytics" : "Artist Analytics",
            variant: 'secondary'
          }}
          actions={[
            {
              label: "Export Report",
              onClick: () => console.log('Export report'),
              variant: 'outline',
              icon: BarChart3
            },
            {
              label: "View Trends",
              onClick: () => console.log('View trends'),
              icon: TrendingUp
            }
          ]}
        />

        {/* Main Analytics Tabs */}
        <ContentSection
          title="Analytics Overview"
          description="Switch between business analytics and streaming insights"
          icon={BarChart3}
        >
          <Tabs defaultValue="business" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Business Analytics
              </TabsTrigger>
              <TabsTrigger value="streaming" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Streaming Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="space-y-6">
              {/* Stats Grid */}
              <StatsGrid stats={statsData} columns={6} />

              {/* Top Artists Section */}
              <ContentSection
                title="Top Performing Artists"
                description="Artists ranked by project count and activity"
                icon={Users}
                actions={[
                  {
                    label: "View All Artists",
                    href: "/artists",
                    variant: 'outline'
                  }
                ]}
              >
                <DataTable
                  data={topArtists}
                  columns={artistColumns}
                  actions={artistActions}
                  emptyState={{
                    title: "No artists found",
                    description: "Add artists to see performance analytics",
                    icon: Users
                  }}
                />
              </ContentSection>

              {/* Recent Transactions */}
              <ContentSection
                title="Recent Transactions"
                description="Latest financial activity and transactions"
                icon={DollarSign}
                actions={[
                  {
                    label: "View All",
                    href: "/finance",
                    variant: 'outline'
                  },
                  {
                    label: "Add Transaction",
                    onClick: () => console.log('Add transaction'),
                    icon: DollarSign
                  }
                ]}
              >
                <DataTable
                  data={recentTransactions}
                  columns={transactionColumns}
                  emptyState={{
                    title: "No transactions found",
                    description: "Start tracking your financial activity",
                    icon: DollarSign
                  }}
                />
              </ContentSection>
            </TabsContent>
            
            <TabsContent value="streaming">
              <StreamingAnalytics artistId={artists[0]?.id} />
            </TabsContent>
          </Tabs>
        </ContentSection>
      </PageLayout>
    </DashboardLayout>
  )
}
