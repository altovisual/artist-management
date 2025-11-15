'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, ExternalLink } from 'lucide-react'

export function MigrationRequiredBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if migration has been run
    const checkMigration = async () => {
      try {
        // Try to select from user_profiles with user_type column
        const { error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .limit(1)
        
        // If there's an error about the column not existing, show banner
        if (error && (error.code === '42703' || error.message?.includes('user_type'))) {
          setShowBanner(true)
        }
      } catch (e) {
        console.log('Could not check migration status')
      }
    }

    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('migration_banner_dismissed')
    if (!dismissed) {
      checkMigration()
    }
  }, [supabase])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('migration_banner_dismissed', 'true')
  }

  if (!showBanner || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="relative">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Database Migration Required</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            The database needs to be updated to support the new user roles system (Artist/Manager).
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open('/COMO_ARREGLAR_EL_ERROR.md', '_blank')
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Instructions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy the file path to clipboard
                navigator.clipboard.writeText('supabase/EJECUTAR_ESTO_PRIMERO.sql')
                alert('File path copied! Open this file and execute it in Supabase SQL Editor.')
              }}
              className="gap-2"
            >
              Copy Migration File Path
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
