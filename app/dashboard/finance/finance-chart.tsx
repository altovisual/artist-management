'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Rectangle } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const chartConfig = {
  income: {
    label: 'Income',
    color: '#22c55e',
  },
  expenses: {
    label: 'Expenses',
    color: '#ef4444',
  },
}

interface FinanceChartProps {
  data: { label: string; income: number; expenses: number }[];
  view: 'daily' | 'monthly';
  setView: (view: 'daily' | 'monthly') => void;
}

const MonospaceBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const barWidth = 10;
  const numBars = Math.floor(width / barWidth);

  return (
    <g>
      {Array.from({ length: numBars }).map((_, i) => (
        <Rectangle
          key={i}
          x={x + i * barWidth}
          y={y}
          width={barWidth - 2}
          height={height}
          fill={fill}
          // Add a subtle animation
          style={{
            animation: `grow 0.5s ease-in-out forwards`,
            transformOrigin: 'bottom',
            animationDelay: `${i * 20}ms`
          }}
        />
      ))}
    </g>
  );
};

export function FinanceChart({ data, view, setView }: FinanceChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Income vs. Expenses</CardTitle>
          <CardDescription>{view === 'daily' ? 'Daily' : 'Monthly'} Summary</CardDescription>
        </div>
        <ToggleGroup type="single" value={view} onValueChange={setView} defaultValue="monthly">
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                if (view === 'daily') {
                  const date = new Date(value + 'T00:00:00');
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                } else {
                  return value.slice(0, 3);
                }
              }}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              shape={<MonospaceBar />}
              animationDuration={500}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              shape={<MonospaceBar />}
              animationDuration={500}
              animationBegin={250}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}