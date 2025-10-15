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
  const sentCount = contracts.filter(c => c.status === 'sent').length;
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
      title: 'Enviados',
      value: sentCount.toString(),
      change: sentCount > 0 ? `${sentCount} waiting` : 'All signed',
      changeType: sentCount > 0 ? 'neutral' as const : 'positive' as const,
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
    <div className="space-y-6">
      {/* Native iPhone Header */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        
        <div className="relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">C</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  Contract Management
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {totalCount} Contracts
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage contracts, signatures and legal documents
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href="/management/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/management/contracts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Native iPhone Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
                stat.changeType === 'neutral' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-red-100 dark:bg-red-900/30'
              }`}>
                <stat.icon className={`h-5 w-5 ${
                  stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                  stat.changeType === 'neutral' ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
            <Badge 
              variant={stat.changeType === 'positive' ? 'secondary' : 'outline'} 
              className="text-xs"
            >
              {stat.change}
            </Badge>
          </div>
        ))}
      </div>

      {/* Native iPhone Content Section */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">All Contracts</h2>
              <p className="text-sm text-muted-foreground">
                {totalCount} contracts found
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {contracts.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-8 text-center">
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
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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
                            contract.status === 'sent' ? 'secondary' :
                            contract.status === 'draft' ? 'outline' : 'destructive'
                          }>
                            {contract.status === 'signed' && '✅ '}
                            {contract.status === 'sent' && '📤 '}
                            {contract.status === 'draft' && '📝 '}
                            {contract.status === 'expired' && '⏰ '}
                            {contract.status === 'archived' && '📦 '}
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

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {contracts.map((contract: any) => (
                  <div
                    key={contract.id}
                    className="bg-background border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FileSignature className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{contract.work_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {contract.template_type} v{contract.template_version}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        contract.status === 'signed' ? 'default' :
                        contract.status === 'sent' ? 'secondary' :
                        contract.status === 'draft' ? 'outline' : 'destructive'
                      }>
                        {contract.status === 'signed' && '✅ '}
                        {contract.status === 'sent' && '📤 '}
                        {contract.status === 'draft' && '📝 '}
                        {contract.status === 'expired' && '⏰ '}
                        {contract.status === 'archived' && '📦 '}
                        {contract.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <AucoSignatureButton 
                        contractId={contract.id} 
                        participants={contract.participants} 
                        workName={contract.work_name}
                      />
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/management/contracts/${contract.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
