const axios = require('axios');

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

// Mumbai/Konkan coast coordinates
const DEFAULT_LAT = 18.95;
const DEFAULT_LNG = 72.85;
// Cache weather responses for 10 minutes to avoid Open-Meteo rate limits (429)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

async function cachedGet(url, params) {
  const key = url + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < CACHE_TTL) return hit.res;
  try {
    const res = await axios.get(url, { params, timeout: 10000 });
    cache.set(key, { time: Date.now(), res });
    return res;
  } catch (err) {
    if (hit) return hit.res; // if the API fails, serve the last good data
    throw err;
  }
}

const http = { get: (url, cfg) => cachedGet(url, cfg.params) };

const WMO_WEATHER_CODES = {
  0: { desc: 'Clear sky', icon: '☀️', severity: 'low' },
  1: { desc: 'Mainly clear', icon: '🌤️', severity: 'low' },
  2: { desc: 'Partly cloudy', icon: '⛅', severity: 'low' },
  3: { desc: 'Overcast', icon: '☁️', severity: 'low' },
  45: { desc: 'Foggy', icon: '🌫️', severity: 'medium' },
  48: { desc: 'Rime fog', icon: '🌫️', severity: 'medium' },
  51: { desc: 'Light drizzle', icon: '🌦️', severity: 'low' },
  53: { desc: 'Moderate drizzle', icon: '🌦️', severity: 'low' },
  55: { desc: 'Dense drizzle', icon: '🌧️', severity: 'medium' },
  56: { desc: 'Freezing drizzle', icon: '🌧️', severity: 'high' },
  57: { desc: 'Dense freezing drizzle', icon: '🌧️', severity: 'high' },
  61: { desc: 'Slight rain', icon: '🌦️', severity: 'low' },
  63: { desc: 'Moderate rain', icon: '🌧️', severity: 'medium' },
  65: { desc: 'Heavy rain', icon: '🌧️', severity: 'high' },
  66: { desc: 'Freezing rain', icon: '🌧️', severity: 'high' },
  67: { desc: 'Heavy freezing rain', icon: '🌧️', severity: 'critical' },
  71: { desc: 'Slight snow', icon: '🌨️', severity: 'medium' },
  73: { desc: 'Moderate snow', icon: '🌨️', severity: 'high' },
  75: { desc: 'Heavy snow', icon: '❄️', severity: 'critical' },
  77: { desc: 'Snow grains', icon: '❄️', severity: 'medium' },
  80: { desc: 'Slight rain showers', icon: '🌦️', severity: 'low' },
  81: { desc: 'Moderate rain showers', icon: '🌧️', severity: 'medium' },
  82: { desc: 'Violent rain showers', icon: '⛈️', severity: 'high' },
  85: { desc: 'Slight snow showers', icon: '🌨️', severity: 'medium' },
  86: { desc: 'Heavy snow showers', icon: '❄️', severity: 'high' },
  95: { desc: 'Thunderstorm', icon: '⛈️', severity: 'high' },
  96: { desc: 'Thunderstorm with hail', icon: '⛈️', severity: 'critical' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️', severity: 'critical' },
};

function getWeatherInfo(code) {
  return WMO_WEATHER_CODES[code] || { desc: 'Unknown', icon: '❓', severity: 'low' };
}

function assessWindSeverity(speed) {
  if (speed > 60) return 'critical';
  if (speed > 40) return 'high';
  if (speed > 25) return 'medium';
  return 'low';
}

async function getCurrentWeather(lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
  try {
    const res = await http.get(`${OPEN_METEO_BASE}/forecast`, { 
      params: {
        latitude: lat,
        longitude: lng,
        current: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
          'weather_code', 'wind_speed_10m', 'wind_direction_10m',
          'wind_gusts_10m', 'cloud_cover', 'precipitation',
          'surface_pressure', 'uv_index'
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: 1,
      },
    });
    const c = res.data.current;
    const weatherInfo = getWeatherInfo(c.weather_code);
    return {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      feelsLike: c.apparent_temperature,
      weatherCode: c.weather_code,
      description: weatherInfo.desc,
      icon: weatherInfo.icon,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      windSeverity: assessWindSeverity(c.wind_speed_10m),
      cloudCover: c.cloud_cover,
      precipitation: c.precipitation,
      pressure: c.surface_pressure,
      uvIndex: c.uv_index,
      severity: weatherInfo.severity,
      timestamp: c.time,
    };
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    return null;
  }
}

async function getMarineWeather(lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
  try {
    const res = await http.get(`${OPEN_METEO_BASE}/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        current: [
          'temperature_2m', 'weather_code', 'wind_speed_10m',
          'wind_direction_10m', 'wind_gusts_10m', 'precipitation',
          'cloud_cover', 'uv_index'
        ].join(','),
        daily: [
          'weather_code', 'temperature_2m_max', 'temperature_2m_min',
          'precipitation_sum', 'precipitation_probability_max',
          'wind_speed_10m_max', 'wind_gusts_10m_max', 'uv_index_max',
          'sunrise', 'sunset'
        ].join(','),
        timezone: 'Asia/Kolkata',
        forecast_days: 7,
      },
    });
    const c = res.data.current;
    const d = res.data.daily;
    const weatherInfo = getWeatherInfo(c.weather_code);
    return {
      current: {
        temperature: c.temperature_2m,
        description: weatherInfo.desc,
        icon: weatherInfo.icon,
        windSpeed: c.wind_speed_10m,
        windDirection: c.wind_direction_10m,
        windGusts: c.wind_gusts_10m,
        precipitation: c.precipitation,
        cloudCover: c.cloud_cover,
        uvIndex: c.uv_index,
        severity: weatherInfo.severity,
      },
      forecast: d.time.map((date, i) => ({
        date,
        weatherCode: d.weather_code[i],
        description: getWeatherInfo(d.weather_code[i]).desc,
        icon: getWeatherInfo(d.weather_code[i]).icon,
        tempMax: d.temperature_2m_max[i],
        tempMin: d.temperature_2m_min[i],
        precipitation: d.precipitation_sum[i],
        precipProbability: d.precipitation_probability_max[i],
        windSpeedMax: d.wind_speed_10m_max[i],
        windGustsMax: d.wind_gusts_10m_max[i],
        uvIndexMax: d.uv_index_max[i],
        sunrise: d.sunrise[i],
        sunset: d.sunset[i],
        severity: getWeatherInfo(d.weather_code[i]).severity,
      })),
    };
  } catch (err) {
    console.error('Marine weather fetch error:', err.message);
    return null;
  }
}

async function checkWeatherAlerts(lat = DEFAULT_LAT, lng = DEFAULT_LNG) {
  const weather = await getCurrentWeather(lat, lng);
  if (!weather) return [];
  const alerts = [];
  if (weather.windSpeed > 40) {
    alerts.push({ title: 'Strong Wind Warning', description: `Wind speeds of ${weather.windSpeed} km/h detected. Fishing vessels should exercise caution.`, severity: weather.windSeverity, type: 'strong_current' });
  }
  if (weather.windGusts > 60) {
    alerts.push({ title: 'Wind Gust Alert', description: `Wind gusts up to ${weather.windGusts} km/h expected. Consider returning to port.`, severity: 'high', type: 'storm' });
  }
  if (weather.precipitation > 10) {
    alerts.push({ title: 'Heavy Rain Alert', description: `Precipitation of ${weather.precipitation}mm detected. Reduced visibility expected.`, severity: 'medium', type: 'low_visibility' });
  }
  if (weather.uvIndex > 8) {
    alerts.push({ title: 'UV Index Warning', description: `Very high UV index of ${weather.uvIndex}. Take protective measures.`, severity: 'medium', type: 'extreme_weather' });
  }
  return alerts;
}

module.exports = { getCurrentWeather, getMarineWeather, checkWeatherAlerts };
