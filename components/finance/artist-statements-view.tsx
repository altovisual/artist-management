'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Download, Upload, BarChart3, GitCompare, FileSpreadsheet } from 'lucide-react'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'
import { formatCurrency, formatDate } from '@/lib/format-utils'
import { FinancialCharts } from './financial-charts'
import { PeriodComparison } from './period-comparison'
import { exportStatementsReport, exportStatementsReportToPDF } from '@/lib/export-statements-report'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { ImportStatementsDialog } from './import-statements-dialog'

interface ArtistStatement {
  id: string
  artist_id: string
  period_start: string
  period_end: string | null
  statement_month: string
  legal_name: string | null
  total_income: number
  total_expenses: number
  total_advances: number
  balance: number
  total_transactions: number
  artists?: {
    name: string
    profile_image?: string
  }
}

interface StatementTransaction {
  id: string
  transaction_date: string
  invoice_number: string | null
  transaction_type_code: string | null
  payment_method_detail: string | null
  concept: string
  invoice_value: number | null
  bank_charges_amount: number | null
  country_percentage: number | null
  commission_20_percentage: number | null
  legal_5_percentage: number | null
  tax_retention: number | null
  mvpx_payment: number | null
  advance_amount: number | null
  final_balance: number | null
  amount: number
  transaction_type: string
  category: string | null
  running_balance: number | null
}

export function ArtistStatementsView() {
  const supabase = createClient()
  const [statements, setStatements] = useState<ArtistStatement[]>([])
  const [selectedArtistId, setSelectedArtistId] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedStatement, setSelectedStatement] = useState<ArtistStatement | null>(null)
  const [transactions, setTransactions] = useState<StatementTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null)
  const [userArtistIds, setUserArtistIds] = useState<string[]>([])

  // Fetch user role and their artists
  useEffect(() => {
    fetchUserRole()
  }, [])

  // Fetch statements
  useEffect(() => {
    if (userRole !== null) {
      fetchStatements()
    }
  }, [selectedArtistId, selectedMonth, userRole])

  // Fetch transactions when statement is selected
  useEffect(() => {
    if (selectedStatement) {
      fetchTransactions(selectedStatement.id)
    }
  }, [selectedStatement])

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role?.toLowerCase() === 'admin'
      setUserRole(isAdmin ? 'admin' : 'user')

      // If not admin, get their artist IDs
      if (!isAdmin) {
        const { data: userArtists } = await supabase
          .from('artists')
          .select('id')
          .eq('user_id', user.id)

        const artistIds = userArtists?.map(a => a.id) || []
        setUserArtistIds(artistIds)
        
        console.log('👤 Usuario normal - Artistas:', artistIds)
      } else {
        console.log('👑 Usuario admin - Ver todos los estados')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('user') // Default to user for safety
    }
  }

  const fetchStatements = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('artist_statements')
        .select(`
          *,
          artists(name, profile_image)
        `)
        .order('period_start', { ascending: false })
        // Filtrar registros ocultos
        .or('hidden.is.null,hidden.eq.false')

      // If user is not admin, filter by their artists only
      if (userRole === 'user' && userArtistIds.length > 0) {
        query = query.in('artist_id', userArtistIds)
        console.log('🔒 Filtrando por artistas del usuario:', userArtistIds)
      }

      if (selectedArtistId !== 'all') {
        query = query.eq('artist_id', selectedArtistId)
      }
      if (selectedMonth !== 'all') {
        query = query.eq('statement_month', selectedMonth)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching statements:', error)
        toast.error('Error al cargar estados de cuenta', {
          description: error.message
        })
        setStatements([])
      } else {
        console.log(`✅ Estados de cuenta cargados: ${data?.length || 0}`)
        setStatements(data || [])
        if (data && data.length > 0 && !selectedStatement) {
          setSelectedStatement(data[0])
        }
      }
    } catch (error) {
      console.error('Error in fetchStatements:', error)
      setStatements([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (statementId: string) => {
    const { data, error } = await supabase
      .from('statement_transactions')
      .select('*')
      .eq('statement_id', statementId)
      // Filtrar transacciones ocultas
      .or('hidden.is.null,hidden.eq.false')
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
  }

  const handleExportExcel = () => {
    try {
      const reportData = {
        statements,
        selectedStatement: selectedStatement || undefined,
        transactions: selectedStatement ? transactions : undefined,
        totalIncome,
        totalExpenses,
        totalAdvances,
        totalBalance,
        filterArtist: selectedArtistId !== 'all' 
          ? uniqueArtists.find(a => a.id === selectedArtistId)?.name 
          : undefined,
        filterMonth: selectedMonth !== 'all' ? selectedMonth : undefined
      };

      const fileName = exportStatementsReport(reportData);

      toast.success('Excel Exportado! 📊', {
        description: `${statements.length} estados de cuenta exportados a ${fileName}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al Exportar', {
        description: 'Hubo un error al generar el reporte. Por favor intenta de nuevo.',
      });
    }
  }

  const handleExportPDF = () => {
    try {
      const reportData = {
        statements,
        selectedStatement: selectedStatement || undefined,
        transactions: selectedStatement ? transactions : undefined,
        totalIncome,
        totalExpenses,
        totalAdvances,
        totalBalance,
        filterArtist: selectedArtistId !== 'all' 
          ? uniqueArtists.find(a => a.id === selectedArtistId)?.name 
          : undefined,
        filterMonth: selectedMonth !== 'all' ? selectedMonth : undefined
      };

      const fileName = exportStatementsReportToPDF(reportData);

      toast.success('PDF Exportado! 📄', {
        description: `${statements.length} estados de cuenta exportados a ${fileName}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al Exportar', {
        description: 'Hubo un error al generar el reporte PDF. Por favor intenta de nuevo.',
      });
    }
  }

  // Calculate totals
  const totalIncome = statements.reduce((sum, s) => sum + s.total_income, 0)
  const totalExpenses = statements.reduce((sum, s) => sum + s.total_expenses, 0)
  const totalAdvances = statements.reduce((sum, s) => sum + s.total_advances, 0)
  const totalBalance = statements.reduce((sum, s) => sum + s.balance, 0)

  // Get unique months
  const uniqueMonths = Array.from(new Set(statements.map(s => s.statement_month))).sort().reverse()

  // Get unique artists (filtered by user's access)
  const uniqueArtists = Array.from(
    new Map(statements.map(s => [s.artist_id, { id: s.artist_id, name: s.artists?.name || 'Unknown' }])).values()
  )

  // Show role indicator for debugging
  const roleIndicator = userRole === 'admin' ? '👑 Admin' : '👤 Usuario'

  // Stats for grid
  const statsData = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(totalIncome),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Ingresos del periodo'
    },
    {
      title: 'Gastos Totales',
      value: formatCurrency(totalExpenses),
      change: '+8.3%',
      changeType: 'negative' as const,
      icon: TrendingDown,
      description: 'Gastos del periodo'
    },
    {
      title: 'Avances Totales',
      value: formatCurrency(Math.abs(totalAdvances)),
      change: totalAdvances < 0 ? 'Pendiente' : 'Recuperado',
      changeType: totalAdvances < 0 ? 'negative' as const : 'positive' as const,
      icon: DollarSign,
      description: 'Avances otorgados'
    },
    {
      title: 'Balance Total',
      value: formatCurrency(totalBalance),
      change: totalBalance >= 0 ? 'Positivo' : 'Negativo',
      changeType: totalBalance >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      description: 'Balance neto'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Filters */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
            {userRole && (
              <Badge variant="outline" className="text-xs">
                {roleIndicator}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los artistas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los artistas</SelectItem>
                {uniqueArtists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={statements.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Reporte
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {userRole === 'user' && userArtistIds.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ℹ️ No tienes artistas asociados a tu cuenta. Los estados de cuenta se mostrarán cuando tengas artistas asignados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statements List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statements List */}
        <ContentSection
          title="Estados de Cuenta"
          description={`${statements.length} periodos encontrados`}
          icon={FileText}
          className="lg:col-span-1"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Cargando estados de cuenta...</p>
            </div>
          ) : statements.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay estados de cuenta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Importa el archivo Excel para comenzar a ver los estados de cuenta de tus artistas
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Estados de Cuenta
              </Button>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {statements.map((statement) => (
              <Card
                key={statement.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedStatement?.id === statement.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedStatement(statement)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{statement.artists?.name}</div>
                    <Badge variant={statement.balance >= 0 ? 'default' : 'destructive'}>
                      {formatCurrency(statement.balance)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(statement.statement_month + '-01').toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">+{formatCurrency(statement.total_income)}</span>
                    <span className="text-red-600">-{formatCurrency(statement.total_expenses)}</span>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          )}
        </ContentSection>

        {/* Statement Details */}
        <ContentSection
          title="Detalle del Estado de Cuenta"
          description={selectedStatement ? selectedStatement.artists?.name : 'Selecciona un estado de cuenta'}
          icon={FileText}
          className="lg:col-span-2"
        >
          {selectedStatement ? (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Resumen</TabsTrigger>
                <TabsTrigger value="transactions">Transacciones ({transactions.length})</TabsTrigger>
                <TabsTrigger value="charts">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gráficos
                </TabsTrigger>
                <TabsTrigger value="comparison">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Comparar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(selectedStatement.total_income)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Ingresos</div>
                  </Card>
                  <Card className="p-4 text-center bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(selectedStatement.total_expenses)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">Gastos</div>
                  </Card>
                  <Card className="p-4 text-center bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(Math.abs(selectedStatement.total_advances))}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Avances</div>
                  </Card>
                  <Card className="p-4 text-center bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {selectedStatement.total_transactions}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Transacciones</div>
                  </Card>
                </div>

                {/* Period Info */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Información del Periodo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Artista:</span>
                      <span className="font-medium">{selectedStatement.artists?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre Legal:</span>
                      <span className="font-medium">{selectedStatement.legal_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Periodo:</span>
                      <span className="font-medium">
                        {new Date(selectedStatement.period_start).toLocaleDateString('es-ES')}
                        {selectedStatement.period_end && ` - ${new Date(selectedStatement.period_end).toLocaleDateString('es-ES')}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Final:</span>
                      <span className={`font-bold ${selectedStatement.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedStatement.balance)}
                      </span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Método Pago</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Valor Factura</TableHead>
                        <TableHead className="text-right">Cargos Banc.</TableHead>
                        <TableHead className="text-right">80% País</TableHead>
                        <TableHead className="text-right">20% Comisión</TableHead>
                        <TableHead className="text-right">5% Legal</TableHead>
                        <TableHead className="text-right">Retención IVA</TableHead>
                        <TableHead className="text-right">Pagado MVPX</TableHead>
                        <TableHead className="text-right">Avance</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(transaction.transaction_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{transaction.invoice_number || '—'}</TableCell>
                          <TableCell className="whitespace-nowrap">{transaction.transaction_type_code || '—'}</TableCell>
                          <TableCell className="whitespace-nowrap">{transaction.payment_method_detail || '—'}</TableCell>
                          <TableCell className="max-w-xs truncate">{transaction.concept}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.invoice_value ? formatCurrency(transaction.invoice_value) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.bank_charges_amount ? formatCurrency(transaction.bank_charges_amount) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.country_percentage ? formatCurrency(transaction.country_percentage) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.commission_20_percentage ? formatCurrency(transaction.commission_20_percentage) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.legal_5_percentage ? formatCurrency(transaction.legal_5_percentage) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.tax_retention ? formatCurrency(transaction.tax_retention) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.mvpx_payment ? formatCurrency(transaction.mvpx_payment) : '—'}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {transaction.advance_amount ? formatCurrency(transaction.advance_amount) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-bold whitespace-nowrap">
                            {transaction.final_balance !== null ? formatCurrency(transaction.final_balance) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <FinancialCharts transactions={transactions} />
              </TabsContent>

              <TabsContent value="comparison">
                <PeriodComparison transactions={transactions} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Selecciona un estado de cuenta para ver los detalles
            </div>
          )}
        </ContentSection>
      </div>

      {/* Import Dialog */}
      <ImportStatementsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => {
          toast.success('Importación completada', {
            description: 'Los estados de cuenta se han actualizado correctamente'
          });
          fetchStatements(); // Recargar los estados de cuenta
        }}
      />
    </div>
  )
}
