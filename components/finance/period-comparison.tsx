'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Calendar,
  DollarSign,
  Percent,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/format-utils'

interface Transaction {
  amount: number
  transaction_type: string
  category: string | null
  transaction_date: string
}

interface PeriodComparisonProps {
  transactions: Transaction[]
}

interface PeriodData {
  income: number
  expenses: number
  advances: number
  balance: number
  transactionCount: number
  avgTransactionSize: number
  topCategory: string
  topCategoryAmount: number
}

export function PeriodComparison({ transactions }: PeriodComparisonProps) {
  // Obtener meses disponibles
  const availableMonths = Array.from(
    new Set(
      transactions.map(t => 
        new Date(t.transaction_date).toISOString().slice(0, 7)
      )
    )
  ).sort().reverse()

  const [period1, setPeriod1] = useState(availableMonths[0] || '')
  const [period2, setPeriod2] = useState(availableMonths[1] || '')

  // Calcular datos para cada periodo
  const calculatePeriodData = (month: string): PeriodData => {
    const periodTransactions = transactions.filter(t => 
      t.transaction_date.startsWith(month)
    )

    const income = periodTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = periodTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const advances = periodTransactions
      .filter(t => t.transaction_type === 'advance')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const balance = income - expenses - advances

    // Top categoría
    const categoryTotals = periodTransactions.reduce((acc, t) => {
      const cat = t.category || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)

    const topCategoryEntry = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0] || ['N/A', 0]

    return {
      income,
      expenses,
      advances,
      balance,
      transactionCount: periodTransactions.length,
      avgTransactionSize: periodTransactions.length > 0 
        ? periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / periodTransactions.length 
        : 0,
      topCategory: topCategoryEntry[0],
      topCategoryAmount: topCategoryEntry[1]
    }
  }

  const data1 = calculatePeriodData(period1)
  const data2 = calculatePeriodData(period2)

  // Calcular cambios
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: 0, trend: 'neutral' as const }
    const change = current - previous
    const percentage = (change / Math.abs(previous)) * 100
    const trend = change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    return { value: change, percentage, trend }
  }

  const incomeChange = calculateChange(data1.income, data2.income)
  const expensesChange = calculateChange(data1.expenses, data2.expenses)
  const balanceChange = calculateChange(data1.balance, data2.balance)
  const transactionsChange = calculateChange(data1.transactionCount, data2.transactionCount)

  const formatMonth = (month: string) => {
    if (!month) return 'Seleccionar'
    const date = new Date(month + '-01')
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4" />
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const TrendBadge = ({ change, isPositiveGood = true }: { change: any, isPositiveGood?: boolean }) => {
    const isGood = isPositiveGood ? change.trend === 'up' : change.trend === 'down'
    const variant = change.trend === 'neutral' ? 'secondary' : isGood ? 'default' : 'destructive'
    
    return (
      <Badge variant={variant} className="gap-1">
        <TrendIcon trend={change.trend} />
        {change.trend !== 'neutral' && (
          <>
            {formatCurrency(Math.abs(change.value))} ({formatPercentage(Math.abs(change.percentage))})
          </>
        )}
        {change.trend === 'neutral' && 'Sin cambio'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selectores de Periodo */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Comparar Periodos
          </CardTitle>
          <CardDescription>
            Selecciona dos meses para comparar su desempeño financiero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo 1 (Actual)</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo 2 (Comparar con)</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparación de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <Card className="border-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Ingresos</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(data1.income)}</p>
                <p className="text-xs text-muted-foreground">
                  vs {formatCurrency(data2.income)}
                </p>
              </div>
              <TrendBadge change={incomeChange} isPositiveGood={true} />
            </div>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card className="border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Gastos</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatCurrency(data1.expenses)}</p>
                <p className="text-xs text-muted-foreground">
                  vs {formatCurrency(data2.expenses)}
                </p>
              </div>
              <TrendBadge change={expensesChange} isPositiveGood={false} />
            </div>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Balance</span>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${data1.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data1.balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs {formatCurrency(data2.balance)}
                </p>
              </div>
              <TrendBadge change={balanceChange} isPositiveGood={true} />
            </div>
          </CardContent>
        </Card>

        {/* Transacciones */}
        <Card className="border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Transacciones</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{data1.transactionCount}</p>
                <p className="text-xs text-muted-foreground">
                  vs {data2.transactionCount}
                </p>
              </div>
              <TrendBadge change={transactionsChange} isPositiveGood={true} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis Detallado */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Análisis Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Periodo 1 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">{formatMonth(period1)}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Promedio por Transacción</span>
                  <span className="font-medium">{formatCurrency(data1.avgTransactionSize)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Categoría Principal</span>
                  <span className="font-medium">{data1.topCategory}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Monto en Categoría Principal</span>
                  <span className="font-medium">{formatCurrency(data1.topCategoryAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Margen de Ganancia</span>
                  <span className={`font-medium ${data1.income > 0 ? 'text-green-600' : ''}`}>
                    {formatPercentage(data1.income > 0 ? ((data1.balance / data1.income) * 100) : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Periodo 2 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-muted-foreground">{formatMonth(period2)}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Promedio por Transacción</span>
                  <span className="font-medium">{formatCurrency(data2.avgTransactionSize)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Categoría Principal</span>
                  <span className="font-medium">{data2.topCategory}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Monto en Categoría Principal</span>
                  <span className="font-medium">{formatCurrency(data2.topCategoryAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Margen de Ganancia</span>
                  <span className={`font-medium ${data2.income > 0 ? 'text-green-600' : ''}`}>
                    {formatPercentage(data2.income > 0 ? ((data2.balance / data2.income) * 100) : 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-0 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="w-5 h-5 text-yellow-600" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomeChange.trend === 'up' && (
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-600">Crecimiento en Ingresos</p>
                <p className="text-xs text-muted-foreground">
                  Tus ingresos aumentaron {formatPercentage(incomeChange.percentage)}. ¡Excelente trabajo!
                </p>
              </div>
            </div>
          )}

          {expensesChange.trend === 'down' && (
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-600">Reducción en Gastos</p>
                <p className="text-xs text-muted-foreground">
                  Redujiste tus gastos en {formatPercentage(Math.abs(expensesChange.percentage))}. Muy bien optimizado.
                </p>
              </div>
            </div>
          )}

          {balanceChange.trend === 'up' && (
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-600">Mejora en Balance</p>
                <p className="text-xs text-muted-foreground">
                  Tu balance mejoró {formatCurrency(balanceChange.value)} respecto al periodo anterior.
                </p>
              </div>
            </div>
          )}

          {incomeChange.trend === 'down' && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600">Atención: Disminución en Ingresos</p>
                <p className="text-xs text-muted-foreground">
                  Tus ingresos bajaron {formatPercentage(Math.abs(incomeChange.percentage))}. Considera revisar tus estrategias de monetización.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
