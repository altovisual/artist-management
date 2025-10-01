"use client";

import { useContractStatus } from '@/hooks/use-contract-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Mail,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractStatusCardProps {
  contractId: string;
  workName: string;
}

const statusConfig = {
  draft: { 
    label: 'Borrador', 
    color: 'bg-gray-100 text-gray-800', 
    icon: FileText 
  },
  sent: { 
    label: 'Enviado', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Mail 
  },
  signed: { 
    label: 'Firmado', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-red-100 text-red-800', 
    icon: AlertCircle 
  },
  archived: { 
    label: 'Archivado', 
    color: 'bg-gray-100 text-gray-600', 
    icon: FileText 
  }
};

const signatureStatusConfig = {
  pending: { 
    label: 'Pendiente', 
    color: 'bg-yellow-100 text-yellow-800' 
  },
  sent: { 
    label: 'Enviado', 
    color: 'bg-blue-100 text-blue-800' 
  },
  signed: { 
    label: 'Firmado', 
    color: 'bg-green-100 text-green-800' 
  },
  completed: { 
    label: 'Completado', 
    color: 'bg-green-100 text-green-800' 
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-red-100 text-red-800' 
  },
  failed: { 
    label: 'Fallido', 
    color: 'bg-red-100 text-red-800' 
  }
};

export function ContractStatusCard({ contractId, workName }: ContractStatusCardProps) {
  const { contractStatus, loading, error, refetch } = useContractStatus(contractId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Cargando estado del contrato...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Error al cargar estado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!contractStatus) {
    return null;
  }

  const statusInfo = statusConfig[contractStatus.status];
  const StatusIcon = statusInfo.icon;
  const signedCount = contractStatus.signatures.filter(s => s.status === 'signed').length;
  const totalSignatures = contractStatus.signatures.length;
  const completionPercentage = totalSignatures > 0 ? (signedCount / totalSignatures) * 100 : 0;

  return (
    <Card className="touch-manipulation">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <StatusIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-base font-medium truncate">Estado del Contrato</span>
          </div>
          <Button onClick={refetch} variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] touch-manipulation">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado general - Optimizado para móviles */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Estado actual</p>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-gray-600 mb-1">Progreso</p>
            <p className="text-lg font-bold">
              {signedCount}/{totalSignatures}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        {totalSignatures > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Firmas completadas</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Información del contrato - Optimizado para móviles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="min-w-0">
            <p className="text-gray-600 mb-1">Contrato</p>
            <p className="font-medium break-words">{workName}</p>
          </div>
          <div className="min-w-0">
            <p className="text-gray-600 mb-1">Creado</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(contractStatus.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>
        </div>

        {/* Lista de firmantes */}
        {contractStatus.signatures.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Firmantes ({contractStatus.signatures.length})
            </h4>
            <div className="space-y-3">
              {contractStatus.signatures.map((signature) => {
                const sigStatus = signatureStatusConfig[signature.status] || signatureStatusConfig.pending;
                return (
                  <div key={signature.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg touch-manipulation">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium break-words">{signature.signer_email}</p>
                      {signature.signed_at && (
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>Firmado {formatDistanceToNow(new Date(signature.signed_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}</span>
                        </p>
                      )}
                    </div>
                    <Badge className={`${sigStatus.color} flex-shrink-0`}>
                      {sigStatus.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Acciones - Optimizado para móviles */}
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0 pt-2">
          <Button 
            onClick={() => window.location.href = '/management/signatures'}
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px] touch-manipulation"
          >
            Ver Dashboard
          </Button>
          {contractStatus.status === 'signed' && (
            <Button 
              onClick={() => window.open(`/api/contracts/${contractId}/download`, '_blank')}
              variant="outline"
              size="sm"
              className="flex-1 min-h-[44px] touch-manipulation"
            >
              Descargar PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
