# Climate Change Dashboard

A web application that visualizes climate change data and predictions for different regions around the world.

## Overview

This project displays historical climate data and forecasts future trends using statistical models. Users can view global metrics like CO2 levels, temperature changes, and Antarctic ice loss, as well as explore region-specific temperature predictions.

## Features

- Global climate indicators (CO2, temperature, Antarctic ice mass)
- Historical data visualization with future predictions
- Region-specific temperature forecasts for 8 locations
- Interactive charts and data comparisons
- Responsive design for mobile and desktop

## Technology Stack

- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Lucide React (icons)

## Installation

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

4. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
npm start
```

## Data Sources

- **CO2 Data:** Scripps CO2 Program, Mauna Loa Observatory - http://scrippsco2.ucsd.edu
- **Temperature Data:** NASA GISS Surface Temperature Analysis (GISTEMP v4) - https://data.giss.nasa.gov/gistemp/
- **Antarctic Ice Data:** GRACE/GRACE-FO satellites - https://grace.jpl.nasa.gov/
- **Regional Temperature Data:** Open-Meteo historical weather API - https://open-meteo.com/
