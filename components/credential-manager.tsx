'use client'

import { useState } from 'react';
import { decrypt } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface CredentialManagerProps {
  accountId: string;
  tableName: 'social_accounts' | 'distribution_accounts';
}

export function CredentialManager({ accountId, tableName }: CredentialManagerProps) {
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleView = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('password')
        .eq('id', accountId)
        .single();

      if (error || !data || !data.password) {
        throw new Error('No credential found for this account.');
      }

      // Check if the password is in the new JSON format
      try {
        const { encrypted, iv } = JSON.parse(data.password);
        const decrypted = await decrypt(encrypted, iv);
        setDecryptedPassword(decrypted);
      } catch (e) {
        // This might be an old password that isn't a JSON object.
        // Or it might be unencrypted.
        // For this app, we'll assume if it's not JSON, it's not viewable.
        throw new Error('Credential is not in a viewable format.');
      }

      // Automatically hide the password after 15 seconds
      setTimeout(() => {
        setDecryptedPassword(null);
      }, 15000);

    } catch (error: any) {
      toast({ title: 'Error Viewing Password', description: error.message, variant: 'destructive' });
      setDecryptedPassword(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (decryptedPassword) {
    return (
      <div className="flex items-center gap-2">
        <Input value={decryptedPassword} readOnly className="font-mono" />
        <Button variant="outline" size="icon" onClick={() => setDecryptedPassword(null)}>
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="sm" className="w-full" onClick={handleView} disabled={isLoading}>
        <Eye className="h-4 w-4 mr-2" />
        View Saved Password
    </Button>
  );
}