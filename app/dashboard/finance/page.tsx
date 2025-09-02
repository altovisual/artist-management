'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, Search, DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TransactionModal } from '@/components/transaction-modal'
import { CategoryModal } from '@/components/category-modal'
import { FinanceSkeleton } from './finance-skeleton' // Import the skeleton
import { AnimatedTitle } from '@/components/animated-title'
import { FinanceChart } from './finance-chart'

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

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select(`
        *,
        artists(name),
        transaction_categories(name, type)
      `)
      .order('transaction_date', { ascending: false })

    if (appliedSelectedArtistId !== 'all') {
      query = query.eq('artist_id', appliedSelectedArtistId)
    }
    if (appliedTransactionTypeFilter !== 'all') {
      query = query.eq('type', appliedTransactionTypeFilter)
    }
    if (appliedSelectedCategoryId !== 'all') {
      query = query.eq('category_id', appliedSelectedCategoryId)
    }
    if (appliedSearchTerm) {
      query = query.ilike('description', `%${appliedSearchTerm}%`)
    }
    if (appliedStartDate) {
      query = query.gte('transaction_date', appliedStartDate)
    }
    if (appliedEndDate) {
      query = query.lte('transaction_date', appliedEndDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      toast({ title: 'Error', description: 'Could not load transactions.', variant: 'destructive' })
      setTransactions([])
    } else {
      setTransactions(data as Transaction[])
    }
    setLoading(false)
  }, [supabase, appliedSelectedArtistId, appliedTransactionTypeFilter, appliedSelectedCategoryId, appliedSearchTerm, appliedStartDate, appliedEndDate, toast])

  const fetchArtistsAndCategories = useCallback(async () => {
    const { data: artistsData, error: artistsError } = await supabase.from('artists').select('id, name').order('name', { ascending: true })
    if (artistsError) {
      console.error('Error fetching artists:', artistsError)
    } else {
      setArtists(artistsData || [])
    }

    const { data: categoriesData, error: categoriesError } = await supabase.from('transaction_categories').select('id, name, type').order('name', { ascending: true })
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    } else {
      setCategories(categoriesData || [])
    }
  }, [supabase])

  useEffect(() => {
    fetchArtistsAndCategories()
  }, [fetchArtistsAndCategories])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2)

  const netBalance = (parseFloat(totalIncome) - parseFloat(totalExpenses)).toFixed(2)

  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { month: string, income: number, expenses: number } } = {};

    transactions.forEach(t => {
      const month = new Date(t.transaction_date).toLocaleString('default', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    return Object.values(monthlyData);
  }, [transactions]);

  const handleAddTransactionClick = () => {
    setSelectedTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionModalSave = () => {
    fetchTransactions(); // Re-fetch transactions after save
    // Also re-fetch artists and categories in case new ones were added (though not via this modal)
    fetchArtistsAndCategories(); 
    setIsTransactionModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col gap-6 p-4 sm:p-6">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-center sm:text-left">
                <AnimatedTitle text="Finance Overview" level={1} className="text-2xl font-bold tracking-tight" />
                <p className="text-muted-foreground">Track your artist&apos;s income and expenses.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsCategoryModalOpen(true)} className="w-full sm:w-auto">Manage Categories</Button>
                <Button onClick={handleAddTransactionClick} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <FinanceSkeleton />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">${totalIncome}</div>
                  <p className="text-xs text-muted-foreground">All recorded income</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">${totalExpenses}</div>
                  <p className="text-xs text-muted-foreground">All recorded expenses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${parseFloat(netBalance) >= 0 ? 'text-green-500' : 'text-red-500'}`}>${netBalance}</div>
                  <p className="text-xs text-muted-foreground">Income - Expenses</p>
                </CardContent>
              </Card>
              <Card className="md:col-span-3 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Royalty Management</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Import and analyze royalty reports from your distributors.
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/finance/royalties" className="w-full">
                    <Button className="w-full">
                      Go to Royalties
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <FinanceChart data={chartData} />

            {/* Filters */}
            <Card>
              <CardHeader><CardTitle>Filter Transactions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  <Select value={pendingSelectedArtistId} onValueChange={setPendingSelectedArtistId}>
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={pendingSelectedCategoryId} onValueChange={setPendingSelectedCategoryId}>
                    <SelectTrigger>
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
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={pendingEndDate}
                    onChange={(e) => setPendingEndDate(e.target.value)}
                  />
                  <Input
                    placeholder="Search description..."
                    value={pendingSearchTerm}
                    onChange={(e) => setPendingSearchTerm(e.target.value)}
                    className="md:col-span-3 lg:col-span-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
                  <Button onClick={handleApplyFilters}>Apply Filters</Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Artist</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id} onClick={() => handleEditTransactionClick(transaction)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>{new Date(transaction.transaction_date + 'T00:00:00').toLocaleDateString('es-ES', { timeZone: 'UTC' })}</TableCell>
                            <TableCell>{transaction.artists?.name || 'N/A'}</TableCell>
                            <TableCell>{transaction.transaction_categories?.name || 'N/A'}</TableCell>
                            <TableCell>{transaction.description || '—'}</TableCell>
                            <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

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
    </DashboardLayout>
  )
}
