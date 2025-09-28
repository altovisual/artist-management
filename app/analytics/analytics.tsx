'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedTitle } from '@/components/animated-title';
import { StatsCard } from '@/components/dashboard/stats-card';
import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Music, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

export function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let isAdmin = false;
        if (user && user.app_metadata?.role === 'admin') {
          isAdmin = true;
          setUserRole('admin');
        }

        // Fetch all data in parallel
        const promises = [];

        // Artists
        let artistQuery = supabase.from('artists').select('*, social_accounts(id), distribution_accounts(id), projects(*)');
        if (user && !isAdmin) {
          artistQuery = artistQuery.eq('user_id', user.id);
        }
        promises.push(artistQuery);

        // Transactions
        let transactionQuery = supabase.from('transactions').select('*');
        if (user && !isAdmin) {
          transactionQuery = transactionQuery.eq('user_id', user.id);
        }
        promises.push(transactionQuery.order('transaction_date', { ascending: false }));

        // Projects
        let projectQuery = supabase.from('projects').select('*, artists(name)');
        if (user && !isAdmin) {
          projectQuery = projectQuery.eq('user_id', user.id);
        }
        promises.push(projectQuery.order('created_at', { ascending: false }));

        const [artistResult, transactionResult, projectResult] = await Promise.all(promises);

        setArtists(artistResult.data || []);
        setTransactions(transactionResult.data || []);
        setProjects(projectResult.data || []);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate analytics metrics
  const totalRevenue = transactions.reduce((acc, t) => 
    acc + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0
  );

  const totalExpenses = transactions.reduce((acc, t) => 
    acc + (t.type === 'expense' ? parseFloat(t.amount) : 0), 0
  );

  const netProfit = totalRevenue - totalExpenses;

  // Monthly data for the last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const revenue = monthTransactions.reduce((acc, t) => 
      acc + (t.type === 'income' ? parseFloat(t.amount) : 0), 0
    );

    const expenses = monthTransactions.reduce((acc, t) => 
      acc + (t.type === 'expense' ? parseFloat(t.amount) : 0), 0
    );

    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
      expenses,
      profit: revenue - expenses
    });
  }

  // Top performing artists by project count
  const topArtists = artists
    .map(artist => ({
      ...artist,
      projectCount: artist.projects?.length || 0,
      socialCount: artist.social_accounts?.length || 0,
      distributionCount: artist.distribution_accounts?.length || 0
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 5);

  // Recent projects
  const recentProjects = projects.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <AnimatedTitle text="Analytics Dashboard" level={1} className="text-3xl font-bold tracking-tight" />
        <p className="text-muted-foreground">
          {userRole === 'admin' 
            ? 'Comprehensive analytics across all artists and projects' 
            : 'Detailed insights into your artist management performance'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="All time income"
          className="border-green-200 dark:border-green-800"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingUp}
          description="All time expenses"
          className="border-red-200 dark:border-red-800"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          changeType={netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : 'neutral'}
          icon={BarChart3}
          description="Revenue - Expenses"
          className="border-blue-200 dark:border-blue-800"
        />
        <StatsCard
          title="Active Artists"
          value={artists.length}
          icon={Users}
          description="Total managed artists"
          className="border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Performance */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Monthly Performance</h3>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{data.month}</span>
                  {getTrendIcon(data.profit)}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    -{formatCurrency(data.expenses)} = {formatCurrency(data.profit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Artists */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Performing Artists</h3>
          </div>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={artist.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">{artist.genre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {artist.projectCount} projects
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {artist.socialCount} social • {artist.distributionCount} distrib
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Projects</h3>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {project.artists?.name} • {project.genre}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                  {project.status || 'In Progress'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(project.release_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
