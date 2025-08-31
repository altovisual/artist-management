'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  event?: any // Full event object for editing
  initialDate?: Date | null // For creating a new event on a specific day
}

export function EventModal({ isOpen, onClose, onSave, event, initialDate }: EventModalProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [category, setCategory] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [artists, setArtists] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchArtists = async () => {
      const { data, error } = await supabase.from('artists').select('id, name').order('name', { ascending: true });
      if (error) {
        console.error("Error fetching artists:", error);
        toast({ title: "Error", description: "Could not load artists for selection.", variant: "destructive" });
      } else {
        setArtists(data || []);
      }
    };

    if (isOpen) {
      fetchArtists();
      if (event) {
        setTitle(event.title || '')
        setDescription(event.resource?.description || '')
        setCategory(event.resource?.category || '')
        setAllDay(event.allDay || false)
        setStart(event.start ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm") : '')
        setEnd(event.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '')
        setSelectedArtistId(event.resource?.artist_id || null);
      } else if (initialDate) {
        const defaultStartTime = format(initialDate, "yyyy-MM-dd'T'09:00");
        const defaultEndTime = format(initialDate, "yyyy-MM-dd'T'10:00");
        setTitle('')
        setDescription('')
        setCategory('')
        setAllDay(false)
        setStart(defaultStartTime)
        setEnd(defaultEndTime)
        setSelectedArtistId(null);
      } else {
        // Reset form for new event if no initialDate
        setTitle('')
        setDescription('')
        setCategory('')
        setAllDay(false)
        setStart('')
        setEnd('')
        setSelectedArtistId(null);
      }
    }
  }, [event, initialDate, isOpen, supabase, toast])

  const handleSave = async () => {
    if (!title || !start || !end || !selectedArtistId) {
      toast({ title: "Error", description: "Please fill in all required fields and select an artist.", variant: "destructive" })
      return
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to save events.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const eventData = {
      id: event?.id, // Pass id for upsert
      user_id: user.id,
      artist_id: selectedArtistId,
      title,
      description,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      category,
      all_day: allDay,
    }

    const { error } = await supabase.from('events').upsert(eventData)

    if (error) {
      console.error("Error saving event:", error)
      toast({ title: "Error", description: "Failed to save event.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Event saved successfully." })
      onSave() // Refetch events on the calendar page
      onClose() // Close the modal
    }
    setIsSaving(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="artist">Artist</Label>
              <Select value={selectedArtistId || ""} onValueChange={setSelectedArtistId}>
                <SelectTrigger id="artist">
                  <SelectValue placeholder="Select an artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.length > 0 ? (
                    artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">Loading artists...</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Date & Time</Label>
              <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date & Time</Label>
              <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Release">Release</SelectItem>
                      <SelectItem value="Concert">Concert</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="allDay">All Day Event</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="allDay" checked={allDay} onCheckedChange={(checked) => setAllDay(Boolean(checked))} />
                    <Label htmlFor="allDay">This event lasts all day</Label>
                </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
