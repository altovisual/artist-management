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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { DeleteButton } from "../DeleteButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AucoSignatureButton } from '@/components/auco/AucoSignatureButton';
import { PageHeader } from '@/components/ui/design-system/page-header';
import { ContentSection } from '@/components/ui/design-system/content-section';
import { StatsGrid } from '@/components/ui/design-system/stats-grid';
import { FileText, CheckCircle, Clock, AlertTriangle, Plus, Settings, FileSignature } from 'lucide-react';

function ContractsTableSkeleton() {
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

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    async function getContracts() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/contracts');
        if (res.ok) {
          const data = await res.json();
          setContracts(data);
        }
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getContracts();
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
          setContracts(prev => prev.filter(c => c.id !== id));
        }
      });
    } else {
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  // Calculate stats
  const signedCount = contracts.filter(c => c.status === 'signed').length;
  const pendingCount = contracts.filter(c => c.status === 'pending').length;
  const draftCount = contracts.filter(c => c.status === 'draft').length;
  const totalCount = contracts.length;

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Contracts',
      value: totalCount.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All contracts'
    },
    {
      title: 'Signed',
      value: signedCount.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Completed contracts'
    },
    {
      title: 'Pending',
      value: pendingCount.toString(),
      change: pendingCount > 0 ? `${pendingCount} waiting` : 'All signed',
      changeType: pendingCount > 0 ? 'neutral' as const : 'positive' as const,
      icon: Clock,
      description: 'Awaiting signatures'
    },
    {
      title: 'Drafts',
      value: draftCount.toString(),
      change: draftCount > 0 ? 'Needs review' : 'All finalized',
      changeType: draftCount > 0 ? 'neutral' as const : 'positive' as const,
      icon: AlertTriangle,
      description: 'Draft contracts'
    }
  ];

  if (isLoading) {
    return <ContractsTableSkeleton />;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <PageHeader
        title="Contract Management"
        description="Manage contracts, signatures and legal documents"
        avatar={{
          src: '/placeholder.svg',
          fallback: 'C'
        }}
        badge={{
          text: `${totalCount} Contracts`,
          variant: 'default'
        }}
        actions={[
          {
            label: 'Settings',
            href: '/management/settings',
            variant: 'outline',
            icon: Settings
          },
          {
            label: 'Create Contract',
            href: '/management/contracts/new',
            variant: 'default',
            icon: Plus
          }
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Contracts Table Section */}
      <ContentSection
        title="All Contracts"
        description={`${totalCount} contracts found`}
        icon={FileSignature}
        actions={[
          {
            label: 'Export CSV',
            href: '#',
            variant: 'outline',
            icon: Settings
          }
        ]}
      >
        {contracts.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileSignature className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first contract to get started
              </p>
              <Button asChild>
                <Link href="/management/contracts/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Contract
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold">Work</TableHead>
                      <TableHead className="font-semibold">Template</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract: any) => (
                      <TableRow 
                        key={contract.id} 
                        ref={el => { rowRefs.current[contract.id] = el; }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileSignature className="w-4 h-4 text-primary" />
                            </div>
                            {contract.work_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {contract.template_type} v{contract.template_version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            contract.status === 'signed' ? 'default' :
                            contract.status === 'pending' ? 'secondary' :
                            contract.status === 'draft' ? 'outline' : 'destructive'
                          }>
                            {contract.status === 'signed' && '✅ '}
                            {contract.status === 'pending' && '⏳ '}
                            {contract.status === 'draft' && '📝 '}
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <AucoSignatureButton 
                              contractId={contract.id} 
                              participants={contract.participants} 
                              workName={contract.work_name}
                            />
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/management/contracts/${contract.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/management/contracts/${contract.id}/generate`}>
                                Generate
                              </Link>
                            </Button>
                            <DeleteButton 
                              id={contract.id} 
                              resource="contracts" 
                              onDelete={handleDelete} 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </ContentSection>
    </div>
  );
}
