'use client'

import { useState } from 'react';
import { useVault } from './vault-provider';
import { encrypt, decrypt } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, EyeOff, Save } from 'lucide-react';

interface CredentialManagerProps {
  accountId: string;
  tableName: 'social_accounts' | 'distribution_accounts';
  onPasswordSave: (password: string) => void;
}

export function CredentialManager({ accountId, tableName, onPasswordSave }: CredentialManagerProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { promptForPassword } = useVault();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSave = async () => {
    if (!passwordInput) {
      toast({ title: 'Error', description: 'Password cannot be empty.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const masterPassword = await promptForPassword();
      if (!masterPassword) {
        setIsLoading(false);
        return; // User cancelled
      }

      const { encrypted, iv } = await encrypt(passwordInput, masterPassword);
      const passwordData = JSON.stringify({ encrypted, iv });

      onPasswordSave(passwordData);

      toast({ title: 'Success', description: 'Password ready to be saved.' });
      setPasswordInput('');
    } catch (error: any) {
      toast({ title: 'Error Encrypting Password', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    setIsLoading(true);
    try {
      const masterPassword = await promptForPassword();
      if (!masterPassword) {
        setIsLoading(false);
        return; // User cancelled
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('password')
        .eq('id', accountId)
        .single();

      if (error || !data || !data.password) {
        throw new Error('No credential found for this account.');
      }

      const { encrypted, iv } = JSON.parse(data.password);

      const decrypted = await decrypt(encrypted, iv, masterPassword);
      setDecryptedPassword(decrypted);

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
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Input
            type="password"
            placeholder="Enter password to save..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            />
            <Button variant="outline" size="icon" onClick={handleSave} disabled={isLoading || !passwordInput}>
                <Save className="h-4 w-4" />
            </Button>
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={handleView} disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            View Saved Password
        </Button>
    </div>
  );
}
