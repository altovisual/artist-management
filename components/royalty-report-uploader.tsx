'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

export function RoyaltyReportUploader({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a file to upload.', variant: 'destructive' })
      return
    }

    setUploading(true)

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedFileName}`
    const { error } = await supabase.storage
      .from('royalty-reports')
      .upload(fileName, file)

    setUploading(false)

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Upload successful', description: 'The report is being processed.' })
      onUploadSuccess();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input type="file" accept=".csv,.tsv" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload Report'}
      </Button>
    </div>
  )
}