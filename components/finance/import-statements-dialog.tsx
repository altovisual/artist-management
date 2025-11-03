'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { processStatementsExcel, saveStatementsToDatabase, type ImportResult } from '@/lib/import-statements'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ImportStatementsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: () => void
}

export function ImportStatementsDialog({ open, onOpenChange, onImportComplete }: ImportStatementsDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        toast({
          title: 'Error',
          description: 'Por favor selecciona un archivo Excel (.xlsx o .xls)',
          variant: 'destructive'
        })
      }
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setProgress(10)

    try {
      // Obtener usuario actual y token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuario no autenticado')
      }

      setProgress(20)
      toast({
        title: 'Procesando archivo...',
        description: 'Leyendo estados de cuenta del Excel'
      })

      // Crear FormData con el archivo
      const formData = new FormData()
      formData.append('file', file)

      setProgress(30)

      // Llamar a la API de importación
      const response = await fetch('/api/statements/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      setProgress(60)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la importación')
      }

      const result = await response.json()
      setProgress(90)

      toast({
        title: 'Guardando en base de datos...',
        description: `${result.totalArtistas} artistas procesados`
      })

      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProgress(100)
      setResult({
        success: result.success,
        totalArtists: result.totalArtistas,
        totalTransactions: result.totalTransacciones,
        successfulImports: result.exitosos,
        failedImports: result.fallidos,
        artistsSummary: result.detalles.map((d: any) => ({
          artistName: d.artista,
          transactions: d.transacciones || 0,
          balance: d.balance || 0,
          status: d.status,
          error: d.error
        })),
        errors: result.detalles.filter((d: any) => d.status === 'error').map((d: any) => d.error)
      })

      toast({
        title: '¡Importación completada!',
        description: `${result.exitosos} artistas importados exitosamente`,
        variant: 'default'
      })

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Error importing statements:', error)
      toast({
        title: 'Error en la importación',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
      setResult({
        success: false,
        totalArtists: 0,
        totalTransactions: 0,
        successfulImports: 0,
        failedImports: 0,
        artistsSummary: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setProgress(0)
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Importar Estados de Cuenta</DialogTitle>
              <DialogDescription>
                Sube el archivo Excel con los estados de cuenta mensuales
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!result ? (
            <>
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={importing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {file ? file.name : 'Selecciona un archivo Excel'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Arrastra y suelta o haz clic para seleccionar
                    </p>
                  </div>
                  {file && (
                    <Badge variant="outline" className="mt-2">
                      {(file.size / 1024).toFixed(2)} KB
                    </Badge>
                  )}
                </label>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato esperado:</strong> El archivo debe contener una hoja por artista
                  con las columnas: Fecha, Concepto, Método de Pago, y Balance.
                </AlertDescription>
              </Alert>

              {/* Progress Bar */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={importing}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={!file || importing}>
                  {importing ? 'Importando...' : 'Importar Estados de Cuenta'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Import Results */}
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {result.totalArtists}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Artistas</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {result.successfulImports}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Exitosos</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {result.failedImports}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">Fallidos</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {result.totalTransactions}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Transacciones</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Artist Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Detalle por Artista</h3>
                    <div className="space-y-2">
                      {result.artistsSummary.map((artist, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {artist.status === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">{artist.artistName}</div>
                                {artist.error && (
                                  <div className="text-xs text-red-600">{artist.error}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {artist.transactions} transacciones
                              </div>
                              <div className={`text-xs ${artist.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Balance: ${artist.balance.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Errores encontrados:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>

              {/* Close Button */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
