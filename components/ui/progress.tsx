'use client'

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-300/20 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 shadow-lg transition-all"
        style={{ 
          backgroundColor: '#e1348f',
          transform: `translateX(-${100 - (value || 0)}%)` 
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }