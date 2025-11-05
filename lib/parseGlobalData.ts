/**
 * Utility functions for parsing and processing global climate data
 */

import { parseTemperatureYearlyCSV, TemperatureYearlyDataPoint } from './parseTemperatureData';
import { 
  parseArcticIceCSV, 
  calculateLinearRegression, 
  addPredictionsToData,
  ArcticIceDataPoint as ArcticIceRawDataPoint 
} from './parseArcticIceData';

export interface CO2DataPoint {
  year: number;
  month: number;
  ppm: number;
  date: string;
}

export interface TemperatureDataPoint {
  year: number;
  anomaly: number;
}

// Arctic ice data for visualization (simplified from raw data)
export interface ArcticIceDataPoint {
  year: number;
  month: number;
  massAnomaly: number; // In Gigatons (Gt)
  isPrediction?: boolean; // True for predicted values, false/undefined for historical
}

export interface GlobalClimateData {
  co2: {
    current: string;
    change: string;
    data: CO2DataPoint[];
  };
  temperature: {
    current: string;
    change: string;
    data: TemperatureDataPoint[];
  };
  arcticIce: {
    current: string;
    change: string;
    annualLossRate: string; // The "hero stat"
    data: ArcticIceDataPoint[];
  };
}

/**
 * Parse CO2 CSV data from Mauna Loa Observatory
 * CSV format: Year, Month, Date, Date, CO2, ...
 * We extract columns 1 (Year), 2 (Month), and 5 (CO2 ppm)
 */
export function parseCO2CSV(csvContent: string): CO2DataPoint[] {
  const lines = csvContent.split('\n');
  const data: CO2DataPoint[] = [];

  for (const line of lines) {
    // Skip empty lines and header/comment lines (those starting with " or containing only dashes)
    if (!line.trim() || line.startsWith('"') || line.startsWith('-')) {
      continue;
    }

    const columns = line.split(',').map(col => col.trim());
    
    // We need at least 5 columns
    if (columns.length < 5) continue;

    const year = parseInt(columns[0]);
    const month = parseInt(columns[1]);
    const ppm = parseFloat(columns[4]);

    // Skip invalid data (marked as -99.99 in the dataset)
    if (isNaN(year) || isNaN(month) || isNaN(ppm) || ppm < 0) {
      continue;
    }

    data.push({
      year,
      month,
      ppm,
      date: `${year}-${String(month).padStart(2, '0')}`,
    });
  }

  return data;
}

/**
 * Parse real temperature anomaly data from NASA GISS CSV file
 * Returns yearly temperature anomalies (relative to 1951-1980 baseline)
 */
export function parseTemperatureData(csvContent: string): TemperatureDataPoint[] {
  // Parse the NASA GISS temperature data
  const yearlyData = parseTemperatureYearlyCSV(csvContent);
  
  // Convert to the expected format
  return yearlyData.map(d => ({
    year: d.year,
    anomaly: d.anomaly
  }));
}

/**
 * Parse real Antarctic ice mass data from GRACE satellites
 * Returns data from AIS_COSTG_0100_0003.csv (Antarctic Ice Sheet mass anomalies)
 * Includes predictions extending 15 years into the future
 */
export function parseArcticIceData(csvContent: string, includePredictions: boolean = true): ArcticIceDataPoint[] {
  // Parse the raw GRACE data
  const rawData = parseArcticIceCSV(csvContent);
  
  if (!includePredictions) {
    // Return just historical data
    return rawData.map(d => ({
      year: d.year,
      month: d.month,
      massAnomaly: d.massAnomaly,
      isPrediction: false,
    }));
  }
  
  // Calculate regression for predictions
  const regression = calculateLinearRegression(rawData);
  
  // Add predictions (15 years into future, like CO2 predictions)
  const dataWithPredictions = addPredictionsToData(rawData, regression, 15);
  
  // Convert to simplified format for visualization
  return dataWithPredictions.map(d => ({
    year: d.year,
    month: d.month,
    massAnomaly: d.massAnomaly,
    isPrediction: d.isPrediction,
  }));
}

/**
 * Calculate current values and trends from data
 */
export function calculateMetrics(
  co2Data: CO2DataPoint[],
  tempData: TemperatureDataPoint[],
  iceData: ArcticIceDataPoint[],
  iceCsvContent?: string
): GlobalClimateData {
  // Get latest CO2 value and calculate annual change
  const latestCO2 = co2Data[co2Data.length - 1];
  const lastYearCO2 = co2Data.filter(d => d.year === latestCO2.year - 1);
  const avgLastYear = lastYearCO2.reduce((sum, d) => sum + d.ppm, 0) / lastYearCO2.length;
  const co2Change = latestCO2.ppm - avgLastYear;

  // Get latest temperature
  const latestTemp = tempData[tempData.length - 1];
  
  // Calculate temperature change rate (comparing last 10 years average to previous 10 years)
  const recent10Years = tempData.slice(-10);
  const previous10Years = tempData.slice(-20, -10);
  const recentAvg = recent10Years.reduce((sum, d) => sum + d.anomaly, 0) / recent10Years.length;
  const previousAvg = previous10Years.reduce((sum, d) => sum + d.anomaly, 0) / previous10Years.length;
  const tempChange = recentAvg - previousAvg;

  // Calculate Antarctic ice loss metrics using linear regression
  let annualLossRate = '-150.5'; // Default fallback
  
  // Get the last HISTORICAL data point (not predictions)
  // iceData includes both historical and predicted values
  const lastHistoricalIce = iceData.filter(d => d.isPrediction === false).pop();
  let latestMass = lastHistoricalIce ? lastHistoricalIce.massAnomaly : iceData[0].massAnomaly;
  let totalLoss = 0;
  
  if (iceCsvContent) {
    const rawIceData = parseArcticIceCSV(iceCsvContent);
    const regression = calculateLinearRegression(rawIceData);
    annualLossRate = regression.slope.toFixed(1);
    
    // Calculate total loss over the measurement period (historical data only)
    const firstMass = rawIceData[0].massAnomaly;
    const lastMass = rawIceData[rawIceData.length - 1].massAnomaly;
    latestMass = lastMass; // Use actual current measurement
    totalLoss = lastMass - firstMass;
  } else {
    // Calculate from simplified data (historical only)
    const historicalData = iceData.filter(d => d.isPrediction === false);
    const firstMass = historicalData[0].massAnomaly;
    latestMass = historicalData[historicalData.length - 1].massAnomaly;
    totalLoss = latestMass - firstMass;
    const yearsSpan = historicalData[historicalData.length - 1].year - historicalData[0].year;
    annualLossRate = (totalLoss / yearsSpan).toFixed(1);
  }

  return {
    co2: {
      current: `${latestCO2.ppm.toFixed(1)} ppm`,
      change: `+${co2Change.toFixed(1)} ppm/year`,
      data: co2Data,
    },
    temperature: {
      current: `+${latestTemp.anomaly.toFixed(2)}°C`,
      change: `+${tempChange.toFixed(2)}°C per decade`,
      data: tempData,
    },
    arcticIce: {
      current: `${latestMass.toFixed(0)} Gt`,
      change: `${totalLoss.toFixed(0)} Gt total loss`,
      annualLossRate: `${annualLossRate} Gt/year`,
      data: iceData,
    },
  };
}

