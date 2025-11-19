![Application screenshot](./public/screenshot.png)

<br/>
<br/>

With the Addnode Weather Forecasting app, users can search locations by city name and observe current weather conditions and forecasts for the next 7 days.

<br />
The app is developed using React.js and Material-UI, and now uses Open-Meteo's APIs for weather data and city search.


## ⚡ Quick Start

1. **Install dependencies:**

```bash
npm install
```

2. **Start the app:**

```bash
npm start
```

## 🔑 API Configuration (Optional)

If you have an **Open-Meteo commercial API key**, you can use it for:
- Higher rate limits
- Priority access
- Dedicated infrastructure

#### Setup Instructions

1. **Create a `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Add your API key** to `.env`:
   ```bash
   REACT_APP_OPEN_METEO_API_KEY=your_api_key_here
   ```

3. **Restart the development server:**
   ```bash
   npm start
   ```

#### Verification
Check the browser console on app startup. You should see:
- `🌤️ Open-Meteo API Mode: ✨ COMMERCIAL` (when using paid API)
- `🌤️ Open-Meteo API Mode: 🆓 FREE` (when using free API)

