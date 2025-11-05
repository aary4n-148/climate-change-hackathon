/**
 * Classical Time Series Decomposition for CO2 Predictions
 * 
 * This module implements a classical decomposition approach for the Keeling Curve data.
 * It separates the data into:
 * 1. Trend (long-term upward movement) - extracted via 12-month moving average
 * 2. Seasonality (repeating annual pattern) - averaged monthly cycle
 * 3. Residual (random noise) - not used in predictions
 * 
 * Predictions use linear regression on recent trend (last 10 years) + seasonal pattern.
 * This provides stable, realistic extrapolation without overfitting.
 */

interface DataPoint {
  year: number;
  month: number;
  ppm: number;
  date: string;
}

interface DecomposedData {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

/**
 * Calculate moving average for trend extraction
 * Using a 12-month moving average to smooth out seasonal variation
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
 * Extract seasonal pattern by averaging values for each month
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
function decompose(data: DataPoint[]): DecomposedData {
  const values = data.map(d => d.ppm);
  
  // Extract trend using 12-month moving average
  const trend = movingAverage(values, 12);
  
  // Extract seasonality
  const seasonal = extractSeasonality(values, trend, 12);
  
  // Calculate residual
  const residual = values.map((val, i) => 
    isNaN(trend[i]) ? NaN : val - trend[i] - seasonal[i]
  );
  
  return { trend, seasonal, residual };
}

/**
 * Fit a linear regression to the recent trend
 * Using recent data (last 10 years) to avoid wild extrapolation
 */
function fitTrendLine(data: DataPoint[], trend: number[]): (x: number) => number {
  // Filter out NaN values and use only recent data (last 120 months = 10 years)
  const validPoints: { x: number; y: number }[] = [];
  trend.forEach((val, i) => {
    if (!isNaN(val)) {
      validPoints.push({ x: i, y: val });
    }
  });
  
  // Use only last 120 months (10 years) for more stable extrapolation
  const recentPoints = validPoints.slice(-120);
  
  // Fit simple linear regression: y = m*x + b
  const n = recentPoints.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  recentPoints.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // Calculate slope (m) and intercept (b)
  const m = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
  const b = meanY - m * meanX;
  
  return (x: number) => m * x + b;
}

/**
 * Generate future predictions using decomposition
 */
export function generateCO2Predictions(
  historicalData: DataPoint[],
  monthsAhead: number = 36
): DataPoint[] {
  // Perform decomposition
  const { trend, seasonal } = decompose(historicalData);
  
  // Fit trend line to valid trend values
  const trendFunc = fitTrendLine(historicalData, trend);
  
  // Get the seasonal pattern (last 12 months)
  const seasonalPattern = seasonal.slice(-12);
  
  // Calculate adjustment to ensure continuity with last historical point
  const lastDataPoint = historicalData[historicalData.length - 1];
  const lastIndex = historicalData.length - 1;
  const lastSeasonalIndex = (historicalData.length - 1) % 12;
  const lastModelValue = trendFunc(lastIndex) + seasonal[lastIndex];
  const adjustment = lastDataPoint.ppm - lastModelValue;
  
  // Generate predictions
  const predictions: DataPoint[] = [];
  const startIndex = historicalData.length;
  
  for (let i = 0; i < monthsAhead; i++) {
    const monthIndex = startIndex + i;
    
    // Calculate trend value
    const trendValue = trendFunc(monthIndex);
    
    // Get seasonal component (cycle through 12 months)
    const seasonalValue = seasonalPattern[i % 12];
    
    // Combine trend + seasonality + adjustment for continuity
    const predictedPPM = trendValue + seasonalValue + adjustment;
    
    // Calculate date
    const monthsFromStart = (lastDataPoint.year - historicalData[0].year) * 12 
                          + lastDataPoint.month + i + 1;
    const year = historicalData[0].year + Math.floor(monthsFromStart / 12);
    const month = (monthsFromStart % 12) || 12;
    const adjustedYear = month === 12 ? year - 1 : year;
    const adjustedMonth = month === 12 ? 12 : month;
    
    predictions.push({
      year: adjustedYear,
      month: adjustedMonth,
      ppm: Math.round(predictedPPM * 100) / 100,
      date: `${adjustedYear}-${String(adjustedMonth).padStart(2, '0')}`
    });
  }
  
  return predictions;
}

/**
 * Add predictions to the CO2 data
 */
export function addPredictions(co2Data: any, monthsAhead: number = 36) {
  const historicalData: DataPoint[] = co2Data.data;
  const predictions = generateCO2Predictions(historicalData, monthsAhead);
  
  // Mark historical vs predicted data
  const markedHistorical = historicalData.map(d => ({ ...d, type: 'historical' }));
  const markedPredictions = predictions.map(d => ({ ...d, type: 'predicted' }));
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('addPredictions:', {
      historicalCount: historicalData.length,
      predictionsCount: predictions.length,
      lastHistorical: historicalData[historicalData.length - 1],
      firstPrediction: predictions[0],
      totalAfterMerge: markedHistorical.length + markedPredictions.length
    });
  }
  
  return {
    ...co2Data,
    data: [...markedHistorical, ...markedPredictions],
    predictions: predictions,
    predictionMonths: monthsAhead
  };
}

