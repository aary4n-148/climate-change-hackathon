'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartCardProps {
  title: string;
  description: string;
  data: any[];
  chartType: 'line' | 'bar';
  dataKey: string;
  xAxisKey: string;
  yAxisLabel?: string;
}

export default function ChartCard({
  title,
  description,
  data,
  chartType,
  dataKey,
  xAxisKey,
  yAxisLabel,
}: ChartCardProps) {
  const chartColor = '#81B29A'; // Secondary sage color

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary/10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-charcoal mb-2">{title}</h3>
        <p className="text-charcoal/60">{description}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey}
                stroke="#6B7280"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '14px' }}
                label={{
                  value: yAxisLabel || '',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={chartColor}
                strokeWidth={3}
                dot={{ fill: chartColor, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey}
                stroke="#6B7280"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '14px' }}
                label={{
                  value: yAxisLabel || '',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey={dataKey} fill={chartColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

