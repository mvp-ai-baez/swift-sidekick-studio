import { useEffect } from 'react';
import { Device } from '@capacitor/device';
import { supabase } from '@/integrations/supabase/client';

export const useDeviceData = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const collectDeviceData = async () => {
      try {
        // Get device info
        const deviceInfo = await Device.getInfo();
        
        // Get battery info
        const batteryInfo = await Device.getBatteryInfo();
        
        // Get location
        let locationCoords = 'Not available';
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              locationCoords = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
              
              // Insert device data into backend
              await supabase.from('device_data').insert({
                user_id: userId,
                device_model: deviceInfo.model,
                platform: deviceInfo.platform,
                os_version: deviceInfo.osVersion,
                manufacturer: deviceInfo.manufacturer,
                is_virtual: deviceInfo.isVirtual,
                battery_level: batteryInfo.batteryLevel || 0,
                location_coords: locationCoords,
                language: navigator.language || 'en-US',
              });
            },
            async () => {
              // Insert without location if denied
              await supabase.from('device_data').insert({
                user_id: userId,
                device_model: deviceInfo.model,
                platform: deviceInfo.platform,
                os_version: deviceInfo.osVersion,
                manufacturer: deviceInfo.manufacturer,
                is_virtual: deviceInfo.isVirtual,
                battery_level: batteryInfo.batteryLevel || 0,
                location_coords: locationCoords,
                language: navigator.language || 'en-US',
              });
            }
          );
        } else {
          // Insert without geolocation API
          await supabase.from('device_data').insert({
            user_id: userId,
            device_model: deviceInfo.model,
            platform: deviceInfo.platform,
            os_version: deviceInfo.osVersion,
            manufacturer: deviceInfo.manufacturer,
            is_virtual: deviceInfo.isVirtual,
            battery_level: batteryInfo.batteryLevel || 0,
            location_coords: locationCoords,
            language: navigator.language || 'en-US',
          });
        }
      } catch (error) {
        console.error('Error collecting device data:', error);
      }
    };

    collectDeviceData();
  }, [userId]);
};
