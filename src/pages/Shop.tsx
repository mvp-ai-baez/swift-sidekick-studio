import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Browser } from '@capacitor/browser';

interface ShopifyProduct {
  id: string;
  variantId: string;
  name: string;
  price: number;
  currencyCode: string;
  image: string;
  description: string;
  handle: string;
  availableForSale: boolean;
}

interface CartItem {
  variantId: string;
  quantity: number;
}

const Shop = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-shopify-products');
      
      if (error) throw error;
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Failed to load products from store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: ShopifyProduct) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const existing = newCart.get(product.id);
      
      if (existing) {
        newCart.set(product.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newCart.set(product.id, { variantId: product.variantId, quantity: 1 });
      }
      
      return newCart;
    });
    
    // Show animation state
    setAddedItems(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 1500);

    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const handleCheckout = async () => {
    if (cart.size === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingOut(true);
      const cartItems = Array.from(cart.values());
      
      const { data, error } = await supabase.functions.invoke('create-shopify-checkout', {
        body: { cartItems },
      });
      
      if (error) throw error;
      
      // Open checkout in native in-app browser (iOS: SFSafariViewController, Android: Custom Tabs)
      if (data.checkoutUrl) {
        await Browser.open({ 
          url: data.checkoutUrl as string,
          presentationStyle: 'popover' // Opens as modal overlay on iOS
        });
        
        // Clear cart after opening checkout
        setCart(new Map());
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout failed",
        description: "Failed to create checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const getTotalItems = () => {
    return Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold uppercase tracking-tight">shop</h1>
          <div className="flex gap-4 items-center">
            <Button
              onClick={handleCheckout}
              disabled={cart.size === 0 || checkingOut}
              className="font-bold uppercase"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Checkout ({getTotalItems()})
                </>
              )}
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-card border-border overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm uppercase">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {product.currencyCode} ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => addToCart(product)}
                    disabled={!product.availableForSale}
                    className={`w-full font-bold uppercase transition-all ${
                      addedItems.has(product.id)
                        ? 'bg-green-600 hover:bg-green-600'
                        : ''
                    }`}
                  >
                    {!product.availableForSale ? (
                      'Sold Out'
                    ) : addedItems.has(product.id) ? (
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
        )}
      </div>
    </div>
  );
};

export default Shop;
