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
  data: { month: string; income: number; expenses: number }[];
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

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>Monthly Summary</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
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