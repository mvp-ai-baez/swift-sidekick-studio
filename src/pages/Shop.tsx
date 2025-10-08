import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder products - will integrate with Shopify
const PLACEHOLDER_PRODUCTS = [
  {
    id: '1',
    name: 'CLASSIC SNAPBACK',
    price: 45,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop'
  },
  {
    id: '2',
    name: 'TRUCKER HAT',
    price: 40,
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&h=800&fit=crop'
  },
  {
    id: '3',
    name: 'DAD HAT',
    price: 38,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&fit=crop'
  },
  {
    id: '4',
    name: 'BEANIE',
    price: 35,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&h=800&fit=crop'
  }
];

const Shop = () => {
  const [cart, setCart] = useState<string[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const addToCart = (id: string, name: string) => {
    setCart([...cart, id]);
    
    // Show animation state
    setAddedItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 1500);

    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold uppercase tracking-tight">shop</h1>
          <div className="hype-box">
            cart ({cart.length})
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <Card key={product.id} className="bg-card border-border overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm uppercase">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">${product.price}</p>
                </div>
                <Button 
                  onClick={() => addToCart(product.id, product.name)}
                  className={`w-full font-bold uppercase transition-all ${
                    addedItems.has(product.id)
                      ? 'bg-green-600 hover:bg-green-600'
                      : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  }`}
                >
                  {addedItems.has(product.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-2 animate-scale-in" />
                      Added!
                    </>
                  ) : (
                    'add to cart'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
