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

  if (isLoading) {
    return <TemplatesTableSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <AnimatedTitle text="Templates" level={1} className="text-2xl font-bold" />
        <Button asChild>
          <Link href="/management/templates/new">Create Template</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template: any) => (
            <TableRow key={template.id} ref={el => { rowRefs.current[template.id] = el; }}>
              <TableCell>{template.type}</TableCell>
              <TableCell>{template.language}</TableCell>
              <TableCell>{template.version}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/templates/${template.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={template.id} resource="templates" onDelete={handleDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
