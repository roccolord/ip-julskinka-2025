import {
  transformWMOCodeToLegacyFormat,
  determineNightTime
} from './OpenMeteoWeatherCodes';

export function groupBy(key) {
  return function group(array) {
    return array.reduce((acc, obj) => {
      const property = obj[key];
      const { date, ...rest } = obj;
      acc[property] = acc[property] || [];
      acc[property].push(rest);
      return acc;
    }, {});
  };
}

export function getAverage(array, isRound = true) {
  let average = 0;
  if (isRound) {
    average = Math.round(array.reduce((a, b) => a + b, 0) / array.length);
    if (average === 0) {
      average = 0;
    }
  } else average = (array.reduce((a, b) => a + b, 0) / array.length).toFixed(2);

  return average;
}

export function getMostFrequentWeather(arr) {
  const hashmap = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(hashmap).reduce((a, b) =>
    hashmap[a] > hashmap[b] ? a : b
  );
}

// LEGACY SUPPORT: Original function for backward compatibility
export const descriptionToIconName = (desc, descriptions_list) => {
  let iconName = descriptions_list.find((item) => item.description === desc);
  return iconName?.icon || 'unknown';
};

/**
 * NEW: Get icon from WMO weather code (Open-Meteo format)
 * @param {number} wmoCode - WMO weather code
 * @param {boolean} isNight - Whether it's night time
 * @returns {string} Icon filename without extension
 */
export const wmoCodeToIconName = (wmoCode, isNight = false) => {
  const weather = transformWMOCodeToLegacyFormat(wmoCode, isNight);
  return weather.icon || 'unknown';
};

/**
 * NEW: Enhanced weekly forecast processing for Open-Meteo data format
 * Works with both legacy OpenWeatherMap format and new Open-Meteo format
 * @param {Object} response - Weather API response
 * @param {Array} descriptions_list - Legacy descriptions list (optional for Open-Meteo)
 * @returns {Array} Processed weekly forecast data
 */
export const getWeekForecastWeather = (response, descriptions_list = []) => {
  // Handle Open-Meteo format (new)
  if (response?._dailyData) {
    return getWeekForecastWeatherOpenMeteo(response._dailyData);
  }

  // Handle legacy OpenWeatherMap format (fallback)
  return getWeekForecastWeatherLegacy(response, descriptions_list);
};

/**
 * Process weekly forecast for Open-Meteo data format
 * @param {Object} dailyData - Open-Meteo daily data
 * @returns {Array} Processed weekly forecast
 */
function getWeekForecastWeatherOpenMeteo(dailyData) {
  if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
    return [];
  }

  const weeklyForecast = [];

  for (let i = 0; i < dailyData.time.length; i++) {
    const date = dailyData.time[i];
    const weatherCode = dailyData.weather_code[i];
    const tempMax = dailyData.temperature_max[i];
    const tempMin = dailyData.temperature_min[i];
    const windSpeed = dailyData.wind_speed_max[i];
    const windDirection = dailyData.wind_direction[i];
    const sunrise = dailyData.sunrise[i];
    const sunset = dailyData.sunset[i];

    // Calculate average temperature for the day
    const avgTemp = Math.round((tempMax + tempMin) / 2);

    // Determine if we should use day or night icon (use midday for daily forecast)
    const midday = `${date}T12:00:00`;
    const isNight = determineNightTime(midday, sunrise, sunset);
    const weather = transformWMOCodeToLegacyFormat(weatherCode, isNight);

    weeklyForecast.push({
      date: date,
      temp: avgTemp,
      humidity: 50, // Open-Meteo doesn't provide daily humidity, use reasonable default
      wind: parseFloat((windSpeed || 0).toFixed(2)),
      clouds: 50, // Open-Meteo doesn't provide daily clouds, use reasonable default
      description: weather.description,
      icon: weather.icon,
      // Additional Open-Meteo specific data
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      windDirection: windDirection || 0,
      weatherCode: weatherCode
    });
  }

  return weeklyForecast;
}

/**
 * LEGACY: Process weekly forecast for OpenWeatherMap format
 * @param {Object} response - OpenWeatherMap API response
 * @param {Array} descriptions_list - Weather descriptions list
 * @returns {Array} Processed weekly forecast
 */
function getWeekForecastWeatherLegacy(response, descriptions_list) {
  let foreacast_data = [];
  let descriptions_data = [];

  if (!response || Object.keys(response).length === 0 || response.cod === '404')
    return [];

  response?.list.slice().map((item, idx) => {
    descriptions_data.push({
      description: item.weather[0].description,
      date: item.dt_txt.substring(0, 10),
    });
    foreacast_data.push({
      date: item.dt_txt.substring(0, 10),
      temp: item.main.temp,
      humidity: item.main.humidity,
      wind: item.wind.speed,
      clouds: item.clouds.all,
    });

    return { idx, item };
  });

  const groupByDate = groupBy('date');
  let grouped_forecast_data = groupByDate(foreacast_data);
  let grouped_forecast_descriptions = groupByDate(descriptions_data);

  const description_keys = Object.keys(grouped_forecast_descriptions);

  let dayDescList = [];

  description_keys.forEach((key) => {
    let singleDayDescriptions = grouped_forecast_descriptions[key].map(
      (item) => item.description
    );
    let mostFrequentDescription = getMostFrequentWeather(singleDayDescriptions);
    dayDescList.push(mostFrequentDescription);
  });

  const forecast_keys = Object.keys(grouped_forecast_data);
  let dayAvgsList = [];

  forecast_keys.forEach((key, idx) => {
    let dayTempsList = [];
    let dayHumidityList = [];
    let dayWindList = [];
    let dayCloudsList = [];

    for (let i = 0; i < grouped_forecast_data[key].length; i++) {
      dayTempsList.push(grouped_forecast_data[key][i].temp);
      dayHumidityList.push(grouped_forecast_data[key][i].humidity);
      dayWindList.push(grouped_forecast_data[key][i].wind);
      dayCloudsList.push(grouped_forecast_data[key][i].clouds);
    }

    dayAvgsList.push({
      date: key,
      temp: getAverage(dayTempsList),
      humidity: getAverage(dayHumidityList),
      wind: getAverage(dayWindList, false),
      clouds: getAverage(dayCloudsList),
      description: dayDescList[idx],
      icon: descriptionToIconName(dayDescList[idx], descriptions_list),
    });
  });

  return dayAvgsList;
}

/**
 * Enhanced today's forecast processing for both formats
 * @param {Object} response - Weather API response
 * @param {string} current_date - Current date string
 * @param {number} current_datetime - Current datetime timestamp
 * @returns {Array} Today's hourly forecast
 */
export const getTodayForecastWeather = (
  response,
  current_date,
  current_datetime
) => {
  if (!response || Object.keys(response).length === 0) {
    return [];
  }

  // Handle legacy format check
  if (response.cod === '404') {
    return [];
  }

  let all_today_forecasts = [];

  response?.list.slice().map((item) => {
    if (item.dt_txt.startsWith(current_date.substring(0, 10))) {
      if (item.dt > current_datetime) {
        all_today_forecasts.push({
          time: item.dt_txt.split(' ')[1].substring(0, 5),
          icon: item.weather[0].icon,
          temperature: Math.round(item.main.temp) + ' °C',
        });
      }
    }
    return all_today_forecasts;
  });

  if (all_today_forecasts.length < 7) {
    return [...all_today_forecasts];
  } else {
    return all_today_forecasts.slice(-6);
  }
};
