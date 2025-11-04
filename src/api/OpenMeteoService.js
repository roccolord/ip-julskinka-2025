import {
  transformWMOCodeToLegacyFormat,
  determineNightTime
} from '../utilities/OpenMeteoWeatherCodes';

// Open-Meteo API endpoints - no API keys required!
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1';

// No API key validation needed - major benefit of Open-Meteo!

/**
 * Fetch cities matching search input using Open-Meteo Geocoding API
 * @param {string} searchInput - City name to search for
 * @returns {Promise<Object>} Cities list in app-compatible format
 */
export async function fetchCities(searchInput) {
  if (!searchInput || searchInput.trim().length < 2) {
    return { data: [] };
  }

  const url = `${GEOCODING_API_URL}/search`;
  const params = new URLSearchParams({
    name: searchInput.trim(),
    count: 30,          // Match current app's limit
    language: 'en',
    format: 'json'
  });

  try {
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Open-Meteo format to app's expected format
    return {
      data: data.results?.map(city => ({
        latitude: city.latitude,
        longitude: city.longitude,
        name: city.name,
        countryCode: city.country_code || '',
        country: city.country || '',
        admin1: city.admin1 || ''  // State/Province
      })) || []
    };
  } catch (error) {
    console.error('Geocoding service error:', error);
    return { data: [] }; // Return empty array on error
  }
}

/**
 * Fetch current weather and forecast data using Open-Meteo Weather API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate  
 * @returns {Promise<Array>} [currentWeather, forecastData] compatible with existing app
 */
export async function fetchWeatherData(latitude, longitude) {
  // Convert to numbers and validate
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  console.log('Fetching weather for coordinates:', { lat, lon });
  
  // Input validation
  if (!latitude || !longitude || isNaN(lat) || isNaN(lon)) {
    throw new Error('Valid latitude and longitude coordinates are required');
  }

  // Ensure coordinates are within valid ranges
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }
  
  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }

  const url = `${WEATHER_API_URL}/forecast`;
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m', 
      'apparent_temperature',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'relative_humidity_2m',
      'wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min', 
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant'
    ].join(','),
    timezone: 'auto',
    forecast_days: 7
  });

  try {
    const fullUrl = `${url}?${params}`;
    console.log('Making weather API request to:', fullUrl);
    
    const response = await fetch(fullUrl);
    
    console.log('Weather API response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Weather API error response:', responseText);
      
      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          throw new Error(`Invalid coordinates provided. Response: ${responseText}`);
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Weather service temporarily unavailable');
        default:
          throw new Error(`Weather API error: ${response.status}. Response: ${responseText}`);
      }
    }

    const data = await response.json();
    console.log('Weather API response data structure:', {
      current: !!data.current,
      hourly: !!data.hourly,
      daily: !!data.daily,
      sampleData: {
        current: data.current ? Object.keys(data.current).slice(0, 3) : null,
        hourly: data.hourly ? Object.keys(data.hourly).slice(0, 3) : null,
        daily: data.daily ? Object.keys(data.daily).slice(0, 3) : null
      }
    });

    // Validate response structure
    if (!data.current || !data.hourly || !data.daily) {
      console.error('Invalid response format. Received:', data);
      throw new Error('Invalid response format from weather service');
    }

    // Transform to format expected by existing app components
    const currentWeather = transformCurrentWeather(data);
    const forecastData = transformForecastData(data);
    
    console.log('Successfully transformed weather data');

    return [currentWeather, forecastData];
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    console.error('Weather service error details:', error);
    throw error;
  }
}

/**
 * Transform Open-Meteo current weather to OpenWeatherMap-compatible format
 * @param {Object} openMeteoData - Raw Open-Meteo response
 * @returns {Object} Transformed weather data
 */
function transformCurrentWeather(openMeteoData) {
  const { current, daily } = openMeteoData;
  
  // Determine if it's night time
  const isNight = determineNightTime(
    current.time,
    daily.sunrise[0], 
    daily.sunset[0]
  );

  // Get weather info from WMO code
  const weatherInfo = transformWMOCodeToLegacyFormat(current.weather_code, isNight);

  return {
    // Core weather data in OpenWeatherMap format
    main: {
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature || current.temperature_2m),
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.pressure_msl)
    },
    weather: [{
      icon: weatherInfo.icon,
      description: weatherInfo.description,
      main: weatherInfo.description.charAt(0).toUpperCase() + weatherInfo.description.slice(1)
    }],
    wind: {
      speed: current.wind_speed_10m,
      deg: current.wind_direction_10m || 0,
      gust: current.wind_gusts_10m
    },
    clouds: {
      all: current.cloud_cover || 0
    },
    // Additional data for compatibility
    coord: {
      lat: openMeteoData.latitude,
      lon: openMeteoData.longitude
    },
    timezone: openMeteoData.utc_offset_seconds,
    // Add original Open-Meteo data for debugging
    _openMeteoData: {
      weatherCode: current.weather_code,
      isNight: isNight
    }
  };
}

/**
 * Transform Open-Meteo forecast to OpenWeatherMap-compatible format
 * @param {Object} openMeteoData - Raw Open-Meteo response  
 * @returns {Object} Transformed forecast data
 */
function transformForecastData(openMeteoData) {
  const { hourly, daily } = openMeteoData;
  
  // Create hourly forecast list (for today's forecast and weekly)
  const forecastList = [];
  
  for (let i = 0; i < hourly.time.length && i < 40; i++) { // Limit to 40 entries for performance
    const isNight = determineNightTime(
      hourly.time[i],
      daily.sunrise[0],
      daily.sunset[0] 
    );
    
    const weatherInfo = transformWMOCodeToLegacyFormat(hourly.weather_code[i], isNight);
    
    forecastList.push({
      dt: Math.floor(new Date(hourly.time[i]).getTime() / 1000),
      dt_txt: hourly.time[i].replace('T', ' '),  // Convert ISO format to legacy format
      main: {
        temp: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i] || 0
      },
      weather: [{
        icon: weatherInfo.icon,
        description: weatherInfo.description,
        main: weatherInfo.description.charAt(0).toUpperCase() + weatherInfo.description.slice(1)
      }],
      wind: {
        speed: hourly.wind_speed_10m[i] || 0
      },
      clouds: {
        all: 0 // Not provided in hourly data
      }
    });
  }

  return {
    list: forecastList,
    city: {
      coord: {
        lat: openMeteoData.latitude,
        lon: openMeteoData.longitude
      },
      timezone: openMeteoData.utc_offset_seconds,
      country: '', // Not provided by Open-Meteo
      population: 0, // Not provided by Open-Meteo
      sunrise: Math.floor(new Date(daily.sunrise[0]).getTime() / 1000),
      sunset: Math.floor(new Date(daily.sunset[0]).getTime() / 1000)
    },
    // Add daily data for weekly forecast processing
    _dailyData: {
      time: daily.time,
      weather_code: daily.weather_code,
      temperature_max: daily.temperature_2m_max,
      temperature_min: daily.temperature_2m_min,
      wind_speed_max: daily.wind_speed_10m_max,
      wind_direction: daily.wind_direction_10m_dominant,
      sunrise: daily.sunrise,
      sunset: daily.sunset
    }
  };
}

// Fallback functions are available if needed for error handling

// Export helper functions for testing
export { transformCurrentWeather, transformForecastData };