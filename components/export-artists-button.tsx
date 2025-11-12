'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  exportArtistsToExcel, 
  exportArtistsToPDF, 
  exportArtistsDetailedPDF,
  type ArtistExportData 
} from '@/lib/export-artists';

interface ExportArtistsButtonProps {
  artists: ArtistExportData[];
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportArtistsButton({ 
  artists, 
  variant = 'default',
  size = 'default',
  className 
}: ExportArtistsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');

  const handleExport = async (type: 'excel' | 'pdf' | 'pdf-detailed') => {
    if (artists.length === 0) {
      toast.error('No hay artistas para exportar', {
        description: 'Primero debes crear algunos artistas.'
      });
      return;
    }

    setIsExporting(true);
    setExportType(type);

    try {
      let success = false;
      let message = '';

      switch (type) {
        case 'excel':
          success = exportArtistsToExcel(artists);
          message = 'Excel generado exitosamente';
          break;
        case 'pdf':
          success = exportArtistsToPDF(artists);
          message = 'PDF generado exitosamente';
          break;
        case 'pdf-detailed':
          success = exportArtistsDetailedPDF(artists);
          message = 'PDF detallado generado exitosamente';
          break;
      }

      if (success) {
        toast.success('Exportación completada', {
          description: `${message}. Se descargó el archivo con ${artists.length} artista${artists.length !== 1 ? 's' : ''}.`
        });
      }
    } catch (error) {
      console.error('Error exporting artists:', error);
      toast.error('Error al exportar', {
        description: 'Hubo un problema al generar el archivo. Por favor intenta de nuevo.'
      });
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={isExporting || artists.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Formato de Exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span className="font-medium">Excel (.xlsx)</span>
            <span className="text-xs text-muted-foreground">Tabla con todos los datos</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">PDF Tabla</span>
            <span className="text-xs text-muted-foreground">Vista resumida en tabla</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleExport('pdf-detailed')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">PDF Detallado</span>
            <span className="text-xs text-muted-foreground">Información completa de cada artista</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {artists.length} artista{artists.length !== 1 ? 's' : ''} disponible{artists.length !== 1 ? 's' : ''}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
