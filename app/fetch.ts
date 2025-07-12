import { createClient } from '@/utils/supabase/server';

export interface UserProfile {
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

export interface SwapRequest {
  id: number;
  requester_uid: string;
  skill_offered: string;
  skill_requested: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

/**
 * Fetch user profile from the database
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Fetch user's swap requests
 */
export async function fetchUserSwapRequests(uid: string): Promise<SwapRequest[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .eq('requester_uid', uid)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching swap requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all pending swap requests for a user (requests they can potentially respond to)
 */
export async function fetchPendingSwapRequestsForUser(uid: string): Promise<SwapRequest[]> {
  const supabase = await createClient();
  
  // Get swap requests where the user has the skill being requested
  // and exclude requests made by the user themselves
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .neq('requester_uid', uid)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending swap requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all available skills
 */
export async function fetchAllSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch skills by category
 */
export async function fetchSkillsByCategory(category: string): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching skills by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user')
    .upsert(profile, { onConflict: 'uid' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }

  return data;
}

/**
 * Create a new swap request
 */
export async function createSwapRequest(swapRequest: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SwapRequest | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('swap_requests')
    .insert(swapRequest)
    .select()
    .single();

  if (error) {
    console.error('Error creating swap request:', error);
    return null;
  }

  return data;
}

/**
 * Update swap request status
 */
export async function updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('swap_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating swap request status:', error);
    return null;
  }

  return data;
}

/**
 * Get user statistics (total requests, completed swaps, etc.)
 */
export async function fetchUserStats(uid: string): Promise<{
  totalRequests: number;
  completedSwaps: number;
  pendingRequests: number;
  rating: number;
}> {
  const supabase = await createClient();
  
  // Get swap request counts
  const { data: requests, error: requestError } = await supabase
    .from('swap_requests')
    .select('status')
    .eq('requester_uid', uid);

  if (requestError) {
    console.error('Error fetching user stats:', requestError);
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }

  const totalRequests = requests?.length || 0;
  const completedSwaps = requests?.filter(r => r.status === 'completed').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  
  // For now, rating is calculated based on completion rate
  // In the future, this could be replaced with actual user ratings
  const rating = totalRequests > 0 ? (completedSwaps / totalRequests) * 5 : 0;

  return {
    totalRequests,
    completedSwaps,
    pendingRequests,
    rating: Math.round(rating * 10) / 10 // Round to 1 decimal place
  };
}
