# Climate temperature forecasting

This repository contains a script `temperature.py` that:

- Fetches daily maximum temperature from Open-Meteo for London (lat=51.5, lon=-0.13) for 1950-01-01 through 2024-12-31 and caches it in `data/`.
- Aggregates to annual mean maximum temperatures at 2 metres height. 
- Trains two forecasting methods (Holt-Winters and RandomForest on lag features) and forecasts up to 2050 by default.
- Produces a plot and prints a short evidence summary (°C per decade).

Usage
------

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Run the script:

```bash
python temperature.py --forecast-until 2050
```

Outputs
-------

- `data/temperature_daily.csv` — cached API data
- `outputs/annual_forecast.png` — plot of observed annual means and forecasts
- `outputs/holt_winters_model.joblib`, `outputs/rf_annual_model.joblib` — saved models

Notes
-----

This is a simple demonstration. For publication-quality attribution of warming you'd use established pipelines, replicate across many locations, and quantify uncertainty with ensemble experiments and formal statistical tests.

