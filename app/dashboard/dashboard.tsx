'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArtistCard } from '@/components/artist-card';
import { ArtistMobileCard } from '@/components/artist-mobile-card';
import { ArtistViewSwitcher } from '@/components/ui/artist-view-switcher';
import { useIsMobile } from '@/components/ui/use-mobile';
import { PlusCircle, Eye, Edit, ImageIcon } from 'lucide-react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DbSizeCard } from '@/components/db-size-card';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from 'date-fns'
import dayjs from 'dayjs'

export function Dashboard() {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [userRole, setUserRole] = useState('');
  const isMobile = useIsMobile();
  const supabase = createClient();

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let isAdmin = false;
        if (user && user.app_metadata?.role === 'admin') {
          isAdmin = true;
          setUserRole('admin');
        }

        let query = supabase.from('artists').select('*, social_accounts(id), distribution_accounts(id), projects(*), assets(id)');

        if (user && !isAdmin) {
          query = query.eq('user_id', user.id);
        }

        const { data: fetchedArtists, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching artists:', error);
          setArtists([]);
        } else {
          const processedArtists = (fetchedArtists || []).map(artist => {
            const nextRelease = artist.projects?.sort((a:any, b:any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())[0];
            return {
              ...artist,
              assetCount: artist.assets?.length || 0,
              nextRelease: nextRelease
            }
          });
          setArtists(processedArtists);
        }
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, [supabase]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const renderDesktopView = () => {
    if (view === 'grid') {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      );
    }

    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Social</TableHead>
              <TableHead>Distrib.</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Next Release</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
                      <AvatarFallback>{(artist.name || "").split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    {artist.name}
                  </div>
                </TableCell>
                <TableCell>{artist.genre}</TableCell>
                <TableCell>{artist.country}</TableCell>
                <TableCell>{artist.social_accounts?.length || 0}</TableCell>
                <TableCell>{artist.distribution_accounts?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {artist.assetCount}
                  </div>
                </TableCell>
                <TableCell>
                  {artist.nextRelease ? (
                    <div className="text-sm">
                      <p className="font-medium">{artist.nextRelease.name}</p>
                      <p className="text-muted-foreground text-xs">({dayjs(artist.nextRelease.release_date).format('MMM D, YYYY')})</p>
                    </div>
                  ) : <span className="text-muted-foreground text-sm">N/A</span>}
                </TableCell>
                <TableCell>{format(new Date(artist.created_at), 'MM/dd/yyyy')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/artists/${artist.id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                    <Link href={`/artists/${artist.id}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artists</h1>
          <p className="text-muted-foreground">
            {userRole === 'admin' 
              ? 'Viewing all artists as an administrator.' 
              : 'Manage your artists and their profiles.'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {!isMobile && <ArtistViewSwitcher view={view} setView={setView} />}
          <Button asChild className="w-full md:w-auto">
            <Link href="/artists/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Artist
            </Link>
          </Button>
        </div>
      </div>

      {userRole === 'admin' && <DbSizeCard />}

      {artists.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No artists found</h2>
          <p className="text-muted-foreground mt-2">Get started by creating a new artist profile.</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {artists.map(artist => (
            <ArtistMobileCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        renderDesktopView()
      )}
    </div>
  );
}
