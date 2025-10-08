import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceData } from '@/hooks/useDeviceData';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Silently collect device data in background
  useDeviceData(userId);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setUserId(user.id);
    loadProfile(user.id);
  };

  const loadProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground uppercase">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground uppercase">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <div className="hype-box mr-4">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">profile</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="uppercase"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Card className="bg-card border-border p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-muted-foreground mb-2 block">
                    First Name
                  </label>
                  <Input
                    value={profile.first_name || ''}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-muted-foreground mb-2 block">
                    Last Name
                  </label>
                  <Input
                    value={profile.last_name || ''}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-muted-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    value={profile.phone_number || ''}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-muted-foreground mb-2 block">
                    Email (cannot be changed)
                  </label>
                  <Input
                    value={profile.email || ''}
                    disabled
                    className="bg-background opacity-50"
                  />
                </div>
              </div>
            </Card>
            <div className="flex gap-2">
              <Button type="submit" className="bg-accent hover:bg-accent/90 uppercase">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                className="uppercase"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Card className="bg-card border-border p-6">
              <div className="flex items-start mb-4">
                <User className="w-5 h-5 text-accent mr-3 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold uppercase text-sm mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="uppercase">{profile.first_name} {profile.last_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-start mb-4">
                <Mail className="w-5 h-5 text-accent mr-3 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold uppercase text-sm mb-3">Email</h3>
                  <p className="text-sm">{profile.email}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-accent mr-3 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold uppercase text-sm mb-3">Phone</h3>
                  <p className="text-sm">{profile.phone_number || 'Not provided'}</p>
                </div>
              </div>
            </Card>

            <Button
              onClick={() => setEditing(true)}
              className="w-full bg-accent hover:bg-accent/90 uppercase"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
