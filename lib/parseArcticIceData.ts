/**
 * Utility functions for parsing Antarctic ice mass data from GRACE satellites
 * 
 * Data source: GRACE/GRACE-FO satellite measurements
 * Dataset: AIS_COSTG_0100_0003.csv (Antarctic Ice Sheet)
 * Measurements: Mass anomaly in Gigatons (Gt) relative to 2002-2020 baseline
 */

export interface ArcticIceDataPoint {
  date: string;          // ISO date string (YYYY-MM-DD)
  year: number;          // Year
  month: number;         // Month (1-12)
  massAnomaly: number;   // Mass anomaly in Gigatons (Gt)
  uncertainty: number;   // Measurement uncertainty in Gt
}

export interface ArcticIceLinearRegression {
  slope: number;         // Rate of ice loss (Gt/year)
  intercept: number;     // Y-intercept
  rSquared: number;      // R² value (goodness of fit)
  prediction: (year: number) => number; // Function to predict mass anomaly for a given year
}

/**
 * Parse Antarctic ice mass CSV data from GRACE satellites
 * CSV format: time [yyyy_doy], time [yyyy-mm-dd], global [Gt], uncertainty_global [Gt], ...
 * We extract columns: time [yyyy-mm-dd] (index 1), global [Gt] (index 2), uncertainty_global [Gt] (index 3)
 */
export function parseArcticIceCSV(csvContent: string): ArcticIceDataPoint[] {
  const lines = csvContent.split('\n');
  const data: ArcticIceDataPoint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and header line
    if (!line || i === 0) {
      continue;
    }

    const columns = line.split(',').map(col => col.trim());
    
    // We need at least 4 columns (time_doy, time_date, global, uncertainty)
    if (columns.length < 4) continue;

    const dateStr = columns[1]; // yyyy-mm-dd
    const massAnomaly = parseFloat(columns[2]); // Gt
    const uncertainty = parseFloat(columns[3]); // Gt

    // Skip invalid data
    if (!dateStr || isNaN(massAnomaly) || isNaN(uncertainty)) {
      continue;
    }

    // Parse the date
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) continue;

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);

    if (isNaN(year) || isNaN(month)) continue;

    data.push({
      date: dateStr,
      year,
      month,
      massAnomaly,
      uncertainty,
    });
  }

  return data;
}

/**
 * Perform linear regression on Antarctic ice mass data
 * This calculates the rate of ice loss (slope) in Gigatons per year
 * 
 * The Hero Stat: The slope tells us how much ice Antarctica is losing each year
 * Example: -150.5 Gt/year means Antarctica is losing 150.5 billion tonnes per year
 */
export function calculateLinearRegression(data: ArcticIceDataPoint[]): ArcticIceLinearRegression {
  const n = data.length;
  
  // Convert dates to decimal years for regression
  // Example: 2002-04-18 becomes 2002 + (108 days / 365 days) ≈ 2002.296
  const points: { x: number; y: number }[] = data.map(d => {
    const startOfYear = new Date(d.year, 0, 1).getTime();
    const currentDate = new Date(d.date).getTime();
    const yearProgress = (currentDate - startOfYear) / (1000 * 60 * 60 * 24 * 365);
    
    return {
      x: d.year + yearProgress, // Decimal year
      y: d.massAnomaly,         // Mass anomaly in Gt
    };
  });

  // Calculate means
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate slope (m) and intercept (b) for line y = mx + b
  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) * (point.x - meanX);
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R² (coefficient of determination)
  const yPredicted = points.map(p => slope * p.x + intercept);
  const ssRes = points.reduce((sum, p, i) => sum + Math.pow(p.y - yPredicted[i], 2), 0);
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);

  return {
    slope,
    intercept,
    rSquared,
    prediction: (year: number) => slope * year + intercept,
  };
}

/**
 * Get formatted statistics for presentation
 */
export function getArcticIceStats(data: ArcticIceDataPoint[], regression: ArcticIceLinearRegression) {
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  
  // Calculate total loss
  const totalLoss = lastPoint.massAnomaly - firstPoint.massAnomaly;
  const yearsSpan = lastPoint.year - firstPoint.year + 
                    (lastPoint.month - firstPoint.month) / 12;

  return {
    // Time period
    startDate: firstPoint.date,
    endDate: lastPoint.date,
    yearsSpan: yearsSpan.toFixed(1),
    
    // Mass changes
    firstMass: firstPoint.massAnomaly.toFixed(1),
    lastMass: lastPoint.massAnomaly.toFixed(1),
    totalLoss: totalLoss.toFixed(1),
    
    // Regression stats (THE HERO STATS)
    annualLossRate: regression.slope.toFixed(1), // Gt/year
    rSquared: regression.rSquared.toFixed(4),
    
    // Predictions
    predict2030: regression.prediction(2030).toFixed(1),
    predict2040: regression.prediction(2040).toFixed(1),
    predict2050: regression.prediction(2050).toFixed(1),
  };
}

/**
 * Generate prediction points for visualization
 * Creates predictions extending from the last data point to the end year
 */
export function generatePredictions(
  regression: ArcticIceLinearRegression,
  startYear: number,
  endYear: number,
  pointsPerYear: number = 12 // Monthly predictions (matching historical data frequency)
): ArcticIceDataPoint[] {
  const predictions: ArcticIceDataPoint[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    for (let monthIdx = 0; monthIdx < pointsPerYear; monthIdx++) {
      const month = monthIdx + 1;
      const decimalYear = year + (monthIdx / pointsPerYear);
      const massAnomaly = regression.prediction(decimalYear);
      
      predictions.push({
        date: `${year}-${String(month).padStart(2, '0')}-15`,
        year,
        month,
        massAnomaly,
        uncertainty: 0, // Predictions don't have uncertainty in this simple model
      });
    }
  }
  
  return predictions;
}

/**
 * Add predictions to historical data for complete visualization
 * Returns combined dataset with isPrediction flag
 */
export function addPredictionsToData(
  historicalData: ArcticIceDataPoint[],
  regression: ArcticIceLinearRegression,
  predictionYears: number = 15 // Default: predict 15 years into future
): Array<ArcticIceDataPoint & { isPrediction: boolean }> {
  const lastDataPoint = historicalData[historicalData.length - 1];
  const startPredictionYear = lastDataPoint.year + 1;
  const endPredictionYear = startPredictionYear + predictionYears - 1;
  
  const predictions = generatePredictions(
    regression,
    startPredictionYear,
    endPredictionYear,
    12 // Monthly
  );
  
  // Mark historical data as not predictions
  const markedHistorical = historicalData.map(d => ({
    ...d,
    isPrediction: false
  }));
  
  // Mark predictions
  const markedPredictions = predictions.map(d => ({
    ...d,
    isPrediction: true
  }));
  
  return [...markedHistorical, ...markedPredictions];
}

