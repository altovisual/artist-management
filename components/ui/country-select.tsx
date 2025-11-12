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
  // North America
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  
  // Central America & Caribbean
  { value: 'cr', label: 'Costa Rica' },
  { value: 'cu', label: 'Cuba' },
  { value: 'do', label: 'Dominican Republic' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'hn', label: 'Honduras' },
  { value: 'jm', label: 'Jamaica' },
  { value: 'ni', label: 'Nicaragua' },
  { value: 'pa', label: 'Panama' },
  { value: 'pr', label: 'Puerto Rico' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'tt', label: 'Trinidad and Tobago' },
  
  // South America
  { value: 'ar', label: 'Argentina' },
  { value: 'bo', label: 'Bolivia' },
  { value: 'br', label: 'Brazil' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'ec', label: 'Ecuador' },
  { value: 'gy', label: 'Guyana' },
  { value: 'py', label: 'Paraguay' },
  { value: 'pe', label: 'Peru' },
  { value: 'sr', label: 'Suriname' },
  { value: 'uy', label: 'Uruguay' },
  { value: 've', label: 'Venezuela' },
  
  // Europe
  { value: 'at', label: 'Austria' },
  { value: 'be', label: 'Belgium' },
  { value: 'bg', label: 'Bulgaria' },
  { value: 'hr', label: 'Croatia' },
  { value: 'cy', label: 'Cyprus' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'dk', label: 'Denmark' },
  { value: 'ee', label: 'Estonia' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'gr', label: 'Greece' },
  { value: 'hu', label: 'Hungary' },
  { value: 'is', label: 'Iceland' },
  { value: 'ie', label: 'Ireland' },
  { value: 'it', label: 'Italy' },
  { value: 'lv', label: 'Latvia' },
  { value: 'lt', label: 'Lithuania' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mt', label: 'Malta' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'no', label: 'Norway' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'ro', label: 'Romania' },
  { value: 'ru', label: 'Russia' },
  { value: 'rs', label: 'Serbia' },
  { value: 'sk', label: 'Slovakia' },
  { value: 'si', label: 'Slovenia' },
  { value: 'es', label: 'Spain' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'tr', label: 'Turkey' },
  { value: 'ua', label: 'Ukraine' },
  { value: 'gb', label: 'United Kingdom' },
  
  // Asia
  { value: 'cn', label: 'China' },
  { value: 'hk', label: 'Hong Kong' },
  { value: 'in', label: 'India' },
  { value: 'id', label: 'Indonesia' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'my', label: 'Malaysia' },
  { value: 'ph', label: 'Philippines' },
  { value: 'sg', label: 'Singapore' },
  { value: 'tw', label: 'Taiwan' },
  { value: 'th', label: 'Thailand' },
  { value: 'vn', label: 'Vietnam' },
  
  // Middle East
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'il', label: 'Israel' },
  { value: 'jo', label: 'Jordan' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'lb', label: 'Lebanon' },
  { value: 'om', label: 'Oman' },
  { value: 'qa', label: 'Qatar' },
  { value: 'sa', label: 'Saudi Arabia' },
  
  // Africa
  { value: 'dz', label: 'Algeria' },
  { value: 'eg', label: 'Egypt' },
  { value: 'gh', label: 'Ghana' },
  { value: 'ke', label: 'Kenya' },
  { value: 'ma', label: 'Morocco' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'za', label: 'South Africa' },
  { value: 'tz', label: 'Tanzania' },
  { value: 'ug', label: 'Uganda' },
  
  // Oceania
  { value: 'au', label: 'Australia' },
  { value: 'fj', label: 'Fiji' },
  { value: 'nz', label: 'New Zealand' },
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
