import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { z } from 'zod';

// Input validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(1, 'Password is required'),
});

// Safe error message mapping
const getSafeErrorMessage = (error: any): string => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'This email is already registered. Try logging in instead.';
  }
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address.';
  }
  if (message.includes('email')) {
    return 'Please check your email address.';
  }
  if (message.includes('password')) {
    return 'Please check your password.';
  }
  
  // Log full error for debugging but return generic message
  console.error('Auth error:', error);
  return 'An error occurred. Please try again.';
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login input
        const validationResult = loginSchema.safeParse({ email, password });
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          toast({
            title: "Validation Error",
            description: firstError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate('/');
      } else {
        // Validate signup input
        const validationResult = signUpSchema.safeParse({
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        });
        
        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          toast({
            title: "Validation Error",
            description: firstError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Welcome to the hype.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="hype-box mr-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs uppercase text-muted-foreground mb-2 block">
                  First Name
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-muted-foreground mb-2 block">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-muted-foreground mb-2 block">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-2 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-2 block">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold uppercase"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground uppercase"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;