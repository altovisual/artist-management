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
    <div className="space-y-6">
      {/* Native iPhone Header */}
      <div className="bg-card border rounded-xl shadow-sm backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
        
        <div className="relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">P</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">
                  Participant Management
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {totalCount} Total
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage and verify all participants in your system
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
              <Link href="/management/participants/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Participant
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
              <h2 className="text-lg font-semibold text-foreground mb-1">All Participants</h2>
              <p className="text-sm text-muted-foreground">
                {totalCount} participants found
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {participants.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-8 text-center">
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
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-background border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{participant.name}</h3>
                          <p className="text-xs text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
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
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize text-xs">
                        {participant.type}
                      </Badge>
                      <div className="flex gap-2">
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