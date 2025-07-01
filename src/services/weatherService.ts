// OpenWeatherMap API service
// Get your API key from: https://openweathermap.org/api

// Use API key from environment variable if available, otherwise use the placeholder
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_API_KEY'; 
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
  alerts?: WeatherAlert[]; // Optional weather alerts
}

export interface WeatherAlert {
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'extreme';
  startTime: string;
  endTime: string;
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

// Mock data for when API is not available or fails
const getMockWeatherData = (): WeatherData => {
  return {
    location: "San Francisco",
    currentTemp: 22,
    description: "Clear sky",
    highTemp: 25,
    lowTemp: 18,
    feelsLike: 23,
    humidity: 65,
    windSpeed: 8,
    windDirection: 'NW',
    precipitation: 10,
    uvIndex: 5,
    sunrise: '6:15 AM',
    sunset: '8:30 PM',
    icon: '01d',
    hourlyForecast: [
      { time: 'Now', temp: 22, icon: '01d' },
      { time: '12:00', temp: 23, icon: '01d' },
      { time: '15:00', temp: 25, icon: '01d' },
      { time: '18:00', temp: 24, icon: '02d' },
      { time: '21:00', temp: 21, icon: '02n' },
      { time: '00:00', temp: 19, icon: '01n' },
      { time: '03:00', temp: 18, icon: '01n' },
      { time: '06:00', temp: 18, icon: '01d' },
    ],
    dailyForecast: [
      { day: 'Today', high: 25, low: 18, icon: '01d', precipitation: 10 },
      { day: 'Tomorrow', high: 26, low: 19, icon: '01d', precipitation: 0 },
      { day: 'Thu', high: 27, low: 19, icon: '02d', precipitation: 0 },
      { day: 'Fri', high: 24, low: 18, icon: '10d', precipitation: 30 },
      { day: 'Sat', high: 22, low: 17, icon: '10d', precipitation: 60 },
    ],
    alerts: [
      {
        title: 'Excessive Heat Warning',
        description: 'The National Weather Service has issued an excessive heat warning. High temperatures may cause heat-related illnesses.',
        severity: 'severe',
        startTime: '12:00 PM',
        endTime: '8:00 PM'
      },
      {
        title: 'Air Quality Alert',
        description: 'Air quality may be unhealthy for sensitive groups. Reduce prolonged outdoor activities if you experience respiratory symptoms.',
        severity: 'moderate',
        startTime: '6:00 AM',
        endTime: '6:00 PM'
      }
    ]
  };
};

// Construct weather data from current data and forecast data
const constructWeatherData = (currentData: any, forecastData: any | null): WeatherData => {
  // Default values for forecast if not available
  let hourlyForecast = [];
  let dailyForecast = [];
  let precipitation = 0;
  let alerts: WeatherAlert[] | undefined = undefined;
  
  if (forecastData) {
    // Process forecast data as normal
    hourlyForecast = forecastData.list.slice(0, 8).map((hour: any, index: number) => {
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
    
    dailyForecast = Array.from(dailyMap.values()).slice(0, 5).map((day: any) => ({
      day: formatDay(day.dt),
      high: formatTemperature(day.temp_max),
      low: formatTemperature(day.temp_min),
      icon: day.weather.icon,
      precipitation: Math.round(day.pop * 100),
    }));
    
    precipitation = forecastData.list[0].pop * 100;
    
    // Process weather alerts if available (OneCall API)
    if (forecastData.alerts) {
      alerts = forecastData.alerts.map((alert: any) => ({
        title: alert.event || 'Weather Alert',
        description: alert.description || '',
        severity: determineSeverity(alert.event),
        startTime: formatTime(alert.start),
        endTime: formatTime(alert.end)
      }));
    }
  } else {
    // Create generic forecast if not available
    hourlyForecast = [
      { time: 'Now', temp: formatTemperature(currentData.main.temp), icon: currentData.weather[0].icon },
    ];
    
    dailyForecast = [
      { 
        day: 'Today', 
        high: formatTemperature(currentData.main.temp_max), 
        low: formatTemperature(currentData.main.temp_min), 
        icon: currentData.weather[0].icon,
        precipitation: 0
      }
    ];
  }
  
  // Calculate UV index (not available in free API)
  const uvIndex = 5;
  
  return {
    location: currentData.name,
    currentTemp: formatTemperature(currentData.main.temp),
    description: currentData.weather[0].description,
    highTemp: formatTemperature(currentData.main.temp_max),
    lowTemp: formatTemperature(currentData.main.temp_min),
    feelsLike: formatTemperature(currentData.main.feels_like),
    humidity: currentData.main.humidity,
    windSpeed: formatWindSpeed(currentData.wind.speed),
    windDirection: getWindDirection(currentData.wind.deg),
    precipitation,
    uvIndex,
    sunrise: formatTime(currentData.sys.sunrise),
    sunset: formatTime(currentData.sys.sunset),
    icon: currentData.weather[0].icon,
    hourlyForecast,
    dailyForecast,
    alerts,
  };
};

// Determine severity level of weather alert
const determineSeverity = (eventType: string): 'moderate' | 'severe' | 'extreme' => {
  const lowercaseEvent = eventType.toLowerCase();
  
  if (lowercaseEvent.includes('extreme') || 
      lowercaseEvent.includes('hurricane') || 
      lowercaseEvent.includes('tornado')) {
    return 'extreme';
  } else if (lowercaseEvent.includes('severe') || 
            lowercaseEvent.includes('storm') || 
            lowercaseEvent.includes('warning')) {
    return 'severe';
  } else {
    return 'moderate';
  }
};

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
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
      console.warn('OpenWeatherMap API key not configured. Using mock locations.');
      return [
        { name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'US' },
        { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
        { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' }
      ].filter(city => city.name.toLowerCase().includes(query.toLowerCase()));
    }
    
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(
        query
      )}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch location data: ${response.status}`);
      return [];
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
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
      console.warn('OpenWeatherMap API key not configured. Using mock data.');
      return getMockWeatherData();
    }
    
    // Get current weather data
    const currentResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`
    );
    
    if (!currentResponse.ok) {
      console.error(`Failed to fetch current weather: ${currentResponse.status}`);
      return getMockWeatherData();
    }
    
    const currentData = await currentResponse.json();
    
    // Get forecast data
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      console.error(`Failed to fetch forecast data: ${forecastResponse.status}`);
      // Even if forecast fails, try to construct weather data with current data
      return constructWeatherData(currentData, null);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Use our helper function to construct the weather data
    return constructWeatherData(currentData, forecastData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// Get weather by city name
export const getWeatherByCity = async (city: string): Promise<WeatherData | null> => {
  try {
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
      console.warn('OpenWeatherMap API key not configured. Using mock data.');
      return getMockWeatherData();
    }
    
    // First get geocoding data to get coordinates
    const geocodingData = await getGeocodingData(city);
    
    if (!geocodingData.length) {
      console.warn(`Location "${city}" not found. Using mock data.`);
      return getMockWeatherData();
    }
    
    // Get the first result
    const { lat, lon } = geocodingData[0];
    
    // Get weather data using coordinates
    return await getCurrentWeather(lat, lon);
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    return getMockWeatherData();
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
