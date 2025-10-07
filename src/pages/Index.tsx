import { Link } from 'react-router-dom';
import { ShoppingBag, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const currentTime = new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="hype-box inline-block text-4xl md:text-6xl mb-4">
            YOUR BRAND
          </div>
          
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {currentTime} · Mexico City
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <Link to="/shop">
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center border-accent hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <ShoppingBag className="w-8 h-8 mb-2" />
                <span className="font-bold uppercase text-sm">shop</span>
              </Button>
            </Link>

            <Link to="/drops">
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center border-accent hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Bell className="w-8 h-8 mb-2" />
                <span className="font-bold uppercase text-sm">drops</span>
              </Button>
            </Link>

            <Link to="/profile">
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center border-accent hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <User className="w-8 h-8 mb-2" />
                <span className="font-bold uppercase text-sm">profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          exclusive drops · push notifications · in-app checkout
        </p>
      </footer>
    </div>
  );
};

export default Index;
