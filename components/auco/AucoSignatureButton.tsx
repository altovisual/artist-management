
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, FileText, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { ContractStatusCard } from '@/components/contracts/ContractStatusCard';

interface AucoSignatureButtonProps {
  contractId: string;
  participants: { id: string; role: string; percentage?: number }[];
  workName: string;
}

type SignatureStatus = 'idle' | 'sending' | 'success' | 'error';

export function AucoSignatureButton({ contractId, participants, workName }: AucoSignatureButtonProps) {
  const [status, setStatus] = useState<SignatureStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignature() {
    setStatus('sending');
    setErrorMessage(null);

    try {
      // Llamar al backend para iniciar la sesión de firma
      const response = await fetch('/api/auco/start-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        let detailMsg = 'Error desconocido';
        let errorData: any = null;
        
        try {
          errorData = await response.json();
          detailMsg = errorData?.details || errorData?.error || JSON.stringify(errorData);
        } catch (_) {
          try { 
            detailMsg = await response.text(); 
          } catch {}
        }

        // Si es 404, probablemente el documento no existe en Auco
        if (response.status === 404) {
          throw new Error(`El documento no se encontró en Auco. Esto puede pasar si el documento fue eliminado o si hay un problema de sincronización. Intenta crear un nuevo contrato.`);
        }
        
        throw new Error(`El backend falló al crear la sesión de firma. Status: ${response.status} - ${detailMsg}`);
      }

      const { session_code } = await response.json();
      if (!session_code) {
        throw new Error('Respuesta inválida del backend: falta session_code.');
      }

      // Éxito - documento enviado
      setStatus('success');

    } catch (error) {
      console.error("Error durante el proceso de firma de Auco:", error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setStatus('error');
    }
  }

  const resetStatus = () => {
    setStatus('idle');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Botón principal - Optimizado para iOS */}
      <Button 
        onClick={handleSignature}
        disabled={status === 'sending'}
        className="w-full min-h-[48px] text-base font-medium touch-manipulation"
        size="lg"
      >
        {status === 'sending' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {status === 'sending' ? 'Enviando a Auco...' : 'Enviar a Firmar con Auco'}
      </Button>

      {/* Estados del proceso - Optimizado para móviles */}
      {status === 'sending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 touch-manipulation">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-blue-900 text-base">Procesando documento...</h4>
              <p className="text-sm text-blue-700 mt-1">Generando PDF y enviando a Auco</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-blue-700">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="min-w-0 break-words">Generando contrato: {workName}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-blue-700">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Preparando para {participants.length} firmante(s)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-blue-700">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>Configurando notificaciones por email</span>
            </div>
          </div>
        </div>
      )}

      {/* Estado de éxito - Optimizado para móviles */}
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 touch-manipulation">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-green-900 text-base">¡Documento enviado exitosamente!</h4>
              <p className="text-sm text-green-700 mt-1 leading-relaxed">
                El contrato ha sido enviado a Auco y los firmantes recibirán un correo electrónico con las instrucciones.
              </p>
              
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-green-700">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0 break-words">Contrato: {workName}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-green-700">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{participants.length} firmante(s) notificado(s)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-green-700">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Estado: Enviado para firma</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
                <Button 
                  onClick={resetStatus}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] touch-manipulation"
                >
                  Enviar Otro
                </Button>
                <Button 
                  onClick={() => window.location.href = '/management/signatures'}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] touch-manipulation"
                >
                  Ver Dashboard de Firmas
                </Button>
              </div>
            </div>
          </div>
          
          {/* Estado del contrato en tiempo real */}
          <div className="mt-4">
            <ContractStatusCard contractId={contractId} workName={workName} />
          </div>
        </div>
      )}

      {/* Estado de error */}
      {status === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Error al enviar documento</h4>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              
              <div className="mt-4">
                <Button 
                  onClick={resetStatus}
                  variant="outline"
                  size="sm"
                >
                  Intentar de Nuevo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
