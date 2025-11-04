'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Search, DollarSign, TrendingUp, TrendingDown, FileText, Filter, BarChart3, Settings, Users, Upload, Receipt, CreditCard, MessageSquare } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TransactionModal } from '@/components/transaction-modal'
import { CategoryModal } from '@/components/category-modal'
import { FinanceSkeleton } from './finance-skeleton' // Import the skeleton
import { FinanceChart } from './finance-chart'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PageHeader } from '@/components/ui/design-system/page-header'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArtistStatementsView } from '@/components/finance/artist-statements-view'
import { ImportStatementsDialog } from '@/components/finance/import-statements-dialog'

interface Transaction {
  id: string
  created_at: string
  artist_id: string
  category_id: string
  amount: number
  description?: string
  transaction_date: string
  type: 'income' | 'expense'
  artists?: { name: string }
  transaction_categories?: { name: string, type: string }
}

interface Artist {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

export default function FinancePage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly')
  const [userRole, setUserRole] = useState<'admin' | 'artist' | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentArtistId, setCurrentArtistId] = useState<string | null>(null)

  // Filter states (pending changes)
  const [pendingSelectedArtistId, setPendingSelectedArtistId] = useState<string | 'all'>('all')
  const [pendingTransactionTypeFilter, setPendingTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [pendingSelectedCategoryId, setPendingSelectedCategoryId] = useState<string | 'all'>('all')
  const [pendingSearchTerm, setPendingSearchTerm] = useState('')
  const [pendingStartDate, setPendingStartDate] = useState('')
  const [pendingEndDate, setPendingEndDate] = useState('')

  // Filter states (applied after clicking filter button)
  const [appliedSelectedArtistId, setAppliedSelectedArtistId] = useState<string | 'all'>('all')
  const [appliedTransactionTypeFilter, setAppliedTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [appliedSelectedCategoryId, setAppliedSelectedCategoryId] = useState<string | 'all'>('all')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const handleApplyFilters = () => {
    console.log('🔍 Applying filters:', {
      artist: pendingSelectedArtistId,
      type: pendingTransactionTypeFilter,
      category: pendingSelectedCategoryId,
      search: pendingSearchTerm
    });
    setAppliedSelectedArtistId(pendingSelectedArtistId);
    setAppliedTransactionTypeFilter(pendingTransactionTypeFilter);
    setAppliedSelectedCategoryId(pendingSelectedCategoryId);
    setAppliedSearchTerm(pendingSearchTerm);
    setAppliedStartDate(pendingStartDate);
    setAppliedEndDate(pendingEndDate);
  };

  const handleClearFilters = () => {
    setPendingSelectedArtistId('all');
    setPendingTransactionTypeFilter('all');
    setPendingSelectedCategoryId('all');
    setPendingSearchTerm('');
    setPendingStartDate('');
    setPendingEndDate('');
    // Also apply cleared filters immediately
    setAppliedSelectedArtistId('all');
    setAppliedTransactionTypeFilter('all');
    setAppliedSelectedCategoryId('all');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ['Date', 'Artist', 'Category', 'Description', 'Type', 'Amount'];
    const csvData = transactions.map(t => [
      t.transaction_date,
      t.artists?.name || 'Unknown',
      t.transaction_categories?.name || 'N/A',
      t.description,
      t.type === 'income' ? 'Income' : 'Expense',
      t.type === 'income' ? `$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: `Exported ${transactions.length} transactions to CSV`,
    });
  };

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')
  const [transactionSource, setTransactionSource] = useState<'manual' | 'statements'>('statements') // Default to statements (Excel data)
  
  // Info modal states
  const [isTransactionsInfoModalOpen, setIsTransactionsInfoModalOpen] = useState(false)
  const [isCategoriesInfoModalOpen, setIsCategoriesInfoModalOpen] = useState(false)
  const [isArtistsInfoModalOpen, setIsArtistsInfoModalOpen] = useState(false)
  
  // Advance and Support modals
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [advanceReason, setAdvanceReason] = useState('')
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')

  // Fetch current user and role
  const fetchUserRole = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setCurrentUserId(user.id)

    // Check if user is an artist first
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single()

    console.log('Artist data:', artist) // Debug log

    // Check if user is admin (check both 'admin' and 'Admin' for case sensitivity)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('User profile:', profile, 'Error:', profileError) // Debug log

    // Priority: Admin role overrides artist status
    if (profile?.role?.toLowerCase() === 'admin') {
      setUserRole('admin')
      console.log('User is admin (has admin role in profiles)')
    } else if (artist) {
      // Only set as artist if NOT admin
      setUserRole('artist')
      setCurrentArtistId(artist.id)
      // Auto-select this artist in filters
      setPendingSelectedArtistId(artist.id)
      setAppliedSelectedArtistId(artist.id)
      console.log('User is artist:', artist.id)
    } else {
      // If no profile and no artist, default to admin
      setUserRole('admin')
      console.log('No role found, defaulting to admin')
    }
  }, [supabase])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    
    console.log('📊 Fetching transactions with filters:', {
      userRole,
      currentArtistId,
      appliedSelectedArtistId,
      appliedTransactionTypeFilter
    });
    
    // Fetch from statement_transactions (real Excel data)
    let query = supabase
      .from('statement_transactions')
      .select(`
        *,
        artist_statements!inner(
          artist_id,
          artists(name)
        )
      `)
      .order('transaction_date', { ascending: false })

    // If user is an artist (not admin), only show their transactions
    if (userRole === 'artist' && currentArtistId) {
      console.log('🎤 Filtering by artist (user is artist):', currentArtistId);
      query = query.eq('artist_id', currentArtistId)
    } else if (appliedSelectedArtistId !== 'all') {
      console.log('👑 Filtering by selected artist (admin):', appliedSelectedArtistId);
      query = query.eq('artist_id', appliedSelectedArtistId)
    } else {
      console.log('🌐 Showing all artists');
    }
    
    if (appliedTransactionTypeFilter !== 'all') {
      query = query.eq('transaction_type', appliedTransactionTypeFilter)
    }
    
    if (appliedSelectedCategoryId !== 'all') {
      query = query.eq('category', appliedSelectedCategoryId)
    }
    
    if (appliedSearchTerm) {
      query = query.ilike('concept', `%${appliedSearchTerm}%`)
    }
    
    if (appliedStartDate) {
      query = query.gte('transaction_date', appliedStartDate)
    }
    if (appliedEndDate) {
      query = query.lte('transaction_date', appliedEndDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching transactions:', error)
      toast({ title: 'Error', description: 'Could not load transactions.', variant: 'destructive' })
      setTransactions([])
    } else {
      console.log(`✅ Fetched ${data?.length || 0} transactions`);
      // Transform statement_transactions to match Transaction interface
      const transformedData = data?.map(t => ({
        id: t.id,
        created_at: t.created_at,
        artist_id: t.artist_statements?.artist_id || t.artist_id || '',
        category_id: '', // statement_transactions don't have categories
        amount: Math.abs(t.amount),
        description: t.concept,
        transaction_date: t.transaction_date,
        type: t.transaction_type as 'income' | 'expense',
        artists: { name: t.artist_statements?.artists?.name || 'Unknown' },
        transaction_categories: { name: t.transaction_type === 'income' ? 'Income' : 'Expense', type: t.transaction_type }
      })) || []
      
      setTransactions(transformedData as Transaction[])
    }
    setLoading(false)
  }, [supabase, appliedSelectedArtistId, appliedTransactionTypeFilter, appliedSelectedCategoryId, appliedSearchTerm, appliedStartDate, appliedEndDate, toast, userRole, currentArtistId])

  const fetchArtistsAndCategories = useCallback(async () => {
    const { data: artistsData, error: artistsError } = await supabase.from('artists').select('id, name').order('name', { ascending: true })
    if (artistsError) {
      console.error('Error fetching artists:', artistsError)
    } else {
      setArtists(artistsData || [])
    }

    // Fetch unique categories from statement_transactions
    const { data: transactionsData, error: categoriesError } = await supabase
      .from('statement_transactions')
      .select('category, transaction_type')
      .not('category', 'is', null)
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    } else {
      // Get unique categories with their types
      const categoryMap = new Map<string, 'income' | 'expense'>()
      transactionsData?.forEach(t => {
        if (t.category && !categoryMap.has(t.category)) {
          categoryMap.set(t.category, t.transaction_type as 'income' | 'expense')
        }
      })
      
      const uniqueCategories = Array.from(categoryMap.entries()).map(([name, type]) => ({
        id: name,
        name: name,
        type: type
      }))
      setCategories(uniqueCategories)
    }
  }, [supabase])

  useEffect(() => {
    fetchUserRole()
  }, [fetchUserRole])

  useEffect(() => {
    fetchArtistsAndCategories()
  }, [fetchArtistsAndCategories])

  useEffect(() => {
    if (userRole !== null) {
      fetchTransactions()
    }
  }, [fetchTransactions, userRole])

  const totalIncomeNum = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpensesNum = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalanceNum = totalIncomeNum - totalExpensesNum

  // Format with Spanish locale (points for thousands, comma for decimals)
  const formatCurrency = (num: number) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const totalIncome = formatCurrency(totalIncomeNum)
  const totalExpenses = formatCurrency(totalExpensesNum)
  const netBalance = formatCurrency(netBalanceNum)

  const chartData = useMemo(() => {
    if (chartView === 'monthly') {
      const monthlyData: { [key: string]: { label: string, income: number, expenses: number } } = {};

      transactions.forEach(t => {
        const month = new Date(t.transaction_date + 'T00:00:00').toLocaleString('default', { month: 'long' });
        if (!monthlyData[month]) {
          monthlyData[month] = { label: month, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expenses += t.amount;
        }
      });

      return Object.values(monthlyData);
    } else {
      const dailyData: { [key: string]: { label: string, income: number, expenses: number } } = {};

      transactions.forEach(t => {
        const date = new Date(t.transaction_date + 'T00:00:00').toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { label: date, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          dailyData[date].income += t.amount;
        } else {
          dailyData[date].expenses += t.amount;
        }
      });

      return Object.values(dailyData).sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
    }
  }, [transactions, chartView]);

  const handleAddTransactionClick = () => {
    setSelectedTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleAdvanceRequest = async () => {
    if (!advanceAmount || !advanceReason) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      })
      return
    }

    // Here you would save to a table like 'advance_requests'
    // For now, just show success message
    toast({
      title: 'Solicitud Enviada',
      description: `Tu solicitud de avance por $${parseFloat(advanceAmount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} ha sido enviada al equipo financiero.`
    })

    setIsAdvanceModalOpen(false)
    setAdvanceAmount('')
    setAdvanceReason('')
  }

  const handleSupportRequest = async () => {
    if (!supportSubject || !supportMessage) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      })
      return
    }

    // Here you would save to a table like 'support_tickets'
    toast({
      title: 'Mensaje Enviado',
      description: 'Tu consulta ha sido enviada al equipo de soporte. Te responderemos pronto.'
    })

    setIsSupportModalOpen(false)
    setSupportSubject('')
    setSupportMessage('')
  }

  const handleTransactionModalSave = () => {
    fetchTransactions(); // Re-fetch transactions after save
    // Also re-fetch artists and categories in case new ones were added (though not via this modal)
    fetchArtistsAndCategories(); 
    setIsTransactionModalOpen(false);
  };

  // Stats data for the grid - Key metrics only
  const statsData = [
    {
      title: 'Total Income',
      value: `$${totalIncome}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Revenue from all sources'
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses}`,
      change: '+8.3%',
      changeType: 'negative' as const,
      icon: TrendingDown,
      description: 'All business expenses'
    },
    {
      title: 'Net Balance',
      value: `$${netBalance}`,
      change: netBalanceNum >= 0 ? '+4.2%' : '-2.1%',
      changeType: netBalanceNum >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      description: netBalanceNum >= 0 ? 'Profitable this period' : 'Loss this period'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {loading ? (
          <FinanceSkeleton />
        ) : (
          <>
            {/* Page Header */}
            <PageHeader
              title="Finance Overview"
              description="Track your artist's income and expenses"
              badge={{
                text: userRole === 'admin' ? '👑 Admin View' : userRole === 'artist' ? '🎤 Artist View' : 'Loading...',
                variant: 'outline'
              }}
              actions={[
                {
                  label: 'Solicitar Avance',
                  onClick: () => setIsAdvanceModalOpen(true),
                  variant: 'outline',
                  icon: CreditCard
                },
                {
                  label: 'Contactar Soporte',
                  onClick: () => setIsSupportModalOpen(true),
                  variant: 'outline',
                  icon: MessageSquare
                },
                ...(userRole === 'admin' ? [
                  {
                    label: 'Import Statements',
                    onClick: () => setIsImportDialogOpen(true),
                    variant: 'outline' as const,
                    icon: Upload
                  },
                  {
                    label: 'Manage Categories',
                    onClick: () => setIsCategoryModalOpen(true),
                    variant: 'outline' as const,
                    icon: Settings
                  }
                ] : []),
                {
                  label: 'Add Transaction',
                  onClick: handleAddTransactionClick,
                  variant: 'default',
                  icon: PlusCircle
                }
              ]}
            />

            {/* Tabs for Transactions and Statements */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Transacciones
                </TabsTrigger>
                <TabsTrigger value="statements" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Estados de Cuenta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-8 mt-6">
            {/* Primary Stats Grid */}
            <StatsGrid stats={statsData} columns={3} />

            {/* Secondary Metrics - Clickeable Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card 
                className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => setIsTransactionsInfoModalOpen(true)}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Transactions</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{transactions.length}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total records</div>
              </Card>

              <Card 
                className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => setIsCategoriesInfoModalOpen(true)}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Categories</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{categories.length}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Active types</div>
              </Card>

              <Card 
                className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => setIsArtistsInfoModalOpen(true)}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Artists</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{artists.length}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Under management</div>
              </Card>
            </div>

            {/* Finance Chart Section */}
            <ContentSection
              title="Financial Overview"
              description="Visual representation of income and expenses"
              icon={BarChart3}
            >
              <FinanceChart data={chartData} view={chartView} setView={setChartView} />
            </ContentSection>

            {/* Filters Section */}
            <ContentSection
              title="Filter Transactions"
              description="Filter and search through your transaction history"
              icon={Filter}
            >
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <Select 
                      value={pendingSelectedArtistId} 
                      onValueChange={(value) => {
                        setPendingSelectedArtistId(value);
                        setAppliedSelectedArtistId(value); // Apply immediately
                      }}
                      disabled={userRole === 'artist'}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Filter by Artist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Artists</SelectItem>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={pendingTransactionTypeFilter} onValueChange={(value) => setPendingTransactionTypeFilter(value as 'all' | 'income' | 'expense')}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Filter by Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">💰 Income</SelectItem>
                        <SelectItem value="expense">💸 Expense</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={pendingSelectedCategoryId} onValueChange={(value) => {
                      setPendingSelectedCategoryId(value);
                      setAppliedSelectedCategoryId(value); // Apply immediately
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      placeholder="Start Date"
                      value={pendingStartDate}
                      onChange={(e) => setPendingStartDate(e.target.value)}
                      className="h-11"
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      value={pendingEndDate}
                      onChange={(e) => setPendingEndDate(e.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="Search description..."
                      value={pendingSearchTerm}
                      onChange={(e) => setPendingSearchTerm(e.target.value)}
                      className="md:col-span-3 lg:col-span-1 h-11"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClearFilters} className="h-11">
                      Clear Filters
                    </Button>
                    <Button onClick={handleApplyFilters} className="h-11">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ContentSection>

            {/* Transactions Table Section */}
            <ContentSection
              title="Transaction History"
              description={`${transactions.length} transactions found`}
              icon={FileText}
            >
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  disabled={transactions.length === 0}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              {transactions.length === 0 ? (
                <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your filters or add your first transaction
                    </p>
                    <Button onClick={handleAddTransactionClick}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b">
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Artist</TableHead>
                            <TableHead className="font-semibold">Category</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="text-right font-semibold">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow 
                              key={transaction.id} 
                              onClick={() => handleEditTransactionClick(transaction)} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {new Date(transaction.transaction_date + 'T00:00:00').toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                              </TableCell>
                              <TableCell>{transaction.artists?.name || 'N/A'}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.transaction_categories?.type === 'income' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {transaction.transaction_categories?.name || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transaction.description || '—'}
                              </TableCell>
                              <TableCell className={`text-right font-bold ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </ContentSection>
              </TabsContent>

              <TabsContent value="statements" className="space-y-8 mt-6">
                <ArtistStatementsView />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Import Statements Dialog */}
      <ImportStatementsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => {
          toast({
            title: 'Importación completada',
            description: 'Los estados de cuenta se han actualizado correctamente'
          })
          // Refrescar la vista si está en el tab de statements
          if (activeTab === 'statements') {
            window.location.reload()
          }
        }}
      />

      {/* Info Modals */}
      
      {/* Transactions Info Modal */}
      <Dialog open={isTransactionsInfoModalOpen} onOpenChange={setIsTransactionsInfoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
                <DialogDescription>
                  Complete overview of all financial transactions
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-1">
            <div className="space-y-6 py-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Income Transactions</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {transactions.filter(t => t.type === 'income').length}
                  </div>
                </Card>
                <Card className="p-3 text-center bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <div className="text-xs text-red-600 dark:text-red-400 mb-1">Expense Transactions</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {transactions.filter(t => t.type === 'expense').length}
                  </div>
                </Card>
                <Card className="p-3 text-center bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300 break-words">
                    ${(transactions.reduce((sum, t) => sum + t.amount, 0)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </Card>
                <Card className="p-3 text-center bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Average Amount</div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-300 break-words">
                    ${transactions.length > 0 ? (transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </div>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <Card key={transaction.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {transaction.type === 'income' ? '💰' : '💸'} {transaction.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{transaction.description || 'No description'}</div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.artists?.name} • {transaction.transaction_categories?.name}
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleAddTransactionClick} className="flex-1">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Transaction
                </Button>
                <Button variant="outline" onClick={() => setIsTransactionsInfoModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Categories Info Modal */}
      <Dialog open={isCategoriesInfoModalOpen} onOpenChange={setIsCategoriesInfoModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Category Management</DialogTitle>
                <DialogDescription>
                  Organize your transactions with custom categories
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-1">
            <div className="space-y-6 py-4">
              {/* Category Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {categories.filter(c => c.type === 'income').length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">Income Categories</div>
                </Card>
                <Card className="p-4 text-center bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">
                    {categories.filter(c => c.type === 'expense').length}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">Expense Categories</div>
                </Card>
              </div>

              {/* Categories List */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  All Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Card key={category.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={category.type === 'income' ? 'default' : 'destructive'}>
                            {category.type === 'income' ? '💰' : '💸'}
                          </Badge>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{category.type}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transactions.filter(t => t.category_id === category.id).length} uses
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setIsCategoryModalOpen(true)} className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Categories
                </Button>
                <Button variant="outline" onClick={() => setIsCategoriesInfoModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Artists Info Modal */}
      <Dialog open={isArtistsInfoModalOpen} onOpenChange={setIsArtistsInfoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Artist Portfolio</DialogTitle>
                <DialogDescription>
                  Financial overview of all managed artists
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-1">
            <div className="space-y-6 py-4">
              {/* Artist Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {artists.map((artist) => {
                  const artistTransactions = transactions.filter(t => t.artist_id === artist.id)
                  const artistIncome = artistTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                  const artistExpenses = artistTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                  const artistBalance = artistIncome - artistExpenses

                  return (
                    <Card key={artist.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg font-bold text-orange-600">
                            {artist.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-semibold">{artist.name}</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Income:</span>
                          <span className="font-medium text-green-600">${artistIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expenses:</span>
                          <span className="font-medium text-red-600">${artistExpenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Net:</span>
                          <span className={artistBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${artistBalance.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {artistTransactions.length} transactions
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/artists">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Artists
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setIsArtistsInfoModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleTransactionModalSave}
        transaction={selectedTransaction}
        artists={artists}
        categories={categories}
      />
      {/* Category Modal */}
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={fetchArtistsAndCategories} // To refetch categories after saving
      />

      {/* Advance Request Modal */}
      <Dialog open={isAdvanceModalOpen} onOpenChange={setIsAdvanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Avance</DialogTitle>
            <DialogDescription>
              Completa el formulario para solicitar un avance sobre tus regalías
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto Solicitado</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Textarea
                id="reason"
                placeholder="Describe el motivo de tu solicitud..."
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdvanceRequest}>
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Request Modal */}
      <Dialog open={isSupportModalOpen} onOpenChange={setIsSupportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar Soporte</DialogTitle>
            <DialogDescription>
              ¿Tienes alguna pregunta o inquietud? Estamos aquí para ayudarte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                placeholder="Ej: Consulta sobre mi balance"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Describe tu consulta..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupportModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSupportRequest}>
              Enviar Mensaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
