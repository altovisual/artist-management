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
  Smartphone
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
  if (!signature) return null;

  const statusConfig = getStatusConfig(signature.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <SheetTitle className="text-lg">
                Detalles del documento
              </SheetTitle>
              <SheetDescription>
                Información completa de la firma digital
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Estado y Título */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {signature.document_name || signature.contract?.work_name || 'Sin título'}
                </CardTitle>
                <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                <User className="w-3 h-3" />
                Creador: {signature.creator_email || 'admin@mvpxmusic.com'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <span>{format(new Date(signature.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Código:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {signature.signature_request_id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Firmante */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Firmante (1)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {(signature.signer_name || signature.signer_email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {signature.signer_name || 'Sin nombre'}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {signature.signer_email}
                  </div>
                  {signature.signer_phone && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {signature.signer_phone}
                    </div>
                  )}
                </div>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>

              {signature.signature_location && (
                <div className="flex items-start gap-2 text-sm p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-muted-foreground">Ubicación</div>
                    <div>{signature.signature_location}</div>
                  </div>
                </div>
              )}

              {signature.signed_at && (
                <div className="flex items-center gap-2 text-sm p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-muted-foreground">Firmado:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(signature.signed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Plataforma:</span>
                <Badge variant="outline">
                  {signature.signature_platform || 'Email'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Lectura */}
          {signature.reading_time && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Tiempo de lectura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {signature.reading_time}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tiempo total de lectura
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {signature.document_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(signature.document_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver documento
                </Button>
              )}
              
              {signature.status === 'completed' && signature.document_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = signature.document_url!;
                    link.download = `${signature.document_name || 'contrato'}.pdf`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF firmado
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(signature.signature_request_id);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Copiar código del documento
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
