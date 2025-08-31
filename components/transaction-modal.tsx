import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  transaction?: any // Full transaction object for editing
  artists: { id: string, name: string }[]
  categories: { id: string, name: string, type: 'income' | 'expense' }[]
}

export function TransactionModal({ isOpen, onClose, onSave, transaction, artists, categories }: TransactionModalProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [type, setType] = useState<'income' | 'expense' | ''>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [transactionDate, setTransactionDate] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setSelectedArtistId(transaction.artist_id || null)
        setType(transaction.type || '')
        setSelectedCategoryId(transaction.category_id || null)
        setAmount(transaction.amount?.toString() || '')
        setTransactionDate(transaction.transaction_date || '')
        setDescription(transaction.description || '')
      } else {
        // Reset form for new transaction
        setSelectedArtistId(null)
        setType('')
        setSelectedCategoryId(null)
        setAmount('')
        setTransactionDate(format(new Date(), 'yyyy-MM-dd')) // Default to today
        setDescription('')
      }
    }
  }, [isOpen, transaction])

  const handleSave = async () => {
    if (!selectedArtistId || !type || !selectedCategoryId || !amount || !transactionDate) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to save transactions.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const transactionData = {
      id: transaction?.id, // Pass id for upsert
      user_id: user.id,
      artist_id: selectedArtistId,
      type,
      category_id: selectedCategoryId,
      amount: parseFloat(amount),
      transaction_date: transactionDate,
      description,
    }

    const { error } = await supabase.from('transactions').upsert(transactionData)

    if (error) {
      console.error("Error saving transaction:", error)
      toast({ title: "Error", description: "Failed to save transaction.", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Transaction saved successfully." });
      if (navigator.vibrate) { // Check if vibration API is supported
        navigator.vibrate(200); // Vibrate for 200ms
      } else {
        console.log("Vibration API not supported.");
      }

      // Apply animation to DialogContent
      if (dialogContentRef.current) {
        if (type === 'income') {
          dialogContentRef.current.classList.add('animate-income');
        } else if (type === 'expense') {
          dialogContentRef.current.classList.add('animate-expense');
        }
        setTimeout(() => {
          if (dialogContentRef.current) {
            dialogContentRef.current.classList.remove('animate-income');
            dialogContentRef.current.classList.remove('animate-expense');
          }
        }, 500); // Animation duration
      }

      onSave(); // Refetch transactions on the finance page
      onClose(); // Close the modal
    }
    setIsSaving(false);
  }

  const filteredCategories = categories.filter(cat => type === '' || cat.type === type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={dialogContentRef} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
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
                    <div className="p-2 text-center text-muted-foreground">No artists found.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as '' | 'income' | 'expense')}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategoryId || ""} onValueChange={setSelectedCategoryId} disabled={!type || filteredCategories.length === 0}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">No categories for this type.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionDate">Date</Label>
              <Input id="transactionDate" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} required />
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
            {isSaving ? "Saving..." : "Save Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
