import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils - cn() function', () => {
  describe('Basic Functionality', () => {
    it('should merge single class', () => {
      const result = cn('text-red-500')
      expect(result).toBe('text-red-500')
    })

    it('should merge multiple classes', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null', () => {
      const result = cn(undefined, null, 'text-red-500')
      expect(result).toBe('text-red-500')
    })
  })

  describe('Conditional Classes', () => {
    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn(
        'base-class',
        isActive && 'active-class'
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should exclude false conditionals', () => {
      const isActive = false
      const result = cn(
        'base-class',
        isActive && 'active-class'
      )
      expect(result).toBe('base-class')
      expect(result).not.toContain('active-class')
    })

    it('should handle ternary operators', () => {
      const variant = 'primary'
      const result = cn(
        'button',
        variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
      )
      expect(result).toContain('bg-blue-500')
    })
  })

  describe('Tailwind Merge', () => {
    it('should merge conflicting Tailwind classes', () => {
      const result = cn('p-4', 'p-8')
      // twMerge should keep only the last padding class
      expect(result).toBe('p-8')
    })

    it('should handle responsive classes', () => {
      const result = cn('text-sm', 'md:text-lg', 'lg:text-xl')
      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-lg')
      expect(result).toContain('lg:text-xl')
    })

    it('should merge hover states', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500')
      expect(result).toBe('hover:bg-red-500')
    })
  })

  describe('Array Input', () => {
    it('should handle array of classes', () => {
      const classes = ['text-red-500', 'bg-blue-500']
      const result = cn(classes)
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle nested arrays', () => {
      const result = cn(['text-red-500', ['bg-blue-500', 'p-4']])
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('p-4')
    })
  })

  describe('Object Input', () => {
    it('should handle object with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'p-4': true
      })
      expect(result).toContain('text-red-500')
      expect(result).not.toContain('bg-blue-500')
      expect(result).toContain('p-4')
    })

    it('should combine objects and strings', () => {
      const result = cn(
        'base-class',
        {
          'active': true,
          'disabled': false
        }
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active')
      expect(result).not.toContain('disabled')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle component variant pattern', () => {
      type Variant = 'primary' | 'secondary'
      type Size = 'sm' | 'lg'
      
      const variant: Variant = 'primary' as Variant
      const size: Size = 'lg' as Size
      const disabled = false

      const result = cn(
        'button',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-black',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg',
        disabled && 'opacity-50 cursor-not-allowed'
      )

      expect(result).toContain('button')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('px-6')
      expect(result).not.toContain('opacity-50')
    })

    it('should handle dark mode classes', () => {
      const result = cn(
        'bg-white text-black',
        'dark:bg-black dark:text-white'
      )
      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-black')
    })

    it('should merge spacing classes correctly', () => {
      const result = cn('m-4', 'mx-8', 'mt-2')
      // Should keep mx-8 and mt-2, remove m-4
      expect(result).toContain('mx-8')
      expect(result).toContain('mt-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace', () => {
      const result = cn('  text-red-500  ', '  bg-blue-500  ')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle empty strings', () => {
      const result = cn('', 'text-red-500', '')
      expect(result).toBe('text-red-500')
    })

    it('should handle duplicate classes', () => {
      const result = cn('text-red-500', 'text-red-500')
      expect(result).toBe('text-red-500')
    })
  })
})
