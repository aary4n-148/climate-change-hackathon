# Global Temperature Data Summary

## Dataset Overview

**Name:** GISS Surface Temperature Analysis (GISTEMP v4) - Land-Ocean Temperature Index  
**File:** `GLB.Ts+dSST.csv`  
**Source:** NASA Goddard Institute for Space Studies (GISS)  
**URL:** https://data.giss.nasa.gov/gistemp/

---

## What This Dataset Measures

### Temperature Anomalies (Not Absolute Temperature!)

This dataset does **not** show the actual temperature in degrees. Instead, it shows **anomalies**—how much warmer or colder each month/year is compared to a baseline period.

**Baseline Period:** 1951-1980 (30-year average)

**Example Interpretation:**
- Anomaly of `+0.50°C` means that period was 0.5°C warmer than the 1951-1980 average
- Anomaly of `-0.20°C` means that period was 0.2°C cooler than the 1951-1980 average
- Anomaly of `+1.30°C` (current) means we're 1.3°C warmer than the baseline

### Why Anomalies?

1. **Removes Geographic Bias:** The Arctic and Tropics have vastly different absolute temperatures, but anomalies can be meaningfully averaged.
2. **Removes Seasonal Effects:** We don't compare January to July; we compare *this* January to *past* Januaries.
3. **Highlights Climate Signal:** Long-term warming is much clearer in anomaly data.

---

## Dataset Structure

### File Format: CSV

The CSV file contains the following columns:

| Column | Name | Description | Example |
|--------|------|-------------|---------|
| 1 | Year | Calendar year | 2024 |
| 2-13 | Jan-Dec | Monthly anomalies (°C) | 1.25, 1.44, ... |
| 14 | J-D | Annual mean (Jan-Dec) | 1.28 |
| 15 | D-N | Annual mean (Dec-Nov) | 1.29 |
| 16 | DJF | Winter mean (Dec-Jan-Feb) | 1.35 |
| 17 | MAM | Spring mean (Mar-Apr-May) | 1.28 |
| 18 | JJA | Summer mean (Jun-Jul-Aug) | 1.23 |
| 19 | SON | Fall mean (Sep-Oct-Nov) | 1.28 |

**Note:** Missing data is marked with `***` (typically for incomplete years)

### Time Coverage

- **Start Date:** January 1880
- **End Date:** Present (updated monthly)
- **Total Duration:** 145+ years of continuous global temperature records
- **Data Points:** ~1,740 monthly measurements

### Geographic Coverage

**"Land-Ocean" Means:**
- **Land Component:** Air temperature measurements from weather stations worldwide
- **Ocean Component:** Sea surface temperature (SST) measurements from ships, buoys, and satellites
- **Coverage:** Global (all latitudes and longitudes weighted appropriately)

---

## Key Historical Trends

### The "Hockey Stick" Pattern

When plotted, global temperature anomalies show a distinctive shape:

1. **1880-1920:** Relatively flat, slight warming (~-0.2°C to 0°C)
2. **1920-1940:** Moderate warming (~0°C to +0.2°C)
3. **1940-1980:** Slight plateau (natural variability)
4. **1980-Present:** Rapid, accelerating warming (+0°C to +1.3°C)

### Major Features in the Data

#### Long-Term Trend: Accelerating Warming
- **Pre-1980:** Warming at ~0.05°C per decade
- **1980-2000:** Warming at ~0.15°C per decade
- **2000-2025:** Warming at ~0.25°C per decade

This acceleration is a key indicator of anthropogenic (human-caused) climate change.

#### Short-Term Variability: Natural Climate Cycles

Superimposed on the long-term trend are shorter oscillations caused by:

**El Niño / La Niña (ENSO):**
- **Warm Years:** 1983, 1998, 2016, 2023 (strong El Niño events)
- **Cool Years:** 1989, 2011 (La Niña events)
- **Effect:** ±0.2°C temporary deviation from trend

**Volcanic Eruptions:**
- **1883:** Krakatoa (minor cooling)
- **1963:** Agung (moderate cooling)
- **1982:** El Chichón (moderate cooling)
- **1991:** Mt. Pinatubo (largest recent event, ~0.3°C cooling for 2 years)
- **Effect:** Temporary cooling from stratospheric aerosols blocking sunlight

**Solar Cycles:**
- 11-year solar activity cycle
- **Effect:** Very small (~0.05°C), often masked by other factors

#### Recent Record Years

The 10 warmest years on record (ranked by annual mean anomaly):

1. **2024:** +1.28°C (preliminary, likely to be #1)
2. **2023:** +1.17°C
3. **2016:** +1.01°C (strong El Niño)
4. **2020:** +1.01°C
5. **2019:** +0.98°C
6. **2017:** +0.92°C
7. **2022:** +0.89°C
8. **2018:** +0.85°C
9. **2021:** +0.85°C
10. **2015:** +0.90°C

**Key Observation:** All 10 warmest years have occurred since 2015. This is not a coincidence—it's a clear signal of accelerating climate change.

---

## Statistical Characteristics

### Distribution

- **Mean (1880-2025):** ~+0.5°C (above baseline)
- **Median (1880-2025):** ~+0.3°C
- **Standard Deviation:** ~0.4°C
- **Range:** -0.72°C (1909) to +1.44°C (Feb 2024)

**Note:** The distribution is shifting upward over time. What was an "extreme hot year" in 1980 is now an average year.

### Trends by Era

| Period | Trend | Rate of Change | Physical Driver |
|--------|-------|----------------|-----------------|
| 1880-1920 | Slight warming | +0.05°C/decade | Early industrial emissions |
| 1920-1940 | Moderate warming | +0.10°C/decade | Increased emissions |
| 1940-1980 | Plateau/slight cooling | ~0°C/decade | Aerosol pollution masking warming |
| 1980-2025 | Rapid warming | +0.20°C/decade | GHG forcing exceeds aerosol cooling |

### Seasonality in Anomalies

Unlike absolute temperature (which has huge seasonal swings), anomalies show **minimal seasonality**:

- **Monthly Variation:** ~0.05°C (almost negligible)
- **Why So Small?** Anomalies are calculated relative to each month's historical average, removing the seasonal cycle by design

This is why temperature anomaly forecasts don't show the dramatic "zig-zag" pattern that CO₂ forecasts do.

---

## Data Quality & Limitations

### Strengths

✅ **Long Historical Record:** 145 years of data  
✅ **Global Coverage:** Comprehensive spatial sampling  
✅ **Rigorous Quality Control:** NASA GISS applies extensive validation and homogenization  
✅ **Multiple Independent Datasets Agree:** NOAA, Berkeley Earth, and Hadley Centre show nearly identical trends  
✅ **Well-Documented Methodology:** Peer-reviewed and continuously improved  

### Limitations & Uncertainties

⚠️ **Early Data (1880-1900):**
- Fewer measurement stations (mostly Northern Hemisphere)
- Uncertainty: ±0.1°C

⚠️ **Mid-Century (1900-1950):**
- Better coverage, but still gaps in Southern Hemisphere and oceans
- Uncertainty: ±0.05°C

⚠️ **Modern Era (1950-Present):**
- Excellent coverage with satellites, weather stations, and buoys
- Uncertainty: ±0.02°C

⚠️ **Spatial Gaps:**
- Polar regions (especially pre-satellite era)
- Deep oceans (surface only)
- High mountains and deserts

⚠️ **Homogenization Challenges:**
- Station relocations
- Changes in measurement methods (e.g., ship bucket types)
- Urban heat island effects (accounted for, but adds complexity)

### Despite Limitations, the Signal is Clear

The warming trend is **far larger** than the measurement uncertainties. Even with all possible sources of error, the conclusion is robust: Earth is warming rapidly.

---

## Relationship to Other Climate Indicators

### How Temperature Relates to CO₂

**Physical Relationship:**
```
↑ CO₂ → ↑ Greenhouse Effect → ↑ Radiative Forcing → ↑ Temperature
```

**Time Lag:**
- CO₂ increases **immediately** when emitted
- Temperature responds with **10-40 year lag** due to ocean thermal inertia

**Mathematical Relationship (Simplified):**
```
ΔTemperature ≈ Climate_Sensitivity × ln(CO₂_new / CO₂_baseline)
```

Where climate sensitivity ≈ 3°C per doubling of CO₂ (IPCC central estimate)

### How Temperature Relates to Sea Level Rise

**Physical Relationship:**
1. Warmer water expands (thermal expansion)
2. Warmer air melts ice sheets and glaciers

**Observed Correlation:**
- +1°C temperature rise → ~200mm sea level rise (historical)
- Long-term commitment: ~2 meters per 1°C (if sustained for centuries)

---

## Use Cases for This Dataset

### Scientific Applications

1. **Climate Model Validation:** Comparing model outputs to observed trends
2. **Attribution Studies:** Separating human-caused vs. natural warming
3. **Trend Analysis:** Detecting acceleration in warming rates
4. **Extreme Event Analysis:** Identifying when/where records are broken

### Policy & Communication

1. **Tracking Paris Agreement Progress:** Are we limiting warming to 1.5°C or 2°C?
2. **Climate Risk Assessment:** Insurance, infrastructure planning, agriculture
3. **Public Education:** Visualizing climate change for non-scientists
4. **Litigation:** Climate lawsuits use this data as evidence of change

### Our Hackathon Project

**Use Case:** Time Series Decomposition and Forecasting

We use this dataset to:
1. Extract the underlying warming trend (signal)
2. Separate it from natural variability (noise)
3. Model the trend with polynomial regression
4. Forecast future warming trajectory
5. Communicate the urgency of climate action

---

## Data Access & Citation

### How to Access

**Direct Download:**
https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.txt

**Interactive Graphs:**
https://data.giss.nasa.gov/gistemp/graphs/

**Full Documentation:**
https://data.giss.nasa.gov/gistemp/

### Proper Citation

When using this data, cite as:

> *GISTEMP Team, 2024: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed [date] at https://data.giss.nasa.gov/gistemp/*

**Key Paper:**

> Lenssen, N., G. Schmidt, J. Hansen, M. Menne, A. Persin, R. Ruedy, and D. Zyss, 2019: Improvements in the GISTEMP uncertainty model. *J. Geophys. Res. Atmos.*, 124, no. 6, 6307-6326, doi:10.1029/2018JD029522.

---

## Frequently Asked Questions

### Q: Why not use absolute temperature instead of anomalies?

**A:** Absolute temperature varies wildly by location (Arctic: -30°C, Tropics: +30°C). You can't meaningfully average these. Anomalies remove this spatial bias, allowing global averaging.

### Q: Is the 1951-1980 baseline arbitrary?

**A:** Somewhat. It's chosen because it's recent enough to have good data coverage, but old enough to represent a "pre-acceleration" climate. Other datasets use 1850-1900 (pre-industrial) or 1961-1990. The choice of baseline doesn't affect trends, only the absolute values.

### Q: How do we know this data is accurate?

**A:** Multiple independent teams (NASA GISS, NOAA, Berkeley Earth, Hadley Centre) analyze different data sources and all reach nearly identical conclusions. The warming trend is robust across all analyses.

### Q: Could urban heat islands be inflating the numbers?

**A:** No. GISS explicitly corrects for this. Moreover, ocean temperatures (which cover 70% of Earth) show the same warming trend, and oceans have no cities.

### Q: What about the "pause" in warming from 1998-2012?

**A:** There was a temporary slowdown (not a pause—warming continued, just slower). This was caused by La Niña conditions and ocean heat uptake. When viewed over longer periods (30+ years), the acceleration is clear.

### Q: How much more warming is "locked in"?

**A:** Even if we stopped all emissions today, Earth would warm another ~0.5°C over the next few decades due to climate system inertia. This is the "committed warming."

---

## Historical Context

### The Discovery of Global Warming

**1896:** Svante Arrhenius first calculates that doubling CO₂ would warm Earth by ~5°C

**1950s:** Systematic global temperature measurements begin

**1975:** Wally Broecker publishes "Are we on the brink of a pronounced global warming?"

**1988:** NASA scientist James Hansen testifies to US Congress: "Global warming is here"

**1992:** Rio Earth Summit; nations commit to addressing climate change

**2015:** Paris Agreement sets goal to limit warming to well below 2°C, ideally 1.5°C

**2024:** Earth temporarily exceeds 1.5°C warming threshold (though not yet sustained)

### Why This Dataset Matters

GISTEMP is one of the "big four" global temperature datasets. When policy makers, climate scientists, and international bodies discuss "how much warming has occurred," they're referring to datasets like this one.

**The temperature record is not debatable.** Multiple independent teams, using different methods and data sources, all conclude: Earth is warming, it's accelerating, and humans are the cause.

---

## For Further Reading

### Official Documentation
- **GISTEMP Homepage:** https://data.giss.nasa.gov/gistemp/
- **NASA Climate:** https://climate.nasa.gov/

### Scientific Background
- **IPCC AR6 Report (2021):** https://www.ipcc.ch/report/ar6/wg1/
- **Climate.gov (NOAA):** https://www.climate.gov/

### Accessible Explanations
- **NASA Earth Observatory:** https://earthobservatory.nasa.gov/
- **Skeptical Science (myth debunking):** https://skepticalscience.com/

---

*Last Updated: November 2025*  
*Dataset Version: GISTEMP v4*  
*Summary Prepared for: Climate Change Hackathon Project*

