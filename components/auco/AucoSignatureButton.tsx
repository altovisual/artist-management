
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AucoSDK } from 'auco-sdk-integration';

interface AucoSignatureButtonProps {
  contractId: string;
  participants: { id: string; role: string; percentage?: number }[];
  workName: string;
}

export function AucoSignatureButton({ contractId, participants, workName }: AucoSignatureButtonProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [unmountAuco, setUnmountAuco] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (unmountAuco) {
        unmountAuco();
      }
    };
  }, [unmountAuco]);

  async function handleSignature() {
    setIsSigning(true);

    try {
      // 1) Llamar al backend para iniciar la sesión de firma
      const response = await fetch('/api/auco/start-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        let detailMsg = 'Error desconocido';
        try {
          const err = await response.json();
          detailMsg = err?.details || err?.error || JSON.stringify(err);
          console.error('❌ Start-signature error:', {
            status: response.status,
            statusText: response.statusText,
            error: err,
            contractId,
            participants: participants.length
          });
        } catch (_) {
          try { 
            detailMsg = await response.text(); 
            console.error('❌ Start-signature text error:', detailMsg);
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

      // 2) Inicia el SDK de Auco con el código de sesión
      const sdkEnv = process.env.NEXT_PUBLIC_AUCO_ENV === 'PROD' ? 'PROD' : 'DEV';
      const unmount = AucoSDK({
        sdkType: 'sign', // <-- Usamos el tipo 'sign'
        iframeId: 'auco-sdk-signature-container',
        language: 'es',
        env: sdkEnv,
        sdkData: {
          document: session_code, // <-- Le pasamos el código de la sesión
          signFlow: 'document',
          uxOptions: {
            primaryColor: "#3B82F6",
            alternateColor: "#FFFFFF",
          },
        },
        events: {
          onSDKReady: () => console.log('Auco Signature SDK is ready.'),
          onSDKClose: () => {
            console.log('Auco Signature flow closed.');
            setIsSigning(false);
            try { unmount(); } catch {}
            setUnmountAuco(null);
          }
        }
      });
      setUnmountAuco(() => unmount);

    } catch (error) {
      console.error("Error durante el proceso de firma de Auco:", error);
      alert(String(error instanceof Error ? error.message : error));
      setIsSigning(false);
    }
  }

  return (
    <div>
      <Button onClick={handleSignature} disabled={isSigning}>
        {isSigning ? 'Preparando...' : 'Enviar a Firmar con Auco'}
      </Button>

      {isSigning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl h-5/6 relative">
            <iframe id="auco-sdk-signature-container" className="w-full h-full" />
            <Button 
              variant="ghost" 
              className="absolute top-2 right-2" 
              onClick={() => {
                if (unmountAuco) {
                  try { unmountAuco(); } catch {}
                  setUnmountAuco(null);
                }
                setIsSigning(false);
              }}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
