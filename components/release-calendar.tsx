"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "@/styles/calendar.css"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from 'next/navigation'
import { View } from 'react-big-calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarToolbar } from "./calendar-toolbar";
import { ReleaseCalendarSkeleton } from "./release-calendar-skeleton";
import { AnimatedTitle } from "./animated-title";

const localizer = momentLocalizer(moment)

/** Fila real de la tabla projects (ajusta si tu esquema difiere) */
type ProjectRow = {
  id: string | number
  name: string
  release_date: string
  type: string
  status: string
  cover_art_url?: string | null
  notes?: string | null
  music_file_url?: string | null
  artist_id: string;
}

type ReleaseEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: ProjectRow
}

interface ReleaseCalendarProps {
  initialEvents: ReleaseEvent[];
  initialArtists: any[];
  initialArtistId: string | null;
  isLoading: boolean;
}

export function ReleaseCalendar({
  initialEvents,
  initialArtists,
  initialArtistId,
  isLoading: initialLoading,
}: ReleaseCalendarProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [events, setEvents] = useState<ReleaseEvent[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<ReleaseEvent | null>(null)
  const [showEditReleaseModal, setShowEditReleaseModal] = useState(false)

  // Form
  const [newReleaseTitle, setNewReleaseTitle] = useState("")
  const [newReleaseDate, setNewReleaseDate] = useState("")
  const [newReleaseType, setNewReleaseType] = useState("")
  const [newReleaseStatus, setNewReleaseStatus] = useState("planned")
  const [newReleaseCoverArtUrl, setNewReleaseCoverArtUrl] = useState("")
  const [newReleaseNotes, setNewReleaseNotes] = useState("")
  const [newReleaseMusicFileUrl, setNewReleaseMusicFileUrl] = useState("")
  const [isSavingRelease, setIsSavingRelease] = useState(false)
  const [artists, setArtists] = useState<any[]>(initialArtists)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(initialArtistId);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    setEvents(initialEvents);
    setArtists(initialArtists);
    setSelectedArtistId(initialArtistId);
    setIsLoading(initialLoading);
  }, [initialEvents, initialArtists, initialArtistId, initialLoading]);

  useEffect(() => {
    if (selectedRelease) {
      setNewReleaseTitle(selectedRelease.resource.name || "");
      setNewReleaseDate(selectedRelease.resource.release_date || "");
      setNewReleaseType(selectedRelease.resource.type || "");
      setNewReleaseStatus(selectedRelease.resource.status || "planned");
      setNewReleaseCoverArtUrl(selectedRelease.resource.cover_art_url || "");
      setNewReleaseNotes(selectedRelease.resource.notes || "");
      setNewReleaseMusicFileUrl(selectedRelease.resource.music_file_url || "");
      setSelectedArtistId(selectedRelease.resource.artist_id || null);
    } else {
      // Reset form fields when no release is selected (e.g., modal is closed)
      setNewReleaseTitle("");
      setNewReleaseDate("");
      setNewReleaseType("");
      setNewReleaseStatus("planned");
      setNewReleaseCoverArtUrl("");
      setNewReleaseNotes("");
      setNewReleaseMusicFileUrl("");
      // Keep selectedArtistId as is, or reset if needed based on UX
      // setSelectedArtistId(null);
    }
  }, [selectedRelease]);

  const handleAddRelease = async () => {
    setIsSavingRelease(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add releases.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }
    if (!selectedArtistId) {
      toast({ title: "Error", description: "Please select an artist for the release.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }
    const { data, error } = await supabase
      .from("projects")
      .insert({ artist_id: selectedArtistId, name: newReleaseTitle, release_date: newReleaseDate, type: newReleaseType, status: newReleaseStatus, cover_art_url: newReleaseCoverArtUrl, notes: newReleaseNotes, music_file_url: newReleaseMusicFileUrl })
      .select()
    if (error || !data) {
      console.error("Error adding release:", JSON.stringify(error, null, 2))
      toast({ title: "Error adding release", description: error?.message || "An unknown error occurred.", variant: "destructive" })
    } else {
      const row = data[0] as ProjectRow
      toast({ title: "Success", description: "Release added successfully." })
      const newEvent: ReleaseEvent = { id: String(row.id), title: row.name, start: new Date(row.release_date), end: new Date(row.release_date), allDay: true, resource: row }
      setEvents((prev) => [...prev, newEvent])
      setShowAddReleaseModal(false)
    }
    setIsSavingRelease(false)
  }

  const handleUpdateRelease = async () => {
    console.log("handleUpdateRelease function called!"); // ADD THIS LINE
    if (!selectedRelease) return
    setIsSavingRelease(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update releases.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }
    if (!selectedArtistId) {
      toast({ title: "Error", description: "Please select an artist for the release.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }
    const realId = selectedRelease.resource.id
    const updateData = {
      artist_id: selectedArtistId,
      name: newReleaseTitle,
      release_date: newReleaseDate,
      type: newReleaseType,
      status: newReleaseStatus,
      cover_art_url: newReleaseCoverArtUrl,
      notes: newReleaseNotes,
      music_file_url: newReleaseMusicFileUrl
    };
    console.log("Attempting to update release with ID:", realId);
    console.log("Data being sent for update:", updateData);

    const { error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", realId)
    if (error) {
      console.error("Supabase error updating release:", JSON.stringify(error, null, 2))
      toast({ title: "Error", description: "Could not update release.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Release updated successfully." })
      setEvents((prev) =>
        prev.map((event) =>
          event.resource.id === realId
            ? { ...event, title: newReleaseTitle, start: new Date(newReleaseDate), end: new Date(newReleaseDate), resource: { ...event.resource, artist_id: selectedArtistId, name: newReleaseTitle, release_date: newReleaseDate, type: newReleaseType, status: newReleaseStatus, cover_art_url: newReleaseCoverArtUrl, notes: newReleaseNotes, music_file_url: newReleaseMusicFileUrl } }
            : event
        )
      )
      setShowEditReleaseModal(false)
      setSelectedRelease(null)
    }
    setIsSavingRelease(false)
  }

  const handleDeleteRelease = async () => {
    if (!selectedRelease || !confirm("Are you sure you want to delete this release?")) return
    setIsSavingRelease(true)
    const realId = selectedRelease.resource.id
    const { error } = await supabase.from("projects").delete().eq("id", realId)
    if (error) {
      console.error("Error deleting release:", error)
      toast({ title: "Error", description: "Could not delete release.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Release deleted successfully." })
      setEvents((prev) => prev.filter((e) => e.resource.id !== realId))
      setShowEditReleaseModal(false)
      setSelectedRelease(null)
    }
    setIsSavingRelease(false)
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-grow text-center sm:text-left">
                    <AnimatedTitle text="Release Calendar" level={1} className="text-2xl font-bold tracking-tight" />
                    <p className="text-muted-foreground">View and manage all upcoming music releases.</p>
                </div>
                <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => {
                  setSelectedRelease(null); // Clear any selected release
                  setShowAddReleaseModal(true);
                  setNewReleaseTitle("");
                  setNewReleaseDate("");
                  setNewReleaseType("");
                  setNewReleaseStatus("planned");
                  setNewReleaseCoverArtUrl("");
                  setNewReleaseNotes("");
                  setNewReleaseMusicFileUrl("");
                  if (initialArtistId) {
                    setSelectedArtistId(initialArtistId);
                  } else if (artists.length > 0) {
                    setSelectedArtistId(artists[0].id);
                  } else {
                    setSelectedArtistId(null);
                  }
                }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Release
                </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <ReleaseCalendarSkeleton />
          ) : (
            <div className="h-[600px] overflow-y-auto"> {/* Fixed height and scrollable */}
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay lanzamientos en este rango.",
                  showMore: (total) => `+ Ver más (${total})`,
                }}
                onSelectEvent={(event) => {
                  setSelectedRelease(event as ReleaseEvent)
                  setShowEditReleaseModal(true)
                }}
                view={currentView}
                onView={(view) => {
                  setCurrentView(view)
                }}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                components={{
                  toolbar: CalendarToolbar,
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Añadir */}
      <Dialog open={showAddReleaseModal} onOpenChange={setShowAddReleaseModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Release</DialogTitle>
            <DialogDescription>Enter the details for the new music release.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="artist">Artist</Label>
                
                {artists && artists.length > 0 ? (
                  <select
                    id="artist" // or editArtist
                    value={selectedArtistId || ""}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes for basic styling
                  >
                    <option value="">Select an artist</option>
                    {artists.filter(artist => typeof artist === 'object' && artist !== null && 'id' in artist && artist.id !== undefined && artist.id !== null).map((artist) => (
                      artist && artist.id ? (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ) : null
                    ))}
                  </select>
                ) : (
                  <Input value="Loading artists..." disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newReleaseTitle} onChange={(e) => setNewReleaseTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Release Date</Label>
                <Input id="date" type="date" value={newReleaseDate} onChange={(e) => setNewReleaseDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Release Type</Label>
                <Select value={newReleaseType} onValueChange={setNewReleaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newReleaseStatus} onValueChange={setNewReleaseStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverArtUrl">Cover Art URL</Label>
                <Input id="coverArtUrl" type="url" value={newReleaseCoverArtUrl} onChange={(e) => setNewReleaseCoverArtUrl(e.target.value)} placeholder="https://example.com/cover.jpg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="musicFileUrl">Music File URL</Label>
                <Input id="musicFileUrl" type="url" value={newReleaseMusicFileUrl} onChange={(e) => setNewReleaseMusicFileUrl(e.target.value)} placeholder="https://example.com/music.mp3" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={newReleaseNotes} onChange={(e) => setNewReleaseNotes(e.target.value)} placeholder="Additional notes about the release..." className="min-h-[100px]" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddReleaseModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleAddRelease} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Saving..." : "Save Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Editar */}
      <Dialog open={showEditReleaseModal} onOpenChange={setShowEditReleaseModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Release</DialogTitle>
            <DialogDescription>Modify the details of the music release.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editArtist">Artist</Label>
                
                {artists && artists.length > 0 ? (
                  <Select value={selectedArtistId || ""} onValueChange={setSelectedArtistId}>
                    <SelectTrigger id="editArtist">
                      <SelectValue placeholder="Select an artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.filter(artist => typeof artist === 'object' && artist !== null && 'id' in artist && artist.id !== undefined && artist.id !== null).map((artist) => (
                        artist && artist.id ? ( // ADDED EXPLICIT CHECK
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ) : null // Render nothing if artist or artist.id is invalid
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value="Loading artists..." disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input id="editTitle" value={newReleaseTitle} onChange={(e) => setNewReleaseTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDate">Release Date</Label>
                <Input id="editDate" type="date" value={newReleaseDate} onChange={(e) => setNewReleaseDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Release Type</Label>
                <Select value={newReleaseType} onValueChange={setNewReleaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={newReleaseStatus} onValueChange={setNewReleaseStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCoverArtUrl">Cover Art URL</Label>
                <Input id="editCoverArtUrl" type="url" value={newReleaseCoverArtUrl} onChange={(e) => setNewReleaseCoverArtUrl(e.target.value)} placeholder="https://example.com/cover.jpg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMusicFileUrl">Music File URL</Label>
                <Input id="editMusicFileUrl" type="url" value={newReleaseMusicFileUrl} onChange={(e) => setNewReleaseMusicFileUrl(e.target.value)} placeholder="https://example.com/music.mp3" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea id="editNotes" value={newReleaseNotes} onChange={(e) => setNewReleaseNotes(e.target.value)} placeholder="Additional notes about the release..." className="min-h-[100px]" />
              </div>

              {selectedRelease?.resource?.music_file_url && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Music Player</Label>
                  <audio controls src={selectedRelease.resource.music_file_url || undefined} className="w-full" />
                  <Button asChild variant="outline" className="w-full">
                    <a href={selectedRelease.resource.music_file_url} download>Download Music</a>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditReleaseModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRelease} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={() => { console.log("Save Changes button clicked!"); handleUpdateRelease(); }} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}