'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ContentSectionAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary'
  icon?: LucideIcon
}

interface ContentSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ContentSectionAction[]
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function ContentSection({
  title,
  description,
  icon: Icon,
  actions = [],
  children,
  className,
  headerClassName,
  contentClassName
}: ContentSectionProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
      "hover:shadow-lg transition-all duration-300",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <CardHeader className={cn("relative", headerClassName)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => {
                const ButtonComponent = (
                  <Button 
                    key={index}
                    variant={action.variant || 'outline'} 
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.icon ? (
                      <action.icon className="h-4 w-4 mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {action.label}
                  </Button>
                )

                return action.href ? (
                  <Link key={index} href={action.href}>
                    {ButtonComponent}
                  </Link>
                ) : ButtonComponent
              })}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn("relative", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
