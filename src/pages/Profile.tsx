import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Card } from '@/components/ui/card';
import { User, Smartphone, MapPin, Globe } from 'lucide-react';

interface DeviceInfo {
  model: string;
  platform: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
}

const Profile = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [location, setLocation] = useState<string>('Loading...');
  const [language, setLanguage] = useState<string>('en-US');

  useEffect(() => {
    loadDeviceInfo();
    loadLocation();
    setLanguage(navigator.language || 'en-US');
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo({
        model: info.model,
        platform: info.platform,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual
      });
    } catch (error) {
      console.error('Error loading device info:', error);
    }
  };

  const loadLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In production, use reverse geocoding API
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        },
        () => {
          setLocation('Location not available');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-12">
          <div className="hype-box mr-4">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">profile</h1>
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border p-6">
            <div className="flex items-start mb-4">
              <Smartphone className="w-5 h-5 text-accent mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm mb-3">device information</h3>
                {deviceInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">platform</span>
                      <span className="uppercase">{deviceInfo.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">model</span>
                      <span className="uppercase">{deviceInfo.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">os version</span>
                      <span>{deviceInfo.osVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">manufacturer</span>
                      <span className="uppercase">{deviceInfo.manufacturer}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading device info...</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start mb-4">
              <MapPin className="w-5 h-5 text-accent mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm mb-3">location</h3>
                <p className="text-sm">{location}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start">
              <Globe className="w-5 h-5 text-accent mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm mb-3">language & region</h3>
                <p className="text-sm uppercase">{language}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-secondary border-accent p-6 mt-8">
            <p className="text-xs text-muted-foreground text-center">
              This data helps us provide better service and personalized drop notifications
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
