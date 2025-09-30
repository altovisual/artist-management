'use client'

import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brazil' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'pe', label: 'Peru' },
  { value: 'uy', label: 'Uruguay' },
  { value: 've', label: 'Venezuela' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'it', label: 'Italy' },
  { value: 'pt', label: 'Portugal' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ie', label: 'Ireland' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'be', label: 'Belgium' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'at', label: 'Austria' },
  { value: 'se', label: 'Sweden' },
  { value: 'no', label: 'Norway' },
  { value: 'dk', label: 'Denmark' },
  { value: 'fi', label: 'Finland' },
  { value: 'pl', label: 'Poland' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'hu', label: 'Hungary' },
  { value: 'ro', label: 'Romania' },
  { value: 'gr', label: 'Greece' },
  { value: 'au', label: 'Australia' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'cn', label: 'China' },
  { value: 'in', label: 'India' },
  { value: 'sg', label: 'Singapore' },
  { value: 'my', label: 'Malaysia' },
  { value: 'th', label: 'Thailand' },
  { value: 'ph', label: 'Philippines' },
  { value: 'id', label: 'Indonesia' },
  { value: 'vn', label: 'Vietnam' },
  { value: 'za', label: 'South Africa' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'ke', label: 'Kenya' },
  { value: 'il', label: 'Israel' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'tr', label: 'Turkey' },
  { value: 'ru', label: 'Russia' },
  { value: 'ua', label: 'Ukraine' },
].sort((a, b) => a.label.localeCompare(b.label))

interface CountrySelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CountrySelect({ value, onChange, placeholder = 'Select country...', className }: CountrySelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between border-0 bg-transparent focus-visible:ring-0 px-0", className)}
        >
          {value
            ? countries.find((country) => country.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.value}
                value={country.label}
                onSelect={() => {
                  onChange(country.value === value ? '' : country.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === country.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {country.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
