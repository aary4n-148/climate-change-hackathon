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
import { loadRegionalTemperatureData } from '@/lib/parseRegionalTemperature';

interface RegionData {
  regionName: string;
  regionCode: string;
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
  temperatureData?: any[];
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

const regions = [
  { id: 'London_UK', name: '🇬🇧 London, UK' },
  { id: 'USA', name: '🇺🇸 United States' },
  { id: 'Germany', name: '🇩🇪 Germany' },
  { id: 'Brazil', name: '🇧🇷 Brazil' },
  { id: 'India', name: '🇮🇳 India' },
  { id: 'Australia', name: '🇦🇺 Australia' },
  { id: 'SouthAfrica', name: '🇿🇦 South Africa' },
  { id: 'Arctic', name: '🧊 Arctic' },
];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState('London_UK');
  const [regionData, setRegionData] = useState<RegionData | null>(null);
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
    const fetchRegionData = async () => {
      setLoading(true);
      try {
        // Fetch region metadata (hero, summary, metrics)
        const response = await fetch(`/data/${selectedRegion}.json`);
        const data = await response.json();
        
        // Load temperature data for this region
        const tempData = await loadRegionalTemperatureData(selectedRegion);
        
        setRegionData({
          ...data,
          temperatureData: tempData,
        });
      } catch (error) {
        console.error('Error fetching region data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionData();
  }, [selectedRegion]);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
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
            Regional Temperature Forecasts
          </h2>
          <p className="text-xl text-charcoal/70 leading-relaxed">
            While climate change is a global crisis, warming rates vary dramatically by region. 
            Explore temperature trends and predictions for key locations around the world through 2050.
          </p>
        </div>
      </section>

      {/* Region Hero Section */}
      {loading || !regionData ? (
        <div className="min-h-[400px] bg-cream flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mb-4"></div>
            <p className="text-charcoal text-lg">Loading regional data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Region Selector */}
          <CountrySelector
            countries={regions}
            selectedCountry={selectedRegion}
            onSelectCountry={handleRegionSelect}
          />

          <HeroHeader heroData={regionData.hero} />

          {/* Dashboard */}
          <Dashboard countryData={regionData} />
        </>
      )}

      {/* Footer */}
      <footer className="bg-forest text-cream py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-3">Climate Impact Showcase</h3>
          <p className="text-sm text-cream/70">
            Data sources: Scripps CO₂ Program, NASA GISS, GRACE/GRACE-FO, Open-Meteo Climate API
          </p>
        </div>
      </footer>
    </main>
  );
}
