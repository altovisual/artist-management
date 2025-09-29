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
import { ParticipantsTableSkeleton } from './participants-table';
import { Badge } from "@/components/ui/badge";
import { PageHeader } from '@/components/ui/design-system/page-header';
import { ContentSection } from '@/components/ui/design-system/content-section';
import { StatsGrid } from '@/components/ui/design-system/stats-grid';
import { Users, UserCheck, UserX, Clock, Plus, Settings } from 'lucide-react';

// Definimos un tipo más estricto para el participante
interface Participant {
  id: string;
  name: string;
  email: string;
  type: string;
  verification_status: 'verified' | 'pending' | 'rejected' | 'not_verified' | null;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
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

  // Calculate stats
  const verifiedCount = participants.filter(p => p.verification_status === 'verified').length;
  const pendingCount = participants.filter(p => p.verification_status === 'pending').length;
  const rejectedCount = participants.filter(p => p.verification_status === 'rejected').length;
  const totalCount = participants.length;

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Participants',
      value: totalCount.toString(),
      change: '+12',
      changeType: 'positive' as const,
      icon: Users,
      description: 'All registered participants'
    },
    {
      title: 'Verified',
      value: verifiedCount.toString(),
      change: '+8',
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'Verified participants'
    },
    {
      title: 'Pending',
      value: pendingCount.toString(),
      change: pendingCount > 0 ? `${pendingCount} waiting` : 'All clear',
      changeType: pendingCount > 0 ? 'neutral' as const : 'positive' as const,
      icon: Clock,
      description: 'Awaiting verification'
    },
    {
      title: 'Rejected',
      value: rejectedCount.toString(),
      change: rejectedCount > 0 ? 'Needs attention' : 'None',
      changeType: rejectedCount > 0 ? 'negative' as const : 'positive' as const,
      icon: UserX,
      description: 'Rejected applications'
    }
  ];

  if (isLoading) {
    return <ParticipantsTableSkeleton />;
  }

  return (
    <div className="space-y-8 p-6">
        {/* Page Header */}
        <PageHeader
          title="Participant Management"
          description="Manage and verify all participants in your system"
          avatar={{
            src: '/placeholder.svg',
            fallback: 'P'
          }}
          badge={{
            text: `${totalCount} Total`,
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
              label: 'Create Participant',
              href: '/management/participants/new',
              variant: 'default',
              icon: Plus
            }
          ]}
        />

        {/* Stats Grid */}
        <StatsGrid stats={statsData} columns={4} />

        {/* Participants Table Section */}
        <ContentSection
          title="All Participants"
          description={`${totalCount} participants found`}
          icon={Users}
          actions={[
            {
              label: 'Export CSV',
              href: '#',
              variant: 'outline',
              icon: Settings
            }
          ]}
        >
          {participants.length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No participants found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first participant
                </p>
                <Button asChild>
                  <Link href="/management/participants/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Participant
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
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((participant) => (
                        <TableRow 
                          key={participant.id} 
                          ref={el => { rowRefs.current[participant.id] = el; }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {participant.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {participant.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{participant.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {participant.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {participant.verification_status && (
                              <Badge variant={
                                participant.verification_status === 'verified' ? 'default' :
                                participant.verification_status === 'pending' ? 'secondary' :
                                participant.verification_status === 'rejected' ? 'destructive' : 'outline'
                              }>
                                {participant.verification_status === 'verified' && '✅ '}
                                {participant.verification_status === 'pending' && '⏳ '}
                                {participant.verification_status === 'rejected' && '❌ '}
                                {participant.verification_status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/management/participants/${participant.id}/edit`}>
                                  Edit
                                </Link>
                              </Button>
                              <DeleteButton 
                                id={participant.id} 
                                resource="participants" 
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