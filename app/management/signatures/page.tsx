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
import { RefreshCw, ExternalLink, Download, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeftRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SignatureDetailModal } from '@/components/signatures/SignatureDetailModal';

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
  // Datos adicionales de Auco
  document_name?: string;
  creator_email?: string;
  signer_name?: string;
  signer_phone?: string;
  signature_platform?: string;
  signature_location?: string;
  reading_time?: string;
  signed_at?: string;
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
    sent: { 
      label: 'Enviado', 
      variant: 'secondary' as const, 
      icon: Clock,
      ariaLabel: 'Estado: Documento enviado',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    pending: { 
      label: 'Pendiente', 
      variant: 'outline' as const, 
      icon: AlertCircle,
      ariaLabel: 'Estado: Pendiente de firma',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    completed: { 
      label: 'Completado', 
      variant: 'default' as const, 
      icon: CheckCircle,
      ariaLabel: 'Estado: Documento firmado completamente',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: { 
      label: 'Rechazado', 
      variant: 'destructive' as const, 
      icon: XCircle,
      ariaLabel: 'Estado: Documento rechazado',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    expired: { 
      label: 'Expirado', 
      variant: 'secondary' as const, 
      icon: XCircle,
      ariaLabel: 'Estado: Documento expirado',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 ${config.color}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
}

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [stats, setStats] = useState<SignatureStats>({ total: 0, completed: 0, pending: 0, rejected: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSignature, setSelectedSignature] = useState<SignatureData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

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

  const syncFromAuco = async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/auco/sync-documents', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('Auto-sync result:', result);
        setLastSyncTime(new Date());
        // Refrescar datos después de sincronizar
        if (!silent) {
          await fetchSignatures();
        }
      } else {
        console.error('Auto-sync failed:', await res.text());
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await syncFromAuco(true); // Sincronización silenciosa
      await fetchSignatures();
    };
    
    initializeData();
    
    // Sincronización automática cada 5 minutos
    const syncInterval = setInterval(() => {
      syncFromAuco(true);
    }, 5 * 60 * 1000); // 5 minutos
    
    // Cleanup del interval
    return () => clearInterval(syncInterval);
  }, [syncFromAuco, fetchSignatures]);

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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <AnimatedTitle text="Dashboard de Firmas" level={1} className="text-2xl sm:text-3xl font-bold" />
          <p className="text-sm text-muted-foreground mt-1" id="dashboard-description">
            Gestiona y supervisa el estado de todos los documentos de firma digital
          </p>
        </div>
        <div className="flex gap-2" role="toolbar" aria-label="Acciones del dashboard">
          <Button 
            onClick={fetchSignatures} 
            disabled={isLoading} 
            size="sm" 
            className="flex items-center gap-2"
            aria-label={isLoading ? 'Actualizando datos...' : 'Actualizar lista de documentos'}
          >
            <RefreshCw 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Actualizar</span>
            <span className="sr-only sm:hidden">Actualizar datos</span>
          </Button>
          {lastSyncTime && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowLeftRight className="w-3 h-3" aria-hidden="true" />
              <span className="hidden sm:inline">
                Última sync: {format(lastSyncTime, 'HH:mm', { locale: es })}
              </span>
              <span className="sm:hidden">
                {format(lastSyncTime, 'HH:mm', { locale: es })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Estadísticas de documentos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card role="region" aria-labelledby="total-docs-title">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="total-docs-title" className="text-sm font-medium">Total Documentos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${stats.total} documentos en total`}>
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">Documentos enviados</p>
          </CardContent>
        </Card>
        
        <Card role="region" aria-labelledby="completed-docs-title">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="completed-docs-title" className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" aria-label={`${stats.completed} documentos completados`}>
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Firmas completadas</p>
          </CardContent>
        </Card>
        
        <Card role="region" aria-labelledby="pending-docs-title">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="pending-docs-title" className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" aria-label={`${stats.pending} documentos pendientes`}>
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Esperando firma</p>
          </CardContent>
        </Card>
        
        <Card role="region" aria-labelledby="success-rate-title">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="success-rate-title" className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" aria-label={`${stats.completionRate} por ciento de tasa de éxito`}>
              {stats.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">Documentos completados</p>
          </CardContent>
        </Card>
        </div>
      </section>

      {/* Tabla con filtros */}
      <section aria-labelledby="documents-section-title">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle id="documents-section-title" className="text-lg sm:text-xl">Estado de Firmas</CardTitle>
                <CardDescription className="text-sm">
                  Seguimiento detallado de todos los documentos enviados para firma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <TabsList 
                  className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto"
                  role="tablist"
                  aria-label="Filtrar documentos por estado"
                >
                  <TabsTrigger 
                    value="all" 
                    className="text-xs sm:text-sm"
                    aria-label={`Mostrar todos los documentos (${stats.total})`}
                  >
                    <span className="hidden sm:inline">Todos</span>
                    <span className="sm:hidden">All</span>
                    <span className="ml-1">({stats.total})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="text-xs sm:text-sm"
                    aria-label={`Mostrar documentos pendientes (${stats.pending})`}
                  >
                    <span className="hidden sm:inline">Pendientes</span>
                    <span className="sm:hidden">Pend</span>
                    <span className="ml-1">({stats.pending})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="text-xs sm:text-sm"
                    aria-label={`Mostrar documentos completados (${stats.completed})`}
                  >
                    <span className="hidden sm:inline">Completados</span>
                    <span className="sm:hidden">Comp</span>
                    <span className="ml-1">({stats.completed})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="text-xs sm:text-sm"
                    aria-label={`Mostrar documentos rechazados (${stats.rejected})`}
                  >
                    <span className="hidden sm:inline">Rechazados</span>
                    <span className="sm:hidden">Rech</span>
                    <span className="ml-1">({stats.rejected})</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <SignaturesTableSkeleton />
              ) : (
                <>
                  {/* Vista Desktop - Tabla completa */}
                  <div className="hidden lg:block">
                    <Table role="table" aria-label="Lista de documentos de firma">
                      <TableHeader>
                        <TableRow>
                          <TableHead scope="col">Documento</TableHead>
                          <TableHead scope="col">Firmante</TableHead>
                          <TableHead scope="col">Estado</TableHead>
                          <TableHead scope="col">Plataforma</TableHead>
                          <TableHead scope="col">Ubicación</TableHead>
                          <TableHead scope="col">Tiempo Lectura</TableHead>
                          <TableHead scope="col">Fecha Firma</TableHead>
                          <TableHead scope="col">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSignatures.length === 0 ? (
                          <TableRow>
                            <TableCell 
                              colSpan={8} 
                              className="text-center py-8 text-muted-foreground"
                              role="cell"
                              aria-live="polite"
                            >
                              {isLoading ? 'Cargando documentos...' : 
                                `No hay documentos ${activeTab === 'all' ? '' : `en estado "${activeTab}"`}`
                              }
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSignatures.map((signature) => (
                            <TableRow 
                              key={signature.id}
                              className="cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50"
                              onClick={() => {
                                setSelectedSignature(signature);
                                setShowDetailModal(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedSignature(signature);
                                  setShowDetailModal(true);
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`Ver detalles del documento ${signature.document_name || signature.contract?.work_name || 'Sin título'}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="font-semibold">
                                    {signature.document_name || signature.contract?.work_name || 'Sin título'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {signature.signature_request_id}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {signature.signer_name || signature.signer_email}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {signature.signer_email}
                                  </span>
                                  {signature.signer_phone && (
                                    <span className="text-xs text-muted-foreground">
                                      📞 {signature.signer_phone}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(signature.status)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {signature.signature_platform || 'Email'}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                <span className="text-xs text-muted-foreground truncate block">
                                  {signature.signature_location || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {signature.reading_time ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {signature.reading_time}
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {signature.signed_at 
                                  ? format(new Date(signature.signed_at), 'dd/MM/yyyy HH:mm', { locale: es })
                                  : signature.completed_at
                                  ? format(new Date(signature.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })
                                  : '-'
                                }
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSignature(signature);
                                      setShowDetailModal(true);
                                    }}
                                    className="flex items-center gap-1"
                                    aria-label={`Ver detalles completos del documento ${signature.document_name || signature.contract?.work_name || 'Sin título'}`}
                                  >
                                    <Eye className="w-3 h-3" aria-hidden="true" />
                                    <span>Ver</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vista Mobile - Cards */}
                  <div className="lg:hidden space-y-3" role="list" aria-label="Lista de documentos">
                    {filteredSignatures.length === 0 ? (
                      <div 
                        className="text-center py-8 text-muted-foreground"
                        role="status"
                        aria-live="polite"
                      >
                        {isLoading ? 'Cargando documentos...' : 
                          `No hay documentos ${activeTab === 'all' ? '' : `en estado "${activeTab}"`}`
                        }
                      </div>
                    ) : (
                      filteredSignatures.map((signature) => (
                        <Card 
                          key={signature.id} 
                          className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                          onClick={() => {
                            setSelectedSignature(signature);
                            setShowDetailModal(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedSignature(signature);
                              setShowDetailModal(true);
                            }
                          }}
                          tabIndex={0}
                          role="listitem button"
                          aria-label={`Ver detalles del documento ${signature.document_name || signature.contract?.work_name || 'Sin título'}, firmante: ${signature.signer_name || signature.signer_email}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">
                                  {signature.document_name || signature.contract?.work_name || 'Sin título'}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {signature.signature_request_id}
                                </p>
                              </div>
                              {getStatusBadge(signature.status)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {(signature.signer_name || signature.signer_email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {signature.signer_name || signature.signer_email}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {signature.signer_email}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {signature.signature_platform || 'Email'}
                                  </Badge>
                                  {signature.reading_time && (
                                    <Badge variant="secondary" className="text-xs">
                                      {signature.reading_time}
                                    </Badge>
                                  )}
                                </div>
                                <div>
                                  {signature.signed_at 
                                    ? format(new Date(signature.signed_at), 'dd/MM/yyyy', { locale: es })
                                    : format(new Date(signature.created_at), 'dd/MM/yyyy', { locale: es })
                                  }
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </section>

      {/* Modal de detalles */}
      <SignatureDetailModal
        signature={selectedSignature}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSignature(null);
        }}
      />

    </div>
  );
}