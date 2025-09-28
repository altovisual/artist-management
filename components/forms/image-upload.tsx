'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  className?: string
  placeholder?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  className,
  placeholder = "Upload profile image" 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/25">
          <AvatarImage src={preview || undefined} />
          <AvatarFallback className="bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {value ? 'Change Image' : 'Upload Image'}
          </Button>
          
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Recommended: Square image, at least 400x400px. Max file size: 5MB.
      </p>
    </div>
  )
}
