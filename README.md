![Application screenshot](./public/screenshot.png)

<br/>
<br/>

With [The Weather Forecasting](https://the-weather-forecasting.netlify.app) user can search locations by city name and observe the weather for the next 5-6 days and 3 hour interval.
<br />
The app is developed using React.js and material-UI.

<br/>

## 💻 Live Demo:

https://the-weather-forecasting.netlify.app

<br/>

## ✨ Getting Started

- Make sure you already have `Node.js` and `npm` installed in your system.
- You need API keys for the following services:
  - **OpenWeatherMap API**: Get your free API key from [OpenWeatherMap](https://openweathermap.org/) by creating an account and [grabbing your key](https://home.openweathermap.org/api_keys).
  - **RapidAPI GeoDB**: Get your free API key from [RapidAPI GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities) for location search functionality.

<br/>

## ⚡ Install & Setup

1. Clone the repository:

```bash
git clone https://github.com/Amin-Awinti/the-weather-forecasting.git
cd the-weather-forecasting
```

2. Install the packages:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

4. Edit the `.env` file and replace the placeholder values with your actual API keys:

```env
# OpenWeatherMap API Key
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# RapidAPI Key for GeoDB Cities API
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key_here
```

5. Start the development server:

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

## 📄 Todos

- [ ] Styled-components
- [ ] Convert the entire project to TypeScript
- [ ] Unit Testing
- [ ] On launch, find user location weather by utilizing GeolocationAPI/GEOCODING
- [ ] Celcius/Fahrenheit conversion
- [ ] Dark/Light Mode

<br/>
Thank You ☺
