import { useState, useEffect } from 'react';

interface ContractStatus {
  id: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'archived';
  signatures: {
    id: string;
    signer_email: string;
    status: 'pending' | 'sent' | 'signed' | 'expired';
    signed_at?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export function useContractStatus(contractId: string) {
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!contractId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch contract status');
      }
      
      const data = await response.json();
      setContractStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [contractId]);

  return {
    contractStatus,
    loading,
    error,
    refetch: fetchStatus
  };
}
