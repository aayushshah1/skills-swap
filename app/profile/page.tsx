'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    skills_offered: '',
    skills_wanted: '',
    availability: '',
    is_public: true,
    photo_url: '',
  });

  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name || '',
          location: data.location || '',
          skills_offered: (data.skills_offered || []).join(', '),
          skills_wanted: (data.skills_wanted || []).join(', '),
          availability: (data.availability || []).join(', '),
          is_public: data.is_public ?? true,
          photo_url: data.photo_url || '',
        });
      }

      setUserId(user.id);

      setLoading(false);
    };

    loadProfile();
  }, [supabase]);

  const updateField = async (field: string, value: string | boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: Record<string, string[] | string | boolean> = {};
    if (field === 'skills_offered' || field === 'skills_wanted') {
      payload[field] = (value as string).split(',').map((s: string) => s.trim());
    } else if (field === 'availability') {
      payload[field] = (value as string).split(',').map((s: string) => s.trim());
    } else {
      payload[field] = value;
    }

    await supabase
      .from('user')
      .update(payload)
      .eq('id', user.id);
  };

  const handlePhotoUploaded = async (url: string) => {
    setProfile((p) => ({ ...p, photo_url: url }));
    await updateField('photo_url', url);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Your Profile</h1>

          {userId && (
            <ProfilePhotoUpload
              userId={userId}
              currentPhotoUrl={profile.photo_url}
              onPhotoUploaded={handlePhotoUploaded}
            />
          )}

          <div>
            <Label>Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => {
                const val = e.target.value;
                setProfile((p) => ({ ...p, name: val }));
                updateField('name', val);
              }}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={profile.location}
              onChange={(e) => {
                const val = e.target.value;
                setProfile((p) => ({ ...p, location: val }));
                updateField('location', val);
              }}
            />
          </div>

          <div>
            <Label>Skills Offered (comma separated)</Label>
            <Input
              value={profile.skills_offered}
              onChange={(e) => {
                const val = e.target.value;
                setProfile((p) => ({ ...p, skills_offered: val }));
                updateField('skills_offered', val);
              }}
            />
          </div>

          <div>
            <Label>Skills Wanted (comma separated)</Label>
            <Input
              value={profile.skills_wanted}
              onChange={(e) => {
                const val = e.target.value;
                setProfile((p) => ({ ...p, skills_wanted: val }));
                updateField('skills_wanted', val);
              }}
            />
          </div>

          <div>
            <Label>Availability (Select weekdays when you&apos;re available)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.availability.includes(day)}
                    onChange={(e) => {
                      const currentAvailability = profile.availability.split(',').map(s => s.trim()).filter(s => s);
                      let newAvailability;
                      if (e.target.checked) {
                        newAvailability = [...currentAvailability, day];
                      } else {
                        newAvailability = currentAvailability.filter(d => d !== day);
                      }
                      const val = newAvailability.join(', ');
                      setProfile((p) => ({ ...p, availability: val }));
                      updateField('availability', val);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={profile.is_public}
              onCheckedChange={(val) => {
                setProfile((p) => ({ ...p, is_public: val }));
                updateField('is_public', val);
              }}
            />
            <Label>{profile.is_public ? 'Public Profile' : 'Private Profile'}</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
