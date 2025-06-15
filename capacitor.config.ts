
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e33ee92152e04ebca914a5fbe3df14c0',
  appName: 'aero-weather-genesis',
  webDir: 'dist',
  server: {
    url: 'https://e33ee921-52e0-4ebc-a914-a5fbe3df14c0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
