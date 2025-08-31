'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoyaltyReportUploader } from "@/components/royalty-report-uploader";
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface RoyaltyReport {
  id: string;
  created_at: string;
  file_name: string;
  status: string;
}

interface Royalty {
  song_title: string;
  platform: string;
  revenue: number;
}

export default function RoyaltiesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [reports, setReports] = useState<RoyaltyReport[]>([]);
  const [royalties, setRoyalties] = useState<Royalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoyalties, setLoadingRoyalties] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('royalty_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching royalty reports:', JSON.stringify(error, null, 2));
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }, [supabase]);

  const fetchRoyalties = useCallback(async () => {
    setLoadingRoyalties(true);
    const { data, error } = await supabase
      .from('royalties')
      .select('song_title, platform, revenue');

    if (error) {
      console.error('Error fetching royalties:', JSON.stringify(error, null, 2));
    } else {
      setRoyalties(data || []);
    }
    setLoadingRoyalties(false);
  }, [supabase]);

  useEffect(() => {
    fetchReports();
    fetchRoyalties();
  }, [fetchReports, fetchRoyalties]);

  const handleUploadSuccess = () => {
    // Automatically refresh the list of reports after a successful upload
    fetchReports();
    fetchRoyalties();
  }

  const aggregatedData = royalties.reduce((acc, item) => {
    const existing = acc.find(i => i.song_title === item.song_title);
    if (existing) {
      existing[item.platform] = (existing[item.platform] || 0) + item.revenue;
    } else {
      acc.push({ song_title: item.song_title, [item.platform]: item.revenue });
    }
    return acc;
  }, [] as any[]);

  const platforms = [...new Set(royalties.map(i => i.platform))];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Royalty Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subir Reporte de Regalías</CardTitle>
          <CardDescription>
            Sube tu archivo CSV o TSV para procesar tus regalías.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoyaltyReportUploader onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Regalías</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRoyalties ? (
            <p>Loading royalty data...</p>
          ) : royalties.length === 0 ? (
            <p>No royalty data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="song_title" />
                <YAxis />
                <Tooltip />
                <Legend />
                {platforms.map((platform, index) => (
                  <Bar key={platform} dataKey={platform} stackId="a" fill={`hsl(var(--chart-${index + 1}))`} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p>No reports uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.file_name}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                    <TableCell>{report.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
