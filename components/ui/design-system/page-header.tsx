'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { AnimatedTitle } from "@/components/animated-title"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PageHeaderAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary'
  icon?: LucideIcon
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'outline'
  }
  avatar?: {
    src?: string
    fallback: string
  }
  actions?: PageHeaderAction[]
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  avatar,
  actions = [],
  className
}: PageHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20",
      className
    )}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Content */}
      <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left: Main Info */}
          <div className="flex items-start gap-4 lg:gap-6 flex-1">
            {avatar && (
              <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-primary/20 shadow-lg">
                <AvatarImage src={avatar.src} alt={title} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {avatar.fallback}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="space-y-2 flex-1">
              {badge && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <Badge variant={badge.variant || 'secondary'} className="bg-primary/10 text-primary border-primary/20">
                    {badge.text}
                  </Badge>
                </div>
              )}
              
              <AnimatedTitle 
                text={title} 
                level={1} 
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              />
              
              {subtitle && (
                <p className="text-sm lg:text-base text-muted-foreground font-medium">
                  {subtitle}
                </p>
              )}
              
              {description && (
                <p className="text-sm lg:text-base text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 w-full sm:w-auto lg:w-auto">
              {actions.map((action, index) => {
                const ButtonComponent = (
                  <Button 
                    key={index}
                    variant={action.variant || 'default'} 
                    size="sm" 
                    className={cn(
                      action.variant === 'default' && "bg-primary hover:bg-primary/90"
                    )}
                    onClick={action.onClick}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
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
      </div>
    </div>
  )
}
