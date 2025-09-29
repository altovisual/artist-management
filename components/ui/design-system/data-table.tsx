'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LucideIcon, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DataTableAction {
  label: string
  onClick: (item: any) => void
  icon?: LucideIcon
  variant?: 'default' | 'destructive'
}

interface DataTableColumn {
  key: string
  label: string
  render?: (value: any, item: any) => React.ReactNode
  className?: string
}

interface DataTableProps {
  title?: string
  description?: string
  data: any[]
  columns: DataTableColumn[]
  actions?: DataTableAction[]
  emptyState?: {
    title: string
    description: string
    icon?: LucideIcon
  }
  className?: string
}

export function DataTable({
  title,
  description,
  data,
  columns,
  actions = [],
  emptyState,
  className
}: DataTableProps) {
  const renderCellContent = (column: DataTableColumn, item: any) => {
    const value = item[column.key]
    
    if (column.render) {
      return column.render(value, item)
    }

    // Auto-render common types
    if (column.key.includes('avatar') || column.key.includes('image')) {
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={value} />
          <AvatarFallback>{item.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
      )
    }

    if (column.key.includes('status')) {
      return (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    }

    if (column.key.includes('date')) {
      return new Date(value).toLocaleDateString()
    }

    return value
  }

  if (data.length === 0 && emptyState) {
    return (
      <Card className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
        className
      )}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          {emptyState.icon && (
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <emptyState.icon className="h-8 w-8 text-primary" />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {emptyState.description}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      {(title || description) && (
        <CardHeader className="relative">
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="relative p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {columns.map((column) => (
                  <th 
                    key={column.key}
                    className={cn(
                      "text-left p-4 font-medium text-muted-foreground text-sm",
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={index}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={cn("p-4", column.className)}
                    >
                      {renderCellContent(column, item)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="text-right p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={cn(
                                action.variant === 'destructive' && "text-destructive"
                              )}
                            >
                              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
