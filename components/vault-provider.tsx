"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';

interface VaultContextType {
  masterPassword: string | null;
  isLocked: boolean;
  unlockVault: (password: string) => void;
  lockVault: () => void;
  promptForPassword: () => Promise<string | null>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordPromise, setPasswordPromise] = useState<{ resolve: (password: string | null) => void } | null>(null);
  const [inputPassword, setInputPassword] = useState("");
  const { toast } = useToast();

  const isLocked = masterPassword === null;

  const unlockVault = useCallback((password: string) => {
    // A simple check. In a real app, you might try to decrypt a test value.
    if (password) {
      setMasterPassword(password);
      toast({ title: "Vault Unlocked", description: "You can now view and manage credentials." });
      return true;
    } 
    toast({ title: "Error", description: "Password cannot be empty.", variant: "destructive" });
    return false;
  }, [toast]);

  const lockVault = useCallback(() => {
    setMasterPassword(null);
    toast({ title: "Vault Locked", description: "Credentials are now secure." });
  }, [toast]);

  const promptForPassword = useCallback((): Promise<string | null> => {
    if (!isLocked) {
        return Promise.resolve(masterPassword);
    }
    setInputPassword("");
    setIsModalOpen(true);
    return new Promise((resolve) => {
      setPasswordPromise({ resolve });
    });
  }, [isLocked, masterPassword]);

  const handleModalSubmit = () => {
    if (unlockVault(inputPassword)) {
        passwordPromise?.resolve(inputPassword);
        setIsModalOpen(false);
        setPasswordPromise(null);
    }
  };

  const handleModalCancel = () => {
    passwordPromise?.resolve(null);
    setIsModalOpen(false);
    setPasswordPromise(null);
  };

  const value = {
    masterPassword,
    isLocked,
    unlockVault,
    lockVault,
    promptForPassword,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onEscapeKeyDown={handleModalCancel} onPointerDownOutside={handleModalCancel}>
          <DialogHeader>
            <DialogTitle>Unlock Vault</DialogTitle>
            <DialogDescription>
              Enter your master password to access credentials. This password is not stored anywhere and is required for each session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="master-password">Master Password</Label>
            <Input
              id="master-password"
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleModalCancel}>Cancel</Button>
            <Button onClick={handleModalSubmit}>Unlock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VaultContext.Provider>
  );
}
