'use client';

import CountrySummaryCard from './CountrySummaryCard';
import MetricCard from './MetricCard';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MetricData {
  label: string;
  value: string;
  icon?: string;
}

interface CountryData {
  regionName?: string;
  countryName?: string;
  regionCode?: string;
  countryCode?: string;
  summary: string;
  keyMetrics: MetricData[];
  temperatureData?: any[];
}

interface DashboardProps {
  countryData: CountryData;
}

export default function Dashboard({ countryData }: DashboardProps) {
  const name = countryData.regionName || countryData.countryName;
  const code = countryData.regionCode || countryData.countryCode;

  // Transform temperature data for the chart
  const transformTemperatureData = () => {
    if (!countryData.temperatureData) return [];
    
    return countryData.temperatureData.map((point: any) => {
      const isHistorical = point.type === 'historical';
      const isPredicted = point.type === 'predicted';
      
      return {
        year: point.year,
        temperature_historical: isHistorical ? point.temperature : null,
        temperature_predicted: isPredicted ? point.temperature : null,
        temperature_low: isPredicted ? point.temperatureLow : null,
        temperature_high: isPredicted ? point.temperatureHigh : null,
        type: point.type,
      };
    });
  };

  const chartData = transformTemperatureData();
  
  // Add connecting point for smooth transition between historical and predicted
  if (chartData.length > 0) {
    const lastHistoricalIndex = chartData.findIndex((d: any) => d.type === 'predicted') - 1;
    if (lastHistoricalIndex >= 0 && lastHistoricalIndex < chartData.length - 1) {
      const nextIndex = lastHistoricalIndex + 1;
      if (chartData[nextIndex]) {
        chartData[nextIndex].temperature_historical = chartData[lastHistoricalIndex].temperature_historical;
        // Also set the confidence interval boundaries at the connection point
        if (chartData[nextIndex].temperature_low !== null) {
          chartData[nextIndex].temperature_low = chartData[lastHistoricalIndex].temperature_historical;
          chartData[nextIndex].temperature_high = chartData[lastHistoricalIndex].temperature_historical;
        }
      }
    }
  }

  // Calculate dynamic y-axis domain based on data range including confidence intervals
  const getYAxisDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto'];
    
    const allTemps: number[] = [];
    
    chartData.forEach((d: any) => {
      if (d.temperature_historical !== null) allTemps.push(d.temperature_historical);
      if (d.temperature_predicted !== null) allTemps.push(d.temperature_predicted);
      if (d.temperature_low !== null) allTemps.push(d.temperature_low);
      if (d.temperature_high !== null) allTemps.push(d.temperature_high);
    });
    
    if (allTemps.length === 0) return ['auto', 'auto'];
    
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    const range = maxTemp - minTemp;
    
    // Add 10% padding above and below for visual clarity
    const padding = range * 0.1;
    const yMin = Math.floor(minTemp - padding);
    const yMax = Math.ceil(maxTemp + padding);
    
    return [yMin, yMax];
  };

  const yAxisDomain = getYAxisDomain();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPredicted = data.type === 'predicted';
      const temp = data.temperature_historical !== null ? data.temperature_historical : data.temperature_predicted;
      
      return (
        <div className="bg-white border border-charcoal/15 rounded-xl p-3 shadow-md">
          <p className="text-xs font-medium text-charcoal/60 mb-1.5">
            {data.year}
          </p>
          <p className="text-base font-semibold text-charcoal">
            {temp !== null && temp !== undefined ? `${temp.toFixed(2)}°C` : 'N/A'}
          </p>
          {isPredicted && data.temperature_low !== null && data.temperature_high !== null && (
            <div className="mt-2 pt-2 border-t border-charcoal/10">
              <p className="text-xs text-charcoal/50 mb-1">90% Confidence Interval</p>
              <p className="text-xs text-charcoal/70">
                {data.temperature_low.toFixed(2)}°C - {data.temperature_high.toFixed(2)}°C
              </p>
            </div>
          )}
          {isPredicted && (
            <p className="text-xs text-charcoal/50 mt-1.5">Forecast (Median)</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-cream py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Region Summary */}
        <CountrySummaryCard
          countryName={name || ''}
          countryCode={code || ''}
          summary={countryData.summary}
        />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {countryData.keyMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Temperature Forecast Chart */}
        {countryData.temperatureData && chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary/10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-charcoal mb-2">
                Temperature Forecast Through 2050
              </h3>
              <p className="text-charcoal/60 mb-4">
                Historical annual mean temperatures and ensemble forecast (Holt-Winters model with 300 simulations)
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-1 bg-[#E07A5F]"></div>
                  <span className="text-charcoal/70 font-normal">Historical Data</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg width="48" height="4" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="2" x2="48" y2="2" stroke="#6B7280" strokeWidth="2" strokeDasharray="8 5" />
                  </svg>
                  <span className="text-charcoal/70 font-normal">Forecast (Median)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-3 bg-[#6B7280] opacity-20 rounded"></div>
                  <span className="text-charcoal/70 font-normal">90% Confidence Interval</span>
                </div>
              </div>
            </div>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    interval={Math.floor(chartData.length / 12) || 'preserveStartEnd'}
                    minTickGap={30}
                    tick={{ fill: '#4B5563' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                    domain={yAxisDomain}
                    label={{
                      value: 'Temperature (°C)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600, fill: '#374151' },
                    }}
                    tick={{ fill: '#4B5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Confidence interval area (5th to 95th percentile) */}
                  <Area
                    type="monotone"
                    dataKey="temperature_high"
                    stroke="none"
                    fill="#6B7280"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature_low"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                  
                  {/* Historical data line (solid) */}
                  <Line
                    type="monotone"
                    dataKey="temperature_historical"
                    stroke="#E07A5F"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                  
                  {/* Predicted data line (dashed) */}
                  <Line
                    type="monotone"
                    dataKey="temperature_predicted"
                    stroke="#6B7280"
                    strokeWidth={2.5}
                    strokeDasharray="8 5"
                    dot={false}
                    activeDot={{ r: 6, fill: '#6B7280', strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

