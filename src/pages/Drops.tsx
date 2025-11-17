import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import azBzCollection from '@/assets/az-bz-collection.jpg';

const UPCOMING_DROPS = [
  {
    id: '1',
    name: 'AZ x BZ Collection',
    date: '2025-11-22',
    image: azBzCollection
  }
];

const Drops = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications enabled',
          description: "You'll be notified about upcoming drops"
        });
      } else {
        toast({
          title: 'Notifications blocked',
          description: 'Enable notifications in your device settings',
          variant: 'destructive'
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold uppercase tracking-tight">upcoming drops</h1>
          <Button
            onClick={requestNotificationPermission}
            variant={notificationsEnabled ? 'secondary' : 'default'}
            className={notificationsEnabled ? '' : 'bg-accent hover:bg-accent/90'}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4 mr-2" />
                notifications on
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                enable alerts
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {UPCOMING_DROPS.map((drop) => (
            <Card key={drop.id} className="bg-card border-border overflow-hidden">
              <img 
                src={drop.image} 
                alt={drop.name}
                className="w-full aspect-video object-cover"
              />
              <div className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="font-bold text-lg uppercase">{drop.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase">
                    {formatDate(drop.date)}
                  </p>
                  <div className="hype-box text-xs">
                    coming soon
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!notificationsEnabled && (
          <Card className="mt-8 bg-secondary border-accent p-6 text-center">
            <Bell className="w-8 h-8 mx-auto mb-4 text-accent" />
            <h3 className="font-bold mb-2 uppercase">never miss a drop</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant push notifications when new products launch
            </p>
            <Button 
              onClick={requestNotificationPermission}
              className="bg-accent hover:bg-accent/90 font-bold uppercase"
            >
              enable push notifications
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Drops;
