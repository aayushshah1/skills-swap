'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProfileCard from '@/components/ProfileCard';
import SearchFilters from '@/components/SearchFilters';
import LoginRequestModal from '@/components/LoginRequestModal';

export default function HomePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [filters, setFilters] = useState({ skill: '', availability: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true);
    setProfiles(data || []);
    setFilteredProfiles(data || []);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Filtering logic
  useEffect(() => {
    const { skill, availability } = filters;
    const filtered = profiles.filter((p) => {
      const matchesSkill =
        !skill ||
        p.skills_offered?.some((s: string) =>
          s.toLowerCase().includes(skill.toLowerCase())
        ) ||
        p.skills_wanted?.some((s: string) =>
          s.toLowerCase().includes(skill.toLowerCase())
        );
      const matchesAvailability = !availability || p.availability === availability;
      return matchesSkill && matchesAvailability;
    });
    setFilteredProfiles(filtered);
  }, [filters, profiles]);

  return (
    <main className="p-6 space-y-6">
      <SearchFilters filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onRequestClick={() => setShowLoginModal(true)}
          />
        ))}
      </div>

      <LoginRequestModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
