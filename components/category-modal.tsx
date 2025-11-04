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
    // Fetch unique categories from statement_transactions (read-only from Excel)
    const { data: transactionsData, error } = await supabase
      .from('statement_transactions')
      .select('category, transaction_type')
      .not('category', 'is', null)
    
    if (error) {
      console.error("Error fetching categories:", error)
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" })
    } else {
      // Get unique categories with their types
      const categoryMap = new Map<string, 'income' | 'expense'>()
      transactionsData?.forEach(t => {
        if (t.category && !categoryMap.has(t.category)) {
          categoryMap.set(t.category, t.transaction_type as 'income' | 'expense')
        }
      })
      
      const uniqueCategories = Array.from(categoryMap.entries()).map(([name, type]) => ({
        id: name,
        name: name,
        type: type
      }))
      setCategories(uniqueCategories)
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
    // Categories are read-only from Excel data
    toast({ 
      title: "Info", 
      description: "Categories are imported from Excel and cannot be edited here.", 
      variant: "default" 
    })
  }

  const handleEditClick = (category: Category) => {
    // Categories are read-only from Excel data
    toast({ 
      title: "Info", 
      description: "Categories are imported from Excel and cannot be edited.", 
      variant: "default" 
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    // Categories are read-only from Excel data
    toast({ 
      title: "Info", 
      description: "Categories are imported from Excel and cannot be deleted.", 
      variant: "default" 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>View Categories</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Categories are imported from your Excel statements and cannot be edited here.
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No categories found in your statements.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{cat.type}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      From Excel
                    </div>
                  </div>
                ))}
              </div>
            )}
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
