const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Current conditions";
}

export function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "☀";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "☁";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄";
  if ([95, 96, 99].includes(code)) return "ϟ";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "☂";
  }
  return "☀";
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}.`);
  }
  return response.json();
}

export async function searchCityWeather(cityName, signal) {
  const geocoding = new URL(GEOCODING_URL);
  geocoding.search = new URLSearchParams({
    name: cityName,
    count: "1",
    language: "en",
    format: "json",
  });

  const locations = await fetchJson(geocoding, signal);
  const location = locations.results?.[0];
  if (!location) {
    throw new Error(`We couldn’t find “${cityName}”. Try another city name.`);
  }

  const forecast = new URL(FORECAST_URL);
  forecast.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "5",
    timezone: "auto",
  });
  const weather = await fetchJson(forecast, signal);

  return {
    location: {
      name: location.name,
      country: location.country ?? "",
      countryCode: location.country_code ?? "",
      admin1: location.admin1 ?? "",
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone ?? weather.timezone ?? "auto",
    },
    current: weather.current,
    daily: weather.daily,
  };
}
