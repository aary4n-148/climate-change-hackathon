# Climate Impact Showcase

A professional, interactive web application demonstrating climate change impacts across vulnerable nations through data-driven storytelling.

## 🌍 Overview

The Climate Impact Showcase is an MVP designed to demonstrate our capability to create powerful, data-driven climate narratives. This single-page application allows users to explore climate risks for different countries through:

- **Dynamic Hero Statistics**: Hard-hitting, emotionally-engaging numbers that tell each country's key climate story
- **Interactive Country Selector**: Seamless navigation between countries with instant data updates
- **Comprehensive Dashboard**: Visual data displays including key metrics, country summaries, and trend visualizations

## 🎨 Design Philosophy

The application uses a warm, earth-tone color palette designed to evoke empathy and trust:
- **Soft Coral/Rose** (#E07A5F) - Primary accent
- **Sage Green** (#81B29A) - Secondary, representing hope and growth
- **Warm Terracotta** (#C98474) - Tertiary
- **Cream/Off-white** (#F8F4F0) - Background
- **Deep Forest** (#3D5A47) - Dark accent for depth
- **Charcoal** (#333333) - Text

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd climate-change-hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Charts**: Recharts
- **Icons**: Lucide React

### Project Structure

```
/app
  layout.tsx          # Root layout with metadata
  page.tsx            # Main landing page with state management
  globals.css         # Custom styles and color palette

/components
  HeroHeader.tsx           # Dynamic hero section
  CountrySelector.tsx      # Country navigation
  Dashboard.tsx            # Main dashboard container
  CountrySummaryCard.tsx   # Country overview card
  MetricCard.tsx           # Individual metric display
  ChartCard.tsx            # Data visualization wrapper

/public/data
  global.json              # Global CO₂ and temperature data with predictions
  united-kingdom.json      # UK climate data
  bangladesh.json          # Bangladesh climate data
  somalia.json             # Somalia climate data
  philippines.json         # Philippines climate data

/lib
  timeSeriesDecomposition.ts      # CO₂ prediction model
  temperatureDecomposition.ts     # Temperature prediction model (polynomial)
  parseGlobalData.ts              # Data parsing utilities
  parseTemperatureData.ts         # NASA GISS CSV parser

/scripts
  generateGlobalData.ts           # Data generation script
```

## 🔮 Climate Prediction Models

This application features **real-time climate forecasting** using time-series decomposition and statistical modeling on authentic NASA and NOAA datasets.

### CO₂ Predictions (Linear Trend Model)

**Data Source**: Scripps CO₂ Program - Mauna Loa Observatory (1958-present)

**Methodology**:
- **Time-Series Decomposition**: Separates data into Trend, Seasonality, and Residual components
- **Trend Extraction**: 12-month moving average to smooth short-term fluctuations
- **Seasonality**: Strong annual cycle (~6 ppm amplitude) due to vegetation patterns
- **Forecasting**: Linear regression on recent trend (last 10 years) + repeated seasonal pattern
- **Horizon**: 15 years (to 2040)

**Key Insight**: CO₂ shows steady, predictable growth with strong seasonal oscillations.

### Temperature Predictions (Polynomial Trend Model)

**Data Source**: NASA GISS Surface Temperature Analysis (GISTEMP v4) - 1880-present

**Methodology**:
- **Time-Series Decomposition**: Extracts the underlying warming trend from natural variability
- **Trend Extraction**: 12-month moving average to remove short-term noise (ENSO, volcanic events)
- **Polynomial Regression**: **Quadratic (degree 2) polynomial** captures accelerating warming
- **Seasonality**: Minimal (~0.05°C) - already removed in anomaly calculation
- **Forecasting**: Projects polynomial curve into future, showing accelerating trend
- **Horizon**: 15 years (to 2040)

**Key Insight**: Temperature rise is **non-linear and accelerating**. The polynomial model captures the "hockey stick" pattern where warming rates have increased from ~0.05°C/decade (pre-1980) to ~0.25°C/decade (post-2000).

### Why Different Models?

| Metric | CO₂ | Temperature |
|--------|-----|-------------|
| **Growth Pattern** | Linear (steady rate) | Non-linear (accelerating) |
| **Seasonality** | Strong (vegetation cycle) | Negligible (already in anomalies) |
| **Best Model** | Linear + Seasonal | Polynomial (quadratic) |
| **Physical Driver** | Direct emissions | Radiative forcing + feedbacks |

### Model Documentation

For detailed technical documentation, see:
- **CO₂ Model**: `CO2_PREDICTION_MODEL.md`
- **Temperature Model**: `TEMPERATURE_PREDICTION_MODEL.md`
- **Data Summaries**: `CO2_DATA_SUMMARY.md` and `TEMPERATURE_DATA_SUMMARY.md`

### Regenerating Data

To regenerate the global.json file with updated predictions:

```bash
npm run generate-data
```

This script (`scripts/generateGlobalData.ts`) reads the CSV files and applies the prediction models.

## 📊 Data Structure

Each country JSON file follows this structure:

```json
{
  "countryName": "Country Name",
  "countryCode": "XX",
  "hero": {
    "stat": "Key Statistic",
    "subtitle": "Context and impact description"
  },
  "summary": "Country's climate story...",
  "keyMetrics": [
    {
      "label": "Metric Name",
      "value": "Metric Value",
      "icon": "icon-name"
    }
  ],
  "charts": {
    "chartType": [
      { "year": 2020, "value": 0 }
    ]
  }
}
```

## 🎯 Key Features

- **Instant Country Switching**: No page reloads, smooth transitions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessible**: Proper focus states, semantic HTML, ARIA labels
- **Performance Optimized**: Static generation, optimized images, minimal bundle size
- **Scalable Architecture**: Easy to add new countries or data visualizations

## 🔄 Adding New Countries

1. Create a new JSON file in `/public/data/` (e.g., `new-country.json`)
2. Follow the data structure outlined above
3. Add the country to the `countries` array in `app/page.tsx`:

```typescript
const countries = [
  // ... existing countries
  { id: 'new-country', name: 'New Country' },
];
```

## 📈 Future Enhancements

This MVP demonstrates a robust framework for:

1. **Scaling Content**: Expand to all countries globally
2. **Live Data Integration**: Connect to World Bank API, ND-GAIN, and other real-time sources
3. **Advanced Modeling**: Integrate custom statistical/ML models for unique insights
4. **User Engagement**: Add comparisons, filtering, and personalized risk assessments
5. **Rich Media**: Incorporate photos, videos, and interactive maps

## 🌟 Why This Approach Works

- **Static JSON Files**: Ensures instant loading and 100% reliability for client demos
- **Component Architecture**: Each piece is modular and reusable
- **Professional Design**: Earth-tone palette builds trust and emotional connection
- **Data-Driven**: Every statistic tells a story backed by credible sources

## 📝 Data Sources

### Global Climate Data
- **CO₂ Data**: [Scripps CO₂ Program, Mauna Loa Observatory](http://scrippsco2.ucsd.edu)
- **Temperature Data**: [NASA GISS Surface Temperature Analysis (GISTEMP v4)](https://data.giss.nasa.gov/gistemp/)

### Country-Specific Data
- [World Bank Climate Change Knowledge Portal](https://climateknowledgeportal.worldbank.org/)
- [ND-GAIN Country Index](https://gain.nd.edu/our-work/country-index/)

## 👥 Credits

**Data4Earth** - Climate data consulting and visualization

---

## 📄 License

This project is a proof-of-concept MVP for demonstration purposes.

## 🤝 Contributing

This is an MVP for a specific client pitch. For inquiries about extending or customizing this application, please contact the Data4Earth team.
