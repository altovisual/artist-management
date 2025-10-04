'use client'

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from '@/components/ui/design-system/page-header';
import { ContentSection } from '@/components/ui/design-system/content-section';
import { StatsGrid } from '@/components/ui/design-system/stats-grid';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ExternalLink, Download, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeftRight, Eye, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
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
  id: number;
  contract_id: string;
  signer_email: string;
  signature_request_id: string;
  status: 'sent' | 'pending' | 'completed' | 'rejected' | 'expired';
  created_at: string;
  completed_at?: string;
  document_url?: string;
  archived?: boolean;
  deleted_at?: string;
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const fetchSignatures = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        showArchived: showArchived.toString(),
        status: activeTab,
        search: searchQuery
      });
      
      const res = await fetch(`/api/signatures?${params}`);
      if (res.ok) {
        const response = await res.json();
        const { data, pagination } = response;
        
        setSignatures(data);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
        
        // Calcular estadísticas
        const total = data.length;
        const completed = data.filter((s: SignatureData) => s.status === 'completed').length;
        const pending = data.filter((s: SignatureData) => ['sent', 'pending'].includes(s.status)).length;
        const rejected = data.filter((s: SignatureData) => s.status === 'rejected').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setStats({ total: pagination.total, completed, pending, rejected, completionRate });
      }
    } catch (error) {
      console.error('Failed to fetch signatures:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived, activeTab, searchQuery, itemsPerPage]);

  const syncFromAuco = useCallback(async (silent: boolean = false) => {
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
  }, [fetchSignatures]);

  useEffect(() => {
    // Solo cargar datos de la DB, NO sincronizar automáticamente
    fetchSignatures(1);
    
    // Sincronización automática deshabilitada para evitar errores 404
    // Si necesitas sincronizar, usa el botón "Refresh" manualmente
  }, [activeTab, showArchived]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchSignatures(1);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Archive/Unarchive signature
  const handleArchive = async (id: number, currentlyArchived: boolean) => {
    try {
      const res = await fetch(`/api/signatures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !currentlyArchived })
      });
      
      if (res.ok) {
        await fetchSignatures(currentPage);
      }
    } catch (error) {
      console.error('Failed to archive signature:', error);
    }
  };

  // Delete signature (soft delete)
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;
    
    try {
      const res = await fetch(`/api/signatures/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchSignatures(currentPage);
      }
    } catch (error) {
      console.error('Failed to delete signature:', error);
    }
  };

  const filteredSignatures = signatures;

  if (isLoading) {
    return <SignaturesTableSkeleton />;
  }

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Documentos',
      value: stats.total.toString(),
      change: '+5',
      changeType: 'positive' as const,
      icon: AlertCircle,
      description: 'Documentos enviados'
    },
    {
      title: 'Completados',
      value: stats.completed.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Firmas completadas'
    },
    {
      title: 'Pendientes',
      value: stats.pending.toString(),
      change: stats.pending > 0 ? `${stats.pending} waiting` : 'All signed',
      changeType: stats.pending > 0 ? 'neutral' as const : 'positive' as const,
      icon: Clock,
      description: 'Esperando firma'
    },
    {
      title: 'Tasa de Éxito',
      value: `${stats.completionRate}%`,
      change: 'High rate',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Documentos completados'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Native iPhone Header */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        
        <div className="relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">S</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  Signature Status
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {stats.total} Documents
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed tracking of all documents sent for signature
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por documento, email, nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => fetchSignatures(1)}
              variant="outline" 
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <Button
              onClick={() => setShowArchived(!showArchived)}
              variant={showArchived ? "default" : "outline"}
              className="flex-1 sm:flex-none"
            >
              {showArchived ? "Ocultar Archivados" : "Mostrar Archivados"}
            </Button>
          </div>
        </div>
      </div>

      {/* Native iPhone Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
                stat.changeType === 'neutral' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-red-100 dark:bg-red-900/30'
              }`}>
                <stat.icon className={`h-5 w-5 ${
                  stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                  stat.changeType === 'neutral' ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
            <Badge 
              variant={stat.changeType === 'positive' ? 'secondary' : 'outline'} 
              className="text-xs"
            >
              {stat.change}
            </Badge>
          </div>
        ))}
      </div>

      {/* Native iPhone Content Section */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Estado de Firmas</h2>
            <p className="text-sm text-muted-foreground">
              Seguimiento detallado de todos los documentos enviados para firma
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Native iPhone Tab Navigation */}
            <div className="bg-muted/30 p-1 rounded-lg">
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'pending'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pend ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'completed'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Comp ({stats.completed})
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'rejected'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Rech ({stats.rejected})
                </button>
              </div>
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
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleArchive(signature.id, signature.archived || false)}
                                    className="flex items-center gap-1"
                                    title={signature.archived ? "Desarchivar" : "Archivar"}
                                  >
                                    <ArrowLeftRight className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(signature.id)}
                                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                                    title="Eliminar"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Native iPhone Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {filteredSignatures.length === 0 ? (
                      <div className="bg-muted/30 rounded-xl p-8 text-center">
                        <div className="text-muted-foreground">
                          {isLoading ? 'Cargando documentos...' : 
                            `No hay documentos ${activeTab === 'all' ? '' : `en estado "${activeTab}"`}`
                          }
                        </div>
                      </div>
                    ) : (
                      filteredSignatures.map((signature) => (
                        <div
                          key={signature.id}
                          className="bg-background border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => {
                            setSelectedSignature(signature);
                            setShowDetailModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {signature.document_name || signature.contract?.work_name || 'Sin título'}
                              </h3>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {signature.signature_request_id}
                              </p>
                            </div>
                            {getStatusBadge(signature.status)}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary text-sm font-semibold">
                                  {(signature.signer_name || signature.signer_email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {signature.signer_name || signature.signer_email}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {signature.signer_email}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {signature.signature_platform || 'Email'}
                                </Badge>
                                {signature.reading_time && (
                                  <Badge variant="secondary" className="text-xs">
                                    {signature.reading_time}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {signature.signed_at 
                                  ? format(new Date(signature.signed_at), 'dd/MM/yyyy', { locale: es })
                                  : format(new Date(signature.created_at), 'dd/MM/yyyy', { locale: es })
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-card border rounded-xl">
          <div className="text-sm text-muted-foreground">
            Mostrando {signatures.length} de {totalItems} documentos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSignatures(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => fetchSignatures(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSignatures(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

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