# UCL-hackathon-2025

Download the arima.html file to your local machine then double-click on it to see it in your browser.

# Prompt used to generate this

You are GPT‑5. Generate ONE complete, self-contained HTML file (no explanations, no extra text before or after the code) that I can save as `index.html` and open in a modern browser.

Functional requirements
1) Fetch climate-modelled daily max temperature for central London from the Open‑Meteo Climate API:
   URL: https://climate-api.open-meteo.com/v1/climate?latitude=51.5&longitude=-0.13&start_date=1950-01-01&end_date=2024-12-31&daily=temperature_2m_max
   - Parse `daily.time` (ISO date strings) and `daily.temperature_2m_max` (°C).
   - Show the available historical range on the page.

2) Plot the history immediately and then overlay an ARIMA forecast (to avoid a blank UI while WASM compiles):
   - Use Chart.js as an ES module (NO globals) via esm.sh: `import Chart from 'https://esm.sh/chart.js@4.5.0/auto';`
   - Fixed-size canvas: `<canvas id="chart" width="800" height="400"></canvas>` and Chart.js option `responsive: false`.
   - History line in blue, forecast line in orange dashed, with ±1σ bands (upper/lower in light orange).
   - X-axis: ISO date labels; Y-axis: °C.

3) Train ARIMA on the full daily series and predict the next 365 days:
   - Import ARIMA async WASM loader as ESM from esm.sh: `import ARIMAPromise from 'https://esm.sh/arima@0.2.5/async';`
   - Await the promise to obtain the class: `const ARIMA = await ARIMAPromise;`
   - Default model: ARIMA(2,1,2), i.e. `{ p:2, d:1, q:2, P:0, D:0, Q:0, s:0, verbose:false }`.
   - Forecast horizon: 365.
   - Display a brief textual summary (forecast window and the first/last 7-day means).

4) UX details
   - Show a status line that updates during: “Fetching…”, “Compiling ARIMA…”, “Forecasting…”, “Done.” and show errors if any.
   - Minimal, clean CSS; include a light border around the canvas to emphasize fixed size.
   - Ensure **all tags are closed**; the file must be valid HTML.

5) Engineering constraints (must-follow)
   - Use **only** CDNs; **no npm**, **no bundler**, **no globals**, **no RequireJS**.
   - Use ESM imports (`<script type="module">`), not `<script src>` for Chart/ARIMA.
   - Do NOT use the plain ESM from cdnjs for Chart.js (it can contain bare specifiers); use `chart.js@4.5.0/auto` from esm.sh as above.
   - Do not rely on `window.Chart`; import Chart from ESM instead.
   - Handle CORS normally (Open‑Meteo supports CORS); no API key.
   - If the page is opened via `file://`, note that modules may be blocked; include a small note suggesting to serve locally (e.g., `python -m http.server 8080`) if imports fail.

6) Code structure (suggested)
   - Small utility functions for date parsing/formatting and label generation.
   - `drawHistory(dates, series)` renders the history.
   - `overlayForecast(historyDates, history, pred, stderr)` extends labels/datasets and updates the chart.
   - Main flow: fetch → drawHistory → await ARIMA → fit → predict → overlay → update status.

7) Acceptance criteria
   - When I open the file over HTTP, I see the history immediately and then the forecast overlay within a few seconds.
   - Canvas stays 800×400 and does not grow.
   - No “Chart is not defined” error at any point.
   - The code compiles without modification in a modern Chromium/Firefox browser.

Deliverable
- Output a single, complete HTML document only, with inline `<style>` and a single `<script type="module">` that implements everything above.
