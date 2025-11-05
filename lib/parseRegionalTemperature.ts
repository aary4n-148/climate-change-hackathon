/**
 * Parse regional temperature data from historical daily data and ensemble forecasts
 */

interface HistoricalDataPoint {
  year: number;
  temperature: number;
  type: 'historical';
}

interface ForecastDataPoint {
  year: number;
  temperature: number;
  temperatureLow?: number;  // 5th percentile
  temperatureHigh?: number; // 95th percentile
  type: 'predicted';
}

type TemperatureDataPoint = HistoricalDataPoint | ForecastDataPoint;

/**
 * Parse daily historical temperature data and aggregate to annual means
 */
export function parseHistoricalDaily(csvContent: string): HistoricalDataPoint[] {
  const lines = csvContent.trim().split('\n');
  const yearlyData: { [year: number]: number[] } = {};

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [dateStr, tempStr] = line.split(',');
    const year = parseInt(dateStr.split('-')[0]);
    const temp = parseFloat(tempStr);

    if (!isNaN(year) && !isNaN(temp)) {
      if (!yearlyData[year]) {
        yearlyData[year] = [];
      }
      yearlyData[year].push(temp);
    }
  }

  // Calculate annual means
  const annualData: HistoricalDataPoint[] = [];
  for (const year in yearlyData) {
    const temps = yearlyData[year];
    const mean = temps.reduce((sum, t) => sum + t, 0) / temps.length;
    annualData.push({
      year: parseInt(year),
      temperature: parseFloat(mean.toFixed(2)),
      type: 'historical',
    });
  }

  return annualData.sort((a, b) => a.year - b.year);
}

/**
 * Parse ensemble forecast CSV and calculate median and confidence intervals for each year
 * The ensemble CSV has columns 0-299 with 300 simulations
 */
export function parseEnsembleForecast(csvContent: string): ForecastDataPoint[] {
  const lines = csvContent.trim().split('\n');
  const forecastData: ForecastDataPoint[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    const dateStr = parts[0];
    const year = parseInt(dateStr.split('-')[0]);

    if (isNaN(year)) continue;

    // Extract all ensemble values (skip first column which is the date)
    const ensembleValues: number[] = [];
    for (let j = 1; j < parts.length; j++) {
      const val = parseFloat(parts[j]);
      if (!isNaN(val)) {
        ensembleValues.push(val);
      }
    }

    if (ensembleValues.length > 0) {
      // Sort for percentile calculations
      ensembleValues.sort((a, b) => a - b);
      
      // Calculate median (50th percentile)
      const medianIdx = Math.floor(ensembleValues.length / 2);
      const median = ensembleValues[medianIdx];
      
      // Calculate 5th percentile (lower bound)
      const p5Idx = Math.floor(ensembleValues.length * 0.05);
      const p5 = ensembleValues[p5Idx];
      
      // Calculate 95th percentile (upper bound)
      const p95Idx = Math.floor(ensembleValues.length * 0.95);
      const p95 = ensembleValues[p95Idx];

      forecastData.push({
        year,
        temperature: parseFloat(median.toFixed(2)),
        temperatureLow: parseFloat(p5.toFixed(2)),
        temperatureHigh: parseFloat(p95.toFixed(2)),
        type: 'predicted',
      });
    }
  }

  return forecastData;
}

/**
 * Combine historical and forecast data into a unified dataset
 */
export function combineTemperatureData(
  historical: HistoricalDataPoint[],
  forecast: ForecastDataPoint[]
): TemperatureDataPoint[] {
  return [...historical, ...forecast];
}

/**
 * Parse all regional temperature data for a given region
 * This is the main function to use for loading regional temperature data
 */
export async function loadRegionalTemperatureData(
  regionSlug: string
): Promise<TemperatureDataPoint[]> {
  try {
    // Fetch historical data
    const historicalResponse = await fetch(
      `/data/regional_temps/${regionSlug}_daily.csv`
    );
    const historicalContent = await historicalResponse.text();
    const historical = parseHistoricalDaily(historicalContent);

    // Fetch ensemble forecast data
    const forecastResponse = await fetch(
      `/data/regional_temps/${regionSlug}_hw_ensemble.csv`
    );
    const forecastContent = await forecastResponse.text();
    const forecast = parseEnsembleForecast(forecastContent);

    // Combine and return
    return combineTemperatureData(historical, forecast);
  } catch (error) {
    console.error(`Error loading temperature data for ${regionSlug}:`, error);
    throw error;
  }
}

/**
 * Format temperature data for use with the chart component
 * This matches the format used by GlobalMetricSection
 */
export function formatForChart(data: TemperatureDataPoint[]) {
  return data.map((point) => ({
    year: point.year,
    temperature: point.temperature,
    type: point.type,
  }));
}

