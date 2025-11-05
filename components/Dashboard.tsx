'use client';

import CountrySummaryCard from './CountrySummaryCard';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';

interface MetricData {
  label: string;
  value: string;
  icon?: string;
}

interface CountryData {
  countryName: string;
  countryCode: string;
  summary: string;
  keyMetrics: MetricData[];
  charts: any;
}

interface DashboardProps {
  countryData: CountryData;
}

export default function Dashboard({ countryData }: DashboardProps) {
  // Determine chart data based on what's available
  const getChartConfig = () => {
    const { charts } = countryData;
    
    if (charts.heavyRainfall) {
      return {
        title: 'Projected Heavy Rainfall Days',
        description: 'Annual days with extreme precipitation events',
        data: charts.heavyRainfall,
        chartType: 'line' as const,
        dataKey: 'days',
        xAxisKey: 'year',
        yAxisLabel: 'Days per Year',
      };
    }
    
    if (charts.seaLevel) {
      return {
        title: 'Projected Sea Level Rise',
        description: 'Mean sea level increase above 2020 baseline',
        data: charts.seaLevel,
        chartType: 'bar' as const,
        dataKey: 'rise_m',
        xAxisKey: 'year',
        yAxisLabel: 'Rise (meters)',
      };
    }
    
    if (charts.consecutiveDryDays) {
      return {
        title: 'Consecutive Dry Days',
        description: 'Maximum annual period without significant rainfall',
        data: charts.consecutiveDryDays,
        chartType: 'line' as const,
        dataKey: 'days',
        xAxisKey: 'year',
        yAxisLabel: 'Days',
      };
    }
    
    if (charts.typhoonIntensity) {
      return {
        title: 'High-Intensity Typhoons',
        description: 'Annual Category 4+ typhoon events',
        data: charts.typhoonIntensity,
        chartType: 'bar' as const,
        dataKey: 'category4plus',
        xAxisKey: 'year',
        yAxisLabel: 'Number of Events',
      };
    }
    
    return null;
  };

  const chartConfig = getChartConfig();

  return (
    <div className="w-full bg-cream py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Country Summary */}
        <CountrySummaryCard
          countryName={countryData.countryName}
          countryCode={countryData.countryCode}
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

        {/* Chart Visualization */}
        {chartConfig && (
          <ChartCard
            title={chartConfig.title}
            description={chartConfig.description}
            data={chartConfig.data}
            chartType={chartConfig.chartType}
            dataKey={chartConfig.dataKey}
            xAxisKey={chartConfig.xAxisKey}
            yAxisLabel={chartConfig.yAxisLabel}
          />
        )}
      </div>
    </div>
  );
}

