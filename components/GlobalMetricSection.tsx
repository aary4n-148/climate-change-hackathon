'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricData {
  current: string;
  change: string;
  data: any[];
}

interface GlobalMetricSectionProps {
  title: string;
  subtitle: string;
  metric: MetricData;
  chartType?: 'line' | 'area';
  dataKey: string;
  xAxisKey: string;
  color: string;
  yAxisLabel?: string;
  showReferenceLine?: boolean;
  referenceValue?: number;
  referenceLabel?: string;
  trend?: 'up' | 'down';
  modelType?: string; // e.g., "Linear Trend + Seasonality", "Polynomial Trend"
}

export default function GlobalMetricSection({
  title,
  subtitle,
  metric,
  chartType = 'line',
  dataKey,
  xAxisKey,
  color,
  yAxisLabel,
  showReferenceLine = false,
  referenceValue,
  referenceLabel,
  trend = 'up',
  modelType,
}: GlobalMetricSectionProps) {
  // Check if data has predictions (indicated by 'type' field or 'isPrediction' field)
  const hasPredictions = metric.data.some((d: any) => d.type === 'predicted' || d.isPrediction === true);
  
  // Transform data to have separate columns for historical and predicted
  const transformedData = metric.data.map((d: any) => {
    const baseData = { ...d };
    if (hasPredictions) {
      // Support both 'type' field (CO2, temp) and 'isPrediction' field (Antarctic ice)
      const isPredicted = d.type === 'predicted' || d.isPrediction === true;
      const isHistorical = d.type === 'historical' || d.isPrediction === false || (!d.type && !d.isPrediction);
      
      if (isHistorical) {
        baseData[`${dataKey}_historical`] = d[dataKey];
        baseData[`${dataKey}_predicted`] = null;
        baseData.type = 'historical'; // Normalize for tooltip
      } else if (isPredicted) {
        baseData[`${dataKey}_historical`] = null;
        baseData[`${dataKey}_predicted`] = d[dataKey];
        baseData.type = 'predicted'; // Normalize for tooltip
      }
    }
    return baseData;
  });
  
  // Add connecting point for smooth transition
  if (hasPredictions) {
    const lastHistoricalIndex = transformedData.findIndex((d: any) => 
      d.type === 'predicted' || d.isPrediction === true
    ) - 1;
    if (lastHistoricalIndex >= 0 && lastHistoricalIndex < transformedData.length - 1) {
      const nextIndex = lastHistoricalIndex + 1;
      if (transformedData[nextIndex]) {
        transformedData[nextIndex][`${dataKey}_historical`] = transformedData[lastHistoricalIndex][`${dataKey}_historical`];
      }
    }
  }
  
  // Use transformed data for the chart
  const chartData = hasPredictions ? transformedData : metric.data;
  
  // Custom tooltip that shows whether data is historical or predicted
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPredicted = data.type === 'predicted';
      
      // Get the actual value from the correct field
      let displayValue;
      if (hasPredictions) {
        // Check both historical and predicted fields
        const historicalValue = data[`${dataKey}_historical`];
        const predictedValue = data[`${dataKey}_predicted`];
        displayValue = historicalValue !== null && historicalValue !== undefined 
          ? historicalValue 
          : predictedValue;
      } else {
        displayValue = data[dataKey];
      }
      
      // Format the display label
      let displayLabel = data.date || data[xAxisKey];
      if (data.year && data.month) {
        displayLabel = `${data.year}-${String(data.month).padStart(2, '0')}`;
      } else if (data.year) {
        displayLabel = String(data.year);
      }
      
      return (
        <div className="bg-white border border-charcoal/15 rounded-xl p-3 shadow-md">
          <p className="text-xs font-medium text-charcoal/60 mb-1.5">
            {displayLabel}
          </p>
          <p className="text-base font-semibold text-charcoal">
            {displayValue !== null && displayValue !== undefined ? displayValue.toFixed(2) : 'N/A'}
          </p>
          {isPredicted && (
            <p className="text-xs text-charcoal/50 mt-1">Forecast</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-charcoal/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Chart Section (70%) */}
        <div className="lg:col-span-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">{title}</h2>
            <p className="text-charcoal/60 text-base leading-relaxed">{subtitle}</p>
            {hasPredictions && (
              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-1" style={{ backgroundColor: color }}></div>
                  <span className="text-charcoal/70 font-normal">Historical Data</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg width="48" height="4" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="2" x2="48" y2="2" stroke="#6B7280" strokeWidth="2" strokeDasharray="8 5" />
                  </svg>
                  <span className="text-charcoal/70 font-normal">
                    Forecast {modelType && <span className="text-charcoal/50 text-xs">({modelType})</span>}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    interval="preserveStartEnd"
                    tick={{ fill: '#4B5563' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    label={{
                      value: yAxisLabel || '',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600, fill: '#374151' },
                    }}
                    tick={{ fill: '#4B5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showReferenceLine && referenceValue && (
                    <ReferenceLine
                      y={referenceValue}
                      stroke="#E07A5F"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      label={{
                        value: referenceLabel || '',
                        position: 'right',
                        fill: '#E07A5F',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    fill={`url(#gradient-${dataKey})`}
                  />
                </AreaChart>
              ) : (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    tickFormatter={(value) => {
                      // Format dates to show year only for cleaner display
                      if (typeof value === 'string' && value.includes('-')) {
                        return value.split('-')[0]; // Extract year from "YYYY-MM"
                      }
                      // For numeric years, show every few years to avoid crowding
                      return String(value);
                    }}
                    interval={Math.floor(chartData.length / 10) || 'preserveStartEnd'}
                    minTickGap={50}
                    tick={{ fill: '#4B5563' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    label={{
                      value: yAxisLabel || '',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600, fill: '#374151' },
                    }}
                    tick={{ fill: '#4B5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showReferenceLine && referenceValue && (
                    <ReferenceLine
                      y={referenceValue}
                      stroke="#E07A5F"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      label={{
                        value: referenceLabel || '',
                        position: 'right',
                        fill: '#E07A5F',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {/* Historical data line (solid) */}
                  {hasPredictions ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey={`${dataKey}_historical`}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                      {/* Predicted data line (dashed) */}
                      <Line
                        type="monotone"
                        dataKey={`${dataKey}_predicted`}
                        stroke="#6B7280"
                        strokeWidth={2.5}
                        strokeDasharray="8 5"
                        dot={false}
                        activeDot={{ r: 6, fill: '#6B7280', strokeWidth: 2, stroke: '#fff' }}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={dataKey}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric Highlight Section (30%) */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-br from-cream/30 to-secondary/5 rounded-3xl p-8 border border-charcoal/10">
            <div className="text-center">
              <p className="text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-4">
                Current Value
              </p>
              <p className="text-5xl md:text-6xl font-bold mb-6" style={{ color }}>
                {metric.current}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-8 bg-white/80 rounded-xl px-5 py-3 border border-charcoal/5">
                {trend === 'up' ? (
                  <TrendingUp className="w-5 h-5" style={{ color }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color }} />
                )}
                <span className="text-base font-semibold text-charcoal">
                  {metric.change}
                </span>
              </div>

              <div className="pt-6 border-t border-charcoal/10">
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  {trend === 'up' ? 'Increasing' : 'Decreasing'} at an alarming rate, 
                  {trend === 'up' ? ' driving' : ' reflecting'} significant climate change impacts worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

