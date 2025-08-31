'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void // Callback to refetch categories in parent
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

export function CategoryModal({ isOpen, onClose, onSave }: CategoryModalProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense' | ''>('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('transaction_categories').select('id, name, type').order('name', { ascending: true })
    if (error) {
      console.error("Error fetching categories:", error)
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" })
    } else {
      setCategories(data || [])
    }
  }, [supabase, toast])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setNewCategoryName('')
      setNewCategoryType('')
      setEditingCategory(null)
    }
  }, [isOpen, fetchCategories])

  const handleSaveCategory = async () => {
    if (!newCategoryName || !newCategoryType) {
      toast({ title: "Error", description: "Category name and type are required.", variant: "destructive" })
      return
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to save categories.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const categoryData = {
      id: editingCategory?.id, // Will be null for new categories
      user_id: user.id,
      name: newCategoryName,
      type: newCategoryType,
    }

    const { error } = await supabase.from('transaction_categories').upsert(categoryData)

    if (error) {
      console.error("Error saving category:", error)
      toast({ title: "Error", description: "Failed to save category. It might already exist.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Category saved successfully." })
      setNewCategoryName('')
      setNewCategoryType('')
      setEditingCategory(null)
      fetchCategories() // Refresh list in modal
      onSave() // Notify parent to refetch categories
    }
    setIsSaving(false);
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryType(category.type)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This cannot be undone.")) return

    setIsSaving(true);

    const { error } = await supabase.from('transaction_categories').delete().eq('id', categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      toast({ title: "Error", description: "Failed to delete category. It might be in use.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Category deleted successfully." })
      fetchCategories() // Refresh list in modal
      onSave() // Notify parent to refetch categories
    }
    setIsSaving(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input id="categoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Streaming, Merch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryType">Type</Label>
                <Select value={newCategoryType} onValueChange={(value) => setNewCategoryType(value as '' | 'income' | 'expense')}>
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveCategory} disabled={isSaving || !newCategoryName || !newCategoryType}>
              {isSaving ? "Saving..." : (editingCategory ? "Update Category" : "Add Category")}
            </Button>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-sm">No categories added yet.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-muted-foreground">{cat.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
