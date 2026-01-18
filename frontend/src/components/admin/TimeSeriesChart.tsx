'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesChartProps {
  title: string;
  data: Array<{
    date?: string;
    week?: string;
    month?: string;
    boxesOpened: number;
    feesCollected: number;
  }>;
  type?: 'bar' | 'line';
  xAxisKey?: 'date' | 'week' | 'month';
}

export function TimeSeriesChart({
  title,
  data,
  type = 'bar',
  xAxisKey = 'date',
}: TimeSeriesChartProps) {
  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey="boxesOpened"
              stroke="#3b82f6"
              fill="#3b82f6"
              name="Boxes Opened"
            />
            <DataComponent
              type="monotone"
              dataKey="feesCollected"
              stroke="#10b981"
              fill="#10b981"
              name="Fees Collected (ETH)"
            />
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
