import React, { useState, useEffect } from 'react';
import { 
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, 
  Wind, Droplets, Thermometer, Search, MapPin, 
  Clock, ChevronDown, ArrowUp, ArrowDown, Menu, 
  RefreshCw, Calendar, Navigation, Plus, X, Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Fab } from '@/components/ui/fab';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  getGeocodingData, 
  getCurrentWeather, 
  getWeatherByCity, 
  getFormattedLocationList,
  WeatherData
} from '@/services/weatherService';

// Map weather condition to icon
const getWeatherIcon = (description: string | undefined) => {
  if (!description) return Sun;
  
  description = description.toLowerCase();
  if (description.includes('clear')) return Sun;
  if (description.includes('cloud')) return Cloud;
  if (description.includes('rain') || description.includes('drizzle')) return CloudRain;
  if (description.includes('snow')) return CloudSnow;
  if (description.includes('thunder') || description.includes('lightning')) return CloudLightning;
  if (description.includes('fog') || description.includes('mist')) return Wind;
  
  return Sun; // Default
};

interface SavedLocation {
  id: string;
  name: string;
  fullName: string;
  lat: number;
  lon: number;
}

// Type for search results
interface SearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  fullName: string;
  id: string;
}

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [currentLocation, setCurrentLocation] = useState('Loading...');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved locations from localStorage on mount
  useEffect(() => {
    const loadSavedLocations = () => {
      const savedLocationsStr = localStorage.getItem('savedLocations');
      if (savedLocationsStr) {
        try {
          const locations = JSON.parse(savedLocationsStr) as SavedLocation[];
          setSavedLocations(locations);
          
          // Load the first saved location or use geolocation
          if (locations.length > 0) {
            fetchWeatherForLocation(locations[0]);
          } else {
            getUserLocation();
          }
        } catch (e) {
          console.error('Error parsing saved locations:', e);
          getUserLocation();
        }
      } else {
        getUserLocation();
      }
    };
    
    loadSavedLocations();
  }, []);

  // Save locations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Search for locations when query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        const results = await getGeocodingData(searchQuery);
        
        // Format results for display
        const formattedResults = results.map(loc => {
          const statePart = loc.state ? `, ${loc.state}` : '';
          const fullName = `${loc.name}${statePart}, ${loc.country}`;
          return {
            ...loc,
            fullName,
            id: `${loc.lat}-${loc.lon}`
          };
        });
        
        setSearchResults(formattedResults);
      } catch (err) {
        console.error('Error searching for locations:', err);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  // Get user's current location
  const getUserLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          
          try {
            const weather = await getCurrentWeather(latitude, longitude);
            if (weather) {
              setCurrentWeather(weather);
              setCurrentLocation(weather.location);
              
              // Add to saved locations if not already saved
              const locationId = `${latitude}-${longitude}`;
              if (!savedLocations.some(loc => loc.id === locationId)) {
                const newLocation: SavedLocation = {
                  id: locationId,
                  name: weather.location,
                  fullName: weather.location,
                  lat: latitude,
                  lon: longitude
                };
                setSavedLocations(prev => [newLocation, ...prev]);
              }
              
              setError(null);
            } else {
              setError('Unable to fetch weather data');
            }
          } catch (err) {
            console.error('Error getting weather data:', err);
            setError('Error fetching weather data');
          } finally {
            setIsLoading(false);
          }
        },
        err => {
          console.error('Geolocation error:', err);
          setError('Location access denied. Please search for a location.');
          setIsLoading(false);
          // Open search dialog if location is denied
          setIsSearchOpen(true);
        }
      );
    } else {
      setError('Geolocation not supported. Please search for a location.');
      setIsLoading(false);
      setIsSearchOpen(true);
    }
  };

  // Fetch weather for a specific location
  const fetchWeatherForLocation = async (location: SavedLocation) => {
    try {
      setIsLoading(true);
      const weather = await getCurrentWeather(location.lat, location.lon);
      
      if (weather) {
        setCurrentWeather(weather);
        setCurrentLocation(location.fullName);
        setError(null);
      } else {
        setError('Unable to fetch weather data');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Error fetching weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh current weather data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      const currentLoc = savedLocations.find(loc => 
        loc.fullName === currentLocation || loc.name === currentLocation
      );
      
      if (currentLoc) {
        await fetchWeatherForLocation(currentLoc);
      } else {
        getUserLocation();
      }
    } catch (err) {
      console.error('Error refreshing weather:', err);
      setError('Error refreshing weather data');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };
  
  // Handle location selection from search or saved locations
  const handleLocationSelect = (location: SearchResult | SavedLocation) => {
    setIsSearchOpen(false);
    setIsAddLocationOpen(false);
    
    fetchWeatherForLocation(location);
  };
  
  // Save a location from search results
  const handleSaveLocation = (location: SearchResult) => {
    if (!savedLocations.some(loc => loc.id === location.id)) {
      setSavedLocations(prev => [location, ...prev]);
    }
    handleLocationSelect(location);
  };
  
  // Remove a saved location
  const handleRemoveLocation = (locationId: string) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      <AnimatedBackground />
      
      {/* Navbar */}
      {/* Error message if needed */}
      {error && (
        <Alert className="fixed top-2 right-2 left-2 z-50 bg-destructive/90 backdrop-blur-sm text-destructive-foreground animate-in fade-in slide-in-from-top-5" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <header className="relative z-10 px-4 py-3 flex items-center justify-between bg-background/30 backdrop-blur-md border-b border-[#ffffff10] dark:border-white/10">
        <div className="flex items-center gap-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Weather App</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/70">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="border-t border-border my-4 pt-4">
                  <h3 className="text-sm font-medium mb-2">Saved Locations</h3>
                  <div className="space-y-1">
                    {savedLocations.map(location => (
                      <Button 
                        key={location.id} 
                        variant="ghost" 
                        className="w-full justify-start text-foreground/80 hover:text-foreground"
                        onClick={() => {
                          handleLocationSelect(location);
                          setIsMenuOpen(false);
                        }}
                      >
                        <MapPin size={14} className="mr-2" />
                        {location.fullName}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold">Weather</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            )}
          </Button>
          <ThemeToggle />
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Search Location</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-2">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(location => (
                    <Button 
                      key={location.id} 
                      variant="ghost" 
                      className="w-full justify-start mb-1"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <MapPin size={14} className="mr-2" />
                      {location.fullName}
                      {!savedLocations.some(loc => loc.id === location.id) && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="ml-auto h-6 w-6" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveLocation(location);
                          }}
                        >
                          <Plus size={14} />
                        </Button>
                      )}
                    </Button>
                  ))
                ) : searchQuery.length > 1 ? (
                  <p className="text-center py-4 text-muted-foreground">No locations found</p>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Type to search for a city</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <main className="container mx-auto max-w-3xl px-4 pt-6 pb-24">
        {/* Location and Current Weather */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 text-lg font-medium text-foreground/80 mb-1">
            <MapPin size={16} />
            <span>{currentLocation}</span>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={40} className="animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Fetching weather data...</p>
            </div>
          ) : currentWeather ? (
            <>
              <div className="flex items-center justify-center">
                {currentWeather.icon ? (
                  <img 
                    src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`} 
                    alt={currentWeather.description} 
                    className="h-20 w-20"
                  />
                ) : (
                  getWeatherIcon(currentWeather.description)({ className: "h-20 w-20 text-primary animate-pulse-glow" })
                )}
                <div className="text-7xl font-light ml-2">{currentWeather.currentTemp}°</div>
              </div>
              
              <p className="text-xl font-medium mt-2">{currentWeather.description}</p>
              
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex items-center">
                  <ArrowUp size={14} className="text-foreground/70" />
                  <span className="ml-1">{currentWeather.highTemp}°</span>
                </div>
                <div className="flex items-center">
                  <ArrowDown size={14} className="text-foreground/70" />
                  <span className="ml-1">{currentWeather.lowTemp}°</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-4">No weather data available</p>
          )}
        </div>
        
        {/* Weather Cards */}
        {!isLoading && currentWeather && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Card glass={true} className="p-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Thermometer size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Feels Like</p>
                  <p className="text-lg font-medium">{currentWeather.feelsLike}°</p>
                </div>
              </div>
            </Card>
            
            <Card glass={true} className="p-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Droplets size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Humidity</p>
                  <p className="text-lg font-medium">{currentWeather.humidity}%</p>
                </div>
              </div>
            </Card>
            
            <Card glass={true} className="p-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wind size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Wind</p>
                  <p className="text-lg font-medium">{currentWeather.windSpeed} mph</p>
                </div>
              </div>
            </Card>
            
            <Card glass={true} className="p-4 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CloudRain size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Precipitation</p>
                  <p className="text-lg font-medium">{currentWeather.precipitation}%</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Tabs for Hourly and Daily Forecast */}
        {!isLoading && currentWeather && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 bg-black/5 dark:bg-foreground/5 backdrop-blur-md p-1 rounded-xl transition-colors duration-300">
              <TabsTrigger value="forecast" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock size={16} className="mr-1" />
                Hourly
              </TabsTrigger>
              <TabsTrigger value="daily" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar size={16} className="mr-1" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Navigation size={16} className="mr-1" />
                Places
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="forecast" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                  {currentWeather.hourlyForecast.map((hour, i) => {
                    const HourIcon = getWeatherIcon(hour.icon ? undefined : hour.time);
                    return (
                      <Card key={i} glass={true} className={`flex flex-col items-center p-3 transition-colors duration-300 ${i === 0 ? 'border-primary' : ''}`} style={{ minWidth: '70px' }}>
                        <span className="text-sm text-foreground/70">{hour.time}</span>
                        {hour.icon ? (
                          <img 
                            src={`https://openweathermap.org/img/wn/${hour.icon}.png`} 
                            alt="Weather icon" 
                            className="h-6 w-6 my-2"
                          />
                        ) : (
                          <HourIcon className={`h-6 w-6 my-2 ${i === 0 ? 'text-primary' : 'text-foreground/80'}`} />
                        )}
                        <span className="text-lg font-medium">{hour.temp}°</span>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-2">
                {currentWeather.dailyForecast.map((day, i) => {
                  const DayIcon = getWeatherIcon(day.icon ? undefined : day.day);
                  return (
                    <Card key={i} glass={true} className="flex items-center justify-between p-4 transition-colors duration-300">
                      <div className="flex items-center">
                        <div className="w-10">
                          {day.icon ? (
                            <img 
                              src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                              alt="Weather icon" 
                              className="h-6 w-6"
                            />
                          ) : (
                            <DayIcon className="h-6 w-6 text-foreground/80" />
                          )}
                        </div>
                        <span className="font-medium" style={{ width: '70px' }}>{day.day}</span>
                        <div className="bg-primary/10 rounded-full px-2 py-0.5 text-xs">
                          {day.precipitation > 0 ? `${day.precipitation}%` : 'Clear'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-foreground/70 text-sm">{day.low}°</span>
                        <div className="w-16 h-1 bg-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full"
                            style={{ width: `${((day.high - 60) / (80 - 60)) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium">{day.high}°</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-2">
                {savedLocations.map((location, i) => (
                  <Card key={location.id} glass={true} className="flex items-center justify-between p-4 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-primary" />
                      <span>{location.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                        onClick={() => handleRemoveLocation(location.id)}
                      >
                        <X size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <ChevronDown size={14} className="text-foreground/50" />
                      </Button>
                    </div>
                  </Card>
                ))}
                
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                  <DialogTrigger asChild>
                    <Button variant="glass" className="w-full mt-4 border-dashed">
                      <Search size={16} className="mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Location</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for a city..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults
                        .filter(location => !savedLocations.some(loc => loc.id === location.id))
                        .length > 0 ? (
                        searchResults
                          .filter(location => !savedLocations.some(loc => loc.id === location.id))
                          .map(location => (
                            <Button 
                              key={location.id} 
                              variant="ghost" 
                              className="w-full justify-start mb-1"
                              onClick={() => handleSaveLocation(location)}
                            >
                              <MapPin size={14} className="mr-2" />
                              {location.fullName}
                              <Plus size={14} className="ml-auto" />
                            </Button>
                          ))
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          {searchQuery.length > 1 ? 'No new locations found' : 'Type to search for a city'}
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      {/* Floating Action Button */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogTrigger asChild>
          <Fab 
            variant="gradient" 
            position="bottomCenter"
            className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
          >
            <Search className="h-6 w-6" />
          </Fab>
        </DialogTrigger>
      </Dialog>
    </div>
  );
};

export default Index;
