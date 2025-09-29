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
    <div className="space-y-6">
      {/* Native iPhone Header */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        
        <div className="relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">W</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  Works Management
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {totalCount} Works
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage all musical works and compositions
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
              <Link href="/management/works/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Work
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
              <h2 className="text-lg font-semibold text-foreground mb-1">All Works</h2>
              <p className="text-sm text-muted-foreground">
                {totalCount} works found
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {works.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-8 text-center">
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
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {works.map((work: any) => (
                  <div
                    key={work.id}
                    className="bg-background border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{work.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{work.type}</p>
                        </div>
                      </div>
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
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
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
