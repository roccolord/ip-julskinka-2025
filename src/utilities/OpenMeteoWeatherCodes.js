// Open-Meteo uses WMO Weather interpretation codes
// Mapping WMO codes to existing weather icons

export const WMO_WEATHER_CODES = {
  0: { icon: '01', description: 'Clear sky' },
  1: { icon: '01', description: 'Mainly clear' },
  2: { icon: '02', description: 'Partly cloudy' },
  3: { icon: '04', description: 'Overcast' },
  45: { icon: '50', description: 'Fog' },
  48: { icon: '50', description: 'Depositing rime fog' },
  51: { icon: '09', description: 'Light drizzle' },
  53: { icon: '09', description: 'Moderate drizzle' },
  55: { icon: '09', description: 'Dense drizzle' },
  56: { icon: '13', description: 'Light freezing drizzle' },
  57: { icon: '13', description: 'Dense freezing drizzle' },
  61: { icon: '10', description: 'Slight rain' },
  63: { icon: '10', description: 'Moderate rain' },
  65: { icon: '10', description: 'Heavy rain' },
  66: { icon: '13', description: 'Light freezing rain' },
  67: { icon: '13', description: 'Heavy freezing rain' },
  71: { icon: '13', description: 'Slight snow fall' },
  73: { icon: '13', description: 'Moderate snow fall' },
  75: { icon: '13', description: 'Heavy snow fall' },
  77: { icon: '13', description: 'Snow grains' },
  80: { icon: '09', description: 'Slight rain showers' },
  81: { icon: '09', description: 'Moderate rain showers' },
  82: { icon: '09', description: 'Violent rain showers' },
  85: { icon: '13', description: 'Slight snow showers' },
  86: { icon: '13', description: 'Heavy snow showers' },
  95: { icon: '11', description: 'Thunderstorm' },
  96: { icon: '11', description: 'Thunderstorm with slight hail' },
  99: { icon: '11', description: 'Thunderstorm with heavy hail' }
};

/**
 * Helper function to determine if it's night time based on current time and sunrise/sunset
 * @param {string} currentTime - Current time in ISO format
 * @param {string} sunrise - Sunrise time in ISO format  
 * @param {string} sunset - Sunset time in ISO format
 * @returns {boolean} True if it's night time
 */
function isNightTime(currentTime, sunrise, sunset) {
  const current = new Date(currentTime);
  const sunriseTime = new Date(sunrise);
  const sunsetTime = new Date(sunset);
  
  return current < sunriseTime || current > sunsetTime;
}

/**
 * Get weather icon and description from WMO code
 * @param {number} wmoCode - WMO weather code
 * @param {boolean} isNight - Whether it's night time (optional)
 * @returns {Object} Weather info with icon and description
 */
export function getWeatherFromWMOCode(wmoCode, isNight = false) {
  const weather = WMO_WEATHER_CODES[wmoCode];
  
  if (!weather) {
    return { 
      icon: 'unknown.png', 
      description: 'Unknown weather condition' 
    };
  }
  
  const iconSuffix = isNight ? 'n' : 'd';
  return {
    icon: `${weather.icon}${iconSuffix}.png`,
    description: weather.description
  };
}

/**
 * Convert WMO code to format compatible with existing app components
 * @param {number} wmoCode - WMO weather code
 * @param {boolean} isNight - Whether it's night time (optional)
 * @returns {Object} Weather info in legacy format
 */
export function transformWMOCodeToLegacyFormat(wmoCode, isNight = false) {
  const weather = getWeatherFromWMOCode(wmoCode, isNight);
  return {
    icon: weather.icon.replace('.png', ''), // Remove .png for compatibility
    description: weather.description
  };
}

/**
 * Determine night time status with sunrise/sunset data
 * @param {string} currentTime - Current time in ISO format
 * @param {string} sunrise - Sunrise time in ISO format
 * @param {string} sunset - Sunset time in ISO format  
 * @returns {boolean} True if it's night time
 */
export function determineNightTime(currentTime, sunrise, sunset) {
  try {
    return isNightTime(currentTime, sunrise, sunset);
  } catch (error) {
    console.warn('Unable to determine day/night status, defaulting to day:', error);
    return false; // Default to day if calculation fails
  }
}

/**
 * Get weather info with automatic day/night detection
 * @param {number} wmoCode - WMO weather code
 * @param {string} currentTime - Current time in ISO format
 * @param {string} sunrise - Sunrise time in ISO format
 * @param {string} sunset - Sunset time in ISO format
 * @returns {Object} Weather info with appropriate day/night icon
 */
export function getWeatherWithDayNight(wmoCode, currentTime, sunrise, sunset) {
  const isNight = determineNightTime(currentTime, sunrise, sunset);
  return getWeatherFromWMOCode(wmoCode, isNight);
}