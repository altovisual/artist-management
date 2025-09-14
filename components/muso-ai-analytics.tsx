'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Star } from 'lucide-react'

interface MusoAiAnalyticsProps {
  artistId: string;
}

export const MusoAiAnalytics = ({ artistId }: MusoAiAnalyticsProps) => {
  const [musoAiData, setMusoAiData] = useState<any>(null);
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
          setMusoAiData(data);
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muso.AI Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 animate-pulse" />
            <span className="font-semibold text-lg animate-pulse">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muso.AI Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!musoAiData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muso.AI Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No Muso.AI data available for this artist.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" /> Muso.AI Popularity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold text-lg">{musoAiData.popularity}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {new Date(musoAiData.last_updated).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
