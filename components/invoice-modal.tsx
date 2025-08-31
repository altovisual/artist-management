'use client'

import { useState, useEffect } from 'react'
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
import { PlusCircle, MinusCircle } from 'lucide-react'

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  invoice?: any; // Full invoice object for editing
  artists: { id: string, name: string }[];
}

export function InvoiceModal({ isOpen, onClose, onSave, invoice, artists }: InvoiceModalProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        setSelectedArtistId(invoice.artist_id || null);
        setInvoiceNumber(invoice.invoice_number || '');
        setClientName(invoice.client_name || '');
        setClientEmail(invoice.client_email || '');
        setIssueDate(invoice.issue_date || format(new Date(), 'yyyy-MM-dd'));
        setDueDate(invoice.due_date || format(new Date(), 'yyyy-MM-dd'));
        setStatus(invoice.status || 'draft');
        // Fetch invoice items if editing existing invoice
        const fetchItems = async () => {
          const { data, error } = await supabase
            .from('invoice_items')
            .select('id, description, quantity, unit_price')
            .eq('invoice_id', invoice.id);
          if (error) {
            console.error("Error fetching invoice items:", error);
            setItems([{ description: '', quantity: 1, unit_price: 0 }]);
          } else {
            setItems(data || [{ description: '', quantity: 1, unit_price: 0 }]);
          }
        };
        fetchItems();
      } else {
        // Reset form for new invoice
        setSelectedArtistId(null);
        setInvoiceNumber('');
        setClientName('');
        setClientEmail('');
        setIssueDate(format(new Date(), 'yyyy-MM-dd'));
        setDueDate(format(new Date(), 'yyyy-MM-dd'));
        setStatus('draft');
        setItems([{ description: '', quantity: 1, unit_price: 0 }]);
      }
    }
  }, [isOpen, invoice, supabase]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ description: '', quantity: 1, unit_price: 0 }]);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSave = async () => {
    if (!selectedArtistId || !clientName || !issueDate || !dueDate || items.some(item => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
      toast({ title: "Error", description: "Please fill in all required fields and ensure item quantities/prices are valid.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save invoices.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const totalAmount = calculateTotalAmount();

    const invoiceData = {
      id: invoice?.id, // For upsert
      user_id: user.id,
      artist_id: selectedArtistId,
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      issue_date: issueDate,
      due_date: dueDate,
      total_amount: totalAmount,
      status: status,
    };

    const { data: savedInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .upsert(invoiceData)
      .select();

    if (invoiceError || !savedInvoice) {
      console.error("Error saving invoice:", invoiceError);
      toast({ title: "Error", description: invoiceError?.message || "Failed to save invoice.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const newInvoiceId = savedInvoice[0].id;

    // Save invoice items
    const itemsToInsert = items.map(item => ({
      ...item,
      invoice_id: newInvoiceId,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .upsert(itemsToInsert, { onConflict: 'id' }); // Upsert items, handle conflicts by ID

    if (itemsError) {
      console.error("Error saving invoice items:", itemsError);
      toast({ title: "Error", description: itemsError?.message || "Failed to save invoice items.", variant: "destructive" });
      // Consider rolling back invoice save if items fail, or handle partial save
    } else {
      toast({ title: "Success", description: "Invoice saved successfully." });
      onSave(); // Refetch invoices on the finance page
      onClose(); // Close the modal
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
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
                    <div className="p-2 text-center text-muted-foreground">No artists found.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-4 mt-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-3 rounded-md">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Qty</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <MinusCircle className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="md:col-span-2 text-right mt-4">
              <h3 className="text-xl font-bold">Total: ${calculateTotalAmount().toFixed(2)}</h3>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
