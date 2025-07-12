'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    skills_offered: '',
    skills_wanted: '',
    availability: '',
    is_public: true,
  });

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name || '',
        location: data.location || '',
        skills_offered: (data.skills_offered || []).join(', '),
        skills_wanted: (data.skills_wanted || []).join(', '),
        availability: data.availability || '',
        is_public: data.is_public ?? true,
      });
    }

    setLoading(false);
  };

  const updateField = async (field: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {};
    if (field === 'skills_offered' || field === 'skills_wanted') {
      payload[field] = value.split(',').map((s: string) => s.trim());
    } else {
      payload[field] = value;
    }

    await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Your Profile</h1>

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
            <Label>Availability</Label>
            <Input
              value={profile.availability}
              onChange={(e) => {
                const val = e.target.value;
                setProfile((p) => ({ ...p, availability: val }));
                updateField('availability', val);
              }}
            />
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
