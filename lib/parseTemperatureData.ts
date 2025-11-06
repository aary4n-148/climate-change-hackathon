/**
 * Temperature Data Parser for NASA GISS Global Temperature Anomaly Data
 * 
 * Dataset: Land-Ocean Temperature Index (GLB.Ts+dSST)
 * Source: NASA Goddard Institute for Space Studies (GISS)
 * 
 * This parser extracts monthly temperature anomalies from the CSV file.
 * Anomalies are relative to the 1951-1980 baseline period.
 */

export interface TemperatureMonthlyDataPoint {
  year: number;
  month: number;
  anomaly: number;
  date: string;
}

export interface TemperatureYearlyDataPoint {
  year: number;
  anomaly: number;
}

/**
 * Parse the NASA GISS temperature CSV file
 * Returns monthly data points for detailed time series analysis
 */
export function parseTemperatureCSV(csvContent: string): TemperatureMonthlyDataPoint[] {
  const lines = csvContent.split('\n');
  const data: TemperatureMonthlyDataPoint[] = [];
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (const line of lines) {
    // Skip header lines and empty lines
    if (!line.trim() || line.includes('Land-Ocean') || line.includes('Year,Jan')) {
      continue;
    }
    
    const columns = line.split(',').map(col => col.trim());
    
    // Need at least year + 12 months
    if (columns.length < 13) continue;
    
    const year = parseInt(columns[0]);
    if (isNaN(year) || year < 1880) continue;
    
    // Extract monthly values (columns 1-12)
    for (let month = 0; month < 12; month++) {
      const anomalyStr = columns[month + 1];
      
      // Skip missing data (marked as *** or empty)
      if (!anomalyStr || anomalyStr === '***' || anomalyStr.trim() === '') {
        continue;
      }
      
      const anomaly = parseFloat(anomalyStr);
      
      // Skip invalid values
      if (isNaN(anomaly)) {
        continue;
      }
      
      data.push({
        year,
        month: month + 1, // 1-based month
        anomaly,
        date: `${year}-${String(month + 1).padStart(2, '0')}`,
      });
    }
  }
  
  return data;
}

/**
 * Parse the NASA GISS temperature CSV file for yearly averages
 * Uses the J-D (January-December) column which is the annual mean
 */
export function parseTemperatureYearlyCSV(csvContent: string): TemperatureYearlyDataPoint[] {
  const lines = csvContent.split('\n');
  const data: TemperatureYearlyDataPoint[] = [];
  
  for (const line of lines) {
    // Skip header lines and empty lines
    if (!line.trim() || line.includes('Land-Ocean') || line.includes('Year,Jan')) {
      continue;
    }
    
    const columns = line.split(',').map(col => col.trim());
    
    // Need at least year + 12 months + J-D column (column 13)
    if (columns.length < 14) continue;
    
    const year = parseInt(columns[0]);
    if (isNaN(year) || year < 1880) continue;
    
    // Column 13 is J-D (annual mean)
    const anomalyStr = columns[13];
    
    // Skip missing data
    if (!anomalyStr || anomalyStr === '***' || anomalyStr.trim() === '') {
      continue;
    }
    
    const anomaly = parseFloat(anomalyStr);
    
    // Skip invalid values
    if (isNaN(anomaly)) {
      continue;
    }
    
    data.push({
      year,
      anomaly,
    });
  }
  
  return data;
}

/**
 * Convert monthly data to yearly averages (for comparison/validation)
 */
export function monthlyToYearly(monthlyData: TemperatureMonthlyDataPoint[]): TemperatureYearlyDataPoint[] {
  const yearMap = new Map<number, number[]>();
  
  // Group by year
  monthlyData.forEach(d => {
    if (!yearMap.has(d.year)) {
      yearMap.set(d.year, []);
    }
    yearMap.get(d.year)!.push(d.anomaly);
  });
  
  // Calculate yearly averages
  const yearlyData: TemperatureYearlyDataPoint[] = [];
  yearMap.forEach((anomalies, year) => {
    const avg = anomalies.reduce((sum, val) => sum + val, 0) / anomalies.length;
    yearlyData.push({
      year,
      anomaly: parseFloat(avg.toFixed(3)),
    });
  });
  
  return yearlyData.sort((a, b) => a.year - b.year);
}


