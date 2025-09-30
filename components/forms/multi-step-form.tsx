'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
}

interface MultiStepFormProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete?: () => void
  children: React.ReactNode
  canGoNext?: boolean
  canGoPrevious?: boolean
  isLastStep?: boolean
  className?: string
  allowStepNavigation?: boolean // Permite click en los pasos para navegar
  mode?: 'create' | 'edit' // Modo del formulario
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
  className,
  allowStepNavigation = false,
  mode = 'create'
}: MultiStepFormProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete()
    } else if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Compact Progress Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Progress Bar with Step Info */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Compact Step Indicators */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-2 flex-1"
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentStep ? 1 : 0.9,
                    backgroundColor: index <= currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                    index <= currentStep ? "text-primary-foreground" : "text-muted-foreground",
                    allowStepNavigation && "cursor-pointer hover:scale-110 transition-transform"
                  )}
                  onClick={() => allowStepNavigation && onStepChange(index)}
                  whileHover={allowStepNavigation ? { scale: 1.1 } : {}}
                  whileTap={allowStepNavigation ? { scale: 0.95 } : {}}
                >
                  {index < currentStep && mode === 'create' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </motion.div>
                <span 
                  className={cn(
                    "text-xs truncate hidden sm:block",
                    index === currentStep ? "text-foreground font-medium" : "text-muted-foreground",
                    allowStepNavigation && "cursor-pointer hover:text-foreground transition-colors"
                  )}
                  onClick={() => allowStepNavigation && onStepChange(index)}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="h-px bg-border flex-1 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area with Animation */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-inset-bottom z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                "flex-1",
                currentStep === 0 && !canGoPrevious && "w-full"
              )}
            >
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {mode === 'edit' ? 'Save Changes' : 'Complete'}
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind fixed nav */}
      <div className="h-24" />
    </div>
  )
}

// iOS-style Form Field Component
export function FormFieldGroup({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm",
      className
    )}>
      {children}
    </div>
  )
}

export function FormFieldItem({
  label,
  children,
  isLast = false
}: {
  label?: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div className={cn(
      "px-4 py-3",
      !isLast && "border-b border-border/50"
    )}>
      {label && (
        <label className="text-sm text-muted-foreground mb-2 block">
          {label}
        </label>
      )}
      {children}
    </div>
  )
}
