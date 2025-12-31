'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProbabilityData } from '@/services/rewardVisualization';

interface ProbabilityBarChartProps {
  data: ProbabilityData[];
  title?: string;
  height?: number;
}

export function ProbabilityBarChart({ data, title = "Reward Probabilities", height = 300 }: ProbabilityBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No probability data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: `Reward ${index + 1}`,
    probability: Number(item.probability.toFixed(2)),
    weight: item.weight,
    fill: getProbabilityColor(item.probability)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">Probability: {data.probability}%</p>
          <p className="text-sm text-gray-600">Weight: {data.weight}</p>
          <p className="text-sm text-gray-600">Rarity: {getRarityFromProbability(data.probability)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              fontSize={12}
              label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getProbabilityColor(probability: number): string {
  if (probability >= 50) return '#10B981'; // Green - Common
  if (probability >= 20) return '#3B82F6'; // Blue - Rare
  if (probability >= 5) return '#8B5CF6';  // Purple - Epic
  return '#F59E0B'; // Orange - Legendary
}

function getRarityFromProbability(probability: number): string {
  if (probability >= 50) return 'Common';
  if (probability >= 20) return 'Rare';
  if (probability >= 5) return 'Epic';
  return 'Legendary';
}