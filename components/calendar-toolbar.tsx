"use client"

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { View } from 'react-big-calendar'; // Import View type

interface CalendarToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  view: View; // current view, now using View type
  onView: (view: View) => void; // function to change view, now using View type
}

export function CalendarToolbar({ label, onNavigate, view, onView }: CalendarToolbarProps) {
  return (
    <div className="rbc-toolbar flex items-center justify-between p-2 sm:p-4 bg-card rounded-t-lg">
      <span className="rbc-btn-group flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </span>

      <span className="rbc-toolbar-label text-lg font-semibold text-center flex-grow mx-2 text-foreground min-w-0 truncate">
        {label}
      </span>

      {/* View buttons - hidden on mobile, visible on larger screens */}
      <span className="rbc-btn-group hidden sm:flex gap-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('day')}
        >
          Day
        </Button>
        <Button
          variant={view === 'agenda' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('agenda')}
        >
          Agenda
        </Button>
      </span>
    </div>
  );
}
