"""Fetch daily max temperature from Open-Meteo and produce forecasts.

This script will:
- download daily `temperature_2m_max` for the provided latitude/longitude and date range
- cache the downloaded CSV to `data/temperature_daily.csv`
- compute monthly and annual mean time series
- fit two forecasting models on the annual series (Holt-Winters and RandomForest with lag features)
- produce plots and a short numeric summary (°C per decade) as evidence of warming

Usage: run `python temperature.py` (requires dependencies in requirements.txt)
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import shutil
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import joblib


BASE_URL = (
    "https://climate-api.open-meteo.com/v1/climate"
    "?latitude=51.5&longitude=-0.13&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max"
)

# Example multi-location mapping (user-provided URLs)
LOCATIONS = {
    "London_UK": "https://climate-api.open-meteo.com/v1/climate?latitude=51.5&longitude=-0.13&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "SouthAfrica": "https://climate-api.open-meteo.com/v1/climate?latitude=-30.0&longitude=22.0&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "India": "https://climate-api.open-meteo.com/v1/climate?latitude=20.5937&longitude=78.9629&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "Germany": "https://climate-api.open-meteo.com/v1/climate?latitude=51.1657&longitude=10.4515&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "USA": "https://climate-api.open-meteo.com/v1/climate?latitude=39.8283&longitude=-98.5795&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "Brazil": "https://climate-api.open-meteo.com/v1/climate?latitude=-14.2350&longitude=-51.9253&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "Australia": "https://climate-api.open-meteo.com/v1/climate?latitude=-25.2744&longitude=133.7751&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
    "Arctic": "https://climate-api.open-meteo.com/v1/climate?latitude=90.0&longitude=0.0&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max",
}

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
OUT_DIR = ROOT / "outputs"
CACHE_FILE = DATA_DIR / "temperature_daily.csv"
# Use a fixed historical cutoff for training so forecasts to a given year are comparable
# This ensures we generate forecasts for all locations even if some API URLs already include data up to the target year.
HISTORICAL_END_YEAR = 2024


def fetch_and_cache(url: str = BASE_URL, cache_path: Path = CACHE_FILE) -> pd.DataFrame:
    """Fetch CSV from Open-Meteo and cache locally. If cached, load from disk.

    Returns a DataFrame with columns: date (datetime), tmax (float)
    """
    DATA_DIR.mkdir(exist_ok=True)
    if cache_path.exists():
        print(f"Loading cached data from {cache_path}")
        df = pd.read_csv(cache_path, parse_dates=["date"])  # saved column is 'date'
        return df

    print(f"Fetching data from API and writing to {cache_path}")
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    j = resp.json()
    daily = j.get("daily", {})
    times = daily.get("time", [])
    temps = daily.get("temperature_2m_max", [])
    df = pd.DataFrame({"date": pd.to_datetime(times), "tmax": pd.to_numeric(temps, errors="coerce")})
    df.to_csv(cache_path, index=False)
    return df


def fetch_and_cache_for_location(url: str, slug: str) -> pd.DataFrame:
    """Fetch data for a particular location and cache to `data/{slug}_daily.csv`."""
    DATA_DIR.mkdir(exist_ok=True)
    path = DATA_DIR / f"{slug}_daily.csv"
    return fetch_and_cache(url, cache_path=path)


def process_location(slug: str, url: str, forecast_until: int) -> dict:
    """Process a single location: fetch, preprocess, forecast, ensemble, save plot and models.

    Returns a summary dict with trend and key predicted temps.
    """
    # Fetch and preprocess
    df_loc = fetch_and_cache_for_location(url, slug)
    monthly_loc, annual_loc = preprocess(df_loc)

    # Train on a consistent historical cutoff so we can forecast to `forecast_until` for all regions.
    # Prefer HISTORICAL_END_YEAR if available in the data; otherwise use the last available year.
    if (annual_loc.index.year <= HISTORICAL_END_YEAR).any():
        train_series = annual_loc[annual_loc.index.year <= HISTORICAL_END_YEAR]
    else:
        train_series = annual_loc

    train_last_year = int(train_series.index[-1].year)
    if forecast_until <= train_last_year:
        # nothing to forecast beyond the training period; still proceed but produce empty preds
        forecast_years = 0
    else:
        forecast_years = forecast_until - train_last_year

    if forecast_years > 0:
        hw_pred_loc, hw_model_loc = train_holt_winters_annual(train_series, forecast_years=forecast_years)
        rf_pred_loc, rf_model_loc = train_random_forest_annual(train_series, forecast_years=forecast_years, nlags=5)
    else:
        hw_pred_loc = pd.Series(dtype=float)
        rf_pred_loc = pd.Series(dtype=float)
        hw_model_loc = None
        rf_model_loc = None

    OUT_DIR.mkdir(exist_ok=True)
    if hw_model_loc is not None:
        joblib.dump(hw_model_loc, OUT_DIR / f"{slug}_holt_winters.joblib")
    if rf_model_loc is not None:
        joblib.dump(rf_model_loc, OUT_DIR / f"{slug}_rf.joblib")


    # ensemble around Holt-Winters (only if model exists)
    hw_ensemble_loc = None
    if hw_model_loc is not None:
        try:
            hw_ensemble_loc = ensemble_hw_with_residual_bootstrap(annual_loc, hw_model_loc, forecast_years=forecast_years, n_sim=300, block_size=3)
            hw_ensemble_loc.to_csv(OUT_DIR / f"{slug}_hw_ensemble.csv")
        except Exception as e:
            print(f"Warning: could not build HW ensemble for {slug}: {e}")
            hw_ensemble_loc = None

    # per-location plot: show observed (full available) and the ensemble forecast built from the training cutoff
    plot_path_loc = OUT_DIR / f"{slug}_annual_forecast.png"
    plot_annual_forecast(annual_loc, hw_pred_loc, rf_pred_loc, plot_path_loc, hw_ensemble=hw_ensemble_loc)

    # trend and some key future values (e.g., median HW and RF at final forecast year)
    trend_loc = compute_trend_per_decade(annual_loc)
    if hw_ensemble_loc is not None and len(hw_ensemble_loc) > 0:
        last_forecast_year = hw_ensemble_loc.index[-1]
        hw_median_final = float(hw_ensemble_loc.loc[last_forecast_year].median())
        hw_p95_final = float(hw_ensemble_loc.loc[last_forecast_year].quantile(0.95))
    elif len(hw_pred_loc) > 0:
        hw_median_final = float(hw_pred_loc.iloc[-1])
        hw_p95_final = float(hw_pred_loc.iloc[-1])
    else:
        hw_median_final = float('nan')
        hw_p95_final = float('nan')

    rf_final = float(rf_pred_loc.iloc[-1]) if len(rf_pred_loc) > 0 else float('nan')

    summary = {
        "region": slug,
        "start_year": int(annual_loc.index[0].year),
        "end_year": int(annual_loc.index[-1].year),
        "slope_per_decade": float(trend_loc["slope_per_decade"]),
        "r2": float(trend_loc["r2"]),
        "hw_median_final": hw_median_final,
        "hw_p95_final": hw_p95_final,
        "rf_final": rf_final,
    }
    return summary



def make_combined_matrix(image_paths: list[Path], titles: list[str], out_path: Path, ncols: int = 4, dpi: int = 150):
    """Create a matrix plot (grid) of the provided image paths with titles and save to out_path."""
    n = len(image_paths)
    if n == 0:
        raise ValueError("No images provided for combined matrix")
    ncols = int(ncols)
    nrows = (n + ncols - 1) // ncols
    # Read first image to estimate size
    imgs = [mpimg.imread(str(p)) for p in image_paths]

    # Create figure sized to approximate images
    img_h, img_w = imgs[0].shape[0], imgs[0].shape[1]
    # set figsize so that each subplot is roughly (img_w/img_h) ratio scaled
    # We'll target each subplot to be ~4 inches wide
    subplot_w = 4
    fig_w = subplot_w * ncols
    fig_h = subplot_w * nrows * (img_h / img_w)
    fig, axes = plt.subplots(nrows, ncols, figsize=(fig_w, max(fig_h, 3)), constrained_layout=True)
    axes = np.array(axes).reshape(-1)
    for ax in axes:
        ax.axis("off")

    for i, (p, title) in enumerate(zip(image_paths, titles)):
        ax = axes[i]
        img = imgs[i]
        ax.imshow(img)
        ax.set_title(title, fontsize=10)

    # Hide any leftover axes
    for j in range(n, len(axes)):
        axes[j].set_visible(False)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, dpi=dpi)
    plt.close(fig)


def slugify(name: str) -> str:
    """Make a filesystem-friendly slug for keys like 'South Africa' -> 'south_africa'."""
    return name.strip().replace(" ", "_").replace("/", "_").replace("-", "_")


def preprocess(df: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    """Return (monthly_mean, annual_mean) series indexed by period start dates."""
    df = df.copy()
    df.dropna(subset=["tmax"], inplace=True)
    df.set_index("date", inplace=True)
    monthly = df["tmax"].resample("M").mean()
    annual = df["tmax"].resample("A").mean()
    annual.index = pd.to_datetime(annual.index.year.astype(str) + "-01-01")
    return monthly, annual


def make_lag_features(series: pd.Series, nlags: int = 5) -> tuple[np.ndarray, np.ndarray, list]:
    arr = series.values
    X = []
    y = []
    for i in range(nlags, len(arr)):
        X.append(arr[i - nlags : i])
        y.append(arr[i])
    X = np.array(X)
    y = np.array(y)
    feature_names = [f"lag_{i}" for i in range(nlags, 0, -1)]
    return X, y, feature_names


def train_random_forest_annual(annual: pd.Series, forecast_years: int = 26, nlags: int = 5):
    X, y, feature_names = make_lag_features(annual, nlags=nlags)
    test_size = min(5, len(y) // 5)
    if test_size < 1:
        test_size = 1
    train_X, test_X = X[:-test_size], X[-test_size:]
    train_y, test_y = y[:-test_size], y[-test_size:]

    model = RandomForestRegressor(n_estimators=200, random_state=0)
    model.fit(train_X, train_y)

    history = list(annual.values[-nlags:])
    preds = []
    for _ in range(forecast_years):
        x_in = np.array(history[-nlags:])[None, :]
        p = model.predict(x_in)[0]
        preds.append(p)
        history.append(p)

    last_year = annual.index[-1].year
    years = [pd.to_datetime(f"{y}-01-01") for y in range(last_year + 1, last_year + 1 + forecast_years)]
    return pd.Series(preds, index=years), model


def train_holt_winters_annual(annual: pd.Series, forecast_years: int = 26):
    model = ExponentialSmoothing(annual.values, trend="add", seasonal=None, damped_trend=False)
    fit = model.fit(optimized=True)
    preds = fit.forecast(forecast_years)
    last_year = annual.index[-1].year
    years = [pd.to_datetime(f"{y}-01-01") for y in range(last_year + 1, last_year + 1 + forecast_years)]
    return pd.Series(preds, index=years), fit


def ensemble_hw_with_residual_bootstrap(annual: pd.Series, fit, forecast_years: int = 26, n_sim: int = 200, block_size: int = 3) -> pd.DataFrame:
    """Generate an ensemble of Holt-Winters forecasts by block-bootstrapping in-sample residuals.

    This preserves short-term autocorrelation while producing realistic fluctuations around the HW trend.

    Returns a DataFrame of shape (forecast_years, n_sim) indexed by forecast year datetimes.
    """
    # obtain fitted values
    try:
        fitted = np.asarray(fit.fittedvalues)
    except Exception:
        # some statsmodels versions may not expose fittedvalues; try predict
        fitted = np.asarray(fit.fittedvalues)

    resid = np.asarray(annual.values) - fitted
    if len(resid) == 0:
        raise ValueError("No residuals available for bootstrap")

    sims = np.zeros((forecast_years, n_sim))
    base_forecast = np.asarray(fit.forecast(forecast_years))
    rng = np.random.default_rng(seed=0)

    for i in range(n_sim):
        # build bootstrap residuals by sampling blocks
        res_boot = []
        while len(res_boot) < forecast_years:
            if len(resid) <= block_size:
                idx = rng.integers(0, len(resid))
                res_boot.append(resid[idx])
            else:
                start = rng.integers(0, len(resid) - block_size + 1)
                block = resid[start : start + block_size].tolist()
                res_boot.extend(block)
        res_boot = np.array(res_boot[:forecast_years])
        sims[:, i] = base_forecast + res_boot

    last_year = annual.index[-1].year
    years = [pd.to_datetime(f"{y}-01-01") for y in range(last_year + 1, last_year + 1 + forecast_years)]
    return pd.DataFrame(sims, index=years)


def evaluate_series(true: pd.Series, pred: pd.Series) -> dict:
    common_idx = true.index.intersection(pred.index)
    if len(common_idx) == 0:
        return {}
    t = true.loc[common_idx].values
    p = pred.loc[common_idx].values
    return {
        "mae": float(mean_absolute_error(t, p)),
        "rmse": float(np.sqrt(mean_squared_error(t, p))),
    }


def compute_trend_per_decade(annual: pd.Series) -> dict:
    X = np.array([d.year for d in annual.index]).reshape(-1, 1)
    y = annual.values
    lr = LinearRegression()
    lr.fit(X, y)
    slope_per_year = float(lr.coef_[0])
    intercept = float(lr.intercept_)
    r2 = float(lr.score(X, y))
    return {"slope_per_year": slope_per_year, "slope_per_decade": slope_per_year * 10, "intercept": intercept, "r2": r2}


def plot_annual_forecast(annual: pd.Series, hw_pred: pd.Series, rf_pred: pd.Series, out_path: Path, hw_ensemble: pd.DataFrame | None = None):
    OUT_DIR.mkdir(exist_ok=True)
    plt.figure(figsize=(10, 6))
    plt.plot(annual.index, annual.values, label="Observed (annual mean)", marker="o")

    # If an ensemble is provided, plot median and a 5-95% interval to show realistic fluctuations
    if hw_ensemble is not None:
        q_low = hw_ensemble.quantile(0.05, axis=1)
        q_med = hw_ensemble.quantile(0.5, axis=1)
        q_high = hw_ensemble.quantile(0.95, axis=1)
        plt.plot(q_med.index, q_med.values, label="HW forecast (median)", linestyle="--", color="C1")
        plt.fill_between(q_med.index, q_low.values, q_high.values, color="C1", alpha=0.2, label="HW 5-95%")
    else:
        # fallback: if no ensemble available but hw_pred present, plot it
        if len(hw_pred) > 0:
            plt.plot(hw_pred.index, hw_pred.values, label="HW forecast", linestyle="--", color="C1")
    plt.xlabel("Year")
    plt.ylabel("Temperature 2m max (°C)")
    plt.title("Annual mean daily maximum temperature — historical + forecast")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(out_path)
    plt.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--forecast-until", type=int, default=2050, help="Year to forecast until (inclusive)")
    parser.add_argument("--all-locations", action="store_true", help="Run analysis for all built-in locations (continents + Arctic)")
    args = parser.parse_args()

    if args.all_locations:
        summaries = []
        for name, url in LOCATIONS.items():
            slug = slugify(name)
            print(f"\nProcessing {name} (slug={slug})...")
            try:
                s = process_location(slug, url, args.forecast_until)
                summaries.append(s)
            except Exception as e:
                print(f"Error processing {name}: {e}")

        # write aggregate summary CSV
        if summaries:
            df_sum = pd.DataFrame(summaries).set_index("region")
            df_sum.to_csv(OUT_DIR / "summary_trends_and_forecasts.csv")
            print(f"Wrote summary for {len(summaries)} regions to outputs/summary_trends_and_forecasts.csv")
            # copy per-location plots into an all-in-one folder and make a combined matrix PNG
            all_folder = OUT_DIR / f"annual_forecast_all_{args.forecast_until}"
            all_folder.mkdir(exist_ok=True)
            plot_paths = []
            titles = []
            for s in summaries:
                slug = s["region"]
                src = OUT_DIR / f"{slug}_annual_forecast.png"
                if src.exists():
                    dst = all_folder / src.name
                    shutil.copy(src, dst)
                    plot_paths.append(dst)
                    titles.append(slug)
            # make combined matrix (4 columns by default)
            if plot_paths:
                combined_path = all_folder / f"annual_forecast_all_{args.forecast_until}_matrix.png"
                make_combined_matrix(plot_paths, titles, combined_path, ncols=4)
                print(f"Wrote combined matrix plot to: {combined_path}")
    else:
        df = fetch_and_cache()
        monthly, annual = preprocess(df)
        forecast_years = args.forecast_until - annual.index[-1].year
        if forecast_years <= 0:
            raise SystemExit("forecast-until must be greater than the last data year")

        print(f"Data spans {annual.index[0].year} to {annual.index[-1].year}. Forecasting {forecast_years} years to {args.forecast_until}.")

        hw_pred, hw_model = train_holt_winters_annual(annual, forecast_years=forecast_years)
        rf_pred, rf_model = train_random_forest_annual(annual, forecast_years=forecast_years, nlags=5)

        OUT_DIR.mkdir(exist_ok=True)
        joblib.dump(hw_model, OUT_DIR / "holt_winters_model.joblib")
        joblib.dump(rf_model, OUT_DIR / "rf_annual_model.joblib")

        # Build an ensemble around the Holt-Winters forecast by bootstrapping residual blocks.
        try:
            hw_ensemble = ensemble_hw_with_residual_bootstrap(annual, hw_model, forecast_years=forecast_years, n_sim=500, block_size=3)
            # save ensemble percentiles for inspection
            perc = hw_ensemble.quantile([0.05, 0.5, 0.95], axis=1).T
            perc.to_csv(OUT_DIR / "hw_ensemble_percentiles.csv")
        except Exception as e:
            print(f"Warning: could not build HW ensemble: {e}")
            hw_ensemble = None

        trend = compute_trend_per_decade(annual)

        plot_path = OUT_DIR / "annual_forecast.png"
        plot_annual_forecast(annual, hw_pred, rf_pred, plot_path, hw_ensemble=hw_ensemble)

        print("\n=== Summary (historical) ===")
        print(f"Years: {annual.index[0].year} - {annual.index[-1].year}")
        print(f"Linear trend: {trend['slope_per_decade']:.3f} °C / decade (R²={trend['r2']:.3f})")

        if trend["slope_per_decade"] > 0.1:
            print("Evidence: The historical annual mean maximum temperature shows a warming trend (>0.1 °C/decade).")
        else:
            print("Evidence: Trend exists but is modest (<0.1 °C/decade) over the historical period provided.")

        print(f"Forecast plot saved to: {plot_path}")
        print("Models saved to outputs/ as joblib files.")


if __name__ == "__main__":
    main()
