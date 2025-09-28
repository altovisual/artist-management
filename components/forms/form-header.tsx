'use client'

import { Button } from '@/components/ui/button'
import { AnimatedTitle } from '@/components/animated-title'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'

interface FormHeaderProps {
  title: string
  description: string
  backHref: string
  backLabel?: string
}

export function FormHeader({ 
  title, 
  description, 
  backHref, 
  backLabel = "Back" 
}: FormHeaderProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Back Button */}
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          </Link>
          
          {/* Title Section */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            
            <div className="min-w-0 flex-1">
              <AnimatedTitle 
                text={title} 
                level={1} 
                className="text-xl sm:text-2xl font-bold tracking-tight" 
              />
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
