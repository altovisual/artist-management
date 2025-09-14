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

  if (isLoading) {
    return <WorksTableSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <AnimatedTitle text="Works" level={1} className="text-2xl font-bold" />
        <Button asChild>
          <Link href="/management/works/new">Create Work</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {works.map((work: any) => (
            <TableRow key={work.id} ref={el => { rowRefs.current[work.id] = el; }}>
              <TableCell>{work.name}</TableCell>
              <TableCell>{work.type}</TableCell>
              <TableCell>{work.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/works/${work.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={work.id} resource="works" onDelete={handleDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
