
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Star, Music, Facebook, Instagram, Play, Pause } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface MusoAiAnalyticsProps {
  artistId: string;
}

export const MusoAiAnalytics = ({ artistId }: MusoAiAnalyticsProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusoAiData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/muso-ai/profiles?artist_id=${artistId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile_data) {
            setProfile(data.profile_data);
          } else {
            setProfile({ popularity: data.popularity });
          }
        } else {
          const errorBody = await res.json();
          throw new Error(errorBody.error || 'Failed to fetch Muso.AI data.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (artistId) {
      fetchMusoAiData();
    }
  }, [artistId]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Muso.AI Profile</CardTitle></CardHeader>
        <CardContent><p className="text-destructive">Error: {error}</p></CardContent>
      </Card>
    );
  }

  if (!profile || !profile.id) {
    return (
      <Card>
        <CardHeader><CardTitle>Muso.AI Profile</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">No Muso.AI data available. Sync data to see analytics.</p></CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="credits">Credits ({profile.creditCount || 0})</TabsTrigger>
        <TabsTrigger value="collaborators">Collaborators ({profile.collaboratorsCount || 0})</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab profile={profile} />
      </TabsContent>
      <TabsContent value="credits">
        <CreditsTab profileId={profile.id} />
      </TabsContent>
      <TabsContent value="collaborators">
        <CollaboratorsTab profileId={profile.id} />
      </TabsContent>
    </Tabs>
  );
}

const OverviewTab = ({ profile }: { profile: any }) => (
  <Card>
    <CardHeader className="flex flex-row items-start gap-4">
      {profile.avatarUrl && <Image src={profile.avatarUrl} alt={profile.name || 'Artist Avatar'} width={80} height={80} className="rounded-full border"/>}
      <div className="flex-grow">
        <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
        <CardDescription>{profile.country}</CardDescription>
        <div className="flex items-center gap-4 mt-2">
          {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook size={20}/></a>}
          {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram size={20}/></a>}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <StatCard icon={<Star size={24} className="text-yellow-500"/>} label="Popularity" value={profile.popularity} />
        <StatCard icon={<Music size={24} className="text-blue-500"/>} label="Credits" value={profile.creditCount} />
        <StatCard icon={<Users size={24} className="text-green-500"/>} label="Collaborators" value={profile.collaboratorsCount} />
      </div>
      {profile.commonCredits && profile.commonCredits.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Common Roles</h4>
          <div className="flex flex-wrap gap-2">
            {profile.commonCredits.map((credit: string) => <Badge key={credit} variant="secondary">{credit}</Badge>)}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const CreditsTab = ({ profileId }: { profileId: string }) => {
  const [credits, setCredits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null); // Track ID of playing song
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [offset, setOffset] = useState(0); // Offset for pagination
  const [totalCredits, setTotalCredits] = useState(0); // Total count from API

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handlePlayPreview = (trackId: string, previewUrl: string) => {
    if (audio) {
      audio.pause();
    }

    if (nowPlaying === trackId) {
      setAudio(null);
      setNowPlaying(null);
    } else {
      const newAudio = new Audio(previewUrl);
      setAudio(newAudio);
      setNowPlaying(trackId);
      newAudio.play();
      newAudio.onended = () => {
        setNowPlaying(null);
        setAudio(null);
      };
    }
  };

  // This effect handles both initial load and subsequent "Load More"
  useEffect(() => {
    // Only fetch if profileId is available
    if (!profileId) return;

    // If offset is 0, it's an initial load or a reset, so clear previous data
    // If offset > 0, it's a "Load More"
    const isInitialLoad = offset === 0;

    setIsLoading(true);
    fetch(`/api/muso-ai/credits?profile_id=${profileId}&limit=20&offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        if (isInitialLoad) {
          setCredits(data.data?.items || []); // Replace for initial load
        } else {
          setCredits(prevCredits => [...prevCredits, ...(data.data?.items || [])]); // Append for load more
        }
        setTotalCredits(data.data?.totalCount || 0);
      })
      .catch(error => console.error("Error fetching credits:", error))
      .finally(() => setIsLoading(false));

  }, [profileId, offset]); // This effect runs when profileId or offset changes

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + 20);
  };

  if (isLoading && credits.length === 0) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  if (!Array.isArray(credits)) {
    return <p>Could not load credits.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credits.map(credit => (
          <Card key={credit.track.id} className="hover:bg-muted/50 transition-colors flex flex-col">
            <CardContent className="flex items-center gap-4 p-4">
              <Image src={credit.album?.albumArt || '/placeholder.svg'} alt={credit.track.title} width={64} height={64} className="rounded-md aspect-square object-cover" />
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{credit.track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{credit.artists.map((a: any) => a.name).join(', ')}</p>
                <p className="text-xs text-muted-foreground">{credit.releaseDate?.split('-')[0]}</p>
              </div>
              {credit.track.spotifyPreviewUrl && (
                <Button variant="ghost" size="icon" onClick={() => handlePlayPreview(credit.track.id, credit.track.spotifyPreviewUrl)}>
                  {nowPlaying === credit.track.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              )}
            </CardContent>
            <div className="px-4 pb-4 pt-0 mt-auto">
              <div className="flex flex-wrap gap-1">
                {credit.credits.map((c: any) => (
                  <Badge key={c.child} variant="outline">{c.child}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {credits.length < totalCredits && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More Credits'}
          </Button>
        </div>
      )}
    </div>
  );
};

const CollaboratorsTab = ({ profileId }: { profileId: string }) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0); // Offset for pagination
  const [totalCollaborators, setTotalCollaborators] = useState(0); // Total count from API

  // This effect handles both initial load and subsequent "Load More"
  useEffect(() => {
    // Only fetch if profileId is available
    if (!profileId) return;

    // If offset is 0, it's an initial load or a reset, so clear previous data
    // If offset > 0, it's a "Load More"
    const isInitialLoad = offset === 0;

    setIsLoading(true);
    fetch(`/api/muso-ai/collaborators?profile_id=${profileId}&limit=20&offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        if (isInitialLoad) {
          setCollaborators(data.data?.items || []); // Replace for initial load
        } else {
          setCollaborators(prevCollaborators => [...prevCollaborators, ...(data.data?.items || [])]); // Append for load more
        }
        setTotalCollaborators(data.data?.totalCount || 0);
      })
      .catch(error => console.error("Error fetching collaborators:", error))
      .finally(() => setIsLoading(false));

  }, [profileId, offset]); // This effect runs when profileId or offset changes

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + 20);
  };

  if (isLoading && collaborators.length === 0) return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">{Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  if (!Array.isArray(collaborators)) {
    return <p>Could not load collaborators.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collaborators.map(collab => (
          <Card key={collab.id} className="hover:bg-muted/50 transition-colors text-center">
            <CardContent className="p-4">
              <Image src={collab.avatarUrl || '/placeholder.svg'} alt={collab.name} width={80} height={80} className="rounded-full mx-auto border" />
              <p className="font-semibold mt-2 truncate">{collab.name}</p>
              <p className="text-xs text-muted-foreground">{collab.commonCredits?.join(', ')}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {collab.popularity !== undefined && <p>Popularity: {collab.popularity}</p>}
                {collab.collaborationsCount !== undefined && <p>Collaborations: {collab.collaborationsCount}</p>}
                {collab.lastCollaborationDate && <p>Last Collab: {collab.lastCollaborationDate}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {collaborators.length < totalCollaborators && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More Collaborators'}
          </Button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) => (
  <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
    <div className="mb-2">{icon}</div>
    <p className="text-2xl font-bold">{value ?? 'N/A'}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const AnalyticsSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-start gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-grow space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div>
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);
