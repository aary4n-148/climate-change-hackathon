'use client';

import GlobalMetricSection from './GlobalMetricSection';

interface GlobalOverviewProps {
  globalData: {
    co2: {
      current: string;
      change: string;
      data: any[];
    };
    temperature: {
      current: string;
      change: string;
      data: any[];
    };
    arcticIce: {
      current: string;
      change: string;
      data: any[];
    };
  };
}

export default function GlobalOverview({ globalData }: GlobalOverviewProps) {
  return (
    <section className="w-full bg-cream py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-5">
            The Global Picture
          </h2>
          <p className="text-lg text-charcoal/60 leading-relaxed">
            Three key indicators tell the story of our changing climate. 
            Each metric represents decades of scientific measurement and undeniable trends.
          </p>
        </div>

        {/* CO2 Concentrations */}
        <GlobalMetricSection
          title="Atmospheric CO₂"
          subtitle="Carbon dioxide levels measured at Mauna Loa Observatory"
          metric={globalData.co2}
          chartType="line"
          dataKey="ppm"
          xAxisKey="date"
          color="#E07A5F"
          yAxisLabel="CO₂ (ppm)"
          showReferenceLine={false}
          trend="up"
          modelType="Linear Trend + Seasonality"
        />

        {/* Temperature Rise */}
        <GlobalMetricSection
          title="Global Temperature"
          subtitle="Temperature anomaly relative to pre-industrial levels (1850-1900)"
          metric={globalData.temperature}
          chartType="line"
          dataKey="anomaly"
          xAxisKey="year"
          color="#C98474"
          yAxisLabel="Temperature Anomaly (°C)"
          showReferenceLine={false}
          trend="up"
          modelType="Polynomial Trend (Degree 2)"
        />

        {/* Antarctic Ice Mass */}
        <GlobalMetricSection
          title="Antarctic Ice Mass"
          subtitle="Ice sheet mass anomaly measured by GRACE satellites (Gigatons)"
          metric={globalData.arcticIce}
          chartType="line"
          dataKey="massAnomaly"
          xAxisKey="year"
          color="#3b82f6"
          yAxisLabel="Mass Anomaly (Gt)"
          trend="down"
          showReferenceLine={true}
          referenceValue={0}
          referenceLabel="Baseline (2002-2020 avg)"
          modelType="Linear Regression"
        />
      </div>
    </section>
  );
}

