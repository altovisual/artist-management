"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "@/styles/calendar.css"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from 'next/navigation'
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
  artist_id: string; // Añadido
}

type ReleaseEvent = {
  id: string           // siempre string para el calendario
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: ProjectRow // guardamos el row real
}

export default function ReleasesPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const searchParams = useSearchParams();
  const initialArtistId = searchParams.get('artistId');

  const [events, setEvents] = useState<ReleaseEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState("month"); // Default view
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date
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
  const [artists, setArtists] = useState<any[]>([]) // Nuevo estado para almacenar artistas
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null); // Nuevo estado para el artista seleccionado

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      // Fetch releases
      const { data: releasesData, error: releasesError } = await supabase
        .from("projects")
        .select("*")
        .order("release_date", { ascending: true })

      if (releasesError) {
        console.error("Error fetching releases:", releasesError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los lanzamientos.",
          variant: "destructive",
        })
      } else {
        const formattedEvents: ReleaseEvent[] = (releasesData as ProjectRow[]).map((release) => ({
          id: String(release.id), // <-- SIEMPRE string para RBC
          title: release.name,
          start: new Date(release.release_date),
          end: new Date(release.release_date),
          allDay: true,
          resource: release,
        }))
        setEvents(formattedEvents)
      }

      // Fetch artists
      const { data: artistsData, error: artistsError } = await supabase
        .from("artists")
        .select("id, name")
        .order("name", { ascending: true })

      if (artistsError) {
        console.error("Error fetching artists:", artistsError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los artistas.",
          variant: "destructive",
        })
      } else {
        setArtists(artistsData || [])
        if (artistsData && artistsData.length > 0) {
          // Si hay un initialArtistId en la URL, úsalo
          if (initialArtistId) {
            setSelectedArtistId(initialArtistId);
          } else {
            setSelectedArtistId(artistsData[0].id); // Seleccionar el primer artista por defecto si no hay initialArtistId
          }
        }
      }
      setIsLoading(false)
    }

    fetchInitialData()
  }, [supabase, toast, initialArtistId])

  useEffect(() => {
    if (selectedRelease) {
      setNewReleaseTitle(selectedRelease.title)
      setNewReleaseDate(moment(selectedRelease.start).format("YYYY-MM-DD"))
      setNewReleaseType(selectedRelease.resource?.type || "")
      setNewReleaseStatus(selectedRelease.resource?.status || "planned")
      setNewReleaseCoverArtUrl(selectedRelease.resource?.cover_art_url || "")
      setNewReleaseNotes(selectedRelease.resource?.notes || "")
      setNewReleaseMusicFileUrl(selectedRelease.resource?.music_file_url || "")
      setSelectedArtistId(selectedRelease.resource?.artist_id || null); // Set selected artist for editing
    } else {
      setNewReleaseTitle("")
      setNewReleaseDate("")
      setNewReleaseType("")
      setNewReleaseStatus("planned")
      setNewReleaseCoverArtUrl("")
      setNewReleaseNotes("")
      setNewReleaseMusicFileUrl("")
      // Keep selectedArtistId as is, or reset to first artist if desired
    }
  }, [selectedRelease])

  const handleAddRelease = async () => {
    setIsSavingRelease(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para añadir lanzamientos.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }

    if (!selectedArtistId) {
      toast({ title: "Error", description: "Por favor, selecciona un artista para el lanzamiento.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        artist_id: selectedArtistId, // Usar el ID del artista seleccionado
        name: newReleaseTitle,
        release_date: newReleaseDate,
        type: newReleaseType,
        status: newReleaseStatus,
        cover_art_url: newReleaseCoverArtUrl,
        notes: newReleaseNotes,
        music_file_url: newReleaseMusicFileUrl,
      })
      .select()

    if (error || !data) {
      console.error("Error adding release:", JSON.stringify(error, null, 2))
      toast({ title: "Error", description: "No se pudo añadir el lanzamiento.", variant: "destructive" })
    } else {
      const row = data[0] as ProjectRow
      toast({ title: "Éxito", description: "Lanzamiento añadido correctamente." })

      const newEvent: ReleaseEvent = {
        id: String(row.id),
        title: row.name,
        start: new Date(row.release_date),
        end: new Date(row.release_date),
        allDay: true,
        resource: row,
      }
      setEvents((prev) => [...prev, newEvent])
      setShowAddReleaseModal(false)
    }
    setIsSavingRelease(false)
  }

  const handleUpdateRelease = async () => {
    if (!selectedRelease) return
    setIsSavingRelease(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para actualizar lanzamientos.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }

    if (!selectedArtistId) {
      toast({ title: "Error", description: "Por favor, selecciona un artista para el lanzamiento.", variant: "destructive" })
      setIsSavingRelease(false)
      return
    }

    const realId = selectedRelease.resource.id // <-- usar el id REAL del row
    const { error } = await supabase
      .from("projects")
      .update({
        artist_id: selectedArtistId, // Actualizar también el artista asociado
        name: newReleaseTitle,
        release_date: newReleaseDate,
        type: newReleaseType,
        status: newReleaseStatus,
        cover_art_url: newReleaseCoverArtUrl,
        notes: newReleaseNotes,
        music_file_url: newReleaseMusicFileUrl,
      })
      .eq("id", realId)

    if (error) {
      console.error("Error updating release:", error)
      toast({ title: "Error", description: "No se pudo actualizar el lanzamiento.", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Lanzamiento actualizado correctamente." })
      setEvents((prev) =>
        prev.map((event) =>
          event.resource.id === realId
            ? {
                ...event,
                title: newReleaseTitle,
                start: new Date(newReleaseDate),
                end: new Date(newReleaseDate),
                resource: {
                  ...event.resource,
                  artist_id: selectedArtistId, // Actualizar en el recurso también
                  name: newReleaseTitle,
                  release_date: newReleaseDate,
                  type: newReleaseType,
                  status: newReleaseStatus,
                  cover_art_url: newReleaseCoverArtUrl,
                  notes: newReleaseNotes,
                  music_file_url: newReleaseMusicFileUrl,
                },
              }
            : event
        )
      )
      setShowEditReleaseModal(false)
      setSelectedRelease(null)
    }
    setIsSavingRelease(false)
  }

  const handleDeleteRelease = async () => {
    if (!selectedRelease || !confirm("¿Estás seguro de que quieres eliminar este lanzamiento?")) return
    setIsSavingRelease(true)

    const realId = selectedRelease.resource.id // <-- usar el id REAL
    const { error } = await supabase.from("projects").delete().eq("id", realId)

    if (error) {
      console.error("Error deleting release:", error)
      toast({ title: "Error", description: "No se pudo eliminar el lanzamiento.", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Lanzamiento eliminado correctamente." })
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Calendario de Lanzamientos</h1>
                  <p className="text-muted-foreground">Gestiona los próximos lanzamientos musicales</p>
                </div>
              </div>
              <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => {
                setShowAddReleaseModal(true);
                // Resetear el formulario al abrir el modal
                setNewReleaseTitle("");
                setNewReleaseDate("");
                setNewReleaseType("");
                setNewReleaseStatus("planned");
                setNewReleaseCoverArtUrl("");
                setNewReleaseNotes("");
                setNewReleaseMusicFileUrl("");
                // Si hay un initialArtistId, preseleccionarlo
                if (initialArtistId) {
                  setSelectedArtistId(initialArtistId);
                } else if (artists.length > 0) {
                  setSelectedArtistId(artists[0].id);
                } else {
                  setSelectedArtistId(null);
                }
              }}>
                <Plus className="h-4 w-4" />
                Añadir Lanzamiento
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              <p>Cargando calendario...</p>
            </div>
          ) : (
            <div className="h-[70vh] md:h-[80vh] lg:h-[700px]">
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
                onView={(view) => setCurrentView(view)}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Añadir */}
      <Dialog open={showAddReleaseModal} onOpenChange={setShowAddReleaseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Lanzamiento</DialogTitle>
            <DialogDescription>Introduce los detalles del nuevo lanzamiento musical.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Select value={selectedArtistId || ""} onValueChange={setSelectedArtistId}>
                <SelectTrigger id="artist">
                  <SelectValue placeholder="Selecciona un artista" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={newReleaseTitle} onChange={(e) => setNewReleaseTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Lanzamiento</Label>
              <Input id="date" type="date" value={newReleaseDate} onChange={(e) => setNewReleaseDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Lanzamiento</Label>
              <Select value={newReleaseType} onValueChange={setNewReleaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Álbum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={newReleaseStatus} onValueChange={setNewReleaseStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planeado</SelectItem>
                  <SelectItem value="released">Lanzado</SelectItem>
                  <SelectItem value="postponed">Pospuesto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverArtUrl">URL de la Portada</Label>
              <Input id="coverArtUrl" type="url" value={newReleaseCoverArtUrl} onChange={(e) => setNewReleaseCoverArtUrl(e.target.value)} placeholder="https://ejemplo.com/portada.jpg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="musicFileUrl">URL del Archivo Musical</Label>
              <Input id="musicFileUrl" type="url" value={newReleaseMusicFileUrl} onChange={(e) => setNewReleaseMusicFileUrl(e.target.value)} placeholder="https://ejemplo.com/musica.mp3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" value={newReleaseNotes} onChange={(e) => setNewReleaseNotes(e.target.value)} placeholder="Notas adicionales sobre el lanzamiento..." />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddReleaseModal(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleAddRelease} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Guardando..." : "Guardar Lanzamiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Editar */}
      <Dialog open={showEditReleaseModal} onOpenChange={setShowEditReleaseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Lanzamiento</DialogTitle>
            <DialogDescription>Modifica los detalles del lanzamiento musical.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editArtist">Artista</Label>
              <Select value={selectedArtistId || ""} onValueChange={setSelectedArtistId}>
                <SelectTrigger id="editArtist">
                  <SelectValue placeholder="Selecciona un artista" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTitle">Título</Label>
              <Input id="editTitle" value={newReleaseTitle} onChange={(e) => setNewReleaseTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDate">Fecha de Lanzamiento</Label>
              <Input id="editDate" type="date" value={newReleaseDate} onChange={(e) => setNewReleaseDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editType">Tipo de Lanzamiento</Label>
              <Select value={newReleaseType} onValueChange={setNewReleaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Álbum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Estado</Label>
              <Select value={newReleaseStatus} onValueChange={setNewReleaseStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planeado</SelectItem>
                  <SelectItem value="released">Lanzado</SelectItem>
                  <SelectItem value="postponed">Pospuesto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCoverArtUrl">URL de la Portada</Label>
              <Input id="editCoverArtUrl" type="url" value={newReleaseCoverArtUrl} onChange={(e) => setNewReleaseCoverArtUrl(e.target.value)} placeholder="https://ejemplo.com/portada.jpg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMusicFileUrl">URL del Archivo Musical</Label>
              <Input id="editMusicFileUrl" type="url" value={newReleaseMusicFileUrl} onChange={(e) => setNewReleaseMusicFileUrl(e.target.value)} placeholder="https://ejemplo.com/musica.mp3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notas</Label>
              <Textarea id="editNotes" value={newReleaseNotes} onChange={(e) => setNewReleaseNotes(e.target.value)} placeholder="Notas adicionales sobre el lanzamiento..." />
            </div>

            {selectedRelease?.resource?.music_file_url && (
              <div className="space-y-2">
                <Label>Reproductor de Música</Label>
                <audio controls src={selectedRelease.resource.music_file_url || undefined} className="w-full" />
                <Button asChild variant="outline" className="w-full">
                  <a href={selectedRelease.resource.music_file_url} download>Descargar Música</a>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditReleaseModal(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteRelease} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Eliminando..." : "Eliminar"}
            </Button>
            <Button onClick={handleUpdateRelease} disabled={isSavingRelease} className="w-full sm:w-auto">
              {isSavingRelease ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
