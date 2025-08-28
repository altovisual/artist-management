// components/db-size-card.tsx
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DbSizeCard() {
  const supabase = createClient();
  const [dbSizeUsedMb, setDbSizeUsedMb] = useState<number | null>(null);
  const [dbSizeLimitMb, setDbSizeLimitMb] = useState<number>(500);
  const [dbSizeRemainingMb, setDbSizeRemainingMb] = useState<number | null>(null);
  const [isDbSizeLoading, setIsDbSizeLoading] = useState(true);

  console.log("[DbSizeCard] Component rendered.");

  useEffect(() => {
    console.log("[DbSizeCard] useEffect triggered.");
    const fetchDbSize = async () => {
      console.log("[DbSizeCard] fetchDbSize started.");
      setIsDbSizeLoading(true);
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session?.data.session?.access_token;
        console.log("[DbSizeCard] Access Token:", accessToken ? "Available" : "Not Available");

        const response = await fetch('/api/get-db-size', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log("[DbSizeCard] Fetch response received:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[DbSizeCard] Data received:", data);
        const usedMb = parseFloat(data.db_size_mb.toFixed(1));

        const limitMb = 500;
        setDbSizeLimitMb(limitMb);

        const calculatedRemainingMb = limitMb - usedMb;

        setDbSizeUsedMb(usedMb);
        setDbSizeRemainingMb(calculatedRemainingMb > 0 ? calculatedRemainingMb : 0);
      } catch (error) {
        console.error('Error fetching DB size:', error);
        setDbSizeUsedMb(null);
        setDbSizeRemainingMb(null);
      } finally {
        setIsDbSizeLoading(false);
        console.log("[DbSizeCard] fetchDbSize finished.");
      }
    };

    fetchDbSize();
  }, [supabase, dbSizeLimitMb]);

  const usagePercentage = dbSizeUsedMb !== null ? (dbSizeUsedMb / dbSizeLimitMb) * 100 : 0;

  return (
    <Card className="min-w-[160px]">
      <CardHeader className="pb-2 sm:pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="sm:py-2">
        {isDbSizeLoading ? (
          <div className="text-lg font-bold animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="text-lg font-bold">
              {dbSizeUsedMb?.toFixed(1)} MB / {dbSizeLimitMb} MB
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Remaining: {dbSizeRemainingMb?.toFixed(1)} MB
            </p>
            <Progress value={usagePercentage} className="mt-2 h-2" />
          </>
        )}
      </CardContent>
    </Card>
  );
}