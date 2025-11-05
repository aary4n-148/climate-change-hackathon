'use client';

import { useState, useEffect } from 'react';
import GlobalHero from '@/components/GlobalHero';
import GlobalOverview from '@/components/GlobalOverview';
import HeroHeader from '@/components/HeroHeader';
import CountrySelector from '@/components/CountrySelector';
import Dashboard from '@/components/Dashboard';
import { addPredictions } from '@/lib/timeSeriesDecomposition';
import { parseTemperatureCSV } from '@/lib/parseTemperatureData';
import { addTemperaturePredictions } from '@/lib/temperatureDecomposition';

interface CountryData {
  countryName: string;
  countryCode: string;
  hero: {
    stat: string;
    subtitle: string;
  };
  summary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  charts: any;
}

interface GlobalData {
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
}

const countries = [
  { id: 'united-kingdom', name: 'United Kingdom' },
  { id: 'bangladesh', name: 'Bangladesh' },
  { id: 'somalia', name: 'Somalia' },
  { id: 'philippines', name: 'Philippines' },
];

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('united-kingdom');
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setGlobalLoading(true);
      try {
        const response = await fetch('/data/global.json');
        const data = await response.json();
        
        // Fetch raw temperature CSV for monthly predictions
        const tempResponse = await fetch('/GLB.Ts+dSST.csv');
        const tempCsvContent = await tempResponse.text();
        const tempMonthlyData = parseTemperatureCSV(tempCsvContent);
        
        // Add CO2 predictions using time series decomposition
        // Predict until 2040 (approximately 180 months from mid-2025)
        // Add temperature predictions using polynomial trend decomposition
        const dataWithPredictions = {
          ...data,
          co2: addPredictions(data.co2, 180), // Predict ~15 years ahead to 2040
          temperature: addTemperaturePredictions(
            { ...data.temperature, data: tempMonthlyData },
            180, // Predict ~15 years ahead to 2040
            2    // Use quadratic polynomial (degree 2) to capture acceleration
          )
        };
        
        setGlobalData(dataWithPredictions);
      } catch (error) {
        console.error('Error fetching global data:', error);
      } finally {
        setGlobalLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/${selectedCountry}.json`);
        const data = await response.json();
        setCountryData(data);
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [selectedCountry]);

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  if (globalLoading || !globalData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mb-4"></div>
          <p className="text-charcoal text-lg">Loading climate data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Global Hero Section */}
      <GlobalHero />

      {/* Global Overview Section */}
      <GlobalOverview globalData={globalData} />

      {/* Transition Section */}
      <section className="bg-gradient-to-b from-cream to-secondary/5 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block h-1 w-24 bg-primary rounded-full mb-6"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Country-Specific Impacts
          </h2>
          <p className="text-xl text-charcoal/70 leading-relaxed">
            While climate change is a global crisis, its impacts vary dramatically by region. 
            Explore how different countries face unique challenges and vulnerabilities.
          </p>
        </div>
      </section>

      {/* Country Hero Section */}
      {loading || !countryData ? (
        <div className="min-h-[400px] bg-cream flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mb-4"></div>
            <p className="text-charcoal text-lg">Loading country data...</p>
          </div>
        </div>
      ) : (
        <>
          <HeroHeader heroData={countryData.hero} />

          {/* Country Selector */}
          <CountrySelector
            countries={countries}
            selectedCountry={selectedCountry}
            onSelectCountry={handleCountrySelect}
          />

          {/* Dashboard */}
          <Dashboard countryData={countryData} />
        </>
      )}

      {/* Footer */}
      <footer className="bg-forest text-cream py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Climate Impact Showcase</h3>
          <p className="text-cream/80 mb-6">
            A demonstration of data-driven climate storytelling by Data4Earth
          </p>
          <p className="text-sm text-cream/60">
            Data sources: Scripps CO₂ Program, NASA GISS, GRACE/GRACE-FO (NASA JPL), World Bank Climate Change Knowledge Portal & ND-GAIN Country Index
          </p>
          <p className="text-xs text-cream/50 mt-4">
            This is a proof-of-concept MVP. Predictions use time-series analysis: CO₂ (linear trend + seasonality), Temperature (polynomial trend), Antarctic Ice (linear regression). All projections assume current trends continue.
          </p>
        </div>
      </footer>
    </main>
  );
}
