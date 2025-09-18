'use client'

import * as React from "react"
import { format } from "date-fns"

interface DatePickerFieldProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePickerField({ date, onDateChange }: DatePickerFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const [year, month, day] = dateValue.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    } else {
      onDateChange(undefined);
    }
  };

  return (
    <input
      type="date"
      value={date ? format(date, 'yyyy-MM-dd') : ''}
      onChange={handleChange}
      className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
    />
  );
}