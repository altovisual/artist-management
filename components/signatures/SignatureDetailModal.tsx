'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  ExternalLink, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Eye,
  Smartphone,
  Copy,
  Share2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SignatureData {
  id: string;
  contract_id: string;
  signer_email: string;
  signature_request_id: string;
  status: 'sent' | 'pending' | 'completed' | 'rejected' | 'expired';
  created_at: string;
  completed_at?: string;
  document_url?: string;
  contract?: {
    internal_reference: string;
    work_name: string;
    status: string;
  };
  document_name?: string;
  creator_email?: string;
  signer_name?: string;
  signer_phone?: string;
  signature_platform?: string;
  signature_location?: string;
  reading_time?: string;
  signed_at?: string;
}

interface SignatureDetailModalProps {
  signature: SignatureData | null;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusConfig(status: string) {
  const statusConfig = {
    sent: { label: 'Enviado', variant: 'secondary' as const, icon: Clock, color: 'text-blue-600' },
    pending: { label: 'Pendiente', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-600' },
    completed: { label: 'Firmado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    rejected: { label: 'Rechazado', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    expired: { label: 'Expirado', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
}

export function SignatureDetailModal({ signature, isOpen, onClose }: SignatureDetailModalProps) {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  
  if (!signature) return null;

  const statusConfig = getStatusConfig(signature.status);
  const StatusIcon = statusConfig.icon;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(signature.signature_request_id);
    toast({
      title: "Código copiado",
      description: "El código del documento se copió al portapapeles",
    });
  };

  const handleShare = async () => {
    if (navigator.share && signature.document_url) {
      try {
        await navigator.share({
          title: signature.document_name || 'Documento',
          text: `Documento: ${signature.document_name || 'Sin título'}`,
          url: signature.document_url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      toast({
        title: "Compartir no disponible",
        description: "Tu navegador no soporta la función de compartir",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (signature.document_url) {
      const link = document.createElement('a');
      link.href = signature.document_url;
      link.download = `${signature.document_name || 'contrato'}.pdf`;
      link.click();
      toast({
        title: "Descarga iniciada",
        description: "El documento se está descargando",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        {/* iOS-style Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b px-6 py-4">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl font-semibold">
                  Detalles del documento
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Información completa de la firma digital
                </SheetDescription>
              </div>
              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden flex-shrink-0 h-10 w-10 rounded-full"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Content with iOS-style padding */}
        <div className="px-6 py-4 space-y-4">
          {/* Estado y Título - iOS Card Style */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold leading-tight">
                    {signature.document_name || signature.contract?.work_name || 'Sin título'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Creador: {signature.creator_email || 'admin@mvpxmusic.com'}
                  </p>
                </div>
                <Badge 
                  variant={statusConfig.variant} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Info Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Fecha de creación</p>
                    <p className="text-sm font-medium">
                      {format(new Date(signature.created_at), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Código del documento</p>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md inline-block mt-1 truncate max-w-full">
                      {signature.signature_request_id}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Firmante - iOS Style */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Firmante (1)
              </h4>

              {/* Signer Card */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0">
                  {(signature.signer_name || signature.signer_email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">
                    {signature.signer_name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {signature.signer_email}
                  </p>
                  {signature.signer_phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      {signature.signer_phone}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={statusConfig.variant}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full flex-shrink-0"
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {signature.signature_platform && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Plataforma:</span>
                    <Badge variant="outline" className="ml-auto">
                      {signature.signature_platform || 'Email'}
                    </Badge>
                  </div>
                )}

                {signature.signature_location && (
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Ubicación de firma</p>
                      <p className="text-sm font-medium mt-0.5">{signature.signature_location}</p>
                    </div>
                  </div>
                )}

                {signature.signed_at && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-green-700 dark:text-green-400">Firmado exitosamente</p>
                      <p className="text-sm font-medium text-green-900 dark:text-green-300 mt-0.5">
                        {format(new Date(signature.signed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas de Lectura - iOS Style */}
          {signature.reading_time && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-900 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Tiempo de lectura
                  </h4>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {signature.reading_time}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Tiempo total de lectura del documento
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones - iOS Style */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Acciones
              </h4>

              {/* iOS-style Action Buttons */}
              <div className="space-y-2">
                {signature.document_url && (
                  <button
                    onClick={() => {
                      setPdfLoading(true);
                      setShowPreview(true);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors rounded-xl group"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Previsualizar documento</p>
                      <p className="text-xs text-muted-foreground">Ver PDF en pantalla completa</p>
                    </div>
                  </button>
                )}
                
                {signature.document_url && (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors rounded-xl group"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Descargar PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {signature.status === 'completed' ? 'Documento firmado' : 'Descargar documento'}
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={handleCopyCode}
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors rounded-xl group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Copy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Copiar código</p>
                    <p className="text-xs text-muted-foreground">Código del documento</p>
                  </div>
                </button>

                {signature.document_url && (
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors rounded-xl group"
                  >
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Compartir</p>
                      <p className="text-xs text-muted-foreground">Enviar documento</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* iOS-style Bottom Padding */}
        <div className="h-6" />
      </SheetContent>

      {/* PDF Preview Modal */}
      {showPreview && signature.document_url && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-lg border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {signature.document_name || 'Documento'}
                  </h3>
                  <p className="text-white/60 text-sm">Vista previa del PDF</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(signature.document_url, '_blank');
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en nueva pestaña
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="text-white hover:bg-white/10"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div 
              className="flex-1 overflow-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden relative">
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Cargando documento...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={`${signature.document_url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[calc(100vh-120px)]"
                  title="Vista previa del documento"
                  onLoad={() => setPdfLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
