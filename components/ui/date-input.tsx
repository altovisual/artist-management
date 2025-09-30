'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  label?: string
  className?: string
}

export function DateInput({ value, onChange, label, className }: DateInputProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  // Initialize from value
  useEffect(() => {
    if (value) {
      setDay(value.getDate().toString().padStart(2, '0'))
      setMonth((value.getMonth() + 1).toString().padStart(2, '0'))
      setYear(value.getFullYear().toString())
    }
  }, [value])

  // Update parent when values change
  useEffect(() => {
    if (day && month && year) {
      const dayNum = parseInt(day)
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
        const date = new Date(yearNum, monthNum - 1, dayNum)
        onChange(date)
      }
    } else if (!day && !month && !year) {
      onChange(undefined)
    }
  }, [day, month, year, onChange])

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2)
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
      setDay(value)
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2)
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
      setMonth(value)
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setYear(value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="DD"
            value={day}
            onChange={handleDayChange}
            maxLength={2}
            className="text-center"
          />
          <span className="text-xs text-muted-foreground mt-1 block text-center">Day</span>
        </div>
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={month}
            onChange={handleMonthChange}
            maxLength={2}
            className="text-center"
          />
          <span className="text-xs text-muted-foreground mt-1 block text-center">Month</span>
        </div>
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="YYYY"
            value={year}
            onChange={handleYearChange}
            maxLength={4}
            className="text-center"
          />
          <span className="text-xs text-muted-foreground mt-1 block text-center">Year</span>
        </div>
      </div>
    </div>
  )
}
