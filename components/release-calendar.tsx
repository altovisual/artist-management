'use client'

import React, { useState, useEffect, useMemo } from "react"
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
import { v4 as uuidv4 } from 'uuid';

const localizer = momentLocalizer(moment)

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
  producers?: string[] | null;
  composers?: string[] | null;
  credits?: string | null;
  lyrics?: string | null;
  splits?: any | null;
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

// Helper Component for Form Fields
const ReleaseFormFields = ({ form, setForm, artists, coverArtFile, setCoverArtFile, musicFile, setMusicFile }: any) => (
  <>
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="artist">Artist</Label>
      <select
        id="artist"
        value={form.selectedArtistId || ""}
        onChange={(e) => setForm({ ...form, selectedArtistId: e.target.value })}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select an artist</option>
        {artists.filter((artist: any) => typeof artist === 'object' && artist !== null && 'id' in artist && artist.id !== undefined && artist.id !== null).map((artist: any) => (
          artist && artist.id ? (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ) : null
        ))}
      </select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input id="title" value={form.newReleaseTitle} onChange={(e) => setForm({ ...form, newReleaseTitle: e.target.value })} required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="date">Release Date</Label>
      <Input id="date" type="date" value={form.newReleaseDate} onChange={(e) => setForm({ ...form, newReleaseDate: e.target.value })} required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="type">Release Type</Label>
      <Select value={form.newReleaseType} onValueChange={(value) => setForm({ ...form, newReleaseType: value }) }>
        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single</SelectItem>
          <SelectItem value="ep">EP</SelectItem>
          <SelectItem value="album">Album</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select value={form.newReleaseStatus} onValueChange={(value) => setForm({ ...form, newReleaseStatus: value }) }>
        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="released">Released</SelectItem>
          <SelectItem value="postponed">Postponed</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="coverArtUrl">Cover Art URL</Label>
      <Input id="coverArtUrl" type="url" value={form.newReleaseCoverArtUrl} onChange={(e) => setForm({ ...form, newReleaseCoverArtUrl: e.target.value })} placeholder="https://example.com/cover.jpg" disabled={!!coverArtFile} />
      <Label htmlFor="coverArtFile" className="text-sm text-muted-foreground">Or Upload File</Label>
      <Input id="coverArtFile" type="file" accept="image/*" onChange={(e) => setCoverArtFile(e.target.files ? e.target.files[0] : null)} disabled={!!form.newReleaseCoverArtUrl} />
    </div>
    <div className="space-y-2">
      <Label htmlFor="musicFileUrl">Music File URL</Label>
      <Input id="musicFileUrl" type="url" value={form.newReleaseMusicFileUrl} onChange={(e) => setForm({ ...form, newReleaseMusicFileUrl: e.target.value })} placeholder="https://example.com/music.mp3" disabled={!!musicFile} />
      <Label htmlFor="musicFile" className="text-sm text-muted-foreground">Or Upload File</Label>
      <Input id="musicFile" type="file" accept="audio/*" onChange={(e) => setMusicFile(e.target.files ? e.target.files[0] : null)} disabled={!!form.newReleaseMusicFileUrl} />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea id="notes" value={form.newReleaseNotes} onChange={(e) => setForm({ ...form, newReleaseNotes: e.target.value })} placeholder="Additional notes about the release..." className="min-h-[100px]" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="producers">Producers</Label>
      <Input id="producers" value={form.producers} onChange={(e) => setForm({ ...form, producers: e.target.value })} placeholder="Producer 1, Producer 2..." />
    </div>
    <div className="space-y-2">
      <Label htmlFor="composers">Composers</Label>
      <Input id="composers" value={form.composers} onChange={(e) => setForm({ ...form, composers: e.target.value })} placeholder="Composer 1, Composer 2..." />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="credits">Credits</Label>
      <Textarea id="credits" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="Full credits text..." />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="lyrics">Lyrics</Label>
      <Textarea id="lyrics" value={form.lyrics} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} placeholder="Song lyrics..." className="min-h-[150px]" />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="splits">Copyright Splits (JSON)</Label>
      <Textarea id="splits" value={form.splits} onChange={(e) => setForm({ ...form, splits: e.target.value })} placeholder='[{"name": "Writer A", "percentage": 50}, {"name": "Producer B", "percentage": 50}]' className="min-h-[150px] font-mono" />
    </div>
  </>
);

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

  const initialFormState = useMemo(() => ({
    newReleaseTitle: "",
    newReleaseDate: "",
    newReleaseType: "",
    newReleaseStatus: "planned",
    newReleaseCoverArtUrl: "",
    newReleaseMusicFileUrl: "",
    newReleaseNotes: "",
    producers: "",
    composers: "",
    credits: "",
    lyrics: "",
    splits: "",
    selectedArtistId: initialArtistId,
  }), [initialArtistId]);

  const [form, setForm] = useState(initialFormState);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isSavingRelease, setIsSavingRelease] = useState(false)
  const [artists, setArtists] = useState<any[]>(initialArtists)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    setEvents(initialEvents);
    setArtists(initialArtists);
    setForm(f => ({ ...f, selectedArtistId: initialArtistId }));
    setIsLoading(initialLoading);
  }, [initialEvents, initialArtists, initialArtistId, initialLoading]);

  useEffect(() => {
    if (selectedRelease) {
      const r = selectedRelease.resource;
      setForm({
        newReleaseTitle: r.name || "",
        newReleaseDate: r.release_date || "",
        newReleaseType: r.type || "",
        newReleaseStatus: r.status || "planned",
        newReleaseCoverArtUrl: r.cover_art_url || "",
        newReleaseMusicFileUrl: r.music_file_url || "",
        selectedArtistId: r.artist_id || null,
        newReleaseNotes: r.notes || "",
        producers: r.producers?.join(', ') || '',
        composers: r.composers?.join(', ') || '',
        credits: r.credits || '',
        lyrics: r.lyrics || '',
        splits: r.splits ? JSON.stringify(r.splits, null, 2) : '',
      });
      setCoverArtFile(null);
      setMusicFile(null);
    } else {
      setForm(initialFormState);
    }
  }, [selectedRelease, initialFormState]);

  const handleFileUpload = async (file: File, artistId: string, projectId: string, assetType: string, assetCategory: string) => {
    if (!file) return null;

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${artistId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('creative-vault-assets').upload(filePath, file);
    if (uploadError) {
      toast({ title: "File Upload Error", description: `Could not upload ${file.name}.`, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage.from('creative-vault-assets').getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase.from('assets').insert({
      artist_id: artistId,
      project_id: projectId,
      name: file.name,
      type: assetType,
      category: assetCategory,
      file_url: publicUrl,
      file_size: file.size,
      format: file.type,
    });

    if (dbError) {
      toast({ title: "Asset Creation Error", description: "File uploaded, but could not create asset record in database.", variant: "destructive" });
      return null;
    }

    return publicUrl;
  };

  const handleAddRelease = async () => {
    setIsSavingRelease(true);
    if (!form.selectedArtistId) {
      toast({ title: "Error", description: "Please select an artist.", variant: "destructive" });
      setIsSavingRelease(false);
      return;
    }

    let splitsJson = null;
    if (form.splits) {
      try {
        splitsJson = JSON.parse(form.splits);
      } catch (e) {
        toast({ title: "Invalid Splits JSON", variant: "destructive" });
        setIsSavingRelease(false);
        return;
      }
    }

    // 1. Insert provisional project data
    const provisionalProject = {
      artist_id: form.selectedArtistId,
      name: form.newReleaseTitle,
      release_date: form.newReleaseDate,
      type: form.newReleaseType,
      status: form.newReleaseStatus,
      notes: form.newReleaseNotes,
      producers: form.producers.split(',').map(s => s.trim()).filter(Boolean),
      composers: form.composers.split(',').map(s => s.trim()).filter(Boolean),
      credits: form.credits,
      lyrics: form.lyrics,
      splits: splitsJson,
    };

    const { data: newProjectData, error: insertError } = await supabase
      .from('projects')
      .insert(provisionalProject)
      .select()
      .single();

    if (insertError || !newProjectData) {
      toast({ title: "Error creating release", description: insertError?.message || "An unknown error occurred.", variant: "destructive" });
      setIsSavingRelease(false);
      return;
    }

    const projectId = newProjectData.id;
    let coverArtUrl = form.newReleaseCoverArtUrl;
    let musicFileUrl = form.newReleaseMusicFileUrl;
    let updateRequired = false;

    // 2. Handle file uploads and asset creation
    if (coverArtFile) {
      const uploadedUrl = await handleFileUpload(coverArtFile, form.selectedArtistId, projectId, 'cover_art', 'musical_releases');
      if (uploadedUrl) {
        coverArtUrl = uploadedUrl;
        updateRequired = true;
      }
    }
    if (musicFile) {
      const uploadedUrl = await handleFileUpload(musicFile, form.selectedArtistId, projectId, 'music_file', 'musical_releases');
      if (uploadedUrl) {
        musicFileUrl = uploadedUrl;
        updateRequired = true;
      }
    }

    // 3. Update project with file URLs if needed
    let finalProjectData = { ...newProjectData, cover_art_url: coverArtUrl, music_file_url: musicFileUrl };

    if (updateRequired) {
      const { data: updatedData, error: updateError } = await supabase
        .from('projects')
        .update({ cover_art_url: coverArtUrl, music_file_url: musicFileUrl })
        .eq('id', projectId)
        .select()
        .single();
      
      if (updateError) {
        toast({ title: "Error updating release with file URLs", description: updateError.message, variant: "destructive" });
        // Decide if we should rollback or notify user
      } else {
        finalProjectData = updatedData;
      }
    }

    toast({ title: "Success", description: "Release added successfully." });
    const newEvent: ReleaseEvent = { id: String(finalProjectData.id), title: finalProjectData.name, start: new Date(finalProjectData.release_date), end: new Date(finalProjectData.release_date), allDay: true, resource: finalProjectData as ProjectRow };
    setEvents((prev) => [...prev, newEvent]);
    setShowAddReleaseModal(false);
    setIsSavingRelease(false);
  }

  const handleUpdateRelease = async () => {
    if (!selectedRelease || !form.selectedArtistId) return;
    setIsSavingRelease(true);

    let splitsJson = null;
    if (form.splits) {
      try {
        splitsJson = JSON.parse(form.splits);
      } catch (e) {
        toast({ title: "Invalid Splits JSON", variant: "destructive" });
        setIsSavingRelease(false);
        return;
      }
    }

    const projectId = selectedRelease.resource.id as string;
    let coverArtUrl = form.newReleaseCoverArtUrl;
    let musicFileUrl = form.newReleaseMusicFileUrl;

    if (coverArtFile) {
      const uploadedUrl = await handleFileUpload(coverArtFile, form.selectedArtistId, projectId, 'cover_art', 'musical_releases');
      if (uploadedUrl) coverArtUrl = uploadedUrl;
    }
    if (musicFile) {
      const uploadedUrl = await handleFileUpload(musicFile, form.selectedArtistId, projectId, 'music_file', 'musical_releases');
      if (uploadedUrl) musicFileUrl = uploadedUrl;
    }

    const updateData = {
      artist_id: form.selectedArtistId,
      name: form.newReleaseTitle,
      release_date: form.newReleaseDate,
      type: form.newReleaseType,
      status: form.newReleaseStatus,
      notes: form.newReleaseNotes,
      producers: form.producers.split(',').map(s => s.trim()).filter(Boolean),
      composers: form.composers.split(',').map(s => s.trim()).filter(Boolean),
      credits: form.credits,
      lyrics: form.lyrics,
      splits: splitsJson,
      cover_art_url: coverArtUrl,
      music_file_url: musicFileUrl,
    };

    const { data: updatedData, error } = await supabase.from("projects").update(updateData).eq("id", projectId).select().single();

    if (error) {
      toast({ title: "Error updating release", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Release updated successfully." });
      setEvents((prev) =>
        prev.map((event) =>
          event.resource.id === projectId
            ? { ...event, title: updatedData.name, start: new Date(updatedData.release_date), end: new Date(updatedData.release_date), resource: updatedData as ProjectRow }
            : event
        )
      );
      setShowEditReleaseModal(false);
      setSelectedRelease(null);
    }
    setIsSavingRelease(false);
  }

  const handleDeleteRelease = async () => {
    if (!selectedRelease) return;
    if (!confirm("Are you sure you want to delete this release?")) return;

    setIsSavingRelease(true);
    const realId = selectedRelease.resource.id;
    const { error } = await supabase.from("projects").delete().eq("id", realId);
    if (error) {
      toast({ title: "Error", description: "Could not delete release.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Release deleted successfully." });
      setEvents((prev) => prev.filter((e) => e.resource.id !== realId));
      setShowEditReleaseModal(false);
      setSelectedRelease(null);
    }
    setIsSavingRelease(false);
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
                  setSelectedRelease(null);
                  setForm(initialFormState);
                  setCoverArtFile(null);
                  setMusicFile(null);
                  setShowAddReleaseModal(true);
                  if (initialArtistId) {
                    setForm(f => ({ ...f, selectedArtistId: initialArtistId }));
                  } else if (artists.length > 0) {
                    setForm(f => ({ ...f, selectedArtistId: artists[0].id }));
                  } else {
                    setForm(f => ({ ...f, selectedArtistId: null }));
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
            <div className="h-[600px] overflow-y-auto">
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
                  setSelectedRelease(event as ReleaseEvent);
                  setShowEditReleaseModal(true);
                }}
                view={currentView}
                onView={(view) => setCurrentView(view)}
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
              <ReleaseFormFields form={form} setForm={setForm} artists={artists} coverArtFile={coverArtFile} setCoverArtFile={setCoverArtFile} musicFile={musicFile} setMusicFile={setMusicFile} />
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddReleaseModal(false)}>Cancel</Button>
            <Button onClick={handleAddRelease} disabled={isSavingRelease}>
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
              <ReleaseFormFields form={form} setForm={setForm} artists={artists} coverArtFile={coverArtFile} setCoverArtFile={setCoverArtFile} musicFile={musicFile} setMusicFile={setMusicFile} />
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
            <Button variant="outline" onClick={() => setShowEditReleaseModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRelease} disabled={isSavingRelease}>
              {isSavingRelease ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={handleUpdateRelease} disabled={isSavingRelease}>
              {isSavingRelease ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}