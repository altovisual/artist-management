'use client'

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Music, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface CreativeVaultItem {
  id: string;
  artist_id: string;
  type: string;
  title: string;
  content: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export default function CreativeVaultPage() {
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()
  const artistId = params.id as string

  const [items, setItems] = useState<CreativeVaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    type: '',
    title: '',
    content: '',
    notes: '',
    file: null as File | null,
  })

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('creative_vault_items')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })

      if (error) {
        toast({ title: "Error", description: "Failed to load creative vault items.", variant: "destructive" })
        console.error("Error fetching creative vault items:", error)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchItems()
  }, [artistId, supabase, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewItem(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewItem(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.type || !newItem.title) {
      toast({ title: "Error", description: "Type and Title are required.", variant: "destructive" })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('type', newItem.type)
    formData.append('title', newItem.title)
    if (newItem.content) formData.append('content', newItem.content)
    if (newItem.notes) formData.append('notes', newItem.notes)
    if (newItem.file) formData.append('file', newItem.file)

    try {
      const response = await fetch(`/api/creative-vault/${artistId}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to add item.")
      }

      const addedItem: CreativeVaultItem = await response.json()
      setItems(prev => [addedItem, ...prev])
      setNewItem({ type: '', title: '', content: '', notes: '', file: null })
      toast({ title: "Success", description: "Item added to Creative Vault." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add item.", variant: "destructive" })
      console.error("Error adding creative vault item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/creative-vault/${artistId}?itemId=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to delete item.")
      }

      setItems(prev => prev.filter(item => item.id !== itemId))
      toast({ title: "Success", description: "Item deleted from Creative Vault." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete item.", variant: "destructive" })
      console.error("Error deleting creative vault item:", error)
    } finally {
      setLoading(false)
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="h-5 w-5 text-primary" />;
      case 'text': return <FileText className="h-5 w-5 text-primary" />;
      case 'image': return <ImageIcon className="h-5 w-5 text-primary" />;
      case 'link': return <LinkIcon className="h-5 w-5 text-primary" />;
      default: return null;
    }
  }

  const renderItemContent = (item: CreativeVaultItem) => {
    switch (item.type) {
      case 'audio':
        return item.file_url ? <audio controls src={item.file_url} className="mt-2 w-full" /> : null;
      case 'image':
        return item.file_url ? (
          <Image
            src={item.file_url}
            alt={item.title}
            width={192}
            height={192}
            className="mt-2 h-48 w-auto object-contain cursor-pointer"
            onClick={() => setSelectedImage(item.file_url)}
          />
        ) : null;
      case 'text':
        return item.content ? <p className="text-sm mt-1 whitespace-pre-wrap">{item.content}</p> : null;
      case 'link':
        if (!item.content) return null;

        // YouTube Embed
        const youtubeMatch = item.content.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/ (?:watch\?v=|embed\/|v\/|)([^&?\n%]{11})/);
        if (youtubeMatch && youtubeMatch[1]) {
          return (
            <div className="relative w-full overflow-hidden rounded-lg mt-2" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={item.title}
              ></iframe>
            </div>
          );
        }

        // Spotify Embed (Track, Album, Playlist)
        const spotifyMatch = item.content.match(/(?:https?:\/\/)?(?:open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+))/);
        if (spotifyMatch && spotifyMatch[1] && spotifyMatch[2]) {
          const type = spotifyMatch[1];
          const id = spotifyMatch[2];
          return (
            <div className="relative w-full overflow-hidden rounded-lg mt-2" style={{ paddingTop: '100%' }}> {/* Spotify embeds are often square */}
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://open.spotify.com/embed/${type}/${id}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="encrypted-media"
                title={item.title}
              ></iframe>
            </div>
          );
        }

        // Generic Link
        return (
          <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-1 block">
            {item.content}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-6">Creative Vault</h1>

          <Card className="mb-6">
            <CardHeader><CardTitle>Add New Item</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" value={newItem.type} onValueChange={(value) => setNewItem(prev => ({ ...prev, type: value }))} required>
                      <SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="text">Text (Lyrics, Notes)</SelectItem>
                        <SelectItem value="image">Image (Moodboard)</SelectItem>
                        <SelectItem value="link">Link (Inspiration)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input type="text" id="title" name="title" value={newItem.title} onChange={handleInputChange} required />
                  </div>
                </div>

                {newItem.type === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" name="content" value={newItem.content} onChange={handleInputChange} rows={5} />
                  </div>
                )}

                {(newItem.type === 'audio' || newItem.type === 'image') && (
                  <div className="space-y-2">
                    <Label htmlFor="file">File</Label>
                    <Input type="file" id="file" name="file" onChange={handleFileChange} accept={newItem.type === 'audio' ? 'audio/*' : 'image/*'} />
                  </div>
                )}

                {newItem.type === 'link' && (
                  <div className="space-y-2">
                    <Label htmlFor="content">URL</Label>
                    <Input type="url" id="content" name="content" value={newItem.content} onChange={handleInputChange} placeholder="https://example.com" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={newItem.notes} onChange={handleInputChange} rows={3} />
                </div>

                <Button type="submit" disabled={loading}><Plus className="h-4 w-4 mr-2" />{loading ? "Adding..." : "Add Item"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Creative Vault Items</CardTitle></CardHeader>
            <CardContent>
              {loading && items.length === 0 ? (
                <p>Loading items...</p>
              ) : items.length === 0 ? (
                <p>No items in your Creative Vault yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="border p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getItemIcon(item.type)}
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
                          {renderItemContent(item)}
                          {item.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {item.notes}</p>}
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)} disabled={loading}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      {selectedImage && (
        <AlertDialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <AlertDialogContent className="max-w-3xl w-full">
            <AlertDialogHeader>
              <AlertDialogTitle>Image Preview</AlertDialogTitle>
              <AlertDialogDescription>
                <Image src={selectedImage} alt="Preview" width={800} height={600} className="w-full h-auto object-contain" />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setSelectedImage(null)}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}