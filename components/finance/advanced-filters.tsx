'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import { formatDate } from '@/lib/format-utils'

export interface FilterOptions {
  searchTerm: string
  dateFrom: Date | null
  dateTo: Date | null
  transactionType: string
  amountMin: number | null
  amountMax: number | null
  category: string
  paymentMethod: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onReset: () => void
  onExport?: () => void
  categories: string[]
  paymentMethods: string[]
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  categories,
  paymentMethods
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    if (value === null || value === '' || value === 'all') return false
    return true
  }).length

  return (
    <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount} activos
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Búsqueda por texto */}
          <div className="space-y-2">
            <Label>Buscar en Concepto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por concepto, número de factura..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? formatDate(filters.dateFrom) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom || undefined}
                    onSelect={(date) => updateFilter('dateFrom', date || null)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? formatDate(filters.dateTo) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo || undefined}
                    onSelect={(date) => updateFilter('dateTo', date || null)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filtros de monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto Mínimo</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMin || ''}
                  onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : null)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monto Máximo</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMax || ''}
                  onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : null)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filtros de categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Transacción</Label>
              <Select value={filters.transactionType} onValueChange={(value) => updateFilter('transactionType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Ingresos
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      Gastos
                    </div>
                  </SelectItem>
                  <SelectItem value="advance">Avances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ordenar Por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="amount">Monto</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="concept">Concepto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Orden</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descendente (Mayor a Menor)</SelectItem>
                  <SelectItem value="asc">Ascendente (Menor a Mayor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={onReset} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>

          {/* Filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {filters.searchTerm && (
                <Badge variant="secondary">
                  Búsqueda: {filters.searchTerm}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('searchTerm', '')}
                  />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary">
                  Desde: {formatDate(filters.dateFrom)}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('dateFrom', null)}
                  />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary">
                  Hasta: {formatDate(filters.dateTo)}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('dateTo', null)}
                  />
                </Badge>
              )}
              {filters.transactionType !== 'all' && (
                <Badge variant="secondary">
                  Tipo: {filters.transactionType}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('transactionType', 'all')}
                  />
                </Badge>
              )}
              {filters.amountMin !== null && (
                <Badge variant="secondary">
                  Min: ${filters.amountMin}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('amountMin', null)}
                  />
                </Badge>
              )}
              {filters.amountMax !== null && (
                <Badge variant="secondary">
                  Max: ${filters.amountMax}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => updateFilter('amountMax', null)}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
