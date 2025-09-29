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
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <PageHeader
        title="Template Management"
        description="Manage document templates and legal forms"
        avatar={{
          src: '/placeholder.svg',
          fallback: 'T'
        }}
        badge={{
          text: `${totalCount} Templates`,
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
            label: 'Create Template',
            href: '/management/templates/new',
            variant: 'default',
            icon: Plus
          }
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Templates Table Section */}
      <ContentSection
        title="All Templates"
        description={`${totalCount} templates found`}
        icon={FileText}
        actions={[
          {
            label: 'Export CSV',
            href: '#',
            variant: 'outline',
            icon: Settings
          }
        ]}
      >
        {templates.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-12 text-center">
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
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
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
            </CardContent>
          </Card>
        )}
      </ContentSection>
    </div>
  );
}
