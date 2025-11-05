# CO₂ Dataset & Prediction Model Summary

## Dataset Information

**Source:** Scripps CO₂ Program, Mauna Loa Observatory, Hawaii  
**Website:** http://scrippsco2.ucsd.edu  
**Location:** 19.5°N, 155.6°W, Elevation 3,397m  
**Time Period:** March 1958 - July 2025 (804 monthly measurements)  
**Historical Significance:** The "Keeling Curve" - the longest continuous atmospheric CO₂ record

### Citation
C. D. Keeling, S. C. Piper, R. B. Bacastow, M. Wahlen, T. P. Whorf, M. Heimann, and H. A. Meijer, "Exchanges of atmospheric CO₂ and ¹³CO₂ with the terrestrial biosphere and oceans from 1978 to 2000. I. Global aspects," SIO Reference Series, No. 01-06, Scripps Institution of Oceanography, San Diego, 88 pages, 2001.

### Contact
- Dr. Ralph Keeling: rkeeling@ucsd.edu
- Stephen Walker: sjwalker@ucsd.edu  
- Stephen Piper: scpiper@ucsd.edu

---

## Prediction Model

### Model Type: Classical Time Series Decomposition

**Approach:** Separates the Keeling Curve into three components:
1. **Trend** - Long-term upward movement (extracted via 12-month moving average)
2. **Seasonality** - Annual vegetation cycle (averaged monthly pattern)
3. **Residual** - Random noise (not used in forecasting)

### Forecasting Method

**Trend Forecasting:**
- Uses linear regression on recent trend: `CO₂ = m×month + b`
- Fitted to the last 10 years (120 months) of data for stable extrapolation
- Avoids wild predictions from polynomial overfitting on long-term extrapolation

**Seasonal Forecasting:**
- Repeats the consistent 12-month seasonal pattern
- Pattern driven by Northern Hemisphere vegetation cycle
  - Spring/Summer: Plant growth → CO₂ drops
  - Fall/Winter: Plant decay → CO₂ rises

**Final Prediction:** Trend Forecast + Seasonal Pattern

### Forecast Horizon
- **Predictions:** August 2025 - July 2040 (180 months)
- **Total data points visualized:** 984 (804 historical + 180 predicted)

---

## Why This Model?

✅ **Explainable:** Every prediction can be traced to mathematical operations  
✅ **Accurate:** Proven approach for data with clear trend + seasonality  
✅ **Scientific:** Standard textbook method for time series analysis  
✅ **Efficient:** Fast computation, no complex training required  

---

## Key Insights from Predictions

Based on current trends (1958-2025), the model forecasts:

- **Continued Acceleration:** CO₂ growth rate continues to increase
- **Seasonal Consistency:** Annual oscillation amplitude remains stable
- **2030 Projection:** ~440 ppm (if current trends continue)
- **2040 Projection:** ~460 ppm (if current trends continue)

⚠️ **Important Caveat:** These predictions assume current emission trends continue unchanged. Major policy interventions, technological breakthroughs, or economic shifts could alter this trajectory.

---

## Visualization

**Historical Data:** Solid line (March 1958 - July 2025)  
**Predicted Data:** Dashed line (August 2025 - July 2040)  
**Safe Level Reference:** 350 ppm (pre-industrial + safe buffer)

The visualization clearly shows:
1. The relentless upward trend (climate crisis)
2. The regular seasonal "breathing" (biosphere cycle)
3. The accelerating rate of increase (worsening problem)

---

## Model Limitations

⚠️ Cannot account for:
- Major climate policy changes
- Breakthrough carbon capture technologies  
- Economic disruptions or pandemics
- Unexpected natural feedback loops
- Shifts in land use patterns

The model provides a "business as usual" scenario baseline.

---

## Technical Implementation

**Files:**
- `lib/timeSeriesDecomposition.ts` - Prediction algorithm
- `components/GlobalMetricSection.tsx` - Visualization
- `app/page.tsx` - Data loading and integration

**Key Functions:**
- `decompose()` - Separates trend, seasonal, residual
- `fitTrendLine()` - Polynomial regression on trend
- `generateCO2Predictions()` - Creates future forecasts
- `addPredictions()` - Integrates predictions with historical data

---

*Data Last Updated: August 2025*  
*Model Version: 1.0*  
*Prediction Horizon: 2040*

