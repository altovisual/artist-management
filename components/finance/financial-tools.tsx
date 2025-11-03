'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Calculator
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/format-utils'

interface Transaction {
  amount: number
  transaction_type: string
  category: string | null
  transaction_date: string
}

interface FinancialToolsProps {
  transactions: Transaction[]
  totalIncome: number
  totalExpenses: number
  totalAdvances: number
  balance: number
}

export function FinancialTools({
  transactions,
  totalIncome,
  totalExpenses,
  totalAdvances,
  balance
}: FinancialToolsProps) {
  // Calcular métricas
  const netProfit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
  const advanceRecovery = totalAdvances > 0 ? ((totalIncome - totalExpenses) / Math.abs(totalAdvances)) * 100 : 0

  // Análisis por categoría
  const categoryBreakdown = transactions.reduce((acc, t) => {
    const cat = t.category || 'Sin categoría'
    if (!acc[cat]) {
      acc[cat] = { income: 0, expense: 0, count: 0 }
    }
    if (t.transaction_type === 'income') {
      acc[cat].income += t.amount
    } else if (t.transaction_type === 'expense') {
      acc[cat].expense += Math.abs(t.amount)
    }
    acc[cat].count++
    return acc
  }, {} as Record<string, { income: number; expense: number; count: number }>)

  // Top categorías de gasto
  const topExpenseCategories = Object.entries(categoryBreakdown)
    .map(([cat, data]) => ({ category: cat, amount: data.expense }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Top categorías de ingreso
  const topIncomeCategories = Object.entries(categoryBreakdown)
    .map(([cat, data]) => ({ category: cat, amount: data.income }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Análisis mensual
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.transaction_date).toISOString().slice(0, 7)
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 }
    }
    if (t.transaction_type === 'income') {
      acc[month].income += t.amount
    } else if (t.transaction_type === 'expense') {
      acc[month].expense += Math.abs(t.amount)
    }
    return acc
  }, {} as Record<string, { income: number; expense: number }>)

  const avgMonthlyIncome = Object.values(monthlyData).reduce((sum, m) => sum + m.income, 0) / Object.keys(monthlyData).length || 0
  const avgMonthlyExpense = Object.values(monthlyData).reduce((sum, m) => sum + m.expense, 0) / Object.keys(monthlyData).length || 0

  // Proyección
  const projectedAnnualIncome = avgMonthlyIncome * 12
  const projectedAnnualExpense = avgMonthlyExpense * 12
  const projectedAnnualProfit = projectedAnnualIncome - projectedAnnualExpense

  return (
    <div className="space-y-6">
      {/* Análisis de Rentabilidad */}
      <Card className="border-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <CardTitle>Análisis de Rentabilidad</CardTitle>
          </div>
          <CardDescription>Métricas clave de tu desempeño financiero</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ganancia Neta</span>
                <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              <Progress value={Math.min(Math.abs(profitMargin), 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margen de Ganancia</span>
                <span className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(profitMargin)}
                </span>
              </div>
              <Progress value={Math.min(Math.abs(profitMargin), 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ratio de Gastos</span>
                <span className="font-bold">{formatPercentage(expenseRatio)}</span>
              </div>
              <Progress value={Math.min(expenseRatio, 100)} className="h-2" />
            </div>

            {totalAdvances !== 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recuperación de Avances</span>
                  <span className="font-bold">{formatPercentage(advanceRecovery)}</span>
                </div>
                <Progress value={Math.min(Math.abs(advanceRecovery), 100)} className="h-2" />
              </div>
            )}
          </div>

          {/* Alertas */}
          <div className="space-y-2 pt-4 border-t">
            {expenseRatio > 80 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600">Gastos Elevados</p>
                  <p className="text-xs text-muted-foreground">
                    Tus gastos representan el {formatPercentage(expenseRatio)} de tus ingresos. Considera optimizar.
                  </p>
                </div>
              </div>
            )}

            {profitMargin > 30 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600">Excelente Rentabilidad</p>
                  <p className="text-xs text-muted-foreground">
                    Tu margen de ganancia del {formatPercentage(profitMargin)} es muy saludable.
                  </p>
                </div>
              </div>
            )}

            {balance < 0 && Math.abs(balance) > totalIncome * 0.5 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-600">Balance Negativo Significativo</p>
                  <p className="text-xs text-muted-foreground">
                    Tu balance negativo representa más del 50% de tus ingresos totales.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Desglose por Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Top Ingresos por Categoría</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIncomeCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-green-600">{formatCurrency(cat.amount)}</span>
                </div>
                <Progress 
                  value={(cat.amount / totalIncome) * 100} 
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {formatPercentage((cat.amount / totalIncome) * 100)} del total
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg">Top Gastos por Categoría</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topExpenseCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-red-600">{formatCurrency(cat.amount)}</span>
                </div>
                <Progress 
                  value={(cat.amount / totalExpenses) * 100} 
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {formatPercentage((cat.amount / totalExpenses) * 100)} del total
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Proyecciones */}
      <Card className="border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <CardTitle>Proyección Anual</CardTitle>
          </div>
          <CardDescription>Basado en tu promedio mensual actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Ingresos Proyectados</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(projectedAnnualIncome)}</p>
              <p className="text-xs text-muted-foreground">
                Promedio mensual: {formatCurrency(avgMonthlyIncome)}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Gastos Proyectados</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(projectedAnnualExpense)}</p>
              <p className="text-xs text-muted-foreground">
                Promedio mensual: {formatCurrency(avgMonthlyExpense)}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-blue-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Ganancia Proyectada</span>
              </div>
              <p className={`text-2xl font-bold ${projectedAnnualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projectedAnnualProfit)}
              </p>
              <p className="text-xs text-muted-foreground">
                Margen: {formatPercentage((projectedAnnualProfit / projectedAnnualIncome) * 100)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Download className="w-5 h-5" />
              <span className="text-xs">Exportar PDF</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Generar Reporte</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Comparar Periodos</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Calculator className="w-5 h-5" />
              <span className="text-xs">Calculadora</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
