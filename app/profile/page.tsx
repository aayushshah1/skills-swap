'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  public: boolean | null;
  roles: string | null;
  location: string | null;
  availability: string[] | null;
  photo_url: string | null;
  created_at: string;
}

const WEEKDAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' }
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    location: '',
    availability: [] as string[],
    public: true,
  });

  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('uid', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          display_name: data.display_name || '',
          location: data.location || '',
          availability: data.availability || [],
          public: data.public ?? true,
        });
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          uid: user.id,
          first_name: null,
          last_name: null,
          display_name: user.email?.split('@')[0] || null,
          public: true,
          roles: 'user',
          location: null,
          availability: [],
          photo_url: null,
        };

        const { data: createdProfile } = await supabase
          .from('user')
          .insert(newProfile)
          .select()
          .single();

        if (createdProfile) {
          setProfile(createdProfile);
          setFormData({
            first_name: createdProfile.first_name || '',
            last_name: createdProfile.last_name || '',
            display_name: createdProfile.display_name || '',
            location: createdProfile.location || '',
            availability: createdProfile.availability || [],
            public: createdProfile.public ?? true,
          });
          toast.success('Welcome! Your profile has been created.');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const saveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user')
        .update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          display_name: formData.display_name || null,
          location: formData.location || null,
          availability: formData.availability,
          public: formData.public,
        })
        .eq('uid', profile.uid);

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Error saving profile. Please try again.');
      } else {
        toast.success('Profile saved successfully!');
        await loadProfile(); // Reload the profile
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = (dayValue: string) => {
    const dayObj = WEEKDAYS.find(d => d.value === dayValue);
    const dayLabel = dayObj?.label || dayValue;
    
    setFormData(prev => {
      const isRemoving = prev.availability.includes(dayValue);
      const newAvailability = isRemoving
        ? prev.availability.filter(d => d !== dayValue)
        : [...prev.availability, dayValue];
      
      // Show feedback toast
      if (isRemoving) {
        toast.info(`Removed ${dayLabel} from availability`);
      } else {
        toast.info(`Added ${dayLabel} to availability`);
      }
      
      return {
        ...prev,
        availability: newAvailability
      };
    });
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for this page */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        </div>
      </div>
      
      <div className="container mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="How do you want to be known?"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State/Country"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {WEEKDAYS.map(day => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={day.value}
                      checked={formData.availability.includes(day.value)}
                      onChange={() => toggleAvailability(day.value)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={day.value} className="text-sm font-medium">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.availability.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.availability.map(dayValue => {
                    const dayObj = WEEKDAYS.find(d => d.value === dayValue);
                    return (
                      <Badge key={dayValue} variant="secondary">
                        {dayObj?.label || dayValue}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacy Settings</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.public ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <Label className="text-base font-medium">
                      {formData.public ? 'Public Profile' : 'Private Profile'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.public 
                        ? 'Your profile is visible to other users for skill matching' 
                        : 'Your profile is hidden from other users'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.public}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, public: checked }));
                    toast.info(`Profile is now ${checked ? 'public' : 'private'}`);
                  }}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={saveProfile} disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
