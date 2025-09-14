'use client';

import { useState, useEffect, useRef } from 'react';
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
import { DeleteButton } from "../DeleteButton";
import { AnimatedTitle } from '@/components/animated-title';
import { Skeleton } from "@/components/ui/skeleton";

function SignaturesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
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
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><div className="flex space-x-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    async function getSignatures() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/signatures');
        if (res.ok) {
          const data = await res.json();
          setSignatures(data);
        }
      } catch (error) {
        console.error('Failed to fetch signatures:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getSignatures();
  }, []);

  const handleDelete = (id: string) => {
    const anime = (window as any).anime;
    const row = rowRefs.current[id];
    if (row && anime) {
      anime({
        targets: row,
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        duration: 500,
        easing: 'easeOutExpo',
        complete: () => {
          setSignatures(prev => prev.filter(s => s.id !== id));
        }
      });
    } else {
      setSignatures(prev => prev.filter(s => s.id !== id));
    }
  };

  if (isLoading) {
    return <SignaturesTableSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <AnimatedTitle text="Signatures" level={1} className="text-2xl font-bold" />
        <Button asChild>
          <Link href="/management/signatures/new">Create Signature</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract</TableHead>
            <TableHead>Signer Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signatures.map((signature: any) => (
            <TableRow key={signature.id} ref={el => { rowRefs.current[signature.id] = el; }}>
              <TableCell>{signature.contract_id}</TableCell>
              <TableCell>{signature.signer_email}</TableCell>
              <TableCell>{signature.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/signatures/${signature.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={signature.id} resource="signatures" onDelete={handleDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
