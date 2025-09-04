"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GenreData {
  genre: string;
  count: number;
}

interface GenreChartConfig {
  [key: string]: { color: string };
}

export function GenreDistributionChart({ data, chartConfig }: { data: GenreData[]; chartConfig: GenreChartConfig }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Genre Distribution</CardTitle>
        <CardDescription>Distribution of genres for the artist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {data.map((entry) => (
          <div key={entry.genre} className="flex items-center space-x-4 group">
            <div className="w-1/3 text-right text-sm font-medium truncate">
              {entry.genre}
            </div>
            <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-300 ease-out"
                style={{
                  width: `${(entry.count / data.reduce((sum, item) => sum + item.count, 0)) * 100}%`,
                  backgroundColor: chartConfig[entry.genre]?.color || 'hsl(var(--primary))',
                }}
              >
                {entry.count}
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-gray-800 dark:text-gray-200 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {((entry.count / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
