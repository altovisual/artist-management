'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArtistCard } from '@/components/artist-card';
import { ArtistMobileCard } from '@/components/artist-mobile-card';
import { ArtistViewSwitcher } from '@/components/ui/artist-view-switcher';
import { useIsMobile } from '@/components/ui/use-mobile';
import { PlusCircle, Eye, Edit, ImageIcon, Trash2 } from 'lucide-react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DbSizeCard } from '@/components/db-size-card';
import { AnimatedTitle } from '@/components/animated-title';
import { GuidedTour } from '@/components/onboarding/guided-tour';
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from 'date-fns'
import dayjs from 'dayjs'

// New modern dashboard components
import { HeroSection } from '@/components/dashboard/hero-section';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { CompactWorkspaceWidget } from '@/components/dashboard/compact-workspace-widget';
import { useCompactWorkspace } from '@/hooks/use-compact-workspace';

export function Dashboard() {
  const [artists, setArtists] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState<any>(null);
  const [deletingArtistId, setDeletingArtistId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const isMobile = useIsMobile();
  const supabase = createClient();
  
  // Compact workspace hook con datos reales
  const {
    notifications,
    projects,
    teamMembers,
    currentUser,
    teamStats,
    isLoading: workspaceLoading,
    error: workspaceError,
    markNotificationAsRead,
    toggleProjectFavorite,
    createProject,
    updateMemberOnlineStatus,
    updateMemberRole,
    inviteMember,
    removeMember,
    refreshData
  } = useCompactWorkspace();

  // Detectar si debe iniciar el tour guiado
  useEffect(() => {
    const shouldStartTour = localStorage.getItem("start_guided_tour");
    if (shouldStartTour === "true") {
      localStorage.removeItem("start_guided_tour");
      // Esperar un poco para que el dashboard cargue
      setTimeout(() => {
        setShowTour(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        let isAdmin = false;
        if (user && user.app_metadata?.role === 'admin') {
          isAdmin = true;
          setUserRole('admin');
        }

        // Fetch artists with related data
        let artistQuery = supabase.from('artists').select('*, social_accounts(id), distribution_accounts(id), projects(*), assets(id)');
        if (user && !isAdmin) {
          artistQuery = artistQuery.eq('user_id', user.id);
        }

        const { data: fetchedArtists, error: artistError } = await artistQuery.order('created_at', { ascending: false });

        if (artistError) {
          console.error('Error fetching artists:', artistError);
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

        // Fetch additional dashboard data in parallel
        const promises = [];

        // Fetch transactions for revenue calculation
        let transactionQuery = supabase.from('transactions').select('amount, type, transaction_date, created_at');
        if (user && !isAdmin) {
          transactionQuery = transactionQuery.eq('user_id', user.id);
        }
        promises.push(transactionQuery);

        // Fetch contracts for activity timeline
        let contractQuery = supabase.from('contracts').select('*, signatures(*)');
        if (user && !isAdmin) {
          contractQuery = contractQuery.eq('user_id', user.id);
        }
        promises.push(contractQuery.order('created_at', { ascending: false }).limit(10));

        const [transactionResult, contractResult] = await Promise.all(promises);

        // Store additional data for metrics calculation
        setTransactions(transactionResult.data || []);
        setContracts(contractResult.data || []);

      } catch (error) {
        console.error('An unexpected error occurred:', error);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const handleDeleteArtist = async (artistId: string, artistName: string) => {
    setDeletingArtistId(artistId);
    try {
      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artist');
      }

      // Actualizar la lista de artistas localmente
      setArtists(prevArtists => prevArtists.filter(a => a.id !== artistId));
      
      toast.success('Artista eliminado', {
        description: `${artistName} ha sido eliminado correctamente.`
      });
    } catch (error: any) {
      console.error('Error deleting artist:', error);
      toast.error('Error al eliminar', {
        description: error.message || 'No se pudo eliminar el artista.'
      });
    } finally {
      setDeletingArtistId(null);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const renderDesktopView = () => {
    if (view === 'grid') {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artists.map(artist => (
            <ArtistCard 
              key={artist.id} 
              artist={artist}
              onDelete={(artistId) => {
                setArtists(prevArtists => prevArtists.filter(a => a.id !== artistId));
              }}
            />
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={deletingArtistId === artist.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader className="space-y-4">
                          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-destructive/10">
                            <Trash2 className="h-6 w-6 text-destructive" />
                          </div>
                          <AlertDialogTitle className="text-center text-xl">
                            ¿Eliminar artista?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-center">
                            <div className="space-y-2">
                              <p>Esta acción no se puede deshacer.</p>
                              <p className="font-medium text-foreground">
                                Se eliminará permanentemente el perfil de <span className="font-bold">{artist.name}</span> y todos sus datos asociados.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                          <AlertDialogCancel className="w-full sm:w-auto">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteArtist(artist.id, artist.name)}
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                            disabled={deletingArtistId === artist.id}
                          >
                            {deletingArtistId === artist.id ? "Eliminando..." : "Sí, eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  // Calculate metrics for the dashboard with real data
  const totalArtists = artists.length;
  const activeProjects = artists.reduce((acc, artist) => acc + (artist.projects?.length || 0), 0);
  const upcomingReleases = artists.reduce((acc, artist) => {
    const upcoming = artist.projects?.filter((project: any) => 
      new Date(project.release_date) > new Date()
    ).length || 0;
    return acc + upcoming;
  }, 0);

  // Calculate monthly revenue from transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyTransactions.reduce((acc, transaction) => {
    return acc + (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
  }, 0);

  // Calculate growth rate (compare with previous month)
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getMonth() === previousMonth && 
           transactionDate.getFullYear() === previousYear;
  });

  const previousMonthRevenue = previousMonthTransactions.reduce((acc, transaction) => {
    return acc + (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
  }, 0);

  const growthRate = previousMonthRevenue > 0 
    ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : monthlyRevenue > 0 ? 100 : 0;

  const metricsData = {
    totalArtists,
    activeProjects,
    monthlyRevenue,
    growthRate,
    upcomingReleases,
    totalContracts: contracts.length
  };

  // Generate real activity data from database
  const recentActivities = [
    // Recent artists
    ...artists.slice(0, 3).map(artist => ({
      id: `artist-${artist.id}`,
      type: 'artist_created' as const,
      title: 'New artist profile created',
      description: `${artist.name} profile has been successfully created`,
      timestamp: new Date(artist.created_at),
      user: { name: user?.user_metadata?.full_name || 'User', avatar: user?.user_metadata?.avatar_url },
      metadata: { artistName: artist.name }
    })),
    
    // Recent projects
    ...artists.flatMap(artist => 
      (artist.projects || []).slice(0, 2).map((project: any) => ({
        id: `project-${project.id}`,
        type: 'project_added' as const,
        title: 'New project added',
        description: `${project.name} project started`,
        timestamp: new Date(project.created_at),
        user: { name: user?.user_metadata?.full_name || 'User', avatar: user?.user_metadata?.avatar_url },
        metadata: { projectName: project.name, artistName: artist.name }
      }))
    ).slice(0, 2),
    
    // Recent contracts
    ...contracts.slice(0, 2).map(contract => ({
      id: `contract-${contract.id}`,
      type: 'contract_signed' as const,
      title: 'Contract created',
      description: `${contract.contract_type || 'Contract'} agreement created`,
      timestamp: new Date(contract.created_at),
      user: { name: user?.user_metadata?.full_name || 'User', avatar: user?.user_metadata?.avatar_url },
      metadata: { contractType: contract.contract_type || 'Contract' }
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <>
      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6">
        {/* Hero Section */}
        <div id="dashboard-header">
        <HeroSection 
          userName={user?.user_metadata?.full_name}
          userRole={userRole}
          totalArtists={totalArtists}
          activeProjects={activeProjects}
        />
      </div>

      {/* Metrics Grid */}
      <MetricsGrid data={metricsData} />

      {/* Main Content Grid - Mobile: Stack vertically, Desktop: Side by side */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {/* Artists Section - Mobile: Full width, Desktop: 2 columns */}
        <div id="artists-section" className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Artists</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {userRole === 'admin' 
                  ? 'Managing all artists across the platform' 
                  : 'Manage your artist profiles and projects'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && <ArtistViewSwitcher view={view} setView={setView} />}
            </div>
          </div>

          {/* Admin DB Size Card */}
          {userRole === 'admin' && <DbSizeCard />}

          {/* Artists Display */}
          {artists.length === 0 ? (
            <Card className="p-6 sm:p-8 md:p-12 text-center">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">No artists found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">Get started by creating your first artist profile.</p>
                </div>
                <Button asChild size="sm" className="sm:size-lg">
                  <Link href="/artists/new">
                    <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Create First Artist
                  </Link>
                </Button>
              </div>
            </Card>
          ) : isMobile ? (
            <div className="space-y-3 sm:space-y-4">
              {artists.map(artist => (
                <ArtistMobileCard 
                  key={artist.id} 
                  artist={artist}
                  onDelete={(artistId) => {
                    setArtists(prevArtists => prevArtists.filter(a => a.id !== artistId));
                  }}
                />
              ))}
            </div>
          ) : (
            renderDesktopView()
          )}
        </div>

        {/* Compact Workspace Widget - Mobile: Full width, Desktop: 1 column */}
        <div className="lg:col-span-1 order-last lg:order-none">
          {currentUser && (
            <CompactWorkspaceWidget 
              notifications={notifications}
              projects={projects}
              teamMembers={teamMembers}
              currentUser={currentUser}
              teamStats={teamStats}
              resizable={true}
              maxWidth="lg"
              minWidth={400}
              minHeight={500}
              onNotificationClick={(notification) => {
                // Marcar como leída automáticamente
                markNotificationAsRead(notification.id);
                console.log('Notification clicked:', notification.type, notification.title);
              }}
              onProjectClick={(project) => {
                console.log('Project selected:', project.name);
                // Aquí podrías navegar al proyecto o abrir un modal
              }}
              onUpdateMemberRole={updateMemberRole}
              onUpdateOnlineStatus={updateMemberOnlineStatus}
              onInviteMember={async (email, role) => {
                try {
                  await inviteMember(email, role);
                  console.log('Member invited:', email, role);
                } catch (err) {
                  console.error('Error inviting member:', err);
                }
              }}
              onRemoveMember={removeMember}
            />
          )}
          
          {workspaceError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error loading workspace: {workspaceError}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}