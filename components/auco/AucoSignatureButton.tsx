
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
      // 1. Llama al backend para crear la sesión de firma de forma segura
      const response = await fetch('/api/auco/start-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, participants, workName }),
      });

      if (!response.ok) {
        throw new Error('El backend falló al crear la sesión de firma.');
      }

      const { session_code } = await response.json();

      if (!session_code) {
        throw new Error('El backend no devolvió un código de sesión.');
      }

      // 2. Inicia el SDK de Auco con el código de sesión
      setTimeout(() => {
        const unmount = AucoSDK({
          sdkType: 'sign', // <-- Usamos el tipo 'sign'
          iframeId: 'auco-sdk-signature-container',
          language: 'es',
          env: 'DEV',
          sdkData: {
            document: session_code, // <-- Le pasamos el código de la sesión
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
              if (unmount) unmount();
              setUnmountAuco(null);
            }
          }
        });
        setUnmountAuco(() => unmount);
      }, 0);

    } catch (error) {
      console.error("Error during Auco signature process:", error);
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
            <div id="auco-sdk-signature-container" className="w-full h-full"></div>
            <Button 
              variant="ghost" 
              className="absolute top-2 right-2" 
              onClick={() => unmountAuco && unmountAuco()}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
