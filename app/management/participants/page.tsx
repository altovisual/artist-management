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
import { ParticipantsTableSkeleton } from './participants-table';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    async function getParticipants() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/participants');
        if (res.ok) {
          const data = await res.json();
          setParticipants(data);
        }
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getParticipants();
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
          setParticipants(prev => prev.filter(p => p.id !== id));
        }
      });
    } else {
      setParticipants(prev => prev.filter(p => p.id !== id));
    }
  };

  if (isLoading) {
    return <ParticipantsTableSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <AnimatedTitle text="Participants" level={1} className="text-2xl font-bold" />
        <Button asChild>
          <Link href="/management/participants/new">Create Participant</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant: any) => (
            <TableRow key={participant.id} ref={el => { rowRefs.current[participant.id] = el; }}>
              <TableCell>{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell>{participant.type}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/participants/${participant.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={participant.id} resource="participants" onDelete={handleDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}