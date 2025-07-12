// Example components showing how to use the Supabase utilities

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  getBrowseProfiles,
  createSwapRequest,
  getUserSwapRequests,
  updateSwapRequestStatus,
  searchProfiles
} from '@/lib/supabase-utils';
import type { PublicUserProfile, SwapRequestWithUsers } from '@/types/supabase';

// Example 1: Browse Public Profiles Component
export function BrowseProfilesExample() {
  const [profiles, setProfiles] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getBrowseProfiles(page, 10);
    
    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    if (data) {
      if (page === 0) {
        setProfiles(data.data);
      } else {
        setProfiles(prev => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
    }
    
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Browse Profiles</h2>
      
      {profiles.map((profile) => (
        <div key={profile.id} className="p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            {profile.photo_url && (
              <Image 
                src={profile.photo_url} 
                alt={profile.name || 'Profile'} 
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{profile.name}</h3>
              <p className="text-gray-600">{profile.location}</p>
              <p className="text-sm text-gray-500">
                {profile.completed_swaps} completed swaps
              </p>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm">
              <strong>Offers:</strong> {profile.skills_offered?.join(', ')}
            </p>
            <p className="text-sm">
              <strong>Wants:</strong> {profile.skills_wanted?.join(', ')}
            </p>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button 
          onClick={loadMore}
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// Example 2: Create Swap Request Component
export function CreateSwapRequestExample({ targetUserId }: { targetUserId: string }) {
  const [skillOffered, setSkillOffered] = useState('');
  const [skillWanted, setSkillWanted] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await createSwapRequest({
      requested_user_id: targetUserId,
      skill_offered: skillOffered,
      skill_wanted: skillWanted,
      description: description || undefined
    });

    if (error) {
      console.error('Error creating swap request:', error);
      alert('Error creating swap request. Please try again.');
    } else {
      console.log('Swap request created:', data);
      alert('Swap request sent successfully!');
      setSkillOffered('');
      setSkillWanted('');
      setDescription('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Create Swap Request</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Skill I can offer:
        </label>
        <input
          type="text"
          value={skillOffered}
          onChange={(e) => setSkillOffered(e.target.value)}
          required
          className="w-full p-2 border rounded"
          placeholder="e.g., Photoshop, Guitar, Excel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Skill I want to learn:
        </label>
        <input
          type="text"
          value={skillWanted}
          onChange={(e) => setSkillWanted(e.target.value)}
          required
          className="w-full p-2 border rounded"
          placeholder="e.g., Cooking, Spanish, Piano"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Message (optional):
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Tell them why you'd like to swap skills..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Swap Request'}
      </button>
    </form>
  );
}

// Example 3: Manage Swap Requests Component
export function ManageSwapRequestsExample() {
  const [swapRequests, setSwapRequests] = useState<SwapRequestWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSwapRequests();
  }, []);

  const loadSwapRequests = async () => {
    setLoading(true);
    const { data, error } = await getUserSwapRequests();
    
    if (error) {
      console.error('Error loading swap requests:', error);
    } else {
      setSwapRequests(data || []);
    }
    
    setLoading(false);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const { data, error } = await updateSwapRequestStatus(requestId, newStatus);
    
    if (error) {
      console.error('Error updating swap request:', error);
      alert('Error updating swap request. Please try again.');
    } else {
      console.log('Swap request updated:', data);
      loadSwapRequests(); // Refresh the list
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading swap requests...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Swap Requests</h2>
      
      {swapRequests.length === 0 ? (
        <p className="text-gray-500 text-center p-8">
          No swap requests yet. Start browsing profiles to make your first swap!
        </p>
      ) : (
        swapRequests.map((request) => (
          <div key={request.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">
                  {request.skill_offered} ↔ {request.skill_wanted}
                </h3>
                <p className="text-sm text-gray-600">
                  Between {request.requester.name} and {request.requested_user.name}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status}
              </span>
            </div>
            
            {request.description && (
              <p className="text-sm text-gray-700 mb-3">
                &ldquo;{request.description}&rdquo;
              </p>
            )}
            
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(request.id, 'accepted')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Example 4: Search Profiles Component
export function SearchProfilesExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    const { data, error } = await searchProfiles({
      skill: searchTerm.trim(),
      limit: 20
    });

    if (error) {
      console.error('Error searching profiles:', error);
      alert('Error searching profiles. Please try again.');
    } else {
      setResults(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a skill (e.g., Photoshop, Guitar)"
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            Found {results.length} profiles matching &ldquo;{searchTerm}&rdquo;
          </h3>
          
          {results.map((profile) => (
            <div key={profile.id} className="p-3 border rounded">
              <div className="flex items-center gap-3">
                {profile.photo_url && (
                  <Image 
                    src={profile.photo_url} 
                    alt={profile.name || 'Profile'} 
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-medium">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.location}</p>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <p><strong>Offers:</strong> {profile.skills_offered?.join(', ')}</p>
                <p><strong>Wants:</strong> {profile.skills_wanted?.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
