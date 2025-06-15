import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer, Gauge, Navigation } from 'lucide-react';
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
    pressure_mb: number;
    uv: number;
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
  const [city, setCity] = useState('Tokyo');
  const [searchInput, setSearchInput] = useState('');

  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: WeatherData = {
        location: { name: city, country: 'Japan' },
        current: {
          temp_c: 24,
          condition: { text: 'Partly cloudy', icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png' },
          humidity: 68,
          wind_kph: 12,
          vis_km: 16,
          feelslike_c: 27,
          pressure_mb: 1013,
          uv: 6
        },
        forecast: {
          forecastday: [
            { date: '2024-01-01', day: { maxtemp_c: 26, mintemp_c: 18, condition: { text: 'Sunny', icon: '' } } },
            { date: '2024-01-02', day: { maxtemp_c: 23, mintemp_c: 16, condition: { text: 'Cloudy', icon: '' } } },
            { date: '2024-01-03', day: { maxtemp_c: 21, mintemp_c: 14, condition: { text: 'Rainy', icon: '' } } },
            { date: '2024-01-04', day: { maxtemp_c: 25, mintemp_c: 17, condition: { text: 'Sunny', icon: '' } } },
            { date: '2024-01-05', day: { maxtemp_c: 28, mintemp_c: 20, condition: { text: 'Partly cloudy', icon: '' } } },
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
    const iconClass = "w-20 h-20 drop-shadow-2xl";
    if (condition.toLowerCase().includes('sun')) return <Sun className={`${iconClass} text-amber-400`} />;
    if (condition.toLowerCase().includes('cloud')) return <Cloud className={`${iconClass} text-slate-300`} />;
    if (condition.toLowerCase().includes('rain')) return <CloudRain className={`${iconClass} text-cyan-400`} />;
    if (condition.toLowerCase().includes('snow')) return <CloudSnow className={`${iconClass} text-blue-200`} />;
    return <Sun className={`${iconClass} text-amber-400`} />;
  };

  const getBackgroundClass = (condition: string) => {
    if (condition.toLowerCase().includes('sun')) return 'from-amber-500 via-orange-500 to-pink-600';
    if (condition.toLowerCase().includes('cloud')) return 'from-slate-600 via-slate-700 to-slate-900';
    if (condition.toLowerCase().includes('rain')) return 'from-cyan-500 via-blue-600 to-indigo-800';
    if (condition.toLowerCase().includes('snow')) return 'from-blue-300 via-indigo-400 to-purple-600';
    return 'from-violet-600 via-purple-600 to-blue-600';
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return new Date(dateStr).toLocaleDateString('en', { weekday: 'short' });
  };

  // Add native app detection
  const isNativeApp = window.location.protocol === 'capacitor:' || 
                     (window as any).Capacitor !== undefined;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${weather ? getBackgroundClass(weather.current.condition.text) : 'from-indigo-900 via-purple-900 to-pink-900'} transition-all duration-1000 relative overflow-hidden ${isNativeApp ? 'pt-safe pb-safe' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-float"></div>
      </div>
      
      <div className="relative min-h-screen backdrop-blur-sm bg-black/10 p-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="text-center pt-8 pb-6">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Weather<span className="text-yellow-300">Ⓧ</span>
            </h1>
            <p className="text-white/70 text-lg">
              Next-gen weather intelligence
            </p>
          </div>

          {/* Search */}
          <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
            <div className="flex gap-3">
              <Input
                placeholder="Search any city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-2xl h-12 text-lg backdrop-blur-sm"
              />
              <Button 
                onClick={handleSearch}
                className="bg-white/15 hover:bg-white/25 border-white/20 text-white backdrop-blur-sm h-12 px-6 rounded-2xl transition-all duration-300 hover:scale-105"
                variant="outline"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </Card>

          {/* Current Weather */}
          {isLoading ? (
            <Card className="p-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
              <div className="animate-pulse text-center space-y-4">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto"></div>
                <div className="h-12 bg-white/20 rounded-2xl"></div>
                <div className="h-6 bg-white/20 rounded-xl w-2/3 mx-auto"></div>
              </div>
            </Card>
          ) : weather ? (
            <Card className="p-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <MapPin className="w-5 h-5 text-white/70 mr-2" />
                  <span className="text-white text-xl font-medium">
                    {weather.location.name}, {weather.location.country}
                  </span>
                </div>
                
                <div className="mb-8">
                  {getWeatherIcon(weather.current.condition.text)}
                </div>
                
                <div className="text-7xl font-bold text-white mb-4 tracking-tight">
                  {Math.round(weather.current.temp_c)}°
                </div>
                
                <div className="text-white/80 text-2xl mb-6 font-light">
                  {weather.current.condition.text}
                </div>
                
                <div className="text-white/60 text-lg">
                  Feels like {Math.round(weather.current.feelslike_c)}°
                </div>
              </div>
            </Card>
          ) : null}

          {/* Weather Details Grid */}
          {weather && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Wind, label: 'Wind Speed', value: `${weather.current.wind_kph} km/h`, color: 'text-cyan-300' },
                { icon: Droplets, label: 'Humidity', value: `${weather.current.humidity}%`, color: 'text-blue-300' },
                { icon: Eye, label: 'Visibility', value: `${weather.current.vis_km} km`, color: 'text-purple-300' },
                { icon: Gauge, label: 'Pressure', value: `${weather.current.pressure_mb} mb`, color: 'text-green-300' },
              ].map((item, index) => (
                <Card key={index} className="p-5 bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                  <div className="text-white/70 text-sm mb-1">{item.label}</div>
                  <div className="text-white text-lg font-semibold">{item.value}</div>
                </Card>
              ))}
            </div>
          )}

          {/* Extended Forecast */}
          {weather && (
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                5-Day Forecast
              </h3>
              <div className="space-y-4">
                {weather.forecast.forecastday.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-white/5 transition-all duration-200">
                    <div className="text-white/90 font-medium min-w-[80px]">
                      {getDayName(day.date, index)}
                    </div>
                    <div className="flex items-center gap-4 flex-1 justify-center">
                      <span className="text-white/70 text-sm capitalize">{day.day.condition.text}</span>
                    </div>
                    <div className="text-white font-semibold text-right">
                      <span className="text-lg">{Math.round(day.day.maxtemp_c)}°</span>
                      <span className="text-white/60 text-sm ml-1">/ {Math.round(day.day.mintemp_c)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-white/50 text-sm">
              Powered by advanced weather intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
