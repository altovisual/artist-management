'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/styles/calendar.css' // Your custom calendar styles

import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { EventModal } from '@/components/event-modal'
import { CalendarToolbar } from '@/components/calendar-toolbar' // Import the custom toolbar
import { CalendarSkeleton } from './calendar-skeleton' // Import the skeleton

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Event {
  id?: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: any
}

export default function CalendarPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [initialSlot, setInitialSlot] = useState<Date | null>(null)

  // State for calendar view and date
  const [currentView, setCurrentView] = useState<Views>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('events').select('*')

    if (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } else {
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        allDay: event.all_day,
        resource: { description: event.description, category: event.category, artist_id: event.artist_id },
      }))
      setEvents(formattedEvents)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setSelectedEvent(null)
    setInitialSlot(start)
    setIsModalOpen(true)
  }, [])

  const handleSelectEvent = useCallback((event: Event) => {
    setInitialSlot(null)
    setSelectedEvent(event)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setInitialSlot(null)
  }

  const handleModalSave = () => {
    fetchEvents() // Refetch events to show the new/updated one
    handleModalClose()
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">View and manage all artist-related events.</p>
            </div>
            <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => {
              setSelectedEvent(null)
              setInitialSlot(new Date())
              setIsModalOpen(true)
            }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Event
            </Button>
        </div>
        <div className="flex-grow h-[75vh]">
            {loading ? (
                <CalendarSkeleton /> // Use the skeleton component
            ) : (
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    components={{
                      toolbar: CalendarToolbar,
                    }}
                />
            )}
        </div>
      </div>
      <EventModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        event={selectedEvent}
        initialDate={initialSlot}
      />
    </DashboardLayout>
  )
}