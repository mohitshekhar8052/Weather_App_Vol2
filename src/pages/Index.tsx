
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    vis_km: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

const Index = () => {
  const [city, setCity] = useState('London');
  const [searchInput, setSearchInput] = useState('');

  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      // Using a mock API response for demo purposes
      // In a real app, you'd use: `https://api.weatherapi.com/v1/forecast.json?key=YOUR_API_KEY&q=${city}&days=7`
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockData: WeatherData = {
        location: { name: city, country: 'UK' },
        current: {
          temp_c: 22,
          condition: { text: 'Partly cloudy', icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png' },
          humidity: 65,
          wind_kph: 15,
          vis_km: 10,
          feelslike_c: 25
        },
        forecast: {
          forecastday: [
            { date: '2024-01-01', day: { maxtemp_c: 24, mintemp_c: 18, condition: { text: 'Sunny', icon: '' } } },
            { date: '2024-01-02', day: { maxtemp_c: 20, mintemp_c: 15, condition: { text: 'Cloudy', icon: '' } } },
            { date: '2024-01-03', day: { maxtemp_c: 18, mintemp_c: 12, condition: { text: 'Rainy', icon: '' } } },
          ]
        }
      };
      return mockData;
    },
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput('');
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('sun')) return <Sun className="w-16 h-16 text-yellow-400" />;
    if (condition.toLowerCase().includes('cloud')) return <Cloud className="w-16 h-16 text-gray-400" />;
    if (condition.toLowerCase().includes('rain')) return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (condition.toLowerCase().includes('snow')) return <CloudSnow className="w-16 h-16 text-blue-200" />;
    return <Sun className="w-16 h-16 text-yellow-400" />;
  };

  const getBackgroundClass = (condition: string) => {
    if (condition.toLowerCase().includes('sun')) return 'from-orange-400 via-pink-500 to-purple-600';
    if (condition.toLowerCase().includes('cloud')) return 'from-gray-400 via-gray-600 to-gray-800';
    if (condition.toLowerCase().includes('rain')) return 'from-blue-500 via-blue-700 to-indigo-900';
    if (condition.toLowerCase().includes('snow')) return 'from-blue-200 via-blue-400 to-blue-600';
    return 'from-orange-400 via-pink-500 to-purple-600';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${weather ? getBackgroundClass(weather.current.condition.text) : 'from-blue-500 via-purple-600 to-pink-600'} transition-all duration-1000`}>
      <div className="min-h-screen backdrop-blur-sm bg-white/10 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <h1 className="text-3xl font-bold text-white mb-2">WeatherNext</h1>
            <p className="text-white/80">Next-gen weather experience</p>
          </div>

          {/* Search */}
          <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/60"
              />
              <Button 
                onClick={handleSearch}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                variant="outline"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Current Weather */}
          {isLoading ? (
            <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-8">
              <div className="animate-pulse text-center">
                <div className="w-16 h-16 bg-white/30 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-white/30 rounded mb-2"></div>
                <div className="h-4 bg-white/30 rounded"></div>
              </div>
            </Card>
          ) : weather ? (
            <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-white/80 mr-2" />
                <span className="text-white text-lg font-medium">
                  {weather.location.name}, {weather.location.country}
                </span>
              </div>
              
              <div className="mb-6">
                {getWeatherIcon(weather.current.condition.text)}
              </div>
              
              <div className="text-6xl font-bold text-white mb-2">
                {Math.round(weather.current.temp_c)}°
              </div>
              
              <div className="text-white/80 text-xl mb-6">
                {weather.current.condition.text}
              </div>
              
              <div className="text-white/70">
                Feels like {Math.round(weather.current.feelslike_c)}°
              </div>
            </Card>
          ) : null}

          {/* Weather Details */}
          {weather && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-4 text-center">
                <Wind className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <div className="text-white text-sm opacity-80">Wind</div>
                <div className="text-white text-lg font-semibold">{weather.current.wind_kph} km/h</div>
              </Card>
              
              <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-4 text-center">
                <Droplets className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <div className="text-white text-sm opacity-80">Humidity</div>
                <div className="text-white text-lg font-semibold">{weather.current.humidity}%</div>
              </Card>
              
              <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-4 text-center">
                <Eye className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <div className="text-white text-sm opacity-80">Visibility</div>
                <div className="text-white text-lg font-semibold">{weather.current.vis_km} km</div>
              </Card>
              
              <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-4 text-center">
                <Thermometer className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <div className="text-white text-sm opacity-80">Feels like</div>
                <div className="text-white text-lg font-semibold">{Math.round(weather.current.feelslike_c)}°</div>
              </Card>
            </div>
          )}

          {/* Forecast */}
          {weather && (
            <Card className="glass-card bg-white/20 backdrop-blur-lg border-white/30 p-6">
              <h3 className="text-white text-lg font-semibold mb-4">3-Day Forecast</h3>
              <div className="space-y-3">
                {weather.forecast.forecastday.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between py-2">
                    <div className="text-white/80">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/70">{day.day.condition.text}</span>
                      <div className="text-white font-medium">
                        {Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
