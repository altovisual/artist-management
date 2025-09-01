"use client"

import { useState } from 'react';
import { encrypt, decrypt } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, EyeOff, Save } from 'lucide-react';

interface SocialCredentialManagerProps {
  socialAccountId: string;
  userId: string;
}

export function SocialCredentialManager({ socialAccountId, userId }: SocialCredentialManagerProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSave = async () => {
    if (!passwordInput) {
      toast({ title: 'Error', description: 'Password cannot be empty.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { encrypted, iv } = await encrypt(passwordInput);

      const { error } = await supabase.from('social_credentials').upsert({
        social_account_id: socialAccountId,
        user_id: userId,
        encrypted_password: encrypted,
        iv: iv,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Password saved securely.' });
      setPasswordInput('');
    } catch (error: any) {
      toast({ title: 'Error Saving Password', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_credentials')
        .select('encrypted_password, iv')
        .eq('social_account_id', socialAccountId)
        .single();

      if (error || !data) {
        throw new Error('No credential found for this account.');
      }

      const decrypted = await decrypt(data.encrypted_password, data.iv);
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