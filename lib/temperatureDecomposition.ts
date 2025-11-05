/**
 * Time Series Decomposition for Global Temperature Predictions
 * 
 * This module implements classical decomposition for NASA GISS temperature anomaly data.
 * Unlike CO2 which has strong seasonality, temperature anomalies have:
 * 1. Strong non-linear trend (accelerating warming)
 * 2. Weak/irregular seasonality (already removed in anomaly calculation)
 * 3. Moderate noise from natural variability (ENSO, volcanic eruptions, etc.)
 * 
 * Key Difference from CO2 Model:
 * - Uses POLYNOMIAL regression (not linear) to capture accelerating warming
 * - Focuses on TREND component (seasonality is minimal in annual anomalies)
 * - Projects the trend curve into the future
 */

import { TemperatureMonthlyDataPoint } from './parseTemperatureData';

interface DecomposedTemperatureData {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

/**
 * Calculate moving average for trend extraction
 * Using a 12-month moving average to smooth out short-term variability
 */
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  const halfWindow = Math.floor(window / 2);
  
  for (let i = 0; i < data.length; i++) {
    if (i < halfWindow || i >= data.length - halfWindow) {
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = i - halfWindow; j <= i + halfWindow; j++) {
        sum += data[j];
      }
      result.push(sum / window);
    }
  }
  
  return result;
}

/**
 * Extract minimal seasonal pattern (though temperature anomalies have little seasonality)
 */
function extractSeasonality(data: number[], trend: number[], period: number = 12): number[] {
  // Calculate detrended data
  const detrended = data.map((val, i) => 
    isNaN(trend[i]) ? NaN : val - trend[i]
  );
  
  // Calculate average for each month
  const seasonalPattern: number[] = new Array(period).fill(0);
  const counts: number[] = new Array(period).fill(0);
  
  detrended.forEach((val, i) => {
    if (!isNaN(val)) {
      const monthIndex = i % period;
      seasonalPattern[monthIndex] += val;
      counts[monthIndex]++;
    }
  });
  
  // Average and center the seasonal pattern
  const avgSeasonalPattern = seasonalPattern.map((sum, i) => 
    counts[i] > 0 ? sum / counts[i] : 0
  );
  
  const mean = avgSeasonalPattern.reduce((a, b) => a + b, 0) / period;
  const centeredPattern = avgSeasonalPattern.map(val => val - mean);
  
  // Repeat the pattern for the entire data length
  return data.map((_, i) => centeredPattern[i % period]);
}

/**
 * Perform classical time series decomposition
 */
function decompose(data: TemperatureMonthlyDataPoint[]): DecomposedTemperatureData {
  const values = data.map(d => d.anomaly);
  
  // Extract trend using 12-month moving average
  const trend = movingAverage(values, 12);
  
  // Extract seasonality (minimal for temperature anomalies)
  const seasonal = extractSeasonality(values, trend, 12);
  
  // Calculate residual
  const residual = values.map((val, i) => 
    isNaN(trend[i]) ? NaN : val - trend[i] - seasonal[i]
  );
  
  return { trend, seasonal, residual };
}

/**
 * Fit a POLYNOMIAL regression to the trend
 * This is the KEY DIFFERENCE from the CO2 model
 * 
 * Temperature warming is accelerating (non-linear), so we use:
 * y = a*x^2 + b*x + c (quadratic polynomial)
 * 
 * This captures the "hockey stick" shape of global warming
 */
function fitPolynomialTrend(
  data: TemperatureMonthlyDataPoint[], 
  trend: number[],
  degree: number = 2
): (x: number) => number {
  // Filter out NaN values - use ALL valid data for polynomial fitting
  const validPoints: { x: number; y: number }[] = [];
  trend.forEach((val, i) => {
    if (!isNaN(val)) {
      validPoints.push({ x: i, y: val });
    }
  });
  
  // For polynomial regression, we use the entire dataset
  // (Unlike CO2 where we used recent data, here we need the full curve)
  
  if (degree === 2) {
    // Quadratic polynomial: y = a*x^2 + b*x + c
    return fitQuadraticRegression(validPoints);
  } else if (degree === 1) {
    // Linear fallback: y = m*x + b
    return fitLinearRegression(validPoints);
  } else {
    throw new Error('Only degree 1 or 2 supported');
  }
}

/**
 * Fit quadratic regression: y = a*x^2 + b*x + c
 * Solves the normal equations using matrix algebra
 */
function fitQuadraticRegression(points: { x: number; y: number }[]): (x: number) => number {
  const n = points.length;
  
  // Calculate sums needed for normal equations
  let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
  let sumY = 0, sumXY = 0, sumX2Y = 0;
  
  points.forEach(({ x, y }) => {
    sumX += x;
    sumX2 += x * x;
    sumX3 += x * x * x;
    sumX4 += x * x * x * x;
    sumY += y;
    sumXY += x * y;
    sumX2Y += x * x * y;
  });
  
  // Solve 3x3 system of equations using Cramer's rule
  // [n     sumX   sumX2 ] [c]   [sumY  ]
  // [sumX  sumX2  sumX3 ] [b] = [sumXY ]
  // [sumX2 sumX3  sumX4 ] [a]   [sumX2Y]
  
  const det = n * (sumX2 * sumX4 - sumX3 * sumX3) 
            - sumX * (sumX * sumX4 - sumX2 * sumX3)
            + sumX2 * (sumX * sumX3 - sumX2 * sumX2);
  
  const detC = sumY * (sumX2 * sumX4 - sumX3 * sumX3)
             - sumX * (sumXY * sumX4 - sumX2Y * sumX3)
             + sumX2 * (sumXY * sumX3 - sumX2Y * sumX2);
  
  const detB = n * (sumXY * sumX4 - sumX2Y * sumX3)
             - sumY * (sumX * sumX4 - sumX2 * sumX3)
             + sumX2 * (sumX * sumX2Y - sumXY * sumX2);
  
  const detA = n * (sumX2 * sumX2Y - sumX3 * sumXY)
             - sumX * (sumX * sumX2Y - sumX2 * sumXY)
             + sumY * (sumX * sumX3 - sumX2 * sumX2);
  
  const c = detC / det;
  const b = detB / det;
  const a = detA / det;
  
  // Return the polynomial function
  return (x: number) => a * x * x + b * x + c;
}

/**
 * Fit linear regression: y = m*x + b (fallback)
 */
function fitLinearRegression(points: { x: number; y: number }[]): (x: number) => number {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  points.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  const m = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
  const b = meanY - m * meanX;
  
  return (x: number) => m * x + b;
}

/**
 * Generate future temperature predictions using polynomial trend
 * 
 * This is the core forecasting function that projects warming into the future
 */
export function generateTemperaturePredictions(
  historicalData: TemperatureMonthlyDataPoint[],
  monthsAhead: number = 36,
  polynomialDegree: number = 2
): TemperatureMonthlyDataPoint[] {
  // Perform decomposition
  const { trend, seasonal } = decompose(historicalData);
  
  // Fit polynomial trend to the smoothed trend values
  const trendFunc = fitPolynomialTrend(historicalData, trend, polynomialDegree);
  
  // Get the seasonal pattern (last 12 months)
  const seasonalPattern = seasonal.slice(-12);
  
  // Calculate adjustment to ensure continuity with last historical point
  const lastDataPoint = historicalData[historicalData.length - 1];
  const lastIndex = historicalData.length - 1;
  const lastModelValue = trendFunc(lastIndex) + seasonal[lastIndex];
  const adjustment = lastDataPoint.anomaly - lastModelValue;
  
  // Generate predictions
  const predictions: TemperatureMonthlyDataPoint[] = [];
  const startIndex = historicalData.length;
  
  for (let i = 0; i < monthsAhead; i++) {
    const monthIndex = startIndex + i;
    
    // Calculate trend value using polynomial
    const trendValue = trendFunc(monthIndex);
    
    // Get seasonal component (minimal for temperature anomalies)
    const seasonalValue = seasonalPattern[i % 12];
    
    // Combine trend + seasonality + adjustment for continuity
    const predictedAnomaly = trendValue + seasonalValue + adjustment;
    
    // Calculate date
    const monthsFromStart = (lastDataPoint.year - historicalData[0].year) * 12 
                          + lastDataPoint.month + i;
    const year = historicalData[0].year + Math.floor(monthsFromStart / 12);
    const month = (monthsFromStart % 12) + 1;
    
    predictions.push({
      year,
      month,
      anomaly: parseFloat(predictedAnomaly.toFixed(3)),
      date: `${year}-${String(month).padStart(2, '0')}`,
    });
  }
  
  return predictions;
}

/**
 * Add predictions to the temperature data
 * Marks historical vs predicted data for visualization
 */
export function addTemperaturePredictions(
  temperatureData: any,
  monthsAhead: number = 180, // 15 years (to match CO2)
  polynomialDegree: number = 2
) {
  const historicalData: TemperatureMonthlyDataPoint[] = temperatureData.data;
  const predictions = generateTemperaturePredictions(
    historicalData, 
    monthsAhead, 
    polynomialDegree
  );
  
  // Mark historical vs predicted data
  const markedHistorical = historicalData.map(d => ({ ...d, type: 'historical' }));
  const markedPredictions = predictions.map(d => ({ ...d, type: 'predicted' }));
  
  return {
    ...temperatureData,
    data: [...markedHistorical, ...markedPredictions],
    predictions: predictions,
    predictionMonths: monthsAhead,
  };
}

/**
 * Export decomposition function for analysis/visualization
 */
export function decomposeTemperature(data: TemperatureMonthlyDataPoint[]): DecomposedTemperatureData {
  return decompose(data);
}

