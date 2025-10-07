import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2f76af985b41470a9599a40a800fa463',
  appName: 'A Lovable project',
  webDir: 'dist',
  server: {
    url: 'https://2f76af98-5b41-470a-9599-a40a800fa463.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
