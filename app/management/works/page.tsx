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
import { PageHeader } from '@/components/ui/design-system/page-header';
import { ContentSection } from '@/components/ui/design-system/content-section';
import { StatsGrid } from '@/components/ui/design-system/stats-grid';
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Settings, Music } from 'lucide-react';

function WorksTableSkeleton() {
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

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    async function getWorks() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/works');
        if (res.ok) {
          const data = await res.json();
          setWorks(data);
        }
      } catch (error) {
        console.error('Failed to fetch works:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getWorks();
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
          setWorks(prev => prev.filter(w => w.id !== id));
        }
      });
    } else {
      setWorks(prev => prev.filter(w => w.id !== id));
    }
  };

  // Calculate stats
  const completedCount = works.filter(w => w.status === 'completed').length;
  const inProgressCount = works.filter(w => w.status === 'in_progress').length;
  const draftCount = works.filter(w => w.status === 'draft').length;
  const totalCount = works.length;

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Works',
      value: totalCount.toString(),
      change: '+5',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All musical works'
    },
    {
      title: 'Completed',
      value: completedCount.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Finished works'
    },
    {
      title: 'In Progress',
      value: inProgressCount.toString(),
      change: inProgressCount > 0 ? `${inProgressCount} active` : 'None active',
      changeType: inProgressCount > 0 ? 'neutral' as const : 'positive' as const,
      icon: Clock,
      description: 'Works in development'
    },
    {
      title: 'Drafts',
      value: draftCount.toString(),
      change: draftCount > 0 ? 'Needs attention' : 'All published',
      changeType: draftCount > 0 ? 'neutral' as const : 'positive' as const,
      icon: AlertCircle,
      description: 'Draft works'
    }
  ];

  if (isLoading) {
    return <WorksTableSkeleton />;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <PageHeader
        title="Works Management"
        description="Manage all musical works and compositions"
        avatar={{
          src: '/placeholder.svg',
          fallback: 'W'
        }}
        badge={{
          text: `${totalCount} Works`,
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
            label: 'Create Work',
            href: '/management/works/new',
            variant: 'default',
            icon: Plus
          }
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Works Table Section */}
      <ContentSection
        title="All Works"
        description={`${totalCount} works found`}
        icon={Music}
        actions={[
          {
            label: 'Export CSV',
            href: '#',
            variant: 'outline',
            icon: Settings
          }
        ]}
      >
        {works.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No works found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating your first musical work
              </p>
              <Button asChild>
                <Link href="/management/works/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work
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
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {works.map((work: any) => (
                      <TableRow 
                        key={work.id} 
                        ref={el => { rowRefs.current[work.id] = el; }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Music className="w-4 h-4 text-primary" />
                            </div>
                            {work.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {work.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            work.status === 'completed' ? 'default' :
                            work.status === 'in_progress' ? 'secondary' :
                            work.status === 'draft' ? 'outline' : 'destructive'
                          }>
                            {work.status === 'completed' && '✅ '}
                            {work.status === 'in_progress' && '⏳ '}
                            {work.status === 'draft' && '📝 '}
                            {work.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/management/works/${work.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton 
                              id={work.id} 
                              resource="works" 
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
