'use client';

import { useState, useEffect } from 'react';
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
            <TableRow key={participant.id}>
              <TableCell>{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell>{participant.type}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/participants/${participant.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={participant.id} resource="participants" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}