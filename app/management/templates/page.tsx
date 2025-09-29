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
import { FileText, Globe, Code, Plus, Settings, Layout } from 'lucide-react';

function TemplatesTableSkeleton() {
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    async function getTemplates() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getTemplates();
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
          setTemplates(prev => prev.filter(t => t.id !== id));
        }
      });
    } else {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Calculate stats
  const contractTemplates = templates.filter(t => t.type === 'contract').length;
  const agreementTemplates = templates.filter(t => t.type === 'agreement').length;
  const englishTemplates = templates.filter(t => t.language === 'english').length;
  const totalCount = templates.length;

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Templates',
      value: totalCount.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All document templates'
    },
    {
      title: 'Contract Templates',
      value: contractTemplates.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Code,
      description: 'Contract templates'
    },
    {
      title: 'Agreement Templates',
      value: agreementTemplates.toString(),
      change: 'stable',
      changeType: 'neutral' as const,
      icon: Layout,
      description: 'Agreement templates'
    },
    {
      title: 'Languages',
      value: new Set(templates.map(t => t.language)).size.toString(),
      change: 'Multi-lang',
      changeType: 'positive' as const,
      icon: Globe,
      description: 'Available languages'
    }
  ];

  if (isLoading) {
    return <TemplatesTableSkeleton />;
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
                <span className="text-primary font-semibold text-lg">T</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  Template Management
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {totalCount} Templates
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage document templates and legal forms
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
              <Link href="/management/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
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
              <h2 className="text-lg font-semibold text-foreground mb-1">All Templates</h2>
              <p className="text-sm text-muted-foreground">
                {totalCount} templates found
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {templates.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first document template
              </p>
              <Button asChild>
                <Link href="/management/templates/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
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
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Language</TableHead>
                      <TableHead className="font-semibold">Version</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template: any) => (
                      <TableRow 
                        key={template.id} 
                        ref={el => { rowRefs.current[template.id] = el; }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {template.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{template.language}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            v{template.version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/management/templates/${template.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton 
                              id={template.id} 
                              resource="templates" 
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
                {templates.map((template: any) => (
                  <div
                    key={template.id}
                    className="bg-background border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Badge variant="outline" className="capitalize mb-1">
                            {template.type}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {template.language}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        v{template.version}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/management/templates/${template.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <DeleteButton 
                        id={template.id} 
                        resource="templates" 
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
