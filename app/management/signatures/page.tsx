'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTitle } from '@/components/animated-title';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ExternalLink, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function SignaturesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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
}

interface SignatureStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  completionRate: number;
}

function getStatusBadge(status: string) {
  const statusConfig = {
    sent: { label: 'Enviado', variant: 'secondary' as const, icon: Clock },
    pending: { label: 'Pendiente', variant: 'outline' as const, icon: AlertCircle },
    completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle },
    rejected: { label: 'Rechazado', variant: 'destructive' as const, icon: XCircle },
    expired: { label: 'Expirado', variant: 'secondary' as const, icon: XCircle },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [stats, setStats] = useState<SignatureStats>({ total: 0, completed: 0, pending: 0, rejected: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchSignatures = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/signatures');
      if (res.ok) {
        const data = await res.json();
        setSignatures(data);
        
        // Calcular estadísticas
        const total = data.length;
        const completed = data.filter((s: SignatureData) => s.status === 'completed').length;
        const pending = data.filter((s: SignatureData) => ['sent', 'pending'].includes(s.status)).length;
        const rejected = data.filter((s: SignatureData) => s.status === 'rejected').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setStats({ total, completed, pending, rejected, completionRate });
      }
    } catch (error) {
      console.error('Failed to fetch signatures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const filteredSignatures = signatures.filter(signature => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['sent', 'pending'].includes(signature.status);
    if (activeTab === 'completed') return signature.status === 'completed';
    if (activeTab === 'rejected') return signature.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return <SignaturesTableSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <AnimatedTitle text="Dashboard de Firmas" level={1} className="text-3xl font-bold" />
        <Button onClick={fetchSignatures} disabled={isLoading} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Documentos enviados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Firmas completadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Esperando firma</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Documentos completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla con filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Firmas</CardTitle>
          <CardDescription>Seguimiento detallado de todos los documentos enviados para firma</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pendientes ({stats.pending})</TabsTrigger>
              <TabsTrigger value="completed">Completados ({stats.completed})</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados ({stats.rejected})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <SignaturesTableSkeleton />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead>Firmante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Enviado</TableHead>
                      <TableHead>Completado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSignatures.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay documentos {activeTab === 'all' ? '' : `en estado "${activeTab}"`}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSignatures.map((signature) => (
                        <TableRow key={signature.id}>
                          <TableCell className="font-medium">
                            {signature.contract?.internal_reference || `#${signature.contract_id}`}
                          </TableCell>
                          <TableCell>
                            {signature.contract?.work_name || 'Sin título'}
                          </TableCell>
                          <TableCell>{signature.signer_email}</TableCell>
                          <TableCell>{getStatusBadge(signature.status)}</TableCell>
                          <TableCell>
                            {format(new Date(signature.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell>
                            {signature.completed_at 
                              ? format(new Date(signature.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {signature.document_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(signature.document_url, '_blank')}
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Ver
                                </Button>
                              )}
                              {signature.status === 'completed' && signature.document_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = signature.document_url!;
                                    link.download = `contrato-${signature.contract?.internal_reference || signature.contract_id}.pdf`;
                                    link.click();
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Descargar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}