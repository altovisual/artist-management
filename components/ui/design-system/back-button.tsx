'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  label?: string
  href?: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
}

export function BackButton({ 
  label = 'Back', 
  href,
  className,
  variant = 'ghost'
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn(
        'gap-2 text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
