// OpenWeatherMap API service
// Get your API key from: https://openweathermap.org/api

// You should store this in an environment variable in a real application
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const UNITS = 'metric' as const; // For Celsius, use 'imperial' for Fahrenheit

export interface WeatherData {
  location: string;
  currentTemp: number;
  description: string;
  highTemp: number;
  lowTemp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  icon: string;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
}

export interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  icon: string;
  precipitation: number;
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Format temperature according to units
const formatTemperature = (temp: number): number => {
  return Math.round(temp);
};

// Format time from Unix timestamp
const formatTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(timestamp * 1000);
};

// Format day from Unix timestamp
const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
    return 'Today';
  } else if (date.setHours(0, 0, 0, 0) === tomorrow.setHours(0, 0, 0, 0)) {
    return 'Tomorrow';
  } else {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  }
};

// Get wind direction from degrees
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Get wind speed in the right units
const formatWindSpeed = (speedMetersPerSecond: number): number => {
  // Always convert to mph for consistency with the UI
  return Math.round(speedMetersPerSecond * 2.237);
};

// Get geolocation data from city name
export const getGeocodingData = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(
        query
      )}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
    }));
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return [];
  }
};

// Get current weather by coordinates
export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    // Get current weather data
    const currentResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current weather: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // Get forecast data
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Failed to fetch forecast data: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Format hourly forecast data (next 24 hours - 8 items at 3-hour intervals)
    const hourlyForecast = forecastData.list.slice(0, 8).map((hour: any, index: number) => {
      const hourTime = new Date(hour.dt * 1000);
      return {
        time: index === 0 ? 'Now' : hourTime.getHours() + ':00',
        temp: formatTemperature(hour.main.temp),
        icon: hour.weather[0].icon,
      };
    });
    
    // Group forecast by day for daily forecast
    const dailyMap = new Map();
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toLocaleDateString();
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          dt: item.dt,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          weather: item.weather[0],
          pop: item.pop
        });
      } else {
        const existingData = dailyMap.get(dateStr);
        if (item.main.temp_min < existingData.temp_min) {
          existingData.temp_min = item.main.temp_min;
        }
        if (item.main.temp_max > existingData.temp_max) {
          existingData.temp_max = item.main.temp_max;
        }
        if (item.pop > existingData.pop) {
          existingData.pop = item.pop;
        }
      }
    });
    
    // Create daily forecast from the grouped data
    const dailyForecast = Array.from(dailyMap.values()).slice(0, 5).map((day: any) => ({
      day: formatDay(day.dt),
      high: formatTemperature(day.temp_max),
      low: formatTemperature(day.temp_min),
      icon: day.weather.icon,
      precipitation: Math.round(day.pop * 100), // Probability of precipitation
    }));
    
    // Calculate UV index (if available or use default)
    const uvIndex = 5; // Default value as it's not available in the free API
    
    // Extract data from current weather
    const weatherData: WeatherData = {
      location: currentData.name,
      currentTemp: formatTemperature(currentData.main.temp),
      description: currentData.weather[0].description,
      highTemp: formatTemperature(currentData.main.temp_max),
      lowTemp: formatTemperature(currentData.main.temp_min),
      feelsLike: formatTemperature(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      windSpeed: formatWindSpeed(currentData.wind.speed),
      windDirection: getWindDirection(currentData.wind.deg),
      precipitation: forecastData.list[0].pop * 100, // Probability of precipitation from the first forecast
      uvIndex: uvIndex,
      sunrise: formatTime(currentData.sys.sunrise),
      sunset: formatTime(currentData.sys.sunset),
      icon: currentData.weather[0].icon,
      hourlyForecast,
      dailyForecast,
    };
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// Get weather by city name
export const getWeatherByCity = async (city: string): Promise<WeatherData | null> => {
  try {
    // First get geocoding data to get coordinates
    const geocodingData = await getGeocodingData(city);
    
    if (!geocodingData.length) {
      throw new Error('Location not found');
    }
    
    // Get the first result
    const { lat, lon } = geocodingData[0];
    
    // Get weather data using coordinates
    return await getCurrentWeather(lat, lon);
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    return null;
  }
};

// Get a formatted location string with state/country
export const getFormattedLocationList = async (query: string): Promise<string[]> => {
  try {
    const geocodingData = await getGeocodingData(query);
    
    return geocodingData.map(location => {
      const statePart = location.state ? `, ${location.state}` : '';
      return `${location.name}${statePart}, ${location.country}`;
    });
  } catch (error) {
    console.error('Error getting formatted locations:', error);
    return [];
  }
};

// Utility function to get weather icon URL
export const getWeatherIconUrl = (iconCode: string, large: boolean = false): string => {
  return `https://openweathermap.org/img/wn/${iconCode}${large ? '@2x' : ''}.png`;
};
