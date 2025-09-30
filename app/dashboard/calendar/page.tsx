'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/styles/calendar.css' // Your custom calendar styles

import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { PlusCircle, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'
import { EventModal } from '@/components/event-modal'
import { CalendarToolbar } from '@/components/calendar-toolbar' // Import the custom toolbar
import { CalendarSkeleton } from './calendar-skeleton' // Import the skeleton
import { PageHeader } from '@/components/ui/design-system/page-header'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'

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
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate stats from events
  const getEventStats = () => {
    const today = new Date()
    const thisMonth = events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
    })
    
    const upcoming = events.filter(event => new Date(event.start) > today)
    const categories = [...new Set(events.map(event => event.resource?.category).filter(Boolean))]
    
    return {
      total: events.length,
      thisMonth: thisMonth.length,
      upcoming: upcoming.length,
      categories: categories.length
    }
  }

  const stats = getEventStats()

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

  const statsData = [
    {
      title: 'Total Events',
      value: stats.total.toString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: CalendarIcon,
      description: 'All scheduled events'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      change: '+3',
      trend: 'up' as const,
      icon: Clock,
      description: 'Events this month'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming.toString(),
      change: '+5',
      trend: 'up' as const,
      icon: Users,
      description: 'Future events'
    },
    {
      title: 'Categories',
      value: stats.categories.toString(),
      change: 'stable',
      trend: 'stable' as const,
      icon: CalendarIcon,
      description: 'Event categories'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Event Calendar"
          description="View and manage all artist-related events"
          badge={{
            text: `${stats.total} Events`,
            variant: 'secondary' as const
          }}
          actions={[
            {
              label: 'Add Event',
              onClick: () => {
                setSelectedEvent(null)
                setInitialSlot(new Date())
                setIsModalOpen(true)
              },
              variant: 'default',
              icon: PlusCircle
            }
          ]}
        />

        {/* Stats Grid */}
        <StatsGrid stats={statsData} columns={4} />

        {/* Calendar Section */}
        <ContentSection
          title="Event Calendar"
          description="Interactive calendar view of all events"
          icon={CalendarIcon}
        >
          <div className="h-[75vh] bg-card rounded-lg border p-4">
            {loading ? (
              <CalendarSkeleton />
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
        </ContentSection>
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