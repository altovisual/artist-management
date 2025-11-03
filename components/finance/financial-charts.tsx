'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/format-utils'

interface Transaction {
  amount: number
  transaction_type: string
  category: string | null
  transaction_date: string
  invoice_value?: number | null
  country_percentage?: number | null
  commission_20_percentage?: number | null
  legal_5_percentage?: number | null
}

interface FinancialChartsProps {
  transactions: Transaction[]
}

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  advance: '#f59e0b',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899'
}

const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#a855f7', '#d946ef', '#f43f5e'
]

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  // 1. Datos para gráfico de línea temporal (Ingresos vs Gastos por mes)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.transaction_date).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    if (!acc[month]) {
      acc[month] = { 
        month, 
        ingresos: 0, 
        gastos: 0, 
        neto: 0,
        transacciones: 0
      }
    }
    
    if (t.transaction_type === 'income') {
      acc[month].ingresos += t.amount
    } else if (t.transaction_type === 'expense') {
      acc[month].gastos += Math.abs(t.amount)
    }
    
    acc[month].neto = acc[month].ingresos - acc[month].gastos
    acc[month].transacciones++
    
    return acc
  }, {} as Record<string, any>)

  const timelineData = Object.values(monthlyData).sort((a: any, b: any) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime()
  })

  // 2. Datos para gráfico de pastel (Distribución de gastos por categoría)
  const expenseByCategory = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)

  const pieData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 categorías

  // 3. Datos para gráfico de barras (Ingresos por categoría)
  const incomeByCategory = transactions
    .filter(t => t.transaction_type === 'income')
    .reduce((acc, t) => {
      const cat = t.category || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const barData = Object.entries(incomeByCategory)
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 10) // Top 10 categorías

  // 4. Datos para gráfico de área (Distribución de pagos)
  const distributionData = transactions
    .filter(t => t.country_percentage || t.commission_20_percentage || t.legal_5_percentage)
    .slice(0, 20) // Últimas 20 transacciones con distribución
    .map(t => ({
      fecha: new Date(t.transaction_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      pais: t.country_percentage || 0,
      comision: t.commission_20_percentage || 0,
      legal: t.legal_5_percentage || 0
    }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">
            <Activity className="w-4 h-4 mr-2" />
            Temporal
          </TabsTrigger>
          <TabsTrigger value="income">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <TrendingUp className="w-4 h-4 mr-2" />
            Distribución
          </TabsTrigger>
        </TabsList>

        {/* Gráfico de Línea Temporal */}
        <TabsContent value="timeline">
          <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Ingresos vs Gastos - Evolución Temporal
              </CardTitle>
              <CardDescription>
                Visualiza cómo han evolucionado tus ingresos y gastos mes a mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke={COLORS.income} 
                    strokeWidth={3}
                    name="Ingresos"
                    dot={{ fill: COLORS.income, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke={COLORS.expense} 
                    strokeWidth={3}
                    name="Gastos"
                    dot={{ fill: COLORS.expense, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="neto" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Neto"
                    dot={{ fill: COLORS.primary, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Barras - Ingresos */}
        <TabsContent value="income">
          <Card className="border-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Ingresos por Categoría
              </CardTitle>
              <CardDescription>
                Top 10 categorías que más ingresos generan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="categoria" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="monto" 
                    fill={COLORS.income}
                    radius={[0, 8, 8, 0]}
                    name="Monto"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Pastel - Gastos */}
        <TabsContent value="expenses">
          <Card className="border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-red-600" />
                Distribución de Gastos
              </CardTitle>
              <CardDescription>
                Cómo se distribuyen tus gastos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">Desglose Detallado</h4>
                  {pieData.map((item, index) => {
                    const total = pieData.reduce((sum, i) => sum + i.value, 0)
                    const percentage = ((item.value / total) * 100).toFixed(1)
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.value)} ({percentage}%)
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Área - Distribución de Pagos */}
        <TabsContent value="distribution">
          <Card className="border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Distribución de Pagos (80% País, 20% Comisión, 5% Legal)
              </CardTitle>
              <CardDescription>
                Cómo se distribuyen los pagos entre las diferentes partes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pais" 
                    stackId="1"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                    name="80% País"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="comision" 
                    stackId="1"
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary}
                    fillOpacity={0.6}
                    name="20% Comisión"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="legal" 
                    stackId="1"
                    stroke={COLORS.accent} 
                    fill={COLORS.accent}
                    fillOpacity={0.6}
                    name="5% Legal"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
