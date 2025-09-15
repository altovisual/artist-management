
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Star, Music, Facebook, Instagram, Play, Pause, ChevronDown, ChevronUp, Workflow, Calendar } from 'lucide-react'
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
            // Fallback for older sync data that only stored popularity
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Muso.AI Profile Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <p className="text-muted-foreground mt-2">Please try syncing the Muso.AI data again. If the problem persists, check the API connection.</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !profile.id) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>No Muso.AI Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No Muso.AI data available for this artist. Sync data from the main analytics page to see the analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ArtistHeader profile={profile} />
      <Tabs defaultValue="credits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits">Credits ({profile.creditCount || 0})</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators ({profile.collaboratorsCount || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="credits">
          <CreditsTab profileId={profile.id} />
        </TabsContent>
        <TabsContent value="collaborators">
          <CollaboratorsTab profileId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ArtistHeader = ({ profile }: { profile: any }) => (
  <Card>
    <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <Image 
        src={profile.avatarUrl || '/placeholder.svg'} 
        alt={profile.name || 'Artist Avatar'} 
        width={100} 
        height={100} 
        className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-full border-4 border-background shadow-lg flex-shrink-0"
      />
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-grow">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                {profile.name}
                <Music className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {profile.facebook && <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook size={20}/></a>}
                {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram size={20}/></a>}
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5" title="Muso.AI Popularity">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold">{profile.popularity ?? 'N/A'}</span>
            <span className="text-sm">Popularity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Music className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">{profile.creditCount ?? 0}</span>
            <span className="text-sm">Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-5 w-5 text-green-400" />
            <span className="font-semibold">{profile.collaboratorsCount ?? 0}</span>
            <span className="text-sm">Collaborators</span>
          </div>
        </div>
        {profile.commonCredits && profile.commonCredits.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.commonCredits.map((credit: string) => <Badge key={credit} variant="secondary" className="capitalize text-sm">{credit}</Badge>)}
          </div>
        )}
      </div>
    </CardHeader>
  </Card>
);


const CreditsTab = ({ profileId }: { profileId: string }) => {
  const [credits, setCredits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const handlePlayPreview = (trackId: string, previewUrl: string) => {
    if (audio) audio.pause();
    if (nowPlaying === trackId) {
      setAudio(null);
      setNowPlaying(null);
    } else {
      const newAudio = new Audio(previewUrl);
      setAudio(newAudio);
      setNowPlaying(trackId);
      newAudio.play();
      newAudio.onended = () => setNowPlaying(null);
    }
  };

  useEffect(() => {
    if (!profileId) return;
    setIsLoading(true);
    fetch(`/api/muso-ai/credits?profile_id=${profileId}&limit=50&offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        setCredits(prev => offset === 0 ? (data.data?.items || []) : [...prev, ...(data.data?.items || [])]);
        setTotalCredits(data.data?.totalCount || 0);
      })
      .catch(error => console.error("Error fetching credits:", error))
      .finally(() => setIsLoading(false));
  }, [profileId, offset]);

  const handleLoadMore = () => {
    if (credits.length < totalCredits) {
      setOffset(prev => prev + 50);
    }
  };

  if (isLoading && credits.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader><CardTitle>Credits</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!credits.length) {
    return (
      <Card className="mt-6">
        <CardHeader><CardTitle>No Credits Found</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">No credits data to display.</p></CardContent>
      </Card>
    );
  }
  
  const visibleCredits = showAll ? credits : credits.slice(0, 10);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" /> Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleCredits.map((credit) => (
            <div key={credit.track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
              {credit.track.spotifyPreviewUrl ? (
                <Button variant="ghost" size="icon" onClick={() => handlePlayPreview(credit.track.id, credit.track.spotifyPreviewUrl)}>
                  {nowPlaying === credit.track.id ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              ) : (
                <div className="w-10 h-10 flex-shrink-0" />
              )}
              <Image 
                src={credit.album?.albumArt || '/placeholder.svg'} 
                alt={credit.track.title} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold whitespace-nowrap truncate text-sm sm:text-base">{credit.track.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap truncate">
                  {credit.artists.map((a: any) => a.name).join(', ')}
                </p>
              </div>
              <div className="hidden sm:flex flex-wrap gap-1 justify-end w-1/3">
                {credit.credits.map((c: any) => (
                  <Badge key={c.child} variant="outline" className="text-xs">{c.child}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {credits.length > 10 && (
          <div className="text-center mt-4">
            <Button variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? (
                <><ChevronUp className="h-4 w-4 mr-2"/> Show Less</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-2"/> Show All {credits.length} Credits</>
              )}
            </Button>
          </div>
        )}
        {showAll && credits.length < totalCredits && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More Credits'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CollaboratorsTab = ({ profileId }: { profileId: string }) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCollaborators, setTotalCollaborators] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    setIsLoading(true);
    fetch(`/api/muso-ai/collaborators?profile_id=${profileId}&limit=12&offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        setCollaborators(prev => offset === 0 ? (data.data?.items || []) : [...prev, ...(data.data?.items || [])]);
        setTotalCollaborators(data.data?.totalCount || 0);
      })
      .catch(error => console.error("Error fetching collaborators:", error))
      .finally(() => setIsLoading(false));
  }, [profileId, offset]);

  const handleLoadMore = () => {
    if (collaborators.length < totalCollaborators) {
      setOffset(prev => prev + 12);
    }
  };

  if (isLoading && collaborators.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader><CardTitle>Collaborators</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-5 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </CardContent>
              <CardFooter className="p-2 flex flex-col items-start">
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-full mt-1" />
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Collaborators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {collaborators.map(collab => (
            <Card key={collab.id} className="group text-center flex flex-col">
              <CardContent className="p-4 flex-grow">
                <div className="w-24 h-24 mx-auto aspect-square overflow-hidden rounded-full border-2 border-transparent group-hover:border-primary transition-colors">
                  <Image 
                    src={collab.avatarUrl || '/placeholder.svg'} 
                    alt={collab.name} 
                    width={96} 
                    height={96} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-sm mt-2 truncate group-hover:underline">{collab.name}</p>
                <p className="text-xs text-muted-foreground truncate">{collab.commonCredits?.join(', ')}</p>
              </CardContent>
              {(collab.popularity || collab.collaborationsCount) && (
                <CardFooter className="p-3 pt-0 flex flex-col items-start text-xs text-muted-foreground">
                    {collab.popularity !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="font-bold">{collab.popularity}</span>
                            <span>Popularity</span>
                        </div>
                    )}
                    {collab.collaborationsCount !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-green-400" />
                            <span className="font-bold">{collab.collaborationsCount}</span>
                            <span>Collabs</span>
                        </div>
                    )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        {collaborators.length < totalCollaborators && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More Collaborators'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0">
        <Skeleton className="h-[100px] w-[100px] rounded-full" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardHeader>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  </div>
);
