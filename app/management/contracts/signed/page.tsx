'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedTitle } from '@/components/animated-title';
import { Skeleton } from "@/components/ui/skeleton";

function SignedContractsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><div className="flex space-x-2"><Skeleton className="h-8 w-16" /></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SignedContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getSignedContracts() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/contracts/signed');
        if (res.ok) {
          const data = await res.json();
          setContracts(data);
        }
      } catch (error) {
        console.error('Failed to fetch signed contracts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getSignedContracts();
  }, []);

  if (isLoading) {
    return <SignedContractsTableSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <AnimatedTitle text="Signed Contracts" level={1} className="text-2xl font-bold" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Signing Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract: any) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.project_name}</TableCell>
              <TableCell>{new Date(contract.signed_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button asChild variant="outline" size="sm">
                  <a href={contract.final_contract_pdf_url} target="_blank" rel="noopener noreferrer">View</a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
