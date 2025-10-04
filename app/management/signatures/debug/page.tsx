'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function SignaturesDebugPage() {
  const [loading, setLoading] = useState(false);
  const [dbSignatures, setDbSignatures] = useState<any[]>([]);
  const [aucoDocuments, setAucoDocuments] = useState<any[]>([]);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDbSignatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signatures');
      if (res.ok) {
        const data = await res.json();
        setDbSignatures(data);
        console.log('📊 DB Signatures:', data);
      } else {
        const errorText = await res.text();
        setError(`Error fetching DB signatures: ${errorText}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAucoDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auco/list-documents');
      if (res.ok) {
        const data = await res.json();
        setAucoDocuments(data.documents || []);
        console.log('📄 Auco Documents:', data);
      } else {
        const errorText = await res.text();
        setError(`Error fetching Auco documents: ${errorText}`);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncFromAuco = async () => {
    setLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      const res = await fetch('/api/auco/sync-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (res.ok) {
        const result = await res.json();
        setSyncResult(result);
        console.log('✅ Sync Result:', result);
        // Refrescar datos después de sincronizar
        await fetchDbSignatures();
      } else {
        const errorText = await res.text();
        setError(`Sync failed: ${errorText}`);
      }
    } catch (err: any) {
      setError(`Sync error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Signatures Debug Panel</h1>
          <p className="text-muted-foreground">Diagnóstico y sincronización de documentos</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">{error}</pre>
          </CardContent>
        </Card>
      )}

      {/* Sync Result */}
      {syncResult && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Sincronización Completada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">{syncResult.stats?.total_documents || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nuevos</p>
                <p className="text-2xl font-bold text-green-600">{syncResult.stats?.synced_new || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actualizados</p>
                <p className="text-2xl font-bold text-blue-600">{syncResult.stats?.updated_existing || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Base de Datos</CardTitle>
            <CardDescription>Ver documentos en Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={fetchDbSignatures} 
              disabled={loading}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Cargar desde DB
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Encontrados: <Badge>{dbSignatures.length}</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auco API</CardTitle>
            <CardDescription>Ver documentos en Auco</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={fetchAucoDocuments} 
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Cargar desde Auco
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Encontrados: <Badge variant="secondary">{aucoDocuments.length}</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sincronizar</CardTitle>
            <CardDescription>Importar de Auco a DB</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={syncFromAuco} 
              disabled={loading}
              variant="default"
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar Ahora
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DB Signatures Table */}
      {dbSignatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos en Base de Datos ({dbSignatures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Documento</th>
                    <th className="p-2 text-left">Firmante</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-left">Código Auco</th>
                    <th className="p-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {dbSignatures.map((sig) => (
                    <tr key={sig.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{sig.id.slice(0, 8)}...</td>
                      <td className="p-2">{sig.document_name || sig.contract?.work_name || 'Sin título'}</td>
                      <td className="p-2">{sig.signer_email}</td>
                      <td className="p-2">
                        <Badge variant={sig.status === 'completed' ? 'default' : 'secondary'}>
                          {sig.status}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs">{sig.signature_request_id}</td>
                      <td className="p-2 text-xs">{new Date(sig.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auco Documents Table */}
      {aucoDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos en Auco ({aucoDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-left">Firmantes</th>
                    <th className="p-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {aucoDocuments.map((doc: any) => (
                    <tr key={doc.code || doc.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{doc.code || doc.id}</td>
                      <td className="p-2">{doc.name || 'Sin nombre'}</td>
                      <td className="p-2">
                        <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="p-2">{doc.signProfile?.length || 0}</td>
                      <td className="p-2 text-xs">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Cargar desde DB:</strong> Ver qué documentos tienes en Supabase</p>
          <p><strong>2. Cargar desde Auco:</strong> Ver qué documentos tienes en Auco</p>
          <p><strong>3. Sincronizar:</strong> Importar todos los documentos de Auco a tu base de datos</p>
          <p className="text-muted-foreground mt-4">
            Si ves documentos en Auco pero no en DB, usa &quot;Sincronizar Ahora&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
