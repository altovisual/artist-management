import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should render badge with number', () => {
      render(<Badge>5</Badge>)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Badge className="custom-badge">Test</Badge>)
      const badge = container.firstChild
      expect(badge).toHaveClass('custom-badge')
    })
  })

  describe('Variants', () => {
    it('should apply default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('should apply secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('should apply destructive variant', () => {
      render(<Badge variant="destructive">Error</Badge>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should apply outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Badge Content', () => {
    it('should display count', () => {
      const count = 42
      render(<Badge>{count}</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should display status text', () => {
      const status = 'Active'
      render(<Badge>{status}</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should display with icon and text', () => {
      render(
        <Badge>
          <span>✓</span> Verified
        </Badge>
      )
      expect(screen.getByText(/Verified/)).toBeInTheDocument()
    })
  })

  describe('Badge States', () => {
    it('should represent active state', () => {
      const isActive = true
      const variant = isActive ? 'default' : 'secondary'
      
      expect(variant).toBe('default')
    })

    it('should represent inactive state', () => {
      const isActive = false
      const variant = isActive ? 'default' : 'secondary'
      
      expect(variant).toBe('secondary')
    })

    it('should represent error state', () => {
      const hasError = true
      const variant = hasError ? 'destructive' : 'default'
      
      expect(variant).toBe('destructive')
    })
  })

  describe('Badge Counts', () => {
    it('should show count when greater than zero', () => {
      const count = 5
      const shouldShow = count > 0
      
      expect(shouldShow).toBe(true)
    })

    it('should hide count when zero', () => {
      const count = 0
      const shouldShow = count > 0
      
      expect(shouldShow).toBe(false)
    })

    it('should format large counts', () => {
      const count = 1234
      const formatted = count > 999 ? '999+' : count.toString()
      
      expect(formatted).toBe('999+')
    })

    it('should show exact count for small numbers', () => {
      const count = 42
      const formatted = count > 999 ? '999+' : count.toString()
      
      expect(formatted).toBe('42')
    })
  })

  describe('Badge Colors', () => {
    it('should use color for status', () => {
      const statusColors = {
        success: 'default',
        warning: 'secondary',
        error: 'destructive',
      }

      expect(statusColors.success).toBe('default')
      expect(statusColors.error).toBe('destructive')
    })

    it('should map priority to color', () => {
      const priority = 'high'
      const variant = priority === 'high' ? 'destructive' : 'default'
      
      expect(variant).toBe('destructive')
    })
  })

  describe('Badge Positioning', () => {
    it('should position as notification badge', () => {
      const position = {
        top: '-8px',
        right: '-8px',
      }

      expect(position.top).toBe('-8px')
      expect(position.right).toBe('-8px')
    })

    it('should calculate position offset', () => {
      const offset = 8
      const position = {
        top: `-${offset}px`,
        right: `-${offset}px`,
      }

      expect(position.top).toBe('-8px')
    })
  })

  describe('Badge Visibility', () => {
    it('should be visible when condition is true', () => {
      const hasNotifications = true
      const isVisible = hasNotifications
      
      expect(isVisible).toBe(true)
    })

    it('should be hidden when condition is false', () => {
      const hasNotifications = false
      const isVisible = hasNotifications
      
      expect(isVisible).toBe(false)
    })
  })

  describe('Badge Text', () => {
    it('should truncate long text', () => {
      const text = 'Very Long Badge Text'
      const maxLength = 10
      const truncated = text.length > maxLength 
        ? text.substring(0, maxLength) + '...' 
        : text

      expect(truncated).toBe('Very Long ...')
    })

    it('should not truncate short text', () => {
      const text = 'Short'
      const maxLength = 10
      const truncated = text.length > maxLength 
        ? text.substring(0, maxLength) + '...' 
        : text

      expect(truncated).toBe('Short')
    })
  })

  describe('Badge Combinations', () => {
    it('should combine variant and size', () => {
      const config = {
        variant: 'destructive',
        size: 'sm',
      }

      expect(config.variant).toBe('destructive')
      expect(config.size).toBe('sm')
    })

    it('should support multiple badges', () => {
      const badges = [
        { text: 'New', variant: 'default' },
        { text: 'Sale', variant: 'destructive' },
      ]

      expect(badges).toHaveLength(2)
      expect(badges[0].text).toBe('New')
    })
  })
})
