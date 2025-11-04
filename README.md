![Application screenshot](./public/screenshot.png)

<br/>
<br/>

With the Addnode Weather Forecasting app user can search locations by city name and observe the weather for the next 5-6 days and 3 hour interval.
<br />
The app is developed using React.js and material-UI.

<br/>


## ⚡ Install & Setup

1. Install the packages:

```bash
npm install
```

1. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

1. Edit the `.env` file and replace the placeholder values with your actual API keys:

```env
# OpenWeatherMap API Key
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# RapidAPI Key for GeoDB Cities API
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key_here
```

1. Start the development server:

```bash
npm start
```

> **Security Note**: Never commit your `.env` file to version control. Your API keys are automatically excluded via `.gitignore`.

<br/>

## 📙 Used libraries

- `react-js`
- `material-ui`

Check `packages.json` for details

<br/>